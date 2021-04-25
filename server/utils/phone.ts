const callerId = (
  givenName: string | undefined,
  familyName: string | undefined,
  fallback = 'Unknown'
) => {
  if (givenName && !familyName) return givenName;
  if (!givenName && familyName) return familyName;
  if (givenName && familyName) return `${givenName} ${familyName}`;
  return fallback;
};

export { callerId };
