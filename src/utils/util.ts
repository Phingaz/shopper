export function capitalizeFirstLetter(string: string) {
  return string?.charAt(0).toUpperCase() + string.slice(1);
}

export function lowercaseFirstLetter(string: string) {
  return string?.charAt(0).toLowerCase() + string.slice(1);
}
