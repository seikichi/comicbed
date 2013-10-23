#!/bin/bash

rm -f *.pdf

for compress in None BZip Fax Group4 JPEG JPEG2000 Lossless LZW RLE Zip; do
    convert -quality 100 -compress $compress 01.png 02.png $compress.pdf
done
