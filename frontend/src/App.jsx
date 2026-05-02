import { useEffect, useState } from "react";
import { api } from "./api/client";
import CourseSummaryPanel from "./components/CourseSummaryPanel";
import FilterPanel from "./components/FilterPanel";
import StudentForm, { buildFormState } from "./components/StudentForm";
import StudentTable from "./components/StudentTable";

const emptyFilters = {
  minAge: "",
  maxAge: "",
  minGpa: "",
  maxGpa: "",
  courseId: "",
};

const emptyReportFilters = {
  major: "",
  minGpa: "",
};

export default function App() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [summaryRows, setSummaryRows] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [reportFilters, setReportFilters] = useState(emptyReportFilters);
  const [form, setForm] = useState(buildFormState(null));
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Load sample data to start the demo.");
  const [errorMessage, setErrorMessage] = useState("");

  async function loadCourses() {
    const data = await api.getCourses();
    setCourses(data);
  }

  async function loadStudents(activeFilters = filters) {
    const data = await api.getStudents(activeFilters);
    setStudents(data);
  }

  async function loadSummary(activeFilters = reportFilters) {
    const data = await api.getCourseEnrollmentSummary(activeFilters);
    setSummaryRows(data);
  }

  async function initialize() {
    try {
      await loadCourses();
      await loadStudents(emptyFilters);
      await loadSummary(emptyReportFilters);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  useEffect(() => {
    initialize();
  }, []);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleReportFilterChange(event) {
    const { name, value } = event.target;
    setReportFilters((current) => ({ ...current, [name]: value }));
  }

  function handleCourseToggle(courseId) {
    setForm((current) => {
      const hasCourse = current.courseIds.includes(courseId);
      return {
        ...current,
        courseIds: hasCourse
          ? current.courseIds.filter((id) => id !== courseId)
          : [...current.courseIds, courseId],
      };
    });
  }

  async function handleSeed() {
    try {
      setErrorMessage("");
      await api.seedData();
      await loadCourses();
      await loadStudents(emptyFilters);
      await loadSummary(emptyReportFilters);
      setFilters(emptyFilters);
      setReportFilters(emptyReportFilters);
      setForm(buildFormState(null));
      setEditingStudentId(null);
      setStatusMessage("Sample MySQL data inserted. The student table and Stage 3 summary report are both refreshed.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setErrorMessage("");
      if (editingStudentId) {
        await api.updateStudent(editingStudentId, form);
        setStatusMessage("Student updated. The report below now reflects the changed data.");
      } else {
        await api.createStudent(form);
        setStatusMessage("Student created. The new record appears in the live report.");
      }
      setForm(buildFormState(null));
      setEditingStudentId(null);
      await loadStudents();
      await loadSummary();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleEdit(student) {
    setEditingStudentId(student.id);
    setForm(buildFormState(student));
    setStatusMessage(`Editing ${student.firstName} ${student.lastName}. Save changes to update the report.`);
  }

  async function handleDelete(studentId) {
    try {
      setErrorMessage("");
      await api.deleteStudent(studentId);
      if (editingStudentId === studentId) {
        setEditingStudentId(null);
        setForm(buildFormState(null));
      }
      await loadStudents();
      await loadSummary();
      setStatusMessage("Student deleted. The student table and summary report refreshed to show the remaining records.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleApplyFilters() {
    try {
      setErrorMessage("");
      await loadStudents(filters);
      setStatusMessage("Report refreshed using the selected age, GPA, and course filters.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleClearFilters() {
    try {
      setErrorMessage("");
      setFilters(emptyFilters);
      await loadStudents(emptyFilters);
      setStatusMessage("Filters cleared. The full report is visible again.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleApplyReportFilters() {
    try {
      setErrorMessage("");
      await loadSummary(reportFilters);
      setStatusMessage("Course enrollment summary refreshed using the selected report filters.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleClearReportFilters() {
    try {
      setErrorMessage("");
      setReportFilters(emptyReportFilters);
      await loadSummary(emptyReportFilters);
      setStatusMessage("Stage 3 report filters cleared.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleCancelEdit() {
    setEditingStudentId(null);
    setForm(buildFormState(null));
    setStatusMessage("Edit mode canceled.");
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Student Portal</p>
          <h1>Student Records</h1>
          <p className="hero-copy">
            Manage student information, course selections, and academic records in one place.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={handleSeed}>
          Load Sample Data
        </button>
      </section>

      <section className="status-bar">
        <span>{statusMessage}</span>
        {errorMessage ? <span className="error-text">{errorMessage}</span> : null}
      </section>

      <div className="layout-grid">
        <StudentForm
          courses={courses}
          form={form}
          editingStudentId={editingStudentId}
          onChange={handleFormChange}
          onCourseToggle={handleCourseToggle}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
        />

        <FilterPanel
          filters={filters}
          courses={courses}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </div>

      <StudentTable students={students} onEdit={handleEdit} onDelete={handleDelete} />
      <CourseSummaryPanel
        reportFilters={reportFilters}
        summaryRows={summaryRows}
        onChange={handleReportFilterChange}
        onApply={handleApplyReportFilters}
        onClear={handleClearReportFilters}
      />
    </main>
  );
}
