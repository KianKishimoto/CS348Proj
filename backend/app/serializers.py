def serialize_course(course):
    return {
        "id": course.id,
        "courseCode": course.course_code,
        "title": course.title,
        "department": course.department,
        "credits": course.credits,
    }


def serialize_student(student):
    return {
        "id": student.id,
        "studentId": student.student_id,
        "firstName": student.first_name,
        "lastName": student.last_name,
        "email": student.email,
        "age": student.age,
        "gpa": float(student.gpa),
        "major": student.major,
        "courseIds": [course.id for course in student.courses],
        "courses": [serialize_course(course) for course in student.courses],
    }
