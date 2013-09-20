export = path;

module path {
  export function extname(name: string) {
    return name.split('.').pop();
  }

  export function basename(name: string) {
    return name.split('/').pop();
  }
}

