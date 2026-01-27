import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#e5e7eb"];

function ProgressChart({ completed, total }) {
  const data = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: total - completed },
  ];

  return (
    <div className="card">
      <h2 className="section-title">
        {/* Learning Progress */}
      </h2>

      <div style={{ height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p
        style={{
          textAlign: "center",
          fontWeight: 600,
          marginTop: -10,
        }}
      >
        {total > 0 ? Math.round((completed / total) * 100) : 0}
        % Completed
      </p>
    </div>
  );
}

export default ProgressChart;

