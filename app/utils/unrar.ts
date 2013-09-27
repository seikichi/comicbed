import _ = require('underscore');
import logger = require('utils/logger');
import Module = require('unrarlib');

export = UnRar;

var urarlib_list: (archiveName: string, listPtr: number) => number =
  Module.cwrap('urarlib_list', 'number', ['string', 'number']);
var urarlib_freelist: (listPtr: number) => void
  = Module.cwrap('urarlib_freelist', 'number', ['number']);
var urarlib_get: (outputPtr: number,
                  sizePtr: number,
                  filename: string,
                  archiveName: string,
                  password: string) => number
  = Module.cwrap('urarlib_get', 'number', ['number', 'number', 'string', 'string', 'string']);

var malloc: (size: number) => number = Module.cwrap('malloc', 'number', ['number']);
var free: (ptr: number) => void = Module.cwrap('free', 'number', []);

class UnRar {
  private _data: ArrayBuffer;
  private _filename: string;

  constructor(data: ArrayBuffer) {
    this._data = data;
    this._filename = _.uniqueId('rarfile_');
    logger.info('open rar archive: filename = ' + this._filename);
    Module.FS_createDataFile('/', this._filename, new Uint8Array(data), true, false);
  }

  close(): void {
    logger.info('close rar archive: filename = ' + this._filename);
    this._data = null;
    // TODO (seikichi): ?????
    // Module.FS_createDataFile('/', this._filename, <any>'', true, true);
    (<any>Module).FS.deleteFile('/' + this._filename);
  }

  getFileNames(): string[] {
    logger.info('UnRar.getFileNames called: filename = ' + this._filename);
    var fileNameList: string[] = [];
    var listPtr = malloc(0);
    var fileNum = urarlib_list(this._filename, listPtr);
    var next = Module.getValue(listPtr, 'i32*');
    while (next !== 0) {
      var filenamePtr = Module.getValue(next, 'i8*');
      var filename = (Module.Pointer_stringify(filenamePtr));
      var fileAttr = Module.getValue(next + 32, 'i32*');
      logger.info('UnRar.getFileNames: filename = ' + filename);
      if (!(fileAttr & 0x10)) {
        logger.info('UnRar.getFileNames: the file is directory, skip');
        fileNameList.push(filename);
      }
      next = Module.getValue(next + 36, 'i32*');
    }
    urarlib_freelist(Module.getValue(listPtr, 'i32*'));
    return fileNameList;
  }

  getFileContent(filename: string): Uint8Array {
    var sizePtr = malloc(4);
    var outputPtr = malloc(0);

    var result = urarlib_get(outputPtr, sizePtr, filename, this._filename, '');
    var size: number = Module.getValue(sizePtr, 'i32*');

    var data: Uint8Array = null;
    if (result === 1) {
      var begin = Module.getValue(outputPtr, 'i8*');
      var data = new Uint8Array(Module.HEAPU8.subarray(begin, begin + size));
    }
    free(Module.getValue(outputPtr, 'i8*'));
    free(sizePtr);
    return data;
  }
}
