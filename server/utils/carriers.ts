const numberTurnOffForwarding = (carrier: string | null | undefined) => {
  if (carrier) {
    if (
      carrier.toLowerCase().includes('t-mobile') ||
      carrier.toLowerCase().includes('at&t') ||
      carrier.toLowerCase().includes('cricket')
    ) {
      return '#21#';
    }
    if (
      carrier.toLowerCase().includes('verizon') ||
      carrier.toLowerCase().includes('xfinity')
    ) {
      return '*73';
    }
    return undefined;
  }
  return undefined;
};

export { numberTurnOffForwarding };
