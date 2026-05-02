# Database Design

I used MySQL for this project.

There are 3 main tables:
- students
- courses
- enrollments

The students table has the student info like:
- id
- student_id
- first_name
- last_name
- email
- age
- gpa
- major

The primary key is `id`.
I also made `student_id` unique since that is the student number used in the app.

The courses table has:
- id
- course_code
- title
- department
- credits

The primary key is `id`.
`course_code` is unique too.

The enrollments table is just there to connect students and courses.
It has:
- student_id
- course_id

Both of those are foreign keys.
`student_id` points to `students.id` and `course_id` points to `courses.id`.

I did it this way because a student can have multiple courses, and a course can also have multiple students.
So it is a many-to-many relationship.

This design lets the app do the main things it needs to do:
- add, update, and delete students
- filter students by age and GPA
- show reports
- load the course list from the database instead of hard-coding it
