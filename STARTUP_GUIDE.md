# Startup Guide

## Before You Start

This project needs three things running:

- MySQL server
- Flask backend
- React frontend

## Step 1: Start MySQL

Try one of these:

```bash
brew services start mysql
```

or

```bash
mysql.server start
```

## Step 2: Create the database

If your MySQL root account has no password:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS cs348_stage2;"
```

If your MySQL root account does have a password:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cs348_stage2;"
```

## Step 3: Start the backend

```bash
cd /Users/kiankishimoto/Downloads/CS348Proj/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

The backend should be available at `http://localhost:5050`.

## Step 4: Start the frontend

Open a second terminal window and run:

```bash
cd /Users/kiankishimoto/Downloads/CS348Proj/frontend
npm install
npm run dev
```

The frontend should be available at `http://localhost:5173`.

## Step 5: Use the app

1. Open `http://localhost:5173`
2. Click `Load Sample Data`
3. Show create, update, and delete on students
4. Show filtering by age and GPA
5. Show that courses are loaded dynamically from the database

## Common Problems

### MySQL socket error

If you see an error about `/tmp/mysql.sock`, MySQL is not running yet.

### Access denied for user `root`

Your local MySQL root user has a password. Update `MYSQL_PASSWORD` in:

- [backend/.env](/Users/kiankishimoto/Downloads/CS348Proj/backend/.env)

### Backend starts but frontend shows request errors

Make sure the backend terminal still shows Flask running on port `5050`.
