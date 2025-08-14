# captive-portal
Source code to build esphome captive portal. Output is `captive_index.h` file to be included by the Captive Portal Component https://esphome.io/components/captive_portal.html

## Important Note on Flash Usage

The captive portal HTML/CSS/JS is **always compiled into ESPHome binaries** when the `captive_portal:` component is enabled. This means the entire portal interface is stored in the device's flash memory. **Minimizing the flash footprint is critical** as ESP devices have limited flash space, and every byte saved here allows more room for user code and other components.

Current size: **1,471 bytes** (gzipped)

###  Features

- All assets (css, svg and js) are inlined and served from index.html
- index.html is gzipped, and stored in flash compressed (~1.4KB of flash memory)
- ssid scan result is returned via `/config.json` api request
- Aggressively optimized for minimal size while maintaining functionality


development
===========

```
git clone https://github.com/esphome/esphome-webserver.git
cd captive-portal
pnpm install
```

`npm run start`
Starts a dev server on http://localhost:3000

build
=====
`npm run build`
The build files are copied to `dist` folder. `captive_index.h` is built to be deployed to https://github.com/esphome/esphome/tree/dev/esphome/components/captive_portal


serve
=====
`npm run server`
Starts a production test server on http://localhost:5001
