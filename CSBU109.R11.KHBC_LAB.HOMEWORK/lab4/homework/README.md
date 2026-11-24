# Lab 4 Homework – ShopAdmin Backend

REST API for the provided ShopAdmin Web UI: register/login with a role, JWT authentication,
bcrypt password hashing, avatar upload with Multer, persistent JSON file storage, and admin-only
management of categories and products.

```text
lab4/
├── backend/    Node.js + Express REST API with JSON file storage (port 4000)
└── frontend/   Provided ShopAdmin UI (unchanged)
```

## Requirements

- Node.js 18 or newer

## Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (excluded from Git via `.gitignore`):

```env
PORT=4000
JWT_SECRET=super_secret_shopadmin_key_2026
JWT_EXPIRES_IN=1d
```

A random secret can be generated with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Start the API server:

```bash
node server.js            # ShopAdmin API running at: http://localhost:4000
```

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port (must match `frontend/config.js`) |
| `JWT_SECRET` | – (required) | Secret used to sign and verify tokens |
| `JWT_EXPIRES_IN` | `1d` | Token lifetime |

Then open `frontend/index.html` with VS Code Live Server. `frontend/config.js` already points to
`http://localhost:4000/api/v1`.

## Data Persistence (`backend/data/store.js` & `db.json`)

| Entity | Fields | Rules |
|---|---|---|
| `users` | `id`, `fullName`, `age`, `gender`, `email`, `passwordHash`, `avatarUrl`, `type` | `email` unique (stored lower-case); `type` is `normal` or `admin`; `passwordHash` is stripped from all responses |
| `categories` | `id`, `name` | `name` required, trimmed, and unique (`409` on duplicate) |
| `products` | `id`, `categoryId`, `name`, `quantity`, `price` | `categoryId` references an existing category; `quantity` and `price` stored as numbers |

On first startup, `readDB()` automatically initializes `backend/data/db.json` with default seed categories and products.

## API

All responses are JSON: `{ success, message?, data? }`. Errors return `{ success: false, message }`.

| Method | URL | Access | Notes |
|---|---|---|---|
| POST | `/api/v1/auth/register` | public | `{ fullName, age, gender, email, password, type }`; duplicate email → `409` |
| POST | `/api/v1/auth/login` | public | `{ email, password }` → `{ success, token, user, data: { token, user } }`; invalid credentials → `401` |
| GET | `/api/v1/auth/me` | logged in | Own profile |
| PUT | `/api/v1/users/me` | logged in | Updates `fullName`, `age`, `gender` only |
| POST | `/api/v1/users/me/avatar` | logged in | `multipart/form-data`, field `avatar`, JPG/PNG/WEBP ≤ 2 MB |
| GET | `/api/v1/categories` | logged in | List all categories |
| POST / PUT / DELETE | `/api/v1/categories[/:id]` | admin | Deleting a category still referenced by products → `400` |
| GET | `/api/v1/products?categoryId=` | logged in | Optional category filter |
| POST / PUT / DELETE | `/api/v1/products[/:id]` | admin | Full product CRUD |

## Authentication and permissions

- Passwords are hashed with `bcryptjs` (10 salt rounds) and verified with `bcrypt.compare` at login.
- Login signs a JWT whose payload is `{ id, type }`; the client sends it as `Authorization: Bearer <token>`.
- Missing, invalid, or expired token → `401 Unauthorized`.
- A valid token from a `normal` user on a create/edit/delete route → `403 Forbidden` (`"Admin permission required"`).
- The avatar route updates only the authenticated user (`req.user.id`). Uploaded files are stored in `backend/uploads/` and served statically from `/uploads/...`. 