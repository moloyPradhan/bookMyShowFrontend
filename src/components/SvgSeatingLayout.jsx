import { useMemo, useEffect, useState } from 'react';
import SvgSeat from './SvgSeat';
import { organizeSeatsByRows, getResponsiveDimensions } from '../utils/seatUtils';

const SvgSeatingLayout = ({ seats, selectedSeats, onSeatSelect, onSeatDeselect, user }) => {
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
    const isLockedByMe = seat.status === 'locked' && user && (seat.locked_by === user.id || seat.locked_by === user._id);
    if (seat.status !== 'available' && !isLockedByMe) return;

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
        className="border border-zinc-800/80 rounded-2xl bg-zinc-950/45 backdrop-blur-md shadow-inner"
      >
        <defs>
          <linearGradient id="screenNeonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.15" />
            <stop offset="15%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Screen curved line */}
        <path
          d={`M ${dimensions.padding + 20} ${dimensions.padding + 15} Q ${svgWidth / 2} ${dimensions.padding} ${svgWidth - dimensions.padding - 20} ${dimensions.padding + 15}`}
          fill="none"
          stroke="url(#screenNeonGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <text
          x={svgWidth / 2}
          y={dimensions.padding + 35}
          textAnchor="middle"
          fontSize={dimensions.fontSize}
          fill="#9ca3af"
          fontWeight="bold"
          letterSpacing="4"
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
              {/* Left Row label */}
              <text
                x={dimensions.padding / 2}
                y={rowY + dimensions.seatSize / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={dimensions.fontSize}
                fill="#9ca3af"
                fontWeight="bold"
              >
                {row}
              </text>

              {/* Right Row label */}
              <text
                x={svgWidth - dimensions.padding / 2}
                y={rowY + dimensions.seatSize / 2}
                textAnchor="middle"
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
                      isClickable={
                        seat.status === 'available' ||
                        (seat.status === 'locked' && user && (seat.locked_by === user.id || seat.locked_by === user._id))
                      }
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
