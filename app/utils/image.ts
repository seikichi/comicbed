import $ = require('jquery');

export = ImageUtil;

module ImageUtil {
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
    };
    image.onerror = () => {
      deferred.reject();
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