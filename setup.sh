#!/bin/sh

npm run-script preinstall
npm install
grunt setup

tsd install requirejs underscore

git submodule update --init
node submodules/pdf.js/make.js generic

mkdir -p assets/app/pdfjs/js/
cp submodules/pdf.js/build/generic/build/*.js assets/app/pdfjs/js/
cp submodules/pdf.js/build/generic/web/compatibility.js assets/app/pdfjs/js/

mkdir -p assets/app/tiff/js/
cp submodules/tiff.js/tiff.memory_growth.min.js  assets/app/tiff/js/tiff.min.js

mkdir -p assets/app/unrarlib/js/
cp submodules/unrar.js/unrar.min.js  assets/app/unrarlib/js/unrar.min.js

mkdir -p assets/app/jquery-mobile/js/ assets/app/jquery-mobile/css/  assets/app/jquery-mobile/tmp
wget http://jquerymobile.com/resources/download/jquery.mobile-1.4.0-rc.1.zip -P assets/app/jquery-mobile
unzip assets/app/jquery-mobile/jquery.mobile-1.4.0-rc.1.zip -d assets/app/jquery-mobile/tmp
mv assets/app/jquery-mobile/tmp/jquery.mobile-1.4.0-rc.1.js assets/app/jquery-mobile/js
mv assets/app/jquery-mobile/tmp/jquery.mobile-1.4.0-rc.1.min.css assets/app/jquery-mobile/css
mv assets/app/jquery-mobile/tmp/images assets/app/jquery-mobile/css/
rm assets/app/jquery-mobile/jquery.mobile-1.4.0-rc.1.zip
rm -rf assets/app/jquery-mobile/tmp
