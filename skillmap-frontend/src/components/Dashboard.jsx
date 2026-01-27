// import { useEffect, useState } from "react";
// import "../dashboard.css";
// import ProfileCard from "./ProfileCard";
// import Chatbot from "./Chatbot";
// import {
//   getProfile,
//   getMyCourses,
//   getStudentProgress,
//   completeTopic,
//   updateProfile,
//   updateAvatar,
// } from "../api";
// import ProgressChart from "./ProgressChart";

// function Dashboard({ onLogout }) {
//   /* =========================
//      STATE
//   ========================= */
//   const [profile, setProfile] = useState(null);
//   const [courses, setCourses] = useState([]);
//   const [stats, setStats] = useState({
//     total_courses: 0,
//     xp: 0,
//     progress: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Edit profile
//   const [isEditing, setIsEditing] = useState(false);
//   const [designation, setDesignation] = useState("");
//   const [skillsInput, setSkillsInput] = useState("");

//   // Course completion
//   const [completingId, setCompletingId] = useState(null);

//   /* =========================
//      FETCH DASHBOARD DATA
//   ========================= */
//   useEffect(() => {
//     Promise.all([
//       getProfile(),
//       getMyCourses(),
//       getStudentProgress(),
//     ])
//       .then(([profileData, coursesData, progressData]) => {
//         setProfile(profileData);
//         setCourses(coursesData);
//         setStats(progressData);
//       })
//       .catch((err) => {
//         console.error("Dashboard load failed:", err);
//         setError("Session expired. Please login again.");
//         onLogout();
//       })
//       .finally(() => setLoading(false));
//   }, [onLogout]);

//   /* =========================
//      PROFILE EDIT
//   ========================= */
//   const openEditProfile = () => {
//     if (!profile) return;
//     setDesignation(profile.designation || "");
//     setSkillsInput(
//       Array.isArray(profile.skills)
//         ? profile.skills.join(", ")
//         : ""
//     );
//     setIsEditing(true);
//   };

//   const handleSaveProfile = async () => {
//     try {
//       const updated = await updateProfile({
//         designation,
//         skills: skillsInput
//           .split(",")
//           .map((s) => s.trim())
//           .filter(Boolean),
//       });

//       setProfile(updated);
//       setIsEditing(false);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update profile");
//     }
//   };

//   const handleAvatarChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const updated = await updateAvatar(file);
//       setProfile(updated);
//     } catch {
//       alert("Avatar update failed");
//     }
//   };

//   /* =========================
//      COMPLETE COURSE
//   ========================= */
//   const handleComplete = async (courseId) => {
//     try {
//       setCompletingId(courseId);
//       await completeTopic(courseId);

//       const updatedStats = await getStudentProgress();
//       setStats(updatedStats);
//     } catch {
//       alert("Failed to mark course complete");
//     } finally {
//       setCompletingId(null);
//     }
//   };

//   /* =========================
//      LOADING / ERROR
//   ========================= */
//   if (loading) {
//     return (
//       <p style={{ padding: 30 }}>
//         Loading dashboard...
//       </p>
//     );
//   }

//   if (error) {
//     return (
//       <p style={{ padding: 30, color: "red" }}>
//         {error}
//       </p>
//     );
//   }

//   /* =========================
//      UI
//   ========================= */
//   return (
//     <div className="dashboard">
//       {/* NAVBAR */}
//       <div className="navbar">
//         <div className="nav-pill brand-pill">
//           SkillMap AI 🚀
//         </div>
//         <button
//           className="nav-pill logout-pill"
//           onClick={onLogout}
//         >
//           Logout
//         </button>
//       </div>

//       {/* STATS */}
//       <div className="stats">
//         <div className="stat-box">
//           <h2>{stats.total_courses}</h2>
//           <p>Courses</p>
//         </div>

//         <div className="stat-box">
//           <h2>{stats.xp}</h2>
//           <p>XP Earned</p>
//         </div>

//         <div className="stat-box">
//           <h2>{stats.progress}%</h2>
//           <p>Progress</p>
//         </div>
//       </div>

//       {/* GRID */}
//       <div className="dashboard-grid">
//         {/* LEFT COLUMN */}
//         <div className="left-column">
//           {/* COURSES */}
//           <div className="card">
//             <h2 className="section-title">
//               My Courses
//             </h2>

//             {courses.length === 0 ? (
//               <p>No courses assigned yet</p>
//             ) : (
//               courses.map((course) => (
//                 <div
//                   key={course.id}
//                   className="course-item"
//                   style={{
//                     opacity: course.completed ? 0.6 : 1,
//                   }}
//                 >
//                   <span>{course.title}</span>

//                   {course.completed ? (
//                     <span className="completed-pill">
//                       Completed
//                     </span>
//                   ) : (
//                     <button
//                       disabled={completingId === course.id}
//                       onClick={async () => {
//                         await handleComplete(course.id);
//                         setCourses((prev) =>
//                           prev.map((c) =>
//                             c.id === course.id
//                               ? { ...c, completed: true }
//                               : c
//                           )
//                         );
//                       }}
//                     >
//                       {completingId === course.id
//                         ? "Completing..."
//                         : "Complete"}
//                     </button>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>

//           {/* 📊 GRAPH GOES HERE */}
//           <ProgressChart
//             completed={
//               courses.filter((c) => c.completed)
//                 .length
//             }
//             total={courses.length || 1}
//           />
//         </div>

//         {/* RIGHT COLUMN */}
//         <div className="card">
//           <ProfileCard
//             name={
//               profile.first_name
//                 ? `${profile.first_name} ${profile.last_name}`
//                 : profile.username
//             }
//             role={profile.designation}
//             email={profile.email}
//             location="India"
//             skills={profile.skills || []}
//             avatar={profile.avatar}
//             onEdit={openEditProfile}
//           />
//         </div>
//       </div>

//       {/* EDIT PROFILE MODAL */}
//       {isEditing && (
//         <div className="modal-overlay">
//           <div className="modal edit-profile-modal">
//             <h3>Edit Profile</h3>

//             <div className="edit-avatar">
//               <div className="profile-avatar">
//                 {profile.avatar ? (
//                   <img
//                     src={`http://127.0.0.1:8000${profile.avatar}`}
//                     alt="avatar"
//                   />
//                 ) : (
//                   profile.username
//                     .charAt(0)
//                     .toUpperCase()
//                 )}
//               </div>

//               <label
//                 htmlFor="avatarUpload"
//                 className="avatar-upload"
//               >
//                 Change Photo
//               </label>

//               <input
//                 id="avatarUpload"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleAvatarChange}
//                 hidden
//               />
//             </div>

//             <div className="form-group">
//               <label>Designation</label>
//               <input
//                 value={designation}
//                 onChange={(e) =>
//                   setDesignation(e.target.value)
//                 }
//               />
//             </div>

//             <div className="form-group">
//               <label>Skills</label>
//               <input
//                 value={skillsInput}
//                 onChange={(e) =>
//                   setSkillsInput(e.target.value)
//                 }
//               />
//             </div>

//             <div className="modal-actions">
//               <button
//                 className="btn-secondary"
//                 onClick={() =>
//                   setIsEditing(false)
//                 }
//               >
//                 Cancel
//               </button>

//               <button
//                 className="btn-primary"
//                 onClick={handleSaveProfile}
//               >
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🤖 AI CHATBOT (STUDENT ONLY) */}
//       <Chatbot />
//     </div>
//   );
// }

// export default Dashboard;


import { useEffect, useState } from "react";
import "../dashboard.css";

import ProfileCard from "./ProfileCard";
import Chatbot from "./Chatbot";
import ProgressChart from "./ProgressChart";
import CourseChecklist from "./CourseChecklist";

import {
  getProfile,
  getMyCourses,
  getStudentProgress,
  completeTopic,
  updateProfile,
  updateAvatar,
} from "../api";

function Dashboard({ onLogout }) {
  /* =========================
     STATE
  ========================= */
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    total_courses: 0,
    xp: 0,
    progress: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Profile edit
  const [isEditing, setIsEditing] = useState(false);
  const [designation, setDesignation] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  // Course completion
  const [completingId, setCompletingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  /* =========================
     FETCH DASHBOARD DATA
  ========================= */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileData, coursesData, progressData] =
          await Promise.all([
            getProfile(),
            getMyCourses(),
            getStudentProgress(),
          ]);

        setProfile(profileData);
        setCourses(coursesData);
        setStats(progressData);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError("Session expired. Please login again.");
        onLogout();
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [onLogout]);

  /* =========================
     PROFILE EDIT
  ========================= */
  const openEditProfile = () => {
    if (!profile) return;

    setDesignation(profile.designation || "");
    setSkillsInput(
      Array.isArray(profile.skills)
        ? profile.skills.join(", ")
        : ""
    );
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await updateProfile({
        designation,
        skills: skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      setProfile(updated);
      setIsEditing(false);
    } catch {
      alert("Failed to update profile");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const updated = await updateAvatar(file);
      setProfile(updated);
    } catch {
      alert("Avatar update failed");
    }
  };

  /* =========================
     COMPLETE COURSE
  ========================= */
  const handleComplete = async (courseId) => {
    try {
      setCompletingId(courseId);
      await completeTopic(courseId);

      // Update course locally
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, completed: true } : c
        )
      );

      // Refresh stats
      const updatedStats = await getStudentProgress();
      setStats(updatedStats);
    } catch {
      alert("Failed to mark course complete");
    } finally {
      setCompletingId(null);
    }
  };

  /* =========================
     LOADING / ERROR
  ========================= */
  if (loading) {
    return <p style={{ padding: 30 }}>Loading dashboard...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: 30, color: "red" }}>{error}</p>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <div className="navbar">
        <div className="nav-pill brand-pill">
          SkillMap AI 🚀
        </div>
        <button
          className="nav-pill logout-pill"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-box">
          <h2>{stats.total_courses}</h2>
          <p>Courses</p>
        </div>

        <div className="stat-box">
          <h2>{stats.xp}</h2>
          <p>XP Earned</p>
        </div>

        <div className="stat-box">
          <h2>{stats.progress}%</h2>
          <p>Progress</p>
        </div>
      </div>

      {/* GRID */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div className="left-column">
          {/* COURSES */}
          <div className="card">
            <h2 className="section-title">My Courses</h2>

            {selectedCourse ? (
              <div className="checklist-wrapper">
                <CourseChecklist
                  courseId={selectedCourse}
                  onClose={() => setSelectedCourse(null)}
                  onProgressUpdate={async () => {
                    const updatedStats = await getStudentProgress();
                    setStats(updatedStats);
                    // Also refresh course list to check for course completion if needed
                    const updatedCourses = await getMyCourses();
                    setCourses(updatedCourses);
                  }}
                />
              </div>
            ) : (
              courses.length === 0 ? (
                <p>No courses assigned yet</p>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="course-item"
                    style={{
                      opacity: course.completed ? 0.6 : 1,
                    }}
                  >
                    <span>{course.title}</span>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedCourse(course.id)}
                    >
                      {course.completed ? "Review" : "Continue"}
                    </button>
                  </div>
                ))
              ))}
          </div>

          {/* PROGRESS CHART */}
          <div className="card">
            <h2 className="section-title">
              Learning Progress
            </h2>
            <ProgressChart
              completed={stats.completed_courses}
              total={stats.total_courses}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="card">
          <ProfileCard
            name={
              profile.first_name
                ? `${profile.first_name} ${profile.last_name}`
                : profile.username
            }
            role={profile.designation}
            email={profile.email}
            location="India"
            skills={profile.skills || []}
            avatar={profile.avatar}
            onEdit={openEditProfile}
          />
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal edit-profile-modal">
            <h3>Edit Profile</h3>

            <div className="edit-avatar">
              <div className="profile-avatar">
                {profile.avatar ? (
                  <img
                    src={`http://127.0.0.1:8000${profile.avatar}`}
                    alt="avatar"
                  />
                ) : (
                  profile.username
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <label
                htmlFor="avatarUpload"
                className="avatar-upload"
              >
                Change Photo
              </label>

              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                value={designation}
                onChange={(e) =>
                  setDesignation(e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Skills</label>
              <input
                value={skillsInput}
                onChange={(e) =>
                  setSkillsInput(e.target.value)
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setIsEditing(false)
                }
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI CHATBOT */}
      <Chatbot />
    </div>
  );
}

export default Dashboard;
