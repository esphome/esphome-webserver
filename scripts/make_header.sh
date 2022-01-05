#!/bin/bash
cat <<EOT > ./$1/$2
#pragma once
// Generated from https://github.com/esphome/esphome-webserver/tree/main/captive-portal
namespace esphome {

namespace captive_portal {

EOT
echo "const uint8_t INDEX_GZ[] PROGMEM = {" >> ./$1/$2
xxd -cols 19 -i $1/index.html.gz | sed -e '2,$!d' -e 's/^/  /' -e '$d' | sed  -e '$d' | sed -e '$s/$/};/' >> ./$1/$2
cat <<EOT >> ./$1/$2

}  // namespace captive_portal
}  // namespace esphome
EOT
ls -l ./$1/$2
