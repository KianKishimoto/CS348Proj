export default function CourseSummaryPanel({
  reportFilters,
  summaryRows,
  onChange,
  onApply,
  onClear,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Stage 3 Report</p>
          <h2>Course Enrollment Summary</h2>
        </div>
      </div>

      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onApply();
        }}
      >
        <label>
          Major filter
          <input
            name="major"
            value={reportFilters.major}
            onChange={onChange}
            placeholder="Example: Computer Science"
          />
        </label>
        <label>
          Minimum GPA
          <input
            name="minGpa"
            type="number"
            min="0"
            max="4"
            step="0.1"
            value={reportFilters.minGpa}
            onChange={onChange}
          />
        </label>

        <div className="button-row full-width">
          <button className="primary-button" type="submit">
            Refresh Report
          </button>
          <button className="ghost-button" type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </form>

      <div className="table-wrapper report-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Students</th>
              <th>Average GPA</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-cell">
                  No courses are available for this report.
                </td>
              </tr>
            ) : (
              summaryRows.map((row) => (
                <tr key={row.courseId}>
                  <td>
                    <strong>{row.courseCode}</strong>
                    <div className="secondary-cell">{row.courseTitle}</div>
                  </td>
                  <td>{row.studentCount}</td>
                  <td>{row.averageGpa.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
