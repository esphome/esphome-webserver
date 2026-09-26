// v4 entry: inject styles once, register all elements, connect SSE.
// The firmware serves our index.html (favicon + viewport included); hosts
// embedding www.js in their own page should provide those themselves.
import { css } from "./ui/css";
import "./ui/app";
import "./ui/entity";
import "./ui/chart";
import "./ui/log";
import { connect } from "./core/sse";

const style = document.createElement("style");
style.textContent = css;
document.head.append(style);

connect();
