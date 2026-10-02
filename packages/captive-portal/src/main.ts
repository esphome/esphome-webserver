if (document.location.search === "?save") document.getElementsByTagName("aside")[0].style.display = "block";
interface Ap {
  ssid: string;
  rssi: number;
  lock: number;
}
interface Config {
  mac: string;
  name: string;
  aps: Ap[]; // first entry is always {} and is skipped via slice(1)
}
function wifi(dBm: number) {
  let q = Math.max(Math.min(2 * (dBm + 100), 100), 0) / 100;
  return svg(`<path d="M12 19.25L.7 4.25c7-5 14-5 22.5 0z" fill="none" stroke="currentColor"/>
<path d="M12 19.25L.7 4.25c7-5 14-5 22.5 0z" transform="scale(${q} ${q})" transform-origin="12 18"/>`)
}
function svg(el: string) {
  return html([`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">${el}</svg>`])
}
function lock(show: number) {
  return show
    ? svg(`<path d='M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z'/>`)
    : ""
}
function html(h: string[]) {
  return h.join("");
}
fetch("/config.json").then(function (response) {
  response.json().then(function (config: Config) {
    document.title = config.name;
    (document.getElementById("mac") as HTMLElement).innerText = "MAC Address: " + config.mac;
    (document.getElementById("h1") as HTMLElement).innerText = "WiFi Networks: " + config.name;
    let net = document.getElementById("net") as HTMLElement;
    let ssid = document.getElementById("ssid") as HTMLInputElement;
    let psk = document.getElementById("psk") as HTMLInputElement;
    config.aps.slice(1).forEach(function (ap) {
      let div = document.createElement("div");
      div.className = "network";
      div.innerHTML = `<a href="#" class="network-left">${wifi(ap.rssi)}<span class="network-ssid"></span></a>${lock(ap.lock)}`;
      (div.querySelector(".network-ssid") as HTMLElement).textContent = ap.ssid;
      div.onclick = function () {
        ssid.value = ap.ssid;
        psk.focus();
      };
      net.appendChild(div);
    });
    (document.querySelector("link[rel~='icon']") as HTMLLinkElement).href = `data:image/svg+xml,${wifi(-65)}`;
  });
});
