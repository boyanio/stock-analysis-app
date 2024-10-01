export const parseTimestamp = (input: string): number | false => {
  if (!input) {
    return false;
  }

  const timestamp = parseInt(input, 10);
  if (isNaN(timestamp) || timestamp < 0) {
    return false;
  }

  return timestamp;
};
