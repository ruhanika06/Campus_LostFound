# 🏃‍♂️ How to Run the Campus Lost & Found System

This guide provides step-by-step instructions to set up and run the **Campus Lost & Found Management System** on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v14 or higher) - [Download Here](https://nodejs.org/)
2.  **MySQL Server** (via MySQL Workbench, XAMPP, or Command Line) - [Download MySQL](https://dev.mysql.com/downloads/installer/)
3.  **Git** (Optional, if cloning from a repo)

---

## 🛠️ Step 1: Database Setup

1.  **Open your MySQL Client** (MySQL Workbench, phpMyAdmin, or Command Line).
2.  **Locate the SQL Script**: Find the file named `database.sql` in the root folder of this project (`c:\Users\HP\Desktop\dbms-react\database.sql`).
3.  **Execute the Script**:
    *   **Workbench**: Open the file in Workbench and click the "Execute" lightning bolt icon.
    *   **Command Line**:
        ```bash
        mysql -u root -p < database.sql
        ```
    *   **phpMyAdmin**: Go to "Import", select `database.sql`, and click "Go".
4.  **Verify**: Ensure a database named `campus_lost_found` is created and contains tables like `users`, `items`, etc.

---

## ⚙️ Step 2: Backend Setup (Server)

The backend handles the API and database connections.

1.  **Open a Terminal** (Command Prompt, PowerShell, or VS Code Terminal).
2.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Configure Environment Variables**:
    *   Open the file named `.env` in the `backend` folder.
    *   Check the database credentials. If you have a password for your MySQL `root` user, add it here:
        ```env
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_mysql_password  <-- Put your password here
        DB_NAME=campus_lost_found
        JWT_SECRET=supersecretkey123
        PORT=5000
        ```
5.  **Start the Server**:
    ```bash
    node server.js
    ```
    *   You should see: `Server is running on port 5000` and `Connected to MySQL database`.
    *   **Keep this terminal open!**

---

## 💻 Step 3: Frontend Setup (User Interface)

The frontend is the React application you interact with.

1.  **Open a New Terminal** (Do not close the backend terminal).
2.  **Navigate to the frontend folder**:
    ```bash
    cd frontend
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Start the Application**:
    ```bash
    npm run dev
    ```
5.  **Access the App**:
    *   The terminal will show a URL, usually `http://localhost:5173`.
    *   Ctrl+Click the link or open your browser and go to `http://localhost:5173`.

---

## 🧪 Testing the Application

### 1. Register a Student
*   Go to the **Register** page.
*   Sign up as a "Student".
*   Login and try "Reporting a Lost Item".

### 2. Admin Access (Pre-configured)
*   **Email**: `admin@college.edu`
*   **Password**: `hashed_password_1` (Note: The raw password for the sample data might not work if not hashed properly. It is recommended to **register a new user** with the role 'Staff' or 'Student' to test standard features).
*   *Tip*: To create a working Admin account via UI:
    1.  Register a new user.
    2.  Go to your database (MySQL).
    3.  Run: `UPDATE users SET role = 'Admin' WHERE email = 'your_new_email@test.com';`
    4.  Log out and Log back in.

---

## ❗ Troubleshooting

*   **"Database connection failed"**:
    *   Check your `.env` file in the `backend` folder.
    *   Ensure your MySQL server is running (Search "Services" in Windows -> Find MySQL -> Start).
    *   Ensure the password in `.env` matches your MySQL root password.

*   **"Port 5000 already in use"**:
    *   Close other node processes or change `PORT` in `.env` to 5001.

*   **Frontend can't connect to Backend**:
    *   Ensure the backend terminal is running and shows "Connected".
    *   Check the browser console (F12) for errors.

---

**Enjoy your Campus Lost & Found System!** 🏛️
