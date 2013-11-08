# ComicBed
ComicBed はWebブラウザ上で動作するコミックビューワです (注意: この README は書きかけです)  ([English](https://github.com/seikichi/comicbed/blob/master/README.md), [日本語](https://github.com/seikichi/comicbed/blob/master/README.ja.md)).

## デモ
[漫画を読む](http://seikichi.github.io/comicbed/#?url=comicbed/LH01_hq.pdf&screen.viewMode=TwoPage&screen.pageDirection=R2L).
このデモページで表示されている漫画は，[Jコミ](http://www.j-comi.jp/book/comic/1) からダウンロードした pdf ファイルです．

## 特徴
+ デスクトップとモバイル両方のモダンなブラウザで動作します
  + Firefox 24+, Chrome29+, Safari 6+, Chrome for Android 30+, iOS Safari 6+
  + とか言いつつモバイルだとまだまだ挙動が不安定です．たまにクラッシュするので注意
+ サポートしているフォーマットは **pdf, zip, rar, cbz, cbr** の5つです
+ 画像ファイルは **jpeg, png, gif, bmp, tiff** の5つをサポートしています
+ Google Drive や Dropbox 上に置いてあるファイルを閲覧することができます

## 既知の不具合
+ モバイルでは挙動が不安定です．たまにクラッシュします．

## キーボードショートカット
+ 左右カーソルキー: ページを移動します
+ スペース: 2ページ表示モードと1ページ表示モードを切り替えます
+ エンター: フルスクリーンに切り替えます (フルスクリーンAPIをサポートしているブラウザに限る)

## その他どうでもいい特徴
+ ファイルのドロップに対応してます
+ 右綴じか左綴じかを設定で変更できます
+ pdf ファイルを閲覧する際は，ファイルのダウンロード完了を待たずに読み始めることができます (ただし Safari を除く)
  + 回線が細い場合は一旦ファイルを全てダウンロードしてから閲覧を開始した方が快適かもしれません
  + フッタの設定 (Config) から "Range-Request when reading PDF files" で挙動を変更できます
+ スワイプでページを移動できます ([iScroll5](http://cubiq.org/iscroll-5-ready-for-beta-test) を利用)
+ 横に長いページは2ページ表示モードの際でも，その1ページだけ表示します
  + URL の末尾に screen.detectsSpreadPage=false と指定すると，この挙動を抑制できます
+ ページのキャッシュとかプリフェッチとかしてます
+ zip 等の圧縮ファイルを閲覧する際は，ファイル名を自然順ソートで並び換えます
+ Backbone.js + TypeScript (0.9) + JQuery Mobile (1.4) で書かれてます
  + MBA でビルドするのに10秒以上かかってつらぽよ...

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

## ライセンス
GPL v3 or later
