#!/bin/sh

npm run-script preinstall
npm install
grunt setup

tsd install requirejs underscore

git submodule update --init
node submodules/pdf.js/make.js generic

mkdir -p assets/app/pdfjs/js/
cp submodules/pdf.js/build/generic/build/pdf.*.js assets/app/pdfjs/js/
cp submodules/pdf.js/build/generic/web/compatibility.js assets/app/pdfjs/js/
