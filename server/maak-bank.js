// Maakt leermiddelen/bank.js uit leermiddelen/toren.html: de vragenbanken, de
// niveaulijsten, de onderdelen per vak en de rekengenerator, precies zoals ze
// in Torenverdediging staan. Draai dit opnieuw na elke wijziging aan de
// vragen (node server/maak-bank.js), dan blijft de Klasquiz gelijk.
const fs = require("fs");
const path = require("path");
const bron = path.join(__dirname, "..", "leermiddelen", "toren.html");
const doel = path.join(__dirname, "..", "leermiddelen", "bank.js");
const s = fs.readFileSync(bron, "utf8").replace(/\r\n/g, "\n");
const begin = s.indexOf("const VAKKEN = [");
const fnStart = s.indexOf("function rekenVraag(");
if (begin < 0 || fnStart < 0) throw new Error("markeringen niet gevonden");
/* het einde van rekenVraag: de accolade die de eerste weer sluit */
let i = s.indexOf("{", fnStart), d = 0, j = i;
for (; j < s.length; j++){ if (s[j] === "{") d++; else if (s[j] === "}"){ d--; if (!d) break; } }
const stuk = s.slice(begin, j + 1);
const uit = "/* Gemaakt door server/maak-bank.js uit toren.html. Niet met de hand bewerken:\n" +
  "   pas de vragen in toren.html aan en draai het script opnieuw. */\n" + stuk + "\n";
fs.writeFileSync(doel, uit.replace(/\n/g, "\r\n"));
new Function(stuk);
console.log("bank.js geschreven,", stuk.length, "tekens; bevat VAKKEN, NIVEAUS, banken, ONDERDELEN, rekenVraag");
