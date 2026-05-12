# Ledger System

Ledger System is a full-stack personal finance app built with **FastAPI + PostgreSQL + React (Vite)**.
It lets users register/login, create accounts, do deposits/withdrawals/transfers, and view transaction history with running balances.

## Features

- User authentication with JWT tokens
- Create and manage up to 2 accounts per user
- Default account currency: **INR**
- Double-entry style ledger updates for transactions
- Idempotency keys for safer transaction processing
- Balance API and transaction history API
- Frontend dashboard with:
  - account cards
  - balance visibility toggle
  - deposit / withdraw / transfer actions
  - delete account with confirmation toast (not direct delete)

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic
- Auth: OAuth2 password flow + JWT
- DB: PostgreSQL (via `DATABASE_URL`)
- Frontend: React + Vite + Axios + Tailwind styles

## Project Structure

- `main.py`: FastAPI app + CORS + routers
- `routers/`: API endpoints (`auth`, `user`, `account`, `transactions`)
- `services/`: business logic for ledger operations
- `DataBase/models/`: SQLAlchemy models
- `migrations/`: Alembic migration files
- `frontend/`: React app

## How It Works

### 1. Authentication

1. User registers via `POST /users/`.
2. Password is hashed and stored.
3. User logs in via `POST /token`.
4. Backend returns a JWT token.
5. Frontend stores token and sends it in `Authorization: Bearer <token>`.

### 2. Account Creation

1. User clicks **New Account** on dashboard.
2. Frontend calls `POST /accounts/create`.
3. Backend creates account with generated account number and currency `INR`.
4. User can fetch all their accounts via `GET /accounts/all`.

### 3. Transactions

- **Deposit**: `POST /transactions/deposit`
- **Withdraw**: `POST /transactions/withdraw`
- **Transfer**: `POST /transactions/transfer`

Each transaction creates ledger entries and updates running balances.

### 4. Balance & History

- Current balance: `GET /transactions/balance?account_number=...`
  - Returns `0.0` for new accounts with no ledger entries.
- History: `GET /transactions/{account_number}/history`

### 5. Delete Account

1. User clicks **Delete** on account card.
2. A confirmation toast appears at top-center.
3. Account is deleted only after **Confirm Delete**.
4. Backend endpoint: `DELETE /accounts/{account_number}` (user-scoped).

## Setup

## 1) Backend

```powershell
cd C:\Users\saiak\Desktop\ledger
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create/update `.env` with your values:

```env
SECRET_KEY=your_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/ledger_db

MAIL_USERNAME=...
MAIL_FROM=...
MAIL_SERVER=...
MAIL_PORT=587
APP_PASSWORD=...
```

Run migrations:

```powershell
alembic upgrade head
```

Start backend:

```powershell
uvicorn main:app --reload
```

Backend default URL: `http://127.0.0.1:8000`

## 2) Frontend

```powershell
cd C:\Users\saiak\Desktop\ledger\frontend
npm install
npm run dev
```

Frontend default URL: `http://127.0.0.1:5173`

## Notes

- CORS is configured to allow localhost/127.0.0.1 dev origins.
- `.gitignore` excludes env files, DB files, logs, virtualenv, and node_modules.

