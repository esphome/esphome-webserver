if (document.location.search === "?save") document.getElementsByTagName("aside")[0].style.display = "block";
function wifi(dBm: number) {
  let quality: number = Math.max(Math.min(2 * (dBm + 100), 100), 0) / 100.0;
  return svg(`<path d="m12.008 19.25-11.3-15c7-5 14-5 22.5 0z" fill="none" stroke="currentColor"/>
              <path d="m12.008 19.25-11.3-15c7-5 14-5 22.5 0z" transform="scale(${quality} ${quality})" transform-origin="12 18"/>`)
}
function svg(el:String) {
  return html([`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">${el}</svg>`])
}
function lock(show: boolean) {
  return show
    ? svg(`<path d='M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 
  2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2
   2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 
   5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z'/>`)
    : ""
}
function html(h: String[]) {
  return h.join("");
}
fetch("/config.json").then(function (response) {
  response.json().then(function (config) {
    document.title = config.name;
    document.body.getElementsByTagName("h1")[0].innerText = "MAC Address: " + config.mac
    document.body.getElementsByTagName("h1")[1].innerText = "WiFi Networks: " + config.name
    let result = config.aps.slice(1).map(function (ap) {
      return `<div class="network" 
      onclick="document.getElementById('ssid').value = this.innerText;document.getElementById('psk').focus()">
      <a href="#" class="network-left">
        ${wifi(ap.rssi)}
        <span class="network-ssid">${ap.ssid}</span>
      </a>
      ${lock(ap.lock)}
      </div>`
    })
    document.querySelector("#net").innerHTML = html(result)
    document.querySelector("link[rel~='icon']").href = `data:image/svg+xml,${wifi(-65)}`;
  })
})
