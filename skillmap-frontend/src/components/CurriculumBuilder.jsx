import { useState, useEffect } from "react";
import { getCourseStructure, createSection, createLesson } from "../api";

function CurriculumBuilder({ courseId, onClose }) {
    const [structure, setStructure] = useState(null);
    const [loading, setLoading] = useState(true);

    // UI States
    const [addingSection, setAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");

    const [addingLessonTo, setAddingLessonTo] = useState(null); // Section ID
    const [newLessonTitle, setNewLessonTitle] = useState("");

    const loadStructure = () => {
        setLoading(true);
        getCourseStructure(courseId)
            .then(setStructure)
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadStructure();
    }, [courseId]);

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        const nextOrder = structure.sections.length > 0
            ? Math.max(...structure.sections.map(s => s.order || 0)) + 1
            : 1;

        try {
            await createSection(courseId, newSectionTitle, nextOrder);
            setNewSectionTitle("");
            // setAddingSection(false); // ⚡ Keep open for rapid entry
            loadStructure();
        } catch {
            alert("Failed to add section");
        }
    };

    const handleAddLesson = async (sectionId) => {
        if (!newLessonTitle.trim()) return;

        const section = structure.sections.find(s => s.id === sectionId);
        const nextOrder = section && section.lessons.length > 0
            ? Math.max(...section.lessons.map(l => l.order || 0)) + 1
            : 1;

        try {
            await createLesson(sectionId, newLessonTitle, nextOrder);
            setNewLessonTitle("");
            // setAddingLessonTo(null); // ⚡ Keep open for rapid entry
            loadStructure();
        } catch {
            alert("Failed to add lesson");
        }
    };

    if (loading) return <div className="p-4">Loading Builder...</div>;
    if (!structure) return <div className="p-4 text-red">Error loading course.</div>;

    return (
        <div className="curriculum-builder" style={{ padding: 20 }}>
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0 }}>Curriculum: {structure.title}</h2>
                    <p className="text-muted" style={{ margin: 0 }}>Manage sections and lessons</p>
                </div>
                <button onClick={onClose} className="btn btn-secondary btn-sm">Close</button>
            </div>

            {/* SECTIONS LIST */}
            <div className="sections-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {structure.sections.map((section) => (
                    <div key={section.id} className="admin-section-card" style={{ background: "white", padding: 15, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "var(--primary)" }}>📂 {section.title}</h4>

                        {/* LESSONS LIST */}
                        <div className="admin-lessons-list" style={{ paddingLeft: 20, borderLeft: "2px solid #f1f5f9", marginBottom: 10 }}>
                            {section.lessons.length === 0 && <p className="text-muted text-sm">No lessons yet</p>}
                            {section.lessons.map((lesson) => (
                                <div key={lesson.id} style={{ padding: "5px 0", fontSize: "0.9rem" }}>
                                    📄 {lesson.title}
                                </div>
                            ))}
                        </div>

                        {/* ADD LESSON FORM */}
                        {addingLessonTo === section.id ? (
                            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                                <input
                                    autoFocus
                                    className="form-input"
                                    style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                                    placeholder="Lesson Title"
                                    value={newLessonTitle}
                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(section.id)}
                                />
                                <button className="btn btn-primary btn-sm" onClick={() => handleAddLesson(section.id)}>Add</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setAddingLessonTo(null)}>Done</button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-sm btn-outline"
                                style={{ marginTop: 5, fontSize: "0.8rem" }}
                                onClick={() => setAddingLessonTo(section.id)}
                            >
                                + Add Lesson
                            </button>
                        )}
                    </div>
                ))}

                {/* ADD SECTION FORM */}
                {addingSection ? (
                    <div className="add-section-form" style={{ background: "#f8fafc", padding: 15, borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                        <h4>New Section</h4>
                        <div style={{ display: "flex", gap: 10 }}>
                            <input
                                className="form-input"
                                placeholder="Section Title (e.g. Introduction)"
                                value={newSectionTitle}
                                onChange={(e) => setNewSectionTitle(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleAddSection}>Add</button>
                            <button className="btn btn-secondary" onClick={() => setAddingSection(false)}>Done</button>
                        </div>
                    </div>
                ) : (
                    <button
                        className="btn btn-primary"
                        style={{ alignSelf: "flex-start" }}
                        onClick={() => setAddingSection(true)}
                    >
                        + Add New Section
                    </button>
                )}
            </div>
        </div>
    );
}

export default CurriculumBuilder;
