export = strings;

module strings {
  export function startsWith(str: string, prefix: string): boolean {
    return str.indexOf(prefix) == 0;
  };

  export function endsWith(str: string, suffix: string): boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }
}