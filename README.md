# Subscription Box Management System (SBMS)

A full-stack MERN application for managing subscription-based product boxes with personalized recommendations.

## Tech Stack
- **Frontend:** React (Vite), React Router, Bootstrap, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Auth:** JWT, bcryptjs

## Project Structure
```
SubscriptionBoxManager/
├── backend/          # Express API
│   ├── server.js
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── config/
├── frontend/         # React app (Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── context/
└── SRS DOCUMENT.docx
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas)

### Backend
```bash
cd backend
npm install
# Update .env with your MongoDB URI and JWT_SECRET
npm start
```
Server runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:5173

## API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | POST /api/auth/register | Register new user |
| Auth | POST /api/auth/login | Login |
| Auth | GET /api/auth/profile | Get profile |
| Subscriptions | GET /api/subscriptions/plans | List active plans |
| Subscriptions | POST /api/subscriptions/subscribe | Subscribe to a plan |
| Products | GET /api/products | List products (search, filter, paginate) |
| Orders | POST /api/orders | Create order |
| Payments | POST /api/payments | Process payment |
| Feedback | POST /api/feedback | Submit rating/review |
| Preferences | POST /api/preferences | Set user preferences |
| Preferences | GET /api/preferences/recommendations | Get personalized recommendations |
| Reports | GET /api/reports/subscriptions | Subscription stats (admin) |
| Reports | GET /api/reports/sales | Sales stats (admin) |
