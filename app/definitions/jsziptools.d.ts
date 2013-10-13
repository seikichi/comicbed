declare module jz {
  module utils {
    class Promise<T> {
      then<U>(onResolve: (value: T) => U, onReject?: (reason: any) => U): Promise<U>;
      then<U>(onResolve: (value: T) => Promise<U>, onReject?: (reason: any) => U): Promise<U>;
      done<U>(onResolve: (value: T) => U): Promise<U>;
      done<U>(onResolve: (value: T) => Promise<U>): Promise<U>;
      fail<U>(onResolve: (reason: any) => U): Promise<U>;
      fail<U>(onResolve: (reason: any) => Promise<U>): Promise<U>;
    }
  }
  module zip {
    interface ZipArchiveReader {
      getFileNames(): string[];
      getFileAsText(filename: string): utils.Promise<string>;
      getFileAsArrayBuffer(filename: string): utils.Promise<ArrayBuffer>;
      getFileAsBlob(filename: string): utils.Promise<Blob>;
      getFileAsDataURL(filename: string): utils.Promise<string>;
    }
    function unpack(param: File): utils.Promise<ZipArchiveReader>;
    function unpack(param: ArrayBuffer): utils.Promise<ZipArchiveReader>;
    function unpack(param: { buffer: ArrayBuffer; encoding?: string;}): utils.Promise<ZipArchiveReader>;
    function unpack(param: { file: File; encoding: string;}): utils.Promise<ZipArchiveReader>;
  }
}
