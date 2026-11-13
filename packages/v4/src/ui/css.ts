// Design tokens + component styles, mobile-first single file.
// Light/dark palettes are WCAG-AA checked pairs (body text >= 4.5:1 on
// surfaces, dim text >= 4.5:1, primary accents >= 3:1) - fixing the muddy
// dark theme of earlier versions.
export const css = `
*{box-sizing:border-box}
body{margin:0 auto;padding:0 10px 24px;font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--text)}
:root{
  --pri:#0369a0;--bright:#03a9f4;--on:#fff;
  --bg:#f2f4f7;--sf:#fff;--sf2:#eceff3;
  --tx:#1b1f24;--dim:#5f6b76;
  --bd:rgba(0,0,0,.15);--tr:rgba(0,0,0,.22);
  --ok:#2e7d32;--err:#c62828;
  --sh:0 1px 3px rgba(0,0,0,.12)
}
:root[data-theme=dark]{
  --pri:#4fc3f7;--bright:#40c4ff;--on:#06232e;
  --bg:#111;--sf:#1c1c1c;--sf2:#26292e;
  --tx:#e1e3e6;--dim:#9fa5ab;
  --bd:rgba(255,255,255,.16);--tr:rgba(255,255,255,.3);
  --ok:#6fce74;--err:#ff6b6b;--sh:none
}
.ic{width:24px;height:24px;fill:currentColor}
button{font:inherit}
button:not(.hicon):not([data-act]),select,input:not([type=range]):not([type=checkbox]):not([type=color]){
  font:inherit;color:var(--tx);background:var(--sf2);
  border:1px solid var(--bd);border-radius:8px;padding:5px 8px;max-width:100%
}
select{max-width:min(100%,220px)}
input[type=color]{width:40px;height:28px;padding:0 2px;border:1px solid var(--bd);border-radius:8px;background:var(--sf2);cursor:pointer}
input:focus-visible,select:focus-visible,button:focus-visible{outline:2px solid var(--pri);outline-offset:1px}

header{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;padding:10px 2px 6px}
header #logo{display:inline-flex}
#logo svg{width:34px;height:33px}
.hicons{display:flex;gap:2px;margin-left:auto}
.hicon{border:0;background:none;padding:6px;color:var(--dim);cursor:pointer;border-radius:8px}
.hicon.ok{color:var(--ok)}
.hicon.off{color:var(--err)}
h1{flex:1 1 100%;margin:0;font-size:1.55em;line-height:1.15;text-align:center}
#sub{flex:1 1 100%;text-align:center;color:var(--dim);font-size:.85em}

main{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:1024px){
  main.table{grid-template-columns:minmax(560px,700px) 1fr;align-items:start}
  main.table #col-log{margin-top:12px}
  main.table.expanded_entity,main.table.expanded_logs{grid-template-columns:1fr}
  main.table.expanded_entity #col-log,main.table.expanded_logs #col-ent{display:none}
}

.sec{margin-top:12px}
.sec-h{display:inline-block;padding:.45em 1.4em;font-weight:500;background:var(--sf);border:1px solid var(--bd);border-bottom:0;border-radius:12px 12px 0 0;user-select:none}
.sec-b{border:1px solid var(--bd);border-radius:0 12px 12px 12px;background:var(--sf);box-shadow:var(--sh);overflow:hidden}
main.cards #col-ent .sec-b{display:grid;gap:8px;padding:8px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}

.ent{position:relative;isolation:isolate}
main.table .ent{display:grid;grid-template-columns:32px minmax(110px,42%) 1fr;gap:8px;align-items:center;min-height:44px;padding:4px 10px}
main.table .ent:nth-child(2n){background:var(--sf2)}
main.table .ent.expanded{min-height:240px;align-items:start;padding-top:10px}
main.cards .ent{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:108px;padding:12px 8px 10px;text-align:center;background:var(--sf2);border-radius:12px;overflow:hidden}
main.cards .ent .eval{margin-top:auto;width:100%}
main.cards .st{font-size:1.25em}
main.cards .sw{padding-bottom:10px}
main.cards .ent.expanded .st{font-size:1em}
main.cards .numrow{margin-top:18px}
main.cards .ent.expanded{display:grid;grid-column:1/-1;grid-template-columns:32px minmax(110px,42%) 1fr;gap:8px;align-items:start;min-height:240px;padding:10px;text-align:left}
main.cards .ent.expanded .eval{margin-top:0;justify-content:flex-end}
main.table .ent.sensor,main.cards .ent.sensor{cursor:pointer}
.eic{color:var(--pri);display:inline-flex}
.ename{min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
main.table .ename{text-align:left}
.eval{min-width:0;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:6px}
main.cards .eval{justify-content:center}
.ent.dim{display:none}

e-chart{position:absolute;left:26px;right:16px;top:50%;translate:0 -50%;height:40px;opacity:.14;z-index:-1;pointer-events:none}
e-chart svg{display:block;width:100%;height:100%}
e-chart path{fill:none;stroke:var(--bright);stroke-width:1;stroke-linecap:round}
e-chart circle{fill:var(--bright)}
e-chart .axis{position:absolute;inset:0;pointer-events:none}
e-chart .axis span{position:absolute;right:0;transform:translateY(-50%);font-size:10px;line-height:1;color:var(--dim)}
.ent.expanded e-chart{opacity:.5;top:42px;bottom:6px;translate:0 0;height:auto}

.btn{border:1px solid var(--bd);border-radius:8px;padding:5px 12px;background:var(--sf2);color:var(--tx);cursor:pointer}
.btn:hover:not(:disabled){border-color:var(--pri);color:var(--pri)}
.btn.cur{opacity:.45;cursor:default}
.allrow{text-align:center;padding:10px}

.sw{display:inline-flex;cursor:pointer;-webkit-tap-highlight-color:transparent}
.sw input{position:absolute;opacity:0;width:0;height:0}
.lever{position:relative;display:inline-block;width:36px;height:14px;border-radius:15px;background:var(--tr);transition:background .3s}
.lever::after{content:"";position:absolute;top:-3px;left:0;width:20px;height:20px;border-radius:50%;transition:left .3s,background .3s}
.lever::after{background:#f1f1f1;box-shadow:var(--sh)}
.sw input:checked+.lever{background:color-mix(in srgb,var(--bright) 55%,transparent)}
.sw input:checked+.lever::before,.sw input:checked+.lever::after{left:16px}
.sw input:focus-visible+.lever{outline:2px solid var(--pri)}

.sl{display:inline-flex;align-items:center;gap:8px;flex:1 1 160px;min-width:140px}
.sl>label{color:var(--dim);min-width:20px}
.slw{position:relative;flex:1;display:flex;align-items:center}
.slw::before{content:"";position:absolute;left:0;right:0;top:50%;height:4px;translate:0 -50%;border-radius:4px;background:var(--bright)}
.slv{position:absolute;left:calc(var(--p,0)*1% + 10px - var(--p,0)*.2px);top:-14px;transform:translateX(-50%);z-index:1;padding:1px 5px;border-radius:6px;background:var(--bright);color:var(--on);font-size:11px;line-height:1.4;pointer-events:none}
.slv::before{content:"";position:absolute;width:0;height:0;border:5px solid transparent;border-top:10px solid var(--bright);top:100%;left:50%;margin:-1px 0 0 -5px}
input[type=range]{position:relative;width:100%;margin:14px 0;appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer;touch-action:none}
input[type=range]:focus{outline:none}
input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:4px}
input[type=range]::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:20px;height:20px;margin-top:-8px;border:0;border-radius:50%;background:#fff;box-shadow:0 0 3px rgba(0,0,0,.6)}
input[type=range]::-moz-range-track{height:4px;border-radius:4px}
input[type=range]::-moz-range-thumb{width:20px;height:20px;border:0;border-radius:50%;background:#fff;box-shadow:0 0 3px rgba(0,0,0,.6)}

.col{display:flex;flex-direction:column;gap:2px;width:100%}
.cr{display:flex;flex-wrap:wrap;align-items:center;width:100%}
.cr>label{color:var(--dim)}
.cr>select{flex:1 1 120px}
.numrow{display:flex;align-items:center;gap:6px;flex:1;min-width:0;width:100%}
.uom{color:var(--dim)}

.logs{padding:16px;overflow-x:auto;font-family:ui-monospace,monospace;font-size:14px}
.lbody{max-height:50vh;overflow-y:auto}
.lrow{display:flex;padding:4px 0;line-height:1.4}
.lrow>div{padding-right:.25em;min-width:0;overflow-wrap:anywhere}
.lrow>div:nth-child(1){flex:2 0;min-width:76px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lrow>div:nth-child(2){flex:1 0;max-width:40px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lrow>div:nth-child(3){flex:3 0;min-width:70px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lrow>div:last-child{flex:15 0;padding-right:0}
.lhead{white-space:nowrap}
:root:not([data-theme=dark]) .logs{font-weight:bold}
.v{color:#888888}
.d{color:#00dddd}
:root[data-theme=dark] .d{color:#00aaaa}
.c{color:magenta}
.i{color:limegreen}
.w{color:yellow}
:root:not([data-theme=dark]) .w{color:#cccc00}
.e{color:red;font-weight:bold}
@media(max-width:1024px){.lrow>div:nth-child(2){display:none}}

form.ota{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;padding:10px}
`;
