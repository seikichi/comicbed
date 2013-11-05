# ComicBed
A browser based comic book reader.

## Demo
see [demo](http://seikichi.github.io/comicbed/#?url=comicbed/LH01_hq.pdf&screen.viewMode=TwoPage&screen.pageDirection=R2L). The pdf file used in the demo site is downloaded from [J-comi](http://www.j-comi.jp/book/comic/1).

## Features
+ uses javascript & html5.
+ runs in modern browsers
  + IE10+, Firefox 24+, Chrome29+, Chrome for Android 30+
+ supports several archive formats (**pdf, zip, rar, cbz, cbr**) and image formats (**jpeg, png, gif, bmp, tiff**).
+ can read files in Google Drive and Dropbox storages.

## Known Issues
+ sometimes crashes in mobile browsers ;-p
+ configuretion dialog does not work in safari, iOS safari, Chrome for Android
+ need tap twice to open dropbox chooser in safari (the first trial is blocked)
+ can not read books in iOS safari

## Keyboard Shortcuts
+ left/right-arrow key: move page
+ space: toggle view mode between one page and two pages
+ enter: toggle fullscreen

## Query String Parameters
[example](http://seikichi.github.io/comicbed/#?url=comicbed/LH01_hq.pdf&screen.viewMode=TwoPage&screen.pageDirection=R2L)

+ url: string
+ screen.viewMode: 'OnePage' or 'TwoPage'
+ screen.pageDirection: 'L2R' or 'R2L'
+ screen.detectsSpreadPage: boolean
+ cache.cachePageNum: number
+ cache.cacheScreenNum: number
+ sort.reverse: boolean
+ sort.order: 'NameNatural' or 'NameDirectory' or 'Entry'
+ unarchiver.enablesRangeRequestInPdf: boolean

## License
GPL v3 or later
