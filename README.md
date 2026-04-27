# 🏛️ Campus Lost & Found Management System

A full-stack web application to manage lost and found items on a college campus. Built with React.js, Node.js, Express, and MySQL.

## 🚀 Features

-   **User Roles**: Students, Staff, and Admins.
-   **Report Items**: Easily report lost or found items.
-   **Browse & Search**: Filter items by category, status, and date.
-   **Claim System**: Students can claim found items; Admins verify claims.
-   **Dashboard**:
    -   **Students**: View their reported items and claim status.
    -   **Admins**: Approve or reject claims, manage all items.
-   **Secure Authentication**: JWT-based login and registration.

## 🛠️ Tech Stack

-   **Frontend**: React.js (Vite), React Router, Axios, Lucide Icons, CSS Modules.
-   **Backend**: Node.js, Express.js, MySQL2.
-   **Database**: MySQL.

## 📋 Prerequisites

-   Node.js (v14+)
-   MySQL Server installed and running.

## ⚙️ Installation & Setup

### 1. Database Setup

1.  Open your MySQL client (Workbench, CLI, etc.).
2.  Run the script located in `database.sql` to create the database and tables.
    -   This will create a database named `campus_lost_found`.
    -   It populates initial sample data for testing.

### 2. Backend Setup

1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    -   Open `.env` file.
    -   Update `DB_PASSWORD` with your MySQL root password.
    -   (Optional) Update `JWT_SECRET`.
4.  Start the server:
    ```bash
    node server.js
    ```
    -   Server will run on `http://localhost:5000`.

### 3. Frontend Setup

1.  Open a new terminal and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser at `http://localhost:5173`.

## 🧪 Testing Credentials

Use the following credentials to test different roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `password123` (You may need to register a new admin or hash this password via a script if using manual insert) |
| **Student** | `student@college.edu` | (Register a new user) |

*Note: The `database.sql` inserts users with hashed passwords. For testing, it is recommended to **Register** a new user through the app UI first.*

## 📂 Project Structure

```
dbms-react/
├── backend/            # Express Server
│   ├── config/         # DB Connection
│   ├── controllers/    # Logic for Auth & Items
│   ├── middleware/     # Auth checks
│   ├── routes/         # API Routes
│   └── server.js       # Entry point
├── frontend/           # React App
│   ├── src/
│   │   ├── components/ # Reusable UI (Navbar)
│   │   ├── context/    # Auth State
│   │   ├── pages/      # Application Pages
│   │   ├── api.js      # Axios Setup
│   │   ├── App.jsx     # Routing
│   │   └── index.css   # Global Styling
└── database.sql        # SQL Schema
```
