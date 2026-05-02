const emptyForm = {
  studentId: "",
  firstName: "",
  lastName: "",
  email: "",
  age: "",
  gpa: "",
  major: "",
  courseIds: [],
};

export function buildFormState(student) {
  if (!student) {
    return { ...emptyForm, courseIds: [] };
  }

  return {
    studentId: student.studentId,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    age: String(student.age),
    gpa: String(student.gpa),
    major: student.major,
    courseIds: student.courseIds || [],
  };
}

export default function StudentForm({
  courses,
  form,
  editingStudentId,
  onChange,
  onCourseToggle,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{editingStudentId ? "Update Student" : "Create Student"}</h2>
        </div>
        {editingStudentId && (
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancel edit
          </button>
        )}
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Student ID
          <input name="studentId" value={form.studentId} onChange={onChange} required />
        </label>
        <label>
          First name
          <input name="firstName" value={form.firstName} onChange={onChange} required />
        </label>
        <label>
          Last name
          <input name="lastName" value={form.lastName} onChange={onChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          Age
          <input name="age" type="number" min="0" value={form.age} onChange={onChange} required />
        </label>
        <label>
          GPA
          <input
            name="gpa"
            type="number"
            min="0"
            max="4"
            step="0.1"
            value={form.gpa}
            onChange={onChange}
            required
          />
        </label>
        <label className="full-width">
          Major
          <input name="major" value={form.major} onChange={onChange} required />
        </label>

        <fieldset className="full-width checkbox-fieldset">
          <legend>Course Selection</legend>
          <div className="checkbox-grid">
            {courses.map((course) => (
              <label key={course.id} className="checkbox-card">
                <input
                  type="checkbox"
                  checked={form.courseIds.includes(course.id)}
                  onChange={() => onCourseToggle(course.id)}
                />
                <span>
                  {course.courseCode} - {course.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button className="primary-button full-width" type="submit">
          {editingStudentId ? "Save Changes" : "Add Student"}
        </button>
      </form>
    </section>
  );
}
