import { useEffect, useState } from "react";
import { getCourseStructure, completeLesson } from "../api";

function CourseDetail({ courseId, onClose, onProgressUpdate }) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    getCourseStructure(courseId)
      .then((s) => {
        setStructure(s);
        // select first lesson by default
        const firstSection = s.sections && s.sections[0];
        const firstLesson = firstSection && firstSection.lessons && firstSection.lessons[0];
        setSelectedLesson(firstLesson || null);
      })
      .catch((err) => {
        console.error("Failed to load course structure", err);
        setError(err?.message || "Failed to load content");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson) return;
    setMarking(true);
    try {
      await completeLesson(selectedLesson.id);
      // update local state
      setStructure((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) => ({
          ...sec,
          lessons: sec.lessons.map((les) => (les.id === selectedLesson.id ? { ...les, completed: true } : les)),
        })),
      }));
      // update selectedLesson
      setSelectedLesson((s) => ({ ...s, completed: true }));
      if (onProgressUpdate) onProgressUpdate();
    } catch (err) {
      alert("Failed to mark lesson complete");
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading course...</div>;
  if (error) return (
    <div style={{ padding: 20 }}>
      <div style={{ color: 'red', marginBottom: 8 }}>Failed to load course.</div>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="course-detail-grid">
      <div className="cd-sidebar">
        <h3 style={{ marginTop: 0 }}>{structure.title}</h3>
        <p style={{ color: 'var(--text-muted)' }}>{structure.description}</p>

        <div style={{ marginTop: 12 }}>
          {structure.sections.map((section) => (
            <div key={section.id} style={{ marginBottom: 12 }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 8 }}>{section.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.lessons.map((lesson) => (
                  <button
                    className={`lesson-list-item ${lesson.id === selectedLesson?.id ? 'active' : ''}`}
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{lesson.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lesson.xp} XP</div>
                      </div>

                      <div style={{ minWidth: 68, textAlign: 'right' }}>
                        {lesson.completed ? <span className="completed-pill">Completed</span> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{lesson.order}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="cd-content">
        {!selectedLesson ? (
          <div style={{ padding: 24 }}>Select a lesson to start learning.</div>
        ) : (
          <div>
            <h3 style={{ marginTop: 0 }}>{selectedLesson.title}</h3>
            {/* Simple video / content placeholder */}
            <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
              <div style={{ width: '100%', height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f5f7', borderRadius: 8 }}>
                {/* Replace with video player if available */}
                <div style={{ color: 'var(--text-muted)' }}>Lesson player placeholder</div>
              </div>
            </div>

            <div style={{ padding: 12, background: 'white', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{selectedLesson.content || 'No content available for this lesson yet.'}</div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              {selectedLesson.completed ? (
                <button className="btn btn-secondary" disabled>Completed</button>
              ) : (
                <button className="btn btn-primary" onClick={handleMarkComplete} disabled={marking}>{marking ? 'Saving...' : 'Mark as complete'}</button>
              )}

              <button className="btn btn-secondary" onClick={() => {
                // Next lesson navigation
                let next = null;
                for (const section of structure.sections) {
                  const idx = section.lessons.findIndex(l => l.id === selectedLesson.id);
                  if (idx >= 0) {
                    // If there's a next lesson in the section
                    if (idx + 1 < section.lessons.length) {
                      next = section.lessons[idx + 1];
                      break;
                    }
                    // otherwise, find next section's first lesson
                    const sIndex = structure.sections.findIndex(s => s.id === section.id);
                    if (sIndex >= 0 && sIndex + 1 < structure.sections.length) {
                      const nextSec = structure.sections[sIndex + 1];
                      next = nextSec.lessons && nextSec.lessons[0];
                      break;
                    }
                  }
                }
                if (next) setSelectedLesson(next);
                else alert('You are at the last lesson of the course.');
              }}>Next lesson</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetail;
