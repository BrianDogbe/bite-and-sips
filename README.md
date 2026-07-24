# Bite & Sips

A full-stack food ordering platform built for a cafeteria business. Customers can browse the menu, add items to cart, place orders, and track their orders. Admins can manage products, orders, and customer messages.

## Live Demo

Frontend:
https://bite-and-sips.vercel.app

Backend API:
https://bite-and-sips-server.onrender.com

---

## Features

### Customer Features

- Browse food and drinks menu
- Category filtering
- Add items to cart
- Update cart quantities
- Checkout and place orders
- Track order status
- Send contact messages

### Admin Features

- Admin dashboard
- Manage products
- View customer orders
- Update order status
- View customer messages
- Delete orders/messages

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router

### Backend

- Node.js
- Express.js
- REST API

### Deployment

- Vercel (Frontend)
- Render (Backend)

---

## Project Structure

---

```text
bite-and-sips/
│
├── client/        # React + TypeScript frontend
│
├── server/        # Node.js + Express backend
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/BrianDogbe/bite-and-sips.git

cd bite-and-sips
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=https://bite-and-sips-server.onrender.com
```

---

## Backend Setup

```bash
cd server

npm install

npm start
```

Create a `.env` file based on:

```text
.env.example
```

---

## 👨🏽‍💻 Author

**Brian Dela Dogbe**

Software Engineering Student  
Ghana Communication Technology University

GitHub:  
https://github.com/BrianDogbe

LinkedIn:  
https://www.linkedin.com/in/brian-dogbe-186360332

---

## 📄 License

This project is for learning and portfolio purposes.
