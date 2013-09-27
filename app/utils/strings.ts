export = strings;

module strings {
  export function endsWith(str: string, suffix: string): boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
}