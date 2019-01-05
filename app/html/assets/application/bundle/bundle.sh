#!/bin/bash
# browserify main.js -t browserify-css -o bundle.js
browserify main.js -t browserify-css -p tinyify -o bundle.js