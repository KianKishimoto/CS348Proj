from .db import db


enrollments = db.Table(
    "enrollments",
    db.Column("student_id", db.Integer, db.ForeignKey("students.id"), primary_key=True),
    db.Column("course_id", db.Integer, db.ForeignKey("courses.id"), primary_key=True),
    db.Index("ix_enrollments_course_student", "course_id", "student_id"),
)


class Student(db.Model):
    __tablename__ = "students"
    __table_args__ = (
        db.Index("ix_students_age_gpa", "age", "gpa"),
        db.Index("ix_students_major_last_first", "major", "last_name", "first_name"),
    )

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gpa = db.Column(db.Numeric(2, 1), nullable=False)
    major = db.Column(db.String(100), nullable=False)
    courses = db.relationship("Course", secondary=enrollments, back_populates="students")


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    students = db.relationship("Student", secondary=enrollments, back_populates="courses")
