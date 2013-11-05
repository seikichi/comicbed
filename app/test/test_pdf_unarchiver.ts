import Unarchiver = require('models/unarchiver');
import ImageUtil = require('utils/image');

var assert = chai.assert;

describe('PdfImageUnarchiver', function () {
  this.timeout(5000);
  var compressTypes = [
    'None',
    'BZip',
    'Fax',
    'Group4',
    'JPEG',
    'JPEG2000',
    'Lossless',
    'LZW',
    'RLE',
    'Zip',
  ];
  var factory = Unarchiver.createFactory({
    pdfjsCanvasScale: () => 1,
    detectsImageXObjectPageInPdf: () => true,
    pageFileExtensions: () => [''],
    enablesRangeRequestInPdf: () => true,
  });
  var PAGE_SIZE = 2;
  var pdfDir = location.protocol + '//' + location.host + '/testdata/pdf/';

  var image01: HTMLCanvasElement;
  var image02: HTMLCanvasElement;
  var jpegImage01: HTMLCanvasElement;
  var jpegImage02: HTMLCanvasElement;
  before((done) => {
    ImageUtil.loadImageFromURL(pdfDir + '01.png').then((image: HTMLImageElement) => {
      image01 = ImageUtil.imageElementToCanvas(image);
      return ImageUtil.loadImageFromURL(pdfDir + '02.png');
    }).then((image: HTMLImageElement) => {
      image02 = ImageUtil.imageElementToCanvas(image);
      return ImageUtil.loadImageFromURL(pdfDir + '01.jpg');
    }).then((image: HTMLImageElement) => {
      jpegImage01 = ImageUtil.imageElementToCanvas(image);
      return ImageUtil.loadImageFromURL(pdfDir + '02.jpg');
    }).then((image: HTMLImageElement) => {
      jpegImage02 = ImageUtil.imageElementToCanvas(image);
      done();
    });
  });

  for (var i = 0, len = compressTypes.length; i < len; ++i) {
    ((type: string) => {
      var url = pdfDir + type + '.pdf';

      it('should extract Image XObject from pdf files (compressed with ' + type + ' option)', (done) => {
        var unarchiver: Unarchiver.Unarchiver = null;
        var filenames: string[] = [];
        factory.getUnarchiverFromURL(url)
          .then((_unarchiver: Unarchiver.Unarchiver) => {
            unarchiver = _unarchiver;
            filenames = unarchiver.filenames();

            assert.strictEqual(type, unarchiver.archiveName());
            assert.strictEqual(PAGE_SIZE, filenames.length);

            return unarchiver.unpack(filenames[0]);
          }).then((content: Unarchiver.Content) => {
            var image = ImageUtil.imageElementToCanvas(<any>content);
            if (type === 'JPEG') {
              assert(jpegImage01.toDataURL() === image.toDataURL());
            } else {
              // assert(image01.toDataURL() === image.toDataURL());
            }
            return unarchiver.unpack(filenames[1]);
          }).then((content: Unarchiver.Content) => {
            var image = ImageUtil.imageElementToCanvas(<any>content);
            if (type === 'JPEG') {
              assert(jpegImage02.toDataURL() === image.toDataURL());
            } else {
              // assert(image02.toDataURL() === image.toDataURL());
            }
            done();
          });
      });
    }(compressTypes[i]));
  }
});
