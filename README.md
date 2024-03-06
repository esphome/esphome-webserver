# esphome-webserver
A Lit Element web component htm webserver for esphome devices. 

###  Features

- 30 sec heartbeat showing node connection is active
- Built with Lit Element web components
- Completely standalone - no other external dependencies  9K compressed
- Light and Dark themes
- Primary theme - currently light blue - can be overridden
- Embedded ESP home logo svg
- Entities are discovered and display
- No css fetch - index page fetches one js file

dark scheme desktop:
====================
![web_server-v2](https://user-images.githubusercontent.com/5050824/141174356-789cc160-46a1-43fc-9a86-ed5a764c35d7.png)

Light scheme on mobile:
=======================
![image](https://user-images.githubusercontent.com/5050824/141175240-95b5b74e-d8c8-48bc-9d6d-053ebeaf8910.png)

### Near future:

- [ ] Support for compressed files in flash for Standalone no internet nodes
- [ ] Add Climate
- [x] Add Select drop list
- [ ] Add Number editing
- [ ] Potentially use an optional card layout instead of a table

## Example entry for `config.yaml`:

```yaml
web_server:
  port: 80
  css_url: ""
  js_url: https://esphome.io/_static/v2/www.js
  version: 2
```

development
===========

```
git clone https://github.com/esphome/esphome-webserver.git
cd esphome-webserver
npm install
```

Build and deploy all packages from the root directory:
````
npm run build
````

### Work with specific packages
Starts a dev server on http://localhost:3000
```
cd packages/v2
npm run start
```

proxy
======
Events from a real device can be proxied for development by using the `PROXY_TARGET` environment variable.

```
PROXY_TARGET=http://nodemcu.local npm run build
# and/or
PROXY_TARGET=http://nodemcu.local npm run serve
```

Alternatively, update this line in `packages/[version]/vite.config.ts` to point to your real device.
```js
const proxy_target = process.env.PROXY_TARGET || "http://nodemcu.local";
```

The json api will POST to the real device and the events are proxied

build
=====
```js
cd packages/v2
npm run build
```
The build files are copied to _static/v2 usually for deployment to https://oi.esphome.io/v2 or your /local/www Home Assistant folder

If you customise, you can deploy to your local Home Assistant /local/www/_static/v2 and use:

```yaml
web_server:
  port: 80
  version: 2
  js_url: http://homeassistant.local:8123/local/_static/v2/www.js
```

To use a specific version of a CDN hosted device dashboard, you can use the following override as an example:
```yaml
web_server:
  port: 80
  version: 3
  js_url: https://oi.esphome.io/v3/www.js
```

serve
=====
```js
cd packages/v2
npm run serve
```
Starts a production test server on http://localhost:5001
Events and the json api are proxied.
