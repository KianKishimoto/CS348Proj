from flask import Flask
from flask_cors import CORS
from sqlalchemy import inspect

from .db import build_database_uri, db
from .routes import api


def _ensure_stage3_indexes():
    inspector = inspect(db.engine)
    existing_indexes = {
        "students": {index["name"] for index in inspector.get_indexes("students")},
        "enrollments": {index["name"] for index in inspector.get_indexes("enrollments")},
    }

    statements = []
    if "ix_students_age_gpa" not in existing_indexes["students"]:
        statements.append("CREATE INDEX ix_students_age_gpa ON students (age, gpa)")
    if "ix_students_major_last_first" not in existing_indexes["students"]:
        statements.append("CREATE INDEX ix_students_major_last_first ON students (major, last_name, first_name)")
    if "ix_enrollments_course_student" not in existing_indexes["enrollments"]:
        statements.append("CREATE INDEX ix_enrollments_course_student ON enrollments (course_id, student_id)")

    for statement in statements:
        db.session.execute(db.text(statement))

    if statements:
        db.session.commit()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = build_database_uri()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "isolation_level": "READ COMMITTED",
        "pool_pre_ping": True,
    }
    CORS(app)
    db.init_app(app)

    with app.app_context():
        from . import models  # noqa: F401

        db.create_all()
        _ensure_stage3_indexes()

    app.register_blueprint(api, url_prefix="/api")
    return app
