export const humanize = function humanize(str: string): string {
  return str.replace("_", " ").replace(/^./, str[0].toUpperCase());
};
