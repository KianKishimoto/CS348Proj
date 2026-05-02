import os

from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

db = SQLAlchemy()


def build_database_uri():
    explicit_uri = os.getenv("MYSQL_URI")
    if explicit_uri:
        return explicit_uri

    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_PASSWORD", "")
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    database = os.getenv("MYSQL_DB")

    if not all([user, database]):
        raise RuntimeError(
            "MySQL configuration is missing. Set MYSQL_URI or MYSQL_USER and MYSQL_DB in backend/.env."
        )

    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
