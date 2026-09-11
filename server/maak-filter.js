// Maakt leermiddelen/naamfilter.js (browser, window.NAAMFILTER) uit
// server/naamfilter.js (ESM). Draai dit na elke wijziging aan de lijst:
//   node server/maak-filter.js
const fs = require("fs");
const path = require("path");
const bron = fs.readFileSync(path.join(__dirname, "naamfilter.js"), "utf8");
const kern = bron.replace(/^export function /gm, "function ");
const uit = "/* Gemaakt door server/maak-filter.js uit server/naamfilter.js. Niet met de hand bewerken. */\n" +
  "window.NAAMFILTER = (function(){\n" + kern + "\n  return { normaliseer: normaliseer, verboden: verboden, nette: nette };\n})();\n";
fs.writeFileSync(path.join(__dirname, "..", "leermiddelen", "naamfilter.js"), uit);
new Function(uit.replace("window.NAAMFILTER", "var NAAMFILTER"));
console.log("naamfilter.js geschreven,", uit.length, "tekens");
