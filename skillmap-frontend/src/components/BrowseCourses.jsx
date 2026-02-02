import { useEffect, useState } from "react";
import { getCourses, enrollCourse } from "../api";

function BrowseCourses({ onClose, onEnrolled }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    setLoading(true);
    getCourses()
      .then((data) => setCourses(data))
      .catch((err) => setError(err?.message || "Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await enrollCourse(courseId);
      alert("Enrolled. The course will now appear in your My Courses.");
      if (onEnrolled) onEnrolled();
    } catch (err) {
      alert("Failed to enroll");
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading courses...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Browse Courses</h3>
      <div className="courses-grid">
        {courses.map((c) => (
          <div key={c.id} className="course-card">
            <div className="thumb">{c.title.charAt(0)}</div>
            <div className="meta">
              <div className="title">{c.title}</div>
              <div className="subtitle">{c.description || 'No description'}</div>
              <div className="course-progress">
                <div className="progress-meta">Lessons: {c.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0}</div>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-primary" onClick={() => handleEnroll(c.id)} disabled={enrolling === c.id}>{enrolling === c.id ? 'Enrolling...' : 'Enroll'}</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default BrowseCourses;
