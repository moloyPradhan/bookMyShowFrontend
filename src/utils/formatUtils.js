/**
 * Formats duration in minutes to a human-readable hours and minutes format.
 * E.g., 150 -> "2h 30m", 120 -> "2h", 45 -> "45m"
 * @param {number} totalMinutes
 * @returns {string}
 */
export const formatDuration = (totalMinutes) => {
  if (!totalMinutes || isNaN(totalMinutes)) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};
