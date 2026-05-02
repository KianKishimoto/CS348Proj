# CS 348 Stages 2 and 3 Demo

This repository contains a complete starter implementation for stage 2 using:

- React frontend
- Flask backend
- MySQL database

The sample domain is a student records system with courses and enrollments. It demonstrates:

- Insert, update, and delete on the `students` table
- Filtering by age range and GPA range
- A live report that refreshes after data changes
- Dynamic course checkboxes and dropdown options loaded from MySQL
- Stage 3 documentation and reporting support for SQL injection protection, indexes, transactions, and AI usage

## Project Structure

```text
backend/
  app/
    __init__.py
    db.py
    models.py
    routes.py
    serializers.py
  .env.example
  requirements.txt
  run.py
frontend/
  src/
    api/
    components/
    App.jsx
    main.jsx
    styles.css
  package.json
docs/
  DatabaseDesign.md
  Stage3Guide.md
```

## Stage 3 Highlights

Stage 3 is implemented with:

- explicit database indexes for student filters and course-based report joins
- a parameterized SQL report endpoint at `GET /api/reports/course-enrollment-summary`
- transaction-safe CRUD and seed operations with rollback handling
- SQLAlchemy engine isolation level set to `READ COMMITTED`
- an AI usage disclosure section in [docs/Stage3Guide.md](docs/Stage3Guide.md)

## Backend Setup

1. Create a Python virtual environment inside `backend/`.
2. Install dependencies from `backend/requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Fill in your MySQL connection values.
5. Run the Flask server from `backend/`.

Example commands:

```bash
cd /Users/kiankishimoto/Downloads/CS348Proj/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

The backend will run at [http://localhost:5050](http://localhost:5050).

Example `backend/.env`:

```env
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=cs348_stage2
```

## Frontend Setup

1. Install dependencies from `frontend/package.json`.
2. Start the Vite development server from `frontend/`.

Example commands:

```bash
cd /Users/kiankishimoto/Downloads/CS348Proj/frontend
npm install
npm run dev
```

The frontend will run at [http://localhost:5173](http://localhost:5173).

## Demo Flow

1. Start the backend and frontend.
2. Click `Load Sample Data`.
3. Show the student table as the initial report.
4. Insert a student using the form.
5. Edit one student and point out the changed report.
6. Delete one student and point out the changed report.
7. Apply age and GPA filters and show the filtered report.
8. Point out that course checkboxes and dropdown options come from MySQL through `GET /api/courses`.

## Startup Guide

If you have never run a React + Flask project before, use this exact order.

### 1. Start MySQL

Your MySQL client is installed, but the server was not running when I checked. Start it using whichever method matches how you installed it.

If you installed MySQL with Homebrew, try:

```bash
brew services start mysql
```

If that does not work, try:

```bash
mysql.server start
```

### 2. Create the database once

If your local MySQL root user has no password:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS cs348_stage2;"
```

If your root user has a password:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cs348_stage2;"
```

### 3. Start the Flask backend

```bash
cd /Users/kiankishimoto/Downloads/CS348Proj/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Leave that terminal open. The backend should stay running at [http://localhost:5050](http://localhost:5050).

### 4. Start the React frontend in a new terminal

```bash
cd /Users/kiankishimoto/Downloads/CS348Proj/frontend
npm install
npm run dev
```

Leave that terminal open too. The frontend should run at [http://localhost:5173](http://localhost:5173).

### 5. Open the app

Go to [http://localhost:5173](http://localhost:5173) in your browser.

Then:

1. Click `Load Sample Data`
2. Create a student
3. Edit a student
4. Delete a student
5. Use the age/GPA filters

### 6. If something fails

- If `mysql -u root ...` fails, your MySQL server is not running yet or your root password is different.
- If `pip install` fails, make sure you are inside the `backend` folder and your virtual environment is activated.
- If `npm install` fails, rerun it inside the `frontend` folder.
- If the page loads but shows API errors, make sure the Flask backend is still running on port `5050`.

## Important Notes

- The app currently assumes the backend runs on port `5050`.
- The frontend currently assumes the backend API is `http://localhost:5050/api`.
- Sample data can be inserted using `POST /api/seed` or the `Load Sample Data` button in the UI.
