import { useState, useEffect } from 'react';

interface CircularProgressProps {
  value: number;
  color?: string;
}

export default function CircularProgress({ value, color = 'var(--secondary)' }: CircularProgressProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    setOffset(((100 - value) / 100) * circumference);
  }, [value, circumference]);

  return (
    <div className="circular-progress">
      <svg viewBox="0 0 80 80">
        <circle className="circle-bg" cx="40" cy="40" r={radius} />
        <circle
          className="circle-fg"
          cx="40" cy="40" r={radius}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, stroke: color }}
        />
      </svg>
      <div className="progress-text">{value}%</div>
    </div>
  );
}
