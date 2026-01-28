// const API_BASE = "http://127.0.0.1:8000/api";
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

/* =========================
   TOKEN HELPERS
========================= */
function getAccessToken() {
  return sessionStorage.getItem("access");
}

function authHeaders(extra = {}) {
  const token = getAccessToken();
  return {
    Authorization: token ? `Bearer ${token}` : "",
    ...extra,
  };
}

/* =========================
   GENERIC FETCH WRAPPER
========================= */
async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);

  // 🔐 Auth errors → logout
  if (response.status === 401) {
    sessionStorage.removeItem("access");
    sessionStorage.removeItem("refresh");
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    throw new Error("Permission Denied (Not Admin)");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw data || new Error("Request failed");
  }

  return data;
}

/* =========================
   AUTH
========================= */
export function loginUser(data) {
  return apiFetch(`${API_BASE}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function signupUser(data) {
  return apiFetch(`${API_BASE}/users/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export function logoutUser() {
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
}

/* =========================
   PROFILE
========================= */
export function getProfile() {
  return apiFetch(`${API_BASE}/users/profile/`, {
    headers: authHeaders(),
  });
}

export function updateProfile(data) {
  return apiFetch(`${API_BASE}/users/profile/update/`, {
    method: "PUT",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });
}

export function updateAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiFetch(`${API_BASE}/users/profile/avatar/`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
}

/* =========================
   COURSES (STUDENT)
========================= */
export function getMyCourses() {
  return apiFetch(`${API_BASE}/courses/my-courses/`, {
    headers: authHeaders(),
  });
}

/* =========================
   STUDENT PROGRESS
========================= */
export function getStudentProgress() {
  return apiFetch(`${API_BASE}/courses/progress/`, {
    headers: authHeaders(),
  });
}

export function completeTopic(topicId) {
  return apiFetch(`${API_BASE}/courses/complete-topic/${topicId}/`, {
    method: "POST",
    headers: authHeaders(),
  });
}

/* =========================
   REFRESH ACCESS TOKEN
========================= */
export async function refreshAccessToken() {
  const refresh = sessionStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  sessionStorage.setItem("access", data.access);
  return data.access;
}

/* =========================
   ADMIN
========================= */
export function getAdminUsers() {
  return apiFetch(`${API_BASE}/admin/users/`, {
    headers: authHeaders(),
  });
}

export function getAdminCourses() {
  return apiFetch(`${API_BASE}/admin/courses/`, {
    headers: authHeaders(),
  });
}

export function assignCourse(userId, courseId) {
  return apiFetch(`${API_BASE}/admin/assign-course/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ user: userId, course: courseId }),
  });
}

export function createCourse(title, description = "") {
  return apiFetch(`${API_BASE}/admin/courses/create/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ title, description }),
  });
}

export function removeCourse(courseId) {
  return apiFetch(`${API_BASE}/admin/courses/remove/${courseId}/`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export function getAdminUsersProgress() {
  return apiFetch(`${API_BASE}/admin/users-progress/`, {
    headers: authHeaders(),
  });
}

export function updateCourse(courseId, data) {
  return apiFetch(`${API_BASE}/admin/courses/update/${courseId}/`, {
    method: "PUT",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });
}

/* =========================
   ADMIN – COURSE STRUCTURE
========================= */
export function createSection(courseId, title, order) {
  return apiFetch(`${API_BASE}/courses/admin/section/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ title, course: courseId, order }),
  });
}

export function createLesson(sectionId, title, order) {
  return apiFetch(`${API_BASE}/courses/admin/lesson/`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      title,
      section: sectionId,
      content: "Draft content",
      order,
      xp: 10,
    }),
  });
}

export function getCourseStructure(courseId) {
  return apiFetch(`${API_BASE}/courses/${courseId}/content/`, {
    headers: authHeaders(),
  });
}

export function completeLesson(lessonId) {
  return apiFetch(`${API_BASE}/courses/lessons/${lessonId}/complete/`, {
    method: "POST",
    headers: authHeaders(),
  });
}
