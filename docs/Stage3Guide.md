# Stage 3 Implementation Guide

This document summarizes the Stage 3 concepts implemented in the project and gives you clear code locations to show during the demo.

## 1. SQL Injection Protection

The backend protects against SQL injection in two main ways:

- The CRUD routes use SQLAlchemy ORM queries instead of string-building SQL. Examples:
  - `Student.query.filter_by(...)`
  - `Student.query.filter(...)`
  - `Course.query.filter(...)`
- The Stage 3 summary report uses a parameterized SQL statement with named bind variables:
  - `db.text(...)` in `backend/app/routes.py`
  - parameters are passed separately through `db.session.execute(report_query, params)`

Why this matters:

- User input is never concatenated directly into SQL strings.
- The database driver treats `:major` and `:min_gpa` as bound parameters rather than executable SQL text.
- Input is also validated and converted before use, which helps reject malformed data early.

Good code locations to show:

- `backend/app/routes.py` in `_validate_student_payload`
- `backend/app/routes.py` in `get_course_enrollment_summary`
- `backend/app/routes.py` in `get_students`, `create_student`, and `update_student`

## 2. Indexes

The project now includes explicit indexes for meaningful app queries.

To support an existing Stage 2 database, the app also checks for the Stage 3 indexes at startup and creates them if they are missing.

### `ix_students_age_gpa`

Defined on:

- `students(age, gpa)`

Why it exists:

- Supports the student report filters used by `GET /api/students`
- Helps when the user filters by age range and GPA range in the main report

Good demo connection:

- Show the filter panel in the UI
- Then show `_build_student_filters` in `backend/app/routes.py`
- Then show the index in `backend/app/models.py`

### `ix_students_major_last_first`

Defined on:

- `students(major, last_name, first_name)`

Why it exists:

- Supports filtering the Stage 3 course summary report by major
- Helps preserve a meaningful lookup path for report use cases involving major and sorted student names

Good demo connection:

- Show the Stage 3 course summary panel
- Show that it can be filtered by major

### `ix_enrollments_course_student`

Defined on:

- `enrollments(course_id, student_id)`

Why it exists:

- Supports joins that start from a course and find enrolled students
- Helps the summary report that groups by course and counts matching students
- Useful for course-based filters and many-to-many relationship lookups

Good demo connection:

- Show the course enrollment summary report
- Point out the `courses -> enrollments -> students` join in the parameterized report query

## 3. Transactions and Isolation Level

### Isolation level

The SQLAlchemy engine is configured with:

- `READ COMMITTED`

Location:

- `backend/app/__init__.py`

Why this choice is reasonable:

- It avoids reading another transaction's uncommitted changes.
- It is a practical default for a web app where multiple users may update data concurrently.
- It reduces the risk of showing dirty reads while keeping behavior straightforward for CRUD operations and reports.

### Transaction handling

Write routes now explicitly protect the session with commit/rollback handling:

- `create_student`
- `update_student`
- `delete_student`
- `seed_data`

Location:

- `backend/app/routes.py`

Why this matters:

- A student update plus course assignment changes should succeed together or fail together.
- If a database error happens mid-request, the session is rolled back so partial writes do not remain in place.
- This gives you a clean "atomic change" story for the demo.

## 4. Stage 3 Report

The app now includes a Stage 3 report panel:

- `Course Enrollment Summary`

What it shows:

- course code and title
- student count per course
- average GPA per course

What it demonstrates:

- a real report powered by SQL
- safe parameter binding
- joins across multiple tables
- a query that benefits from the new indexes

Frontend code locations:

- `frontend/src/App.jsx`
- `frontend/src/components/CourseSummaryPanel.jsx`
- `frontend/src/api/client.js`

## 5. AI Usage

AI tools used:

- Codex / ChatGPT-style coding assistance

What AI assisted with:

- planning the Stage 3 implementation
- generating and refining backend and frontend code changes
- drafting documentation and demo structure

How the output was verified or modified:

- the generated code was reviewed and adjusted to fit the existing Flask + React project structure
- the implementation was aligned with the assignment PDF requirements
- the final code paths were checked against the current repository before being kept

This section exists to satisfy the assignment requirement that AI usage be disclosed in project documentation and discussed during the recorded demo.
