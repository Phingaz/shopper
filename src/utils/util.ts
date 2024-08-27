export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toLowerCase() + str.slice(1);
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

export const generateRandomUuid = (): string => {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  const uuidTemplate = "xxxxxxxx-4xxx-yyyxxxxxxxxxx";

  const uuid = uuidTemplate.replace(/[xy]/g, function (char) {
    const rand = randomHex();
    const value =
      char === "x" ? rand : ((parseInt(rand, 16) & 0x3) | 0x8).toString(16);
    return value;
  });

  return uuid;
};
