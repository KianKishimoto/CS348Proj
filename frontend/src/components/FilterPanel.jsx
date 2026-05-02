export default function FilterPanel({ filters, courses, onChange, onApply, onClear }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Student Report Filters</h2>
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
          Minimum age
          <input name="minAge" type="number" min="0" max="120" value={filters.minAge} onChange={onChange} />
        </label>
        <label>
          Maximum age
          <input name="maxAge" type="number" min="0" max="120" value={filters.maxAge} onChange={onChange} />
        </label>
        <label>
          Minimum GPA
          <input name="minGpa" type="number" min="0" max="4" step="0.1" value={filters.minGpa} onChange={onChange} />
        </label>
        <label>
          Maximum GPA
          <input name="maxGpa" type="number" min="0" max="4" step="0.1" value={filters.maxGpa} onChange={onChange} />
        </label>
        <label className="full-width">
          Course filter
          <select name="courseId" value={filters.courseId} onChange={onChange}>
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseCode} - {course.title}
              </option>
            ))}
          </select>
        </label>

        <div className="button-row full-width">
          <button className="primary-button" type="submit">
            Apply Filters
          </button>
          <button className="ghost-button" type="button" onClick={onClear}>
            Clear
          </button>
        </div>
      </form>
    </section>
  );
}
