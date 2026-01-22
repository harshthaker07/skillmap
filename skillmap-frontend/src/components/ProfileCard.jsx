function ProfileCard({
  name,
  role,
  email,
  location = "—",
  skills,
  avatar,
  onEdit,
}) {
  // 🛡️ Defensive defaults (CRITICAL)
  const safeName = name || "User";
  const safeRole = role || "No designation";
  const safeEmail = email || "—";
  const safeSkills = Array.isArray(skills) ? skills : [];

  return (
    <div className="profile-card client-profile">
      {/* ===== Header ===== */}
      <div className="profile-header">
        <div className="profile-avatar">
          {avatar ? (
            <img
              src={`http://127.0.0.1:8000${avatar}`}
              alt="Profile"
            />
          ) : (
            safeName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="profile-title">
          <h3>{safeName}</h3>
          <p className="profile-role">{safeRole}</p>
        </div>
      </div>

      {/* ===== Info ===== */}
      <div className="profile-info-grid">
        <div className="info-item">
          <span>Email</span>
          <p>{safeEmail}</p>
        </div>

        <div className="info-item">
          <span>Location</span>
          <p>{location}</p>
        </div>
      </div>

      {/* ===== Skills ===== */}
      <div className="profile-skills-section">
        <p className="section-label">Skills</p>

        <div className="profile-skills">
          {safeSkills.length > 0 ? (
            safeSkills.map((skill, index) => (
              <span key={index} className="skill-chip">
                {skill}
              </span>
            ))
          ) : (
            <span className="muted">No skills added</span>
          )}
        </div>
      </div>

      {/* ===== Action ===== */}
      <button
        className="edit-profile-btn"
        onClick={onEdit}
      >
        Edit profile
      </button>
    </div>
  );
}

export default ProfileCard;
