export default function StudentTable({ students, onEdit, onDelete }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Live Report</p>
          <h2>Students</h2>
        </div>
        <span className="pill">{students.length} records</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>GPA</th>
              <th>Major</th>
              <th>Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-cell">
                  No students match the current filters.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>
                    {student.firstName} {student.lastName}
                  </td>
                  <td>{student.age}</td>
                  <td>{student.gpa.toFixed(1)}</td>
                  <td>{student.major}</td>
                  <td>{student.courses.map((course) => course.courseCode).join(", ") || "None"}</td>
                  <td>
                    <div className="action-row">
                      <button className="ghost-button small" type="button" onClick={() => onEdit(student)}>
                        Edit
                      </button>
                      <button className="danger-button small" type="button" onClick={() => onDelete(student.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
