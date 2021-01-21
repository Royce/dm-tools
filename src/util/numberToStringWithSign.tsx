export const numberToStringWithSign = function numberToStringWithSign(
  n: number
): string {
  return n >= 0 ? `+${n}` : n.toString();
};
