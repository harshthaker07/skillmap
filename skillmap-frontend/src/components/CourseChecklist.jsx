import { useState, useEffect } from "react";
import { getCourseStructure, completeLesson } from "../api";

function CourseChecklist({ courseId, onClose, onProgressUpdate }) {
    const [structure, setStructure] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCourseStructure(courseId)
            .then(setStructure)
            .catch((err) => console.error("Failed to load content", err))
            .finally(() => setLoading(false));
    }, [courseId]);

    const handleLessonComplete = async (lessonId) => {
        try {
            await completeLesson(lessonId);
            // Optimistic update
            setStructure((prev) => ({
                ...prev,
                sections: prev.sections.map((sec) => ({
                    ...sec,
                    lessons: sec.lessons.map((les) =>
                        les.id === lessonId ? { ...les, completed: true } : les
                    ),
                })),
            }));

            // Notify parent to refresh stats
            if (onProgressUpdate) onProgressUpdate();

        } catch (err) {
            alert("Failed to mark lesson complete");
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Content...</div>;
    if (!structure) return <div className="p-4 text-center text-red">Failed to load content.</div>;

    return (

        <div className="checklist-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="checklist-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{structure.title}</h2>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{structure.description || "Course Content"}</p>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.5rem', padding: '0 10px' }}
                >
                    &times;
                </button>
            </div>

            <div className="sections-list" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {structure.sections.map((section) => (
                    <div key={section.id} className="section-block" style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem' }}>📂</span> {section.title}
                        </h4>
                        <div className="lessons-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {section.lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="lesson-item"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        background: lesson.completed ? '#f0fdf4' : '#f8fafc',
                                        border: `1px solid ${lesson.completed ? '#bbf7d0' : '#e2e8f0'}`,
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: lesson.completed ? '#22c55e' : '#cbd5e1',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: '12px', fontWeight: 'bold'
                                        }}>
                                            {lesson.completed ? '✓' : lesson.order}
                                        </div>
                                        <span style={{
                                            color: lesson.completed ? '#15803d' : '#334155',
                                            textDecoration: lesson.completed ? 'none' : 'none',
                                            fontWeight: lesson.completed ? 500 : 400
                                        }}>
                                            {lesson.title}
                                        </span>
                                    </div>

                                    {lesson.completed ? (
                                        <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, padding: '4px 8px', background: '#dcfce7', borderRadius: '4px' }}>
                                            Completed
                                        </span>
                                    ) : (
                                        <button
                                            className="btn-link"
                                            onClick={() => handleLessonComplete(lesson.id)}
                                            style={{
                                                fontSize: '0.85rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600
                                            }}
                                        >
                                            Mark as Done
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CourseChecklist;
