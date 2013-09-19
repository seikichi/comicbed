#!/bin/sh

npm run-script preinstall
npm install
grunt setup

tsd install requirejs jquery underscore
