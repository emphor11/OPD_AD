// Estimate and format patient wait times based on queue position and average consultation minutes
export const calculateWaitTime = (positionAhead, avgConsultMins = 8) => {
  if (positionAhead <= 0) return 0;
  return positionAhead * avgConsultMins;
};

export const formatWaitTime = (minutes) => {
  if (minutes <= 0) return 'Turn is next!';
  if (minutes < 60) return `~${minutes} mins`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `~${hours} hr${hours > 1 ? 's' : ''}`;
  return `~${hours}h ${remainingMins}m`;
};

export default {
  calculateWaitTime,
  formatWaitTime,
};
