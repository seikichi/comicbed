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
