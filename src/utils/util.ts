export function capitalizeFirstLetter(string: string): string {
  return string?.charAt(0).toUpperCase() + string.slice(1);
}

export function lowercaseFirstLetter(string: string): string {
  return string?.charAt(0).toLowerCase() + string.slice(1);
}

export const processBase64Image = (
  base64: string
): { type: string; data: string } | null => {
  if (!base64) return null;

  const base64Regex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,/;
  const match = base64.match(base64Regex);

  if (!match) return null;

  const mimeType = match[1];
  const data = base64.split(",")[1];

  return { type: mimeType, data };
};
