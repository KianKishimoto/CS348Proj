from flask import Blueprint, jsonify, request

from .db import db
from .models import Course, Student
from .serializers import serialize_course, serialize_student

api = Blueprint("api", __name__)


def _build_student_filters(args):
    filters = []

    min_age = args.get("minAge", type=int)
    max_age = args.get("maxAge", type=int)
    min_gpa = args.get("minGpa", type=float)
    max_gpa = args.get("maxGpa", type=float)
    course_id = args.get("courseId")

    if min_age is not None:
        filters.append(Student.age >= min_age)
    if max_age is not None:
        filters.append(Student.age <= max_age)

    if min_gpa is not None:
        filters.append(Student.gpa >= min_gpa)
    if max_gpa is not None:
        filters.append(Student.gpa <= max_gpa)

    if course_id:
        try:
            filters.append(Student.courses.any(Course.id == int(course_id)))
        except ValueError:
            filters.append(False)

    return filters


def _validate_student_payload(payload):
    required_fields = [
        "studentId",
        "firstName",
        "lastName",
        "email",
        "age",
        "gpa",
        "major",
    ]

    missing = [field for field in required_fields if payload.get(field) in (None, "")]
    if missing:
        return f"Missing required fields: {', '.join(missing)}"

    try:
        payload["age"] = int(payload["age"])
        payload["gpa"] = float(payload["gpa"])
    except (TypeError, ValueError):
        return "Age must be an integer and GPA must be a number."

    if payload["gpa"] < 0 or payload["gpa"] > 4:
        return "GPA must be between 0.0 and 4.0."

    course_ids = payload.get("courseIds", [])
    if not isinstance(course_ids, list):
        return "courseIds must be a list."

    try:
        payload["courseIds"] = [int(course_id) for course_id in course_ids]
    except (TypeError, ValueError):
        return "One or more selected course IDs are invalid."
    return None


def _parse_optional_float(raw_value, field_name):
    if raw_value in (None, ""):
        return None, None

    try:
        return float(raw_value), None
    except (TypeError, ValueError):
        return None, f"{field_name} must be a number."


def _parse_optional_string(raw_value):
    if raw_value is None:
        return ""
    return str(raw_value).strip()


def _apply_student_payload(student, payload):
    student.student_id = payload["studentId"]
    student.first_name = payload["firstName"]
    student.last_name = payload["lastName"]
    student.email = payload["email"]
    student.age = payload["age"]
    student.gpa = payload["gpa"]
    student.major = payload["major"]
    student.courses = Course.query.filter(Course.id.in_(payload["courseIds"])).all() if payload["courseIds"] else []


@api.get("/health")
def health():
    return jsonify({"status": "ok"})


@api.get("/courses")
def get_courses():
    courses = [serialize_course(course) for course in Course.query.order_by(Course.course_code.asc()).all()]
    return jsonify(courses)


@api.get("/students")
def get_students():
    filters = _build_student_filters(request.args)
    query = Student.query
    for condition in filters:
        query = query.filter(condition)
    students = [serialize_student(student) for student in query.order_by(Student.last_name.asc(), Student.first_name.asc()).all()]
    return jsonify(students)


@api.get("/reports/course-enrollment-summary")
def get_course_enrollment_summary():
    min_gpa, min_gpa_error = _parse_optional_float(request.args.get("minGpa"), "minGpa")
    if min_gpa_error:
        return jsonify({"error": min_gpa_error}), 400

    major = _parse_optional_string(request.args.get("major"))
    params = {
        "major": major,
        "min_gpa": min_gpa,
    }

    report_query = db.text(
        """
        SELECT
            c.id AS courseId,
            c.course_code AS courseCode,
            c.title AS courseTitle,
            COUNT(s.id) AS studentCount,
            COALESCE(ROUND(AVG(s.gpa), 2), 0) AS averageGpa
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        LEFT JOIN students s ON s.id = e.student_id
            AND (:major = '' OR s.major = :major)
            AND (:min_gpa IS NULL OR s.gpa >= :min_gpa)
        GROUP BY c.id, c.course_code, c.title
        ORDER BY studentCount DESC, c.course_code ASC
        """
    )

    rows = db.session.execute(report_query, params).mappings().all()
    return jsonify(
        [
            {
                "courseId": row["courseId"],
                "courseCode": row["courseCode"],
                "courseTitle": row["courseTitle"],
                "studentCount": int(row["studentCount"]),
                "averageGpa": float(row["averageGpa"]),
            }
            for row in rows
        ]
    )


@api.post("/students")
def create_student():
    payload = request.get_json(force=True)
    error = _validate_student_payload(payload)
    if error:
        return jsonify({"error": error}), 400

    if Student.query.filter_by(student_id=payload["studentId"]).first():
        return jsonify({"error": "studentId must be unique."}), 409

    if Student.query.filter_by(email=payload["email"]).first():
        return jsonify({"error": "email must be unique."}), 409

    try:
        student = Student()
        _apply_student_payload(student, payload)
        db.session.add(student)
        db.session.commit()
        return jsonify(serialize_student(student)), 201
    except Exception:
        db.session.rollback()
        raise


@api.put("/students/<student_id>")
def update_student(student_id):
    try:
        student_key = int(student_id)
    except ValueError:
        return jsonify({"error": "Invalid student ID."}), 400

    payload = request.get_json(force=True)
    error = _validate_student_payload(payload)
    if error:
        return jsonify({"error": error}), 400

    existing = db.session.get(Student, student_key)
    if not existing:
        return jsonify({"error": "Student not found."}), 404

    duplicate = Student.query.filter(Student.student_id == payload["studentId"], Student.id != student_key).first()
    if duplicate:
        return jsonify({"error": "studentId must be unique."}), 409

    email_duplicate = Student.query.filter(Student.email == payload["email"], Student.id != student_key).first()
    if email_duplicate:
        return jsonify({"error": "email must be unique."}), 409

    try:
        _apply_student_payload(existing, payload)
        db.session.commit()
        return jsonify(serialize_student(existing))
    except Exception:
        db.session.rollback()
        raise


@api.delete("/students/<student_id>")
def delete_student(student_id):
    try:
        student_key = int(student_id)
    except ValueError:
        return jsonify({"error": "Invalid student ID."}), 400

    student = db.session.get(Student, student_key)
    if not student:
        return jsonify({"error": "Student not found."}), 404

    try:
        db.session.delete(student)
        db.session.commit()
        return jsonify({"message": "Student deleted."})
    except Exception:
        db.session.rollback()
        raise


@api.post("/seed")
def seed_data():
    try:
        db.session.execute(db.text("DELETE FROM enrollments"))
        Student.query.delete()
        Course.query.delete()

        seeded_courses = [
            Course(course_code="CS 180", title="Problem Solving and OOP", department="Computer Science", credits=4),
            Course(course_code="CS 240", title="Programming in C", department="Computer Science", credits=3),
            Course(course_code="STAT 350", title="Introduction to Statistics", department="Statistics", credits=3),
            Course(course_code="MA 261", title="Multivariate Calculus", department="Mathematics", credits=4),
        ]
        db.session.add_all(seeded_courses)
        db.session.flush()

        seeded_students = [
            Student(
                student_id="S1001",
                first_name="Ava",
                last_name="Patel",
                email="ava.patel@example.com",
                age=19,
                gpa=3.8,
                major="Computer Science",
                courses=[seeded_courses[0], seeded_courses[1]],
            ),
            Student(
                student_id="S1002",
                first_name="Noah",
                last_name="Kim",
                email="noah.kim@example.com",
                age=21,
                gpa=3.4,
                major="Data Science",
                courses=[seeded_courses[1], seeded_courses[2]],
            ),
            Student(
                student_id="S1003",
                first_name="Mia",
                last_name="Garcia",
                email="mia.garcia@example.com",
                age=20,
                gpa=3.9,
                major="Mathematics",
                courses=[seeded_courses[2], seeded_courses[3]],
            ),
            Student(
                student_id="S1004",
                first_name="Liam",
                last_name="Johnson",
                email="liam.johnson@example.com",
                age=22,
                gpa=3.2,
                major="Computer Science",
                courses=[seeded_courses[0], seeded_courses[2]],
            ),
        ]
        db.session.add_all(seeded_students)
        db.session.commit()
        return jsonify({"message": "Seeded sample data."}), 201
    except Exception:
        db.session.rollback()
        raise
