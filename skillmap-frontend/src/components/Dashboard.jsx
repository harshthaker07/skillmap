import { useEffect, useState } from "react";
import "../dashboard.css";

import ProfileCard from "./ProfileCard";
import Chatbot from "./Chatbot";
import ProgressChart from "./ProgressChart";
import XpLineChart from "./XpLineChart";
import CourseChecklist from "./CourseChecklist";
import CourseDetail from "./CourseDetail";
import BrowseCourses from "./BrowseCourses";

import { getProfile, getMyCourses, getStudentProgress, updateProfile, updateAvatar } from "../api";

function Dashboard({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProgress, setStudentProgress] = useState({ total_courses: 0, completed_courses: 0, progress: 0, xp_history: [] });

  async function fetchProgress() {
    try {
      const res = await getStudentProgress();
      setStudentProgress(res || { total_courses: 0, completed_courses: 0, progress: 0, xp_history: [] });
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  }

  async function fetchCourses() {
    try {
      const c = await getMyCourses();
      setCourses(c || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  }

  async function refreshData() {
    await Promise.all([fetchCourses(), fetchProgress()]);
  }

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile();
        setProfile(p);
        await refreshData();
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [designation, setDesignation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showBrowse, setShowBrowse] = useState(false);

  const openEditProfile = () => {
    setDesignation(profile?.designation || "");
    setSkillsInput((profile?.skills || []).join(", "));
    setAvatarFile(null);
    setIsEditing(true);
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) setAvatarFile(f);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ designation, skills: skillsInput.split(",").map(s => s.trim()).filter(Boolean) });
      if (avatarFile) {
        await updateAvatar(avatarFile);
      }
      const p = await getProfile();
      setProfile(p);
      setIsEditing(false);
      alert("Profile updated");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="hero modern-card">
        <div className="hero-left">
          <h1>Hello, {profile?.first_name || profile?.username || "Learner"} 👋</h1>
          <p className="muted">Welcome back. Continue learning and build new skills today.</p>

          <div className="hero-stats">
            <div className="stat">
              <strong>{studentProgress.total_courses}</strong>
              <div className="muted">Courses</div>
            </div>
            <div className="stat">
              <strong>{studentProgress.completed_courses}</strong>
              <div className="muted">Completed</div>
            </div>
            <div className="stat">
              <strong>{studentProgress.progress}%</strong>
              <div className="muted">Overall Progress</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (courses && courses.length) setSelectedCourseId(courses[0].id);
                else alert("No courses assigned yet.");
              }}
            >
              Continue Learning
            </button>
            <button className="btn btn-secondary" style={{ marginLeft: 12 }} onClick={openEditProfile}>Edit Profile</button>
          </div>
        </div>

        <div className="hero-right">
          <ProfileCard
            name={profile && profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile?.username}
            role={profile?.designation}
            email={profile?.email}
            location="India"
            skills={profile?.skills || []}
            avatar={profile?.avatar}
            onEdit={openEditProfile}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-col">
          <div className="card">
            <h2 className="section-title">My Courses</h2>
            {courses.length === 0 ? (
              <div className="p-4 text-center text-muted">No courses assigned yet.</div>
            ) : (
              <div className="courses-grid">
                {courses.map((c) => (
                  <div key={c.id} className="course-card">
                    <div className="progress-badge">{c.progress || 0}%</div>
                    <div className="thumb">{c.title.charAt(0)}</div>
                    <div className="meta">
                      <div className="title">{c.title}</div>
                      <div className="subtitle">{c.completed ? "Completed" : "In Progress"}</div>
                      <div className="course-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${c.progress || 0}%`, background: `linear-gradient(90deg, var(--primary), var(--secondary))` }} />
                        </div>
                        <div className="progress-meta">{c.progress || 0}% • {c.completed_lessons}/{c.total_lessons} lessons</div>
                      </div>
                    </div>
                    <div className="actions">
                      <button className="btn btn-primary" onClick={() => setSelectedCourseId(c.id)}>Continue</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="section-title">Your Insights</h2>
            <div className="insights-grid">
              <ProgressChart completed={studentProgress.completed_courses || 0} total={studentProgress.total_courses || 0} />
              <XpLineChart data={studentProgress.xp_history || []} />
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="card">
            <h2 className="section-title">Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-primary" onClick={() => setShowBrowse(true)}>Browse Courses</button>
              <button className="btn btn-secondary" onClick={() => alert('Not implemented')}>Certificates</button>
              <button className="btn btn-secondary" onClick={() => alert('Not implemented')}>Settings</button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Chatbot />
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal edit-profile-modal">
            <h3>Edit Profile</h3>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div className="profile-avatar" style={{ width: 64, height: 64 }}>
                {profile?.avatar ? (
                  <img src={`http://127.0.0.1:8000${profile.avatar}`} alt="avatar" />
                ) : (
                  profile?.username?.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <label className="btn btn-secondary" style={{ marginBottom: 8 }}>
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
                {avatarFile && <div style={{ fontSize: 12 }}><strong>Selected:</strong> {avatarFile.name}</div>}
              </div>
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {selectedCourseId && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="btn btn-secondary" style={{ float: 'right' }} onClick={() => setSelectedCourseId(null)}>Close</button>
            <CourseDetail courseId={selectedCourseId} onClose={() => setSelectedCourseId(null)} onProgressUpdate={() => refreshData()} />
          </div>
        </div>
      )}

      {/* Browse Modal */}
      {showBrowse && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="btn btn-secondary" style={{ float: 'right' }} onClick={() => setShowBrowse(false)}>Close</button>
            <BrowseCourses onClose={() => setShowBrowse(false)} onEnrolled={() => { setShowBrowse(false); refreshData(); }} />
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
