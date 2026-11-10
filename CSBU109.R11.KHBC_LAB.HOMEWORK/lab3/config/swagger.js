const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 3 E-Commerce API Documentation',
      version: '1.0.0',
      description: 'API Documentation for In-Class (MongoDB) and Homework (MySQL Orders Management)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Quét tất cả file .js trong thư mục routes
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;