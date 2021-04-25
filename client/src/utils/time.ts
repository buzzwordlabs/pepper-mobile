export const prettyTimeMS = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return {
    mins,
    secs,
    textFormat: `${mins}:${seconds < 10 ? `0${secs}` : secs}`,
  };
};
