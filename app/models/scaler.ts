import Events = require('models/events');
import Page = require('models/page');

export = Scaler;

module Scaler {
  export enum ScaleMode { AlignVertical, }
  export interface Content extends HTMLElement {}

  export interface Setting extends Events.Events {
    scaleMode(): ScaleMode;
  }

  export interface ScaleParams {
    width: number;
    height: number;
  }

  export interface Scaler {
    scale(pages: Page.Content[], params: ScaleParams): Content;
  }

  export function create(setting: Setting): Scaler {
    return new ContentScaler(setting);
  }
}

// private
class ContentScaler implements Scaler.Scaler {
  private _setting: Scaler.Setting;

  constructor(setting: Scaler.Setting) {
    this._setting = setting;
  }

  scale(pages: Page.Content[], params: Scaler.ScaleParams): Scaler.Content {
    if (pages.length === 1) {
      return this.scaleOnePage(pages, params);
    } else {
      return this.scaleTwoPage(pages, params);
    }
  }

  scaleOnePage(pages: Page.Content[], params: Scaler.ScaleParams): Scaler.Content {
    var div = document.createElement('div');
    var content = pages[0];
    div.appendChild(content);

    var width = content.width;
    var height = content.height;

    var scale = Math.min(params.width / width, params.height / height);
    var newWidth = Math.floor(scale * width);
    var newHeight = Math.floor(scale * height);
    var newTop = Math.floor((params.height - newHeight) / 2);
    var newLeft = Math.floor((params.width - newWidth) / 2);

    div.style.cssText =
      'position: relative;' +
      'width: ' + params.width + 'px;' +
      'height: ' + params.height + 'px;';
    content.style.cssText =
      'position: absolute;' +
      'top: ' + newTop + 'px;' +
      'left: ' + newLeft + 'px;' +
      'width: ' + newWidth + 'px;' +
      'height: ' + newHeight + 'px;';
    return div;
  }

  scaleTwoPage(pages: Page.Content[], params: Scaler.ScaleParams): Scaler.Content {
    var div = document.createElement('div');
    var leftContent = pages[1];
    var rightContent =  pages[0];

    var leftHeight = leftContent.height;
    var leftWidth = leftContent.width;
    var rightHeight = rightContent.height;
    var rightWidth = rightContent.width;

    var leftScale = 1.0
    var rightScale = leftHeight / rightHeight;

    var width = (leftScale * leftWidth) + (rightScale * rightWidth);
    var height = leftHeight;
    var scale = Math.min(params.width / width, params.height / height);

    var newLeftWidth = Math.floor(leftWidth * leftScale * scale);
    var newLeftHeight = Math.floor(leftHeight * leftScale * scale);
    var newRightWidth = Math.floor(rightWidth * rightScale * scale);
    var newRightHeight = Math.floor(rightHeight * rightScale * scale);

    var leftTop = Math.floor((params.height - newLeftHeight) / 2);
    var leftLeft = Math.floor((params.width - newLeftWidth - newRightWidth) / 2);
    var rightTop = Math.floor((params.height - newRightHeight) / 2);
    var rightLeft = Math.floor(leftLeft + newLeftWidth);

    div.style.cssText =
      'position: relative;' +
      'width: ' + params.width + 'px;' +
      'height: ' + params.height + 'px;';
    leftContent.style.cssText =
      'position: absolute;' +
      'top: ' + leftTop + 'px;' +
      'left: ' + leftLeft + 'px;' +
      'width: ' + newLeftWidth + 'px;' +
      'height: ' + newLeftHeight + 'px;';
    rightContent.style.cssText =
      'position: absolute;' +
      'top: ' + rightTop + 'px;' +
      'left: ' + rightLeft + 'px;' +
      'width: ' + newRightWidth + 'px;' +
      'height: ' + newRightHeight + 'px;';
    div.appendChild(leftContent);
    div.appendChild(rightContent);
    return div;
  }
}
