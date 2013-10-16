import Promise = require('promise');
import PromiseUtil = require('utils/promise');

export = ImageUtil;

module ImageUtil {

  export function isImageData(data: Uint8Array): boolean {
    return  (isJPEG(data)
             || isPNG(data)
             || isBMP(data)
             || isGIF(data)
             || isTIFF(data));
  }

  export function createImageElementFromArrayBuffer(buffer: ArrayBuffer)
  : Promise<HTMLImageElement> {
    var data = new Uint8Array(buffer);
    if (!isImageData(data)) { return Promise.rejected('invalid image'); }

    var format = '';
    if (isJPEG(data)) {
      format = 'jpeg';
    } else if (isPNG(data)) {
      format = 'png';
    } else if (isBMP(data)) {
      format = 'bmp';
    } else if (isGIF(data)) {
      format = 'gif';
    } else if (isTIFF(data)) {
      return PromiseUtil.require<typeof Tiff>('tiff').then((Tiff: typeof Tiff) => {
        return loadImageFromURL(new Tiff(data).toDataURL());
      });
    }

    var base64data = arrayBufferTobase64String(buffer);
    var dataURL = 'data:image/' + format + ';base64,' + base64data;
    return loadImageFromURL(dataURL);
  }

  export function pixelDataToImageElement(data: Uint8Array, width: number, height: number)
  : Promise<HTMLImageElement> {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    var imageData = context.createImageData(width, height);
    var imageDataArray = imageData.data;
    if ('set' in imageDataArray) {
      (<any>imageDataArray).set(data);
    } else {
      for (var i = 0, len = imageDataArray.length; i < len; ++i) {
        imageDataArray[i] = data[i];
      }
    }
    context.putImageData(imageData, 0, 0);
    return ImageUtil.loadImageFromURL(canvas.toDataURL());
  }

  export function loadImageFromURL(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      var image: HTMLImageElement = new Image();
      image.onload = () => {
        resolve(image);
        image = null;
      };
      image.onerror = () => {
        reject('invalid image url');
        image = null;
      };
      image.src = url;
    });
  }

  export function imageElementToCanvas(image: HTMLImageElement): HTMLCanvasElement {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    return canvas;
  }
}

function arrayBufferTobase64String(buffer: ArrayBuffer): string {
  var str = '';
  var data = new Uint8Array(buffer);
  var length = data.length;
  for (var n = 0; n < length; ++n) {
    str += String.fromCharCode(data[n]);
  }
  var base64Data: string = window.btoa(str);
  return base64Data;
}

// Use: http://en.wikipedia.org/wiki/List_of_file_signatures
function headerEqual(data: Uint8Array, header: number[]): boolean {
  if (header.length > data.length) { return false; }
  for (var i = 0, len = header.length; i < len; ++i) {
    if (data[i] !== header[i]) { return false; }
  }
  return true;
}

function isJPEG(data: Uint8Array): boolean {
  return headerEqual(data, [0xff, 0xd8, 0xff]);
}

function isPNG(data: Uint8Array): boolean {
  return headerEqual(data, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
}

function isGIF(data: Uint8Array): boolean {
  return headerEqual(data, [0x47, 0x49, 0x46, 0x38]);
}

function isBMP(data: Uint8Array): boolean {
  return headerEqual(data, [0x42, 0x4d]);
}

function isTIFF(data: Uint8Array): boolean {
  return (headerEqual(data, [0x49, 0x49, 0x2A, 0x00])
          || headerEqual(data, [0x4D, 0x4D, 0x00, 0x2A]));
}
