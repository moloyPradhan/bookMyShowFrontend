import React, { useMemo } from 'react';
import { getSeatStatusColor } from '../utils/seatUtils';

const SvgSeat = ({
  seat,
  size,
  isSelected,
  isLocked,
  onSelect,
  fontSize,
}) => {
  const handleClick = () => {
    if (!isLocked && seat.status === 'available') {
      onSelect(seat);
    }
  };

  let fillColor = getSeatStatusColor(seat.status);
  if (isSelected) {
    fillColor = '#3b82f6'; // blue-500
  }

  const isClickable = seat.status === 'available' && !isLocked;

  return (
    <g onClick={handleClick} style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}>
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        rx="4"
        fill={fillColor}
        opacity={seat.status === 'available' ? 1 : 0.6}
        style={{
          transition: 'all 0.2s ease',
        }}
      />
      {isSelected && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 4}
          fill="white"
          opacity="0.8"
        />
      )}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fill="white"
        fontWeight="bold"
        pointerEvents="none"
      >
        {seat.seat_number}
      </text>
    </g>
  );
};

export default SvgSeat;
