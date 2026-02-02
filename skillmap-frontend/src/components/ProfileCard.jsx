function ProfileCard({
  name,
  role,
  email,
  location = "India",
  skills,
  avatar,
  onEdit,
}) {
  const safeName = name || "User";
  const safeRole = role || "Learner";
  const safeSkills = Array.isArray(skills) ? skills : [];

  return (
    <div className="profile-card client-profile" style={{ textAlign: "left", paddingBottom: "1rem", background: "linear-gradient(180deg, rgba(255,159,67,0.03), rgba(255,106,0,0.01))", padding: "18px", borderRadius: "12px" }}>
      {/* Banner / Header Background could go here */}

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "24px" }}>
        <div className="profile-avatar" style={{ width: "80px", height: "80px", margin: 0, border: "none", boxShadow: "0 8px 20px rgba(255,106,0,0.08)" }}>
          {avatar ? (
            <img
              src={`http://127.0.0.1:8000${avatar}`}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "2rem", color: "var(--primary)" }}>{safeName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "4px", color: "var(--text-main)" }}>{safeName}</h3>
          <p style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.95rem" }}>{safeRole}</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>📍 {location}</p>
        </div>
      </div>

      <div className="profile-info-grid" style={{ marginBottom: "24px" }}>
        <div className="info-item">
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Email</span>
          <p style={{ fontWeight: "500" }}>{email || "—"}</p>
        </div>
      </div>

      <div className="profile-skills-section">
        <p className="section-label" style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "12px" }}>Skills & Interests</p>
        <div className="profile-skills" style={{ justifyContent: "flex-start" }}>
          {safeSkills.length > 0 ? (
            safeSkills.map((skill, index) => (
              <span key={index} className="skill-chip" style={{ background: "linear-gradient(90deg, rgba(255,159,67,0.12), rgba(255,106,0,0.08))", color: "var(--primary)", fontWeight: "700", padding: "6px 10px", borderRadius: "999px" }}>
                {skill}
              </span>
            ))
          ) : (
            <span className="muted">No skills added</span>
          )}
        </div>
      </div>

       {/* <button
          className="btn btn-secondary"
          onClick={onEdit}
          style={{ width: "100%", marginTop: "16px" }}
        >
          Edit Profile
        </button> */}
   
      <button
        className="btn btn-secondary"
        onClick={onEdit}
        style={{
          width: "100%",
          marginTop: "12px",
          padding: "0.6rem",
        }}
      >
        Edit Profile
      </button>

    </div>
  );
}

export default ProfileCard;
