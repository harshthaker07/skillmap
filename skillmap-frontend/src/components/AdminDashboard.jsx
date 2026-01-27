import { useEffect, useState } from "react";
import {
  getAdminUsers,
  getAdminCourses,
  getAdminUsersProgress,
  assignCourse,
  createCourse,
  updateCourse,
  removeCourse,
} from "../api";
import "../adminDashboard.css";
import CurriculumBuilder from "./CurriculumBuilder";

function AdminDashboard({ onLogout }) {
  /* =========================
     STATE
  ========================= */
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [usersProgress, setUsersProgress] = useState([]);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  const [editingCourse, setEditingCourse] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");



  const [managingCourseId, setManagingCourseId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("all");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  /* =========================
     LOAD ADMIN DATA
  ========================= */
  const loadAdminData = async () => {
    try {
      const [u, c, p] = await Promise.all([
        getAdminUsers(),
        getAdminCourses(),
        getAdminUsersProgress(),
      ]);
      setUsers(u);
      setCourses(c);
      setUsersProgress(p);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  /* =========================
     ASSIGN COURSE
  ========================= */
  const handleAssign = async () => {
    if (!selectedUser || !selectedCourse) {
      setMessage("❌ Select user and course");
      return;
    }

    setAssigning(true);
    try {
      await assignCourse(
        Number(selectedUser),
        Number(selectedCourse)
      );
      await loadAdminData();
      setSelectedUser("");
      setSelectedCourse("");
      setMessage("✅ Course assigned");
    } catch {
      setMessage("❌ Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  /* =========================
     CREATE COURSE
  ========================= */
  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      setMessage("❌ Course title required");
      return;
    }

    setCreating(true);
    try {
      await createCourse(newCourseTitle, newCourseDesc);
      setNewCourseTitle("");
      setNewCourseDesc("");
      await loadAdminData();
      setMessage("✅ Course created");
    } catch {
      setMessage("❌ Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  /* =========================
     EDIT COURSE
  ========================= */
  const openEditCourse = (course) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditDesc(course.description || "");
  };

  const handleUpdateCourse = async () => {
    if (!editTitle.trim()) {
      setMessage("❌ Title required");
      return;
    }

    setUpdating(true);
    try {
      await updateCourse(editingCourse.id, {
        title: editTitle,
        description: editDesc,
      });
      await loadAdminData();
      setEditingCourse(null);
      setMessage("✅ Course updated");
    } catch {
      setMessage("❌ Failed to update course");
    } finally {
      setUpdating(false);
    }
  };

  /* =========================
     REMOVE COURSE
  ========================= */
  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm("Remove course globally?")) return;

    try {
      await removeCourse(courseId);
      await loadAdminData();
      setMessage("✅ Course removed");
    } catch {
      setMessage("❌ Failed to remove course");
    }
  };

  /* =========================
     SEARCH & FILTER
  ========================= */
  const filteredUsers = usersProgress.filter((u) => {
    const matchText =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const p = u.progress;
    const matchProgress =
      progressFilter === "all" ||
      (progressFilter === "not_started" && p === 0) ||
      (progressFilter === "in_progress" && p > 0 && p < 100) ||
      (progressFilter === "completed" && p === 100);

    return matchText && matchProgress;
  });

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Dashboard…
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* CURRICULUM BUILDER OVERLAY */}
      {managingCourseId && (
        <div style={{ marginBottom: 30, background: "white", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <CurriculumBuilder
            courseId={managingCourseId}
            onClose={() => setManagingCourseId(null)}
          />
        </div>
      )}

      {/* ASSIGN COURSE */}
      <div className="admin-card">
        <h3>Assign Course</h3>
        <div className="assign-row">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={handleAssign} disabled={assigning}>
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </div>
        {message && <p className="status-msg">{message}</p>}
      </div>

      {/* CREATE COURSE */}
      <div className="admin-card">
        <h3>Add Course</h3>
        <input
          placeholder="Title"
          value={newCourseTitle}
          onChange={(e) => setNewCourseTitle(e.target.value)}
        />
        <input
          placeholder="Description"
          value={newCourseDesc}
          onChange={(e) => setNewCourseDesc(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreateCourse} disabled={creating}>
          {creating ? "Creating..." : "Add"}
        </button>
      </div>

      {/* USER PROGRESS */}
      <div className="admin-card">
        <h3>User Progress</h3>

        <div className="filter-row">
          <input
            placeholder="Search user/email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="not_started">0%</option>
            <option value="in_progress">In progress</option>
            <option value="completed">100%</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Courses</th>
                <th>Completed</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const done = u.courses.filter((c) => c.completed).length;
                return (
                  <tr key={u.id}>
                    <td><strong>{u.username}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      {u.courses.length === 0
                        ? <span className="muted">No courses</span>
                        : u.courses.map((c) => (
                          <span
                            key={c.id}
                            className={`course-pill ${c.completed ? "course-done" : "course-pending"
                              }`}
                          >
                            {c.title}
                          </span>
                        ))}
                    </td>
                    <td>
                      {u.courses.length === 0
                        ? "0 / 0"
                        : `${done} / ${u.courses.length}`}
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${u.progress}%` }}
                          />
                        </div>
                        <span>{u.progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COURSES */}
      <div className="admin-card">
        <h3>Courses</h3>
        <ul className="list">
          {courses.map((c) => (
            <li key={c.id}>
              {c.title}
              <div>
                <button className="btn btn-primary btn-sm" style={{ marginRight: 8 }} onClick={() => setManagingCourseId(c.id)}>Manage Content</button>
                <button className="btn btn-secondary btn-sm" style={{ marginRight: 8 }} onClick={() => openEditCourse(c)}>Edit</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveCourse(c.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* EDIT MODAL */}
      {editingCourse && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Course</h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <div className="modal-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setEditingCourse(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdateCourse} disabled={updating}>
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
