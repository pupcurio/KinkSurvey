import type { Dimension } from "@/survey/questions";

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 100;

function point(i: number, count: number, r: number): [number, number] {
  const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

export function RadarChart({
  values,
  order,
  labels,
}: {
  values: Record<Dimension, number>;
  order: Dimension[];
  labels: Record<Dimension, string>;
}) {
  const n = order.length;
  const polygon = order.map((d, i) => point(i, n, (values[d] / 100) * RADIUS).join(",")).join(" ");

  return (
    <svg
      viewBox={`-60 -10 ${SIZE + 120} ${SIZE + 25}`}
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label={order.map((d) => `${labels[d]}: ${values[d]}`).join(", ")}
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={order.map((_, i) => point(i, n, RADIUS * f).join(",")).join(" ")}
          fill="none"
          stroke="var(--line)"
        />
      ))}
      {order.map((d, i) => {
        const [x, y] = point(i, n, RADIUS);
        return <line key={d} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--line)" />;
      })}
      <polygon points={polygon} fill="var(--accent)" fillOpacity={0.3} stroke="var(--accent)" strokeWidth={2} />
      {order.map((d, i) => {
        const [x, y] = point(i, n, RADIUS + 16);
        return (
          <text
            key={d}
            x={x}
            y={y}
            textAnchor={Math.abs(x - CENTER) < 1 ? "middle" : x > CENTER ? "start" : "end"}
            fontSize={17}
            fill="var(--text)"
          >
            <tspan x={x} dy={y < CENTER - RADIUS ? -26 : y > CENTER + RADIUS ? 16 : -4}>
              {labels[d]}
            </tspan>
            <tspan x={x} dy={19} fill="var(--muted)" fontWeight={600}>
              {values[d]}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
