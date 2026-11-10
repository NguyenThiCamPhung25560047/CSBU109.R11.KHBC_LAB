const pool = require('../config/db');

// 1. POST /api/v1/orders
exports.createOrder = async (customerId, items) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cust] = await conn.query('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (cust.length === 0) {
      throw { status: 404, message: 'Customer not found' };
    }

    const productIds = items.map(i => i.productId);
    const [products] = await conn.query(
      'SELECT id, price, stock FROM products WHERE id IN (?) FOR UPDATE',
      [productIds]
    );

    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        throw { status: 404, message: `Product ID ${item.productId} not found` };
      }
      if (prod.stock < item.quantity) {
        throw { status: 400, message: `Product ID ${item.productId} is out of stock` };
      }
      totalAmount += prod.price * item.quantity;
      orderItemsToInsert.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: prod.price
      });
    }

    const [orderRes] = await conn.query(
      'INSERT INTO orders (customer_id, status, total_amount) VALUES (?, "pending", ?)',
      [customerId, totalAmount]
    );
    const orderId = orderRes.insertId;

    for (const item of orderItemsToInsert) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.unitPrice]
      );
      await conn.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    await conn.commit();
    return { orderId, customerId, status: 'pending', totalAmount };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// 2. GET /api/v1/orders
exports.getAllOrders = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 5, 1);
  const offset = (page - 1) * limit;

  let whereClause = ' WHERE 1=1';
  const params = [];
  if (query.status) {
    whereClause += ' AND o.status = ?';
    params.push(query.status);
  }
  if (query.customerId) {
    whereClause += ' AND o.customer_id = ?';
    params.push(query.customerId);
  }

  const [countRes] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${whereClause}`, params);
  const totalOrders = countRes[0].total;

  const sql = `
    SELECT o.id AS order_id, c.full_name AS customer_name, c.email, o.status, o.total_amount,
           COALESCE(SUM(oi.quantity), 0) AS total_items_count, o.created_at
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    ${whereClause}
    GROUP BY o.id, c.full_name, c.email, o.status, o.total_amount, o.created_at
    ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `;
  const [orders] = await pool.query(sql, [...params, limit, offset]);

  return {
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    totalOrders,
    data: orders
  };
};

// 3. GET /api/v1/orders/:id
exports.getOrderById = async (orderId) => {
  const [orders] = await pool.query(`
    SELECT o.id AS order_id, o.status, o.total_amount, o.created_at,
           c.id AS customer_id, c.full_name, c.email, c.phone
    FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?
  `, [orderId]);

  if (orders.length === 0) {
    throw { status: 404, message: 'Order not found' };
  }

  const [items] = await pool.query(`
    SELECT oi.product_id, p.product_name, oi.quantity, oi.unit_price,
           (oi.quantity * oi.unit_price) AS subtotal
    FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?
  `, [orderId]);

  const ord = orders[0];
  return {
    order_id: ord.order_id,
    status: ord.status,
    total_amount: ord.total_amount,
    created_at: ord.created_at,
    customer: { id: ord.customer_id, full_name: ord.full_name, email: ord.email, phone: ord.phone },
    items
  };
};

// 4. PATCH /api/v1/orders/:id/status
exports.updateOrderStatus = async (orderId, newStatus) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orders] = await conn.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (orders.length === 0) {
      throw { status: 404, message: 'Order not found' };
    }

    const currentStatus = orders[0].status;
    if (currentStatus === 'cancelled') {
      throw { status: 400, message: 'Cancelled order status cannot be changed' };
    }

    if (newStatus === 'cancelled' && currentStatus !== 'cancelled') {
      const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    await conn.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);
    await conn.commit();
    return { orderId, status: newStatus, message: 'Order status updated successfully' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// 5. DELETE /api/v1/orders/:id
exports.deleteOrder = async (orderId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orders] = await conn.query('SELECT status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (orders.length === 0) {
      throw { status: 404, message: 'Order not found' };
    }

    if (orders[0].status !== 'cancelled') {
      const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of items) {
        await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    await conn.query('DELETE FROM orders WHERE id = ?', [orderId]);
    await conn.commit();
    return { message: 'Order deleted successfully' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// 6. GET /api/v1/orders/analytics/sales-summary
exports.getSalesSummary = async () => {
  const [stats] = await pool.query(`
    SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue,
           COUNT(*) AS completedOrdersCount,
           COALESCE(AVG(total_amount), 0) AS averageOrderValue
    FROM orders WHERE status = 'completed'
  `);

  const [topProducts] = await pool.query(`
    SELECT p.id AS product_id, p.product_name, SUM(oi.quantity) AS total_quantity_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status = 'completed'
    GROUP BY p.id, p.product_name
    ORDER BY total_quantity_sold DESC LIMIT 3
  `);

  return {
    totalRevenue: Number(stats[0].totalRevenue),
    completedOrdersCount: Number(stats[0].completedOrdersCount),
    averageOrderValue: Number(stats[0].averageOrderValue),
    topSellingProducts: topProducts
  };
};

// 7. GET /api/v1/customers/:id/order-history
exports.getCustomerOrderHistory = async (customerId) => {
  const [cust] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
  if (cust.length === 0) {
    throw { status: 404, message: 'Customer not found' };
  }

  const [orders] = await pool.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
  const [spentRes] = await pool.query(
    'SELECT COALESCE(SUM(total_amount), 0) AS totalLifetimeSpent FROM orders WHERE customer_id = ? AND status = "completed"',
    [customerId]
  );

  return {
    customer: cust[0],
    totalLifetimeSpent: Number(spentRes[0].totalLifetimeSpent),
    orders
  };
};