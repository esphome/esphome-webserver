#!/bin/bash
cat <<EOT > ./$1/$2
#pragma once
// Generated from https://github.com/esphome/esphome-webserver
$(if [ -n "$4" ]; then echo "#if USE_WEBSERVER_VERSION == $4"; fi)
#include "esphome/core/hal.h"
namespace esphome {

namespace $3 {

EOT
echo "const uint8_t INDEX_GZ[] PROGMEM = {" >> ./$1/$2
xxd -cols 19 -i $1/index.html.gz | sed -e '2,$!d' -e 's/^/  /' -e '$d' | sed  -e '$d' | sed -e '$s/$/};/' >> ./$1/$2
cat <<EOT >> ./$1/$2

}  // namespace $3
}  // namespace esphome
$(if [ -n "$4" ]; then echo "#endif"; fi)
EOT
ls -l ./$1/$2
