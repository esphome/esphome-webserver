#!/bin/bash
cat <<EOT > ./dist/captive_index.h
#pragma once
// Generated from https://github.com/esphome/esphome-webserver/tree/main/captive-portal
namespace esphome {

namespace captive_portal {

EOT
echo "const uint8_t INDEX_GZ[] PROGMEM = {" >> ./dist/captive_index.h
xxd -cols 19 -i dist/index.html.gz | sed -e '2,$!d' -e 's/^/  /' -e '$d' | sed  -e '$d' | sed -e '$s/$/};/' >> ./dist/captive_index.h
cat <<EOT >> ./dist/captive_index.h

}  // namespace captive_portal
}  // namespace esphome
EOT
ls -l ./dist/captive_index.h
tail ./dist/captive_index.h