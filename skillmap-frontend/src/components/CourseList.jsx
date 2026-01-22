function CourseList({ courses, onComplete }) {
  return (
    <div>
      {courses.map((course) => (
        <div key={course.id} className="course-item">
          <span>{course.name}</span>

          {course.completed ? (
            <span style={{ color: "green", fontWeight: "600" }}>
              Completed
            </span>
          ) : (
            <button onClick={() => onComplete(course.id)}>
              Complete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default CourseList;
