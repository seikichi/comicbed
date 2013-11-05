import Promise = require('promise');

export = PromiseUtil;

module PromiseUtil {
  export function wait<T>(second: number): (value: T) => Promise<T> {
    return (value: T) => {
      return new Promise<T>((resolve, reject) => {
        setTimeout(() => {
          resolve(value);
        }, second);
      });
    };
  }

  export function require<M>(moduleName: string): Promise<M> {
    return new Promise<M>((resolve, reject) => {
      (<any>requirejs)([moduleName], (m: M) => {
        resolve(m);
      }, (error: any) => {
        reject(error);
      });
    });
  }

  export function readFileAsArrayBuffer(file: File) : Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      var fileReader = new FileReader();
      fileReader.onload = () => {
        var buffer: ArrayBuffer = fileReader.result;
        resolve(buffer);
      };
      fileReader.onerror = (error: any) => {
        reject(error);
      };
      fileReader.readAsArrayBuffer(file);
    });
  }

  export function getArrayBufferByXHR(url: string, httpHeaders: {[key:string]:string} = {})
  : Promise<ArrayBuffer> {
    var resolver = Promise.pending<ArrayBuffer>();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';

    for (var key in httpHeaders) if (httpHeaders.hasOwnProperty(key)) {
      xhr.setRequestHeader(key, httpHeaders[key]);
    }

    xhr.onload = (e: Event) => {
      // checking xhr.status === 200 failed in Firefox
      // when the url is created from URL.createObjectURL(file: File)
      if (xhr.readyState !== 4 || !xhr.response) {
        resolver.reject({ status: xhr.status, statusText: xhr.statusText });
        return;
      }
      resolver.progress({ message: 'Downloading ...', progress: 100 });
      var buffer: ArrayBuffer = xhr.response;
      resolver.fulfill(buffer);
    };
    xhr.onprogress = (ev: ProgressEvent) => {
      if (ev.lengthComputable) {
        var progress = Math.round((ev.loaded / ev.total) * 100);
        resolver.progress({ message: 'Downloading ...', progress: progress });
      }
    };
    xhr.onerror = (error: any) => {
      resolver.reject(error);
    };
    xhr.send();

    var promise: Promise<ArrayBuffer> = resolver.promise
      .catch(Promise.CancellationError, (error: any) => {
        xhr.abort();
        return Promise.rejected<ArrayBuffer>(error);
      });

    return promise;
  }
}
