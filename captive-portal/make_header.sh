#!/bin/bash
echo "const uint8_t index_gz[] PROGMEM = {" > ./dist/captive_index.h
xxd -i dist/index.html.gz | sed -e '2,$!d' -e '$d' >> ./dist/captive_index.h
ls -l ./dist/captive_index.h