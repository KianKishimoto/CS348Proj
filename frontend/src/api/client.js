const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.error || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getCourses() {
    return request("/courses");
  },
  getStudents(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        params.set(key, value);
      }
    });
    const suffix = params.toString() ? `?${params}` : "";
    return request(`/students${suffix}`);
  },
  getCourseEnrollmentSummary(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        params.set(key, value);
      }
    });
    const suffix = params.toString() ? `?${params}` : "";
    return request(`/reports/course-enrollment-summary${suffix}`);
  },
  createStudent(payload) {
    return request("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateStudent(studentId, payload) {
    return request(`/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteStudent(studentId) {
    return request(`/students/${studentId}`, {
      method: "DELETE",
    });
  },
  seedData() {
    return request("/seed", {
      method: "POST",
    });
  },
};
