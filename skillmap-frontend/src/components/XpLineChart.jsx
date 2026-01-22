import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function XpLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h2 className="section-title">XP Growth</h2>
        <p>No XP data yet</p>
      </div>
    );
  }


  return (
    <div className="card">
      <h2 className="section-title">XP Growth</h2>

      <div style={{ height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="xp"
              stroke="#6366f1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default XpLineChart;
