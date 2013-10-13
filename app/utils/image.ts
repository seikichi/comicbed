import $ = require('jquery');

export = ImageUtil;

module ImageUtil {
  export enum Type { JPEG, PNG, BMP, GIF, TIFF, OTHER }

  export function determineImageType(data: Uint8Array): Type {
    if (isJPEG(data)) {
      return Type.JPEG;
    } else if (isPNG(data)) {
      return Type.PNG;
    } else if (isBMP(data)) {
      return Type.BMP;
    } else if (isGIF(data)) {
      return Type.GIF;
    } else if (isTIFF(data)) {
      return Type.TIFF;
    }
    return Type.OTHER;
  }

  export function pixelDataToImageElement(data: Uint8Array, width: number, height: number)
  : JQueryPromise<HTMLImageElement> {
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

  export function loadImageFromURL(url: string): JQueryPromise<HTMLImageElement> {
    var deferred = $.Deferred<HTMLImageElement>();
    var image: HTMLImageElement = new Image();
    image.onload = () => {
      deferred.resolve(image);
      image = null;
    };
    image.onerror = () => {
      deferred.reject();
      image = null;
    };
    image.src = url;
    return deferred.promise();
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

// Use: http://en.wikipedia.org/wiki/List_of_file_signatures
function headerEqual(data: Uint8Array, header: number[]): boolean {
  if (header.length < data.length) { return false; }
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
