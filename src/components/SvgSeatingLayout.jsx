import React, { useMemo, useEffect, useState } from 'react';
import SvgSeat from './SvgSeat';
import { organizeSeatsByRows, getResponsiveDimensions } from '../utils/seatUtils';

const SvgSeatingLayout = ({ seats, selectedSeats, onSeatSelect, onSeatDeselect }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dimensions = getResponsiveDimensions(screenWidth);
  const seatsByRow = useMemo(() => organizeSeatsByRows(seats), [seats]);
  const rows = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

  // Calculate SVG dimensions
  const maxSeatsInRow = useMemo(
    () => Math.max(...rows.map((row) => seatsByRow[row].length)),
    [rows, seatsByRow]
  );

  const svgWidth = maxSeatsInRow * dimensions.seatSize + (maxSeatsInRow - 1) * dimensions.seatGap + dimensions.padding * 2;
  const svgHeight = rows.length * dimensions.seatSize + (rows.length - 1) * dimensions.rowGap + dimensions.padding * 3 + 40;

  const handleSeatClick = (seat) => {
    if (seat.status !== 'available') return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    if (isSelected) {
      onSeatDeselect(seat);
    } else {
      onSeatSelect(seat);
    }
  };

  return (
    <div className="flex justify-center overflow-x-auto pb-4">
      <svg
        width={Math.min(svgWidth, screenWidth - 32)}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="border border-gray-700 rounded-lg bg-zinc-800"
      >
        {/* Screen */}
        <rect
          x={dimensions.padding}
          y={dimensions.padding}
          width={svgWidth - dimensions.padding * 2}
          height="30"
          fill="url(#screenGradient)"
          rx="4"
        />
        <defs>
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>
        </defs>
        <text
          x={svgWidth / 2}
          y={dimensions.padding + 20}
          textAnchor="middle"
          fontSize={dimensions.fontSize}
          fill="white"
          fontWeight="bold"
          pointerEvents="none"
        >
          🎬 SCREEN
        </text>

        {/* Seats */}
        {rows.map((row, rowIndex) => {
          const rowSeats = seatsByRow[row];
          const rowY = dimensions.padding * 2 + 40 + rowIndex * (dimensions.seatSize + dimensions.rowGap);

          // Center the row
          const rowWidth = rowSeats.length * dimensions.seatSize + (rowSeats.length - 1) * dimensions.seatGap;
          const rowStartX = (svgWidth - rowWidth) / 2;

          return (
            <g key={row}>
              {/* Row label */}
              <text
                x={rowStartX - 20}
                y={rowY + dimensions.seatSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={dimensions.fontSize}
                fill="#9ca3af"
                fontWeight="bold"
              >
                {row}
              </text>

              {/* Seats in row */}
              {rowSeats.map((seat, seatIndex) => {
                const seatX = rowStartX + seatIndex * (dimensions.seatSize + dimensions.seatGap);
                const isSelected = selectedSeats.some((s) => s.id === seat.id);

                return (
                  <g
                    key={seat.id}
                    transform={`translate(${seatX}, ${rowY})`}
                  >
                    <SvgSeat
                      seat={seat}
                      size={dimensions.seatSize}
                      isSelected={isSelected}
                      isLocked={seat.locked_by !== null}
                      onSelect={handleSeatClick}
                      fontSize={dimensions.fontSize}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SvgSeatingLayout;
