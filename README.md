# 🛒 FreshMart — Grocery Shop Management

A full-stack grocery shop admin website built with **React**, **Node.js/Express**, and **MongoDB**.

---

## Features

- **Login / Register** — JWT-based authentication (admin & customer roles)
- **Dashboard** — Live analytics with revenue charts, order status pie chart, category bar chart
- **Products** — Full CRUD: add, edit, delete products with categories, stock levels, emojis
- **Orders** — View all orders, update status (Pending → Delivered), expand order items, delete
- **Customers** — Browse all customers, view order history and spending, delete customers

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** running on `localhost:27017`

---

## Quick Start

### 1. Start MongoDB
```bash
mongod
```

### 2. Backend
```bash
cd backend
npm install
npm run seed      # Seed database with sample data
npm run dev       # Starts API on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev       # Starts app on http://localhost:5173
```

Open **http://localhost:5173**

---

## Login

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@freshmart.com     | admin123  |

Sample customers are also seeded with `password123`.

---

## API Endpoints

| Method | Route                     | Description                    |
|--------|---------------------------|--------------------------------|
| POST   | /api/auth/register        | Register new user              |
| POST   | /api/auth/login           | Login, returns JWT             |
| GET    | /api/auth/me              | Get current user               |
| GET    | /api/products             | List products (search/filter)  |
| POST   | /api/products             | Create product (admin)         |
| PUT    | /api/products/:id         | Update product (admin)         |
| DELETE | /api/products/:id         | Delete product (admin)         |
| GET    | /api/orders               | List orders                    |
| POST   | /api/orders               | Create order                   |
| PUT    | /api/orders/:id/status    | Update order status (admin)    |
| DELETE | /api/orders/:id           | Delete order (admin)           |
| GET    | /api/customers            | List customers (admin)         |
| GET    | /api/customers/:id        | Customer detail + orders       |
| DELETE | /api/customers/:id        | Delete customer (admin)        |
| GET    | /api/stats/overview       | Dashboard KPIs                 |
| GET    | /api/stats/revenue        | 7-day revenue data             |
| GET    | /api/stats/categories     | Revenue by product category    |
| GET    | /api/stats/order-status   | Order status breakdown         |

---

## MongoDB Collections

| Collection | Contents                                        |
|------------|-------------------------------------------------|
| users      | Admin + customer accounts with hashed passwords |
| products   | Grocery items with category, price, stock       |
| orders     | Customer orders with embedded line items        |

---

## Project Structure

```
grocery-shop/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── customers.js
│   │   └── stats.js
│   ├── seed.js
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── context/AuthContext.jsx   # Global auth state
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProductsPage.jsx
        │   ├── OrdersPage.jsx
        │   └── CustomersPage.jsx
        └── components/
            └── Layout.jsx            # Sidebar + outlet
```
