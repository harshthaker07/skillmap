

import { useEffect, useState } from "react";
import "../dashboard.css";

import ProfileCard from "./ProfileCard";
import Chatbot from "./Chatbot";
import ProgressChart from "./ProgressChart";
import XpLineChart from "./XpLineChart";
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

          <div className="card modern-card modern-profile-card">
            <ProfileCard
              name={profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.username}
              role={profile.designation}
              email={profile.email}
              location="India"
              skills={profile.skills || []}
              avatar={profile.avatar}
              onEdit={openEditProfile}
            />
          </div>
        </>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal edit-profile-modal">
            <h3>Edit Profile</h3>
            <div className="edit-avatar">
              <div className="profile-avatar">
                {profile.avatar ? (
                  <img src={`http://127.0.0.1:8000${profile.avatar}`} alt="avatar" />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
              <label htmlFor="avatarUpload" className="avatar-upload">Change Photo</label>
              <input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarChange} hidden />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Skills</label>
              <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* 🤖 AI CHATBOT (STUDENT ONLY) */}
      <Chatbot />
    </div>
  );

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
