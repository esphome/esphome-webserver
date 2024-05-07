#!/bin/bash
cat <<EOT >./$1/$2
#pragma once
// Generated from https://github.com/esphome/esphome-webserver

EOT

if [ -n "$4" ]; then
  echo "#ifdef USE_WEBSERVER_LOCAL" >>./$1/$2
  echo "#if USE_WEBSERVER_VERSION == $4" >>./$1/$2
  echo "" >>./$1/$2
fi

cat <<EOT >>./$1/$2
#include "esphome/core/hal.h"

namespace esphome {
namespace $3 {

EOT
echo "const uint8_t INDEX_GZ[] PROGMEM = {" >>./$1/$2
xxd -cols 19 -i $1/index.html.gz | sed -e '2,$!d' -e 's/^/  /' -e '$d' | sed -e '$d' | sed -e '$s/$/};/' >>./$1/$2
cat <<EOT >>./$1/$2

}  // namespace $3
}  // namespace esphome
EOT
if [ -n "$4" ]; then
  echo "" >>./$1/$2
  echo "#endif" >>./$1/$2
  echo "#endif" >>./$1/$2
fi
