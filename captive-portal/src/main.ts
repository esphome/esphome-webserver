window.c = function (l) {
  document.getElementById("ssid").value = l.innerText || l.textContent
  document.getElementById("psk").focus()
}
if (document.location.search === "?save") document.getElementsByTagName("aside")[0].style.display = "block"
var app = document.querySelector("#net")

fetch("/config.json").then(function (response) {
  response.json().then(function (config) {
    document.title = config.name
    document.body.getElementsByTagName("h1")[0].innerText = "WiFi Networks: " + config.name
    let result = config.aps.slice(1).map(function (ap) {
      return `<div class="network" onclick="window.c(this)"><a href="#" class="network-left">
<i class="sig${ap.sig}"></i><span class="network-ssid">${ap.ssid}</span></a>
${ap.lock ? '<i class="lock"></i>' : ""}</div>`;
    });
    app.innerHTML = result.join("")
  })
})
