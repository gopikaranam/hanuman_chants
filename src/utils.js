export const generateSessionId = () => {
  return (
    "HNMT-" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
};

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const isExpired = (expiry) => {
  return new Date() > new Date(expiry);
};
