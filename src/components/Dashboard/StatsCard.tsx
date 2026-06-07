import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  color,
}) => {
  return (
    <div
      className="stats-card"
      style={{
        borderTop: `5px solid ${color}`,
      }}
    >
      <h3>{title}</h3>

      <div className="card-number">
        {value}
      </div>
    </div>
  );
};

export default StatsCard;