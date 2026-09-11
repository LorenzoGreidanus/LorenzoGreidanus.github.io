/* Het naamfilter: houdt racistische en andere haatdragende termen uit
   bijnamen, ook als ze verstopt zijn met cijfers, tekens, spaties, accenten
   of herhaalde letters.

   Werkwijze: de naam wordt eerst genormaliseerd (kleine letters, accenten
   weg, cijfers en tekens die op letters lijken vertaald, alles wat geen
   letter is weg, drie of meer dezelfde letters achter elkaar ingekort tot
   twee), en daarna vergeleken met een lijst. Lange termen tellen als ze
   ergens in de naam voorkomen, korte termen alleen als de hele naam ze is,
   anders wordt "spice" of "raccoon" ook tegengehouden.

   Dit bestand is de bron; server/maak-filter.js maakt er de browserversie
   leermiddelen/naamfilter.js van. Pas de lijst hier aan en draai dat script. */

/* tekens die als letter gebruikt worden om een filter te omzeilen */
const LEET = { "0": "o", "1": "i", "2": "z", "3": "e", "4": "a", "5": "s", "6": "g", "7": "t", "8": "b", "9": "g",
  "@": "a", "$": "s", "!": "i", "|": "l", "€": "e", "£": "l", "+": "t", "(": "c", "<": "c", "¢": "c", "ß": "ss" };

/* termen die overal in de naam mogen voorkomen (vijf letters of meer) */
const LANG = [
  "nigger", "nigga", "niggr", "neger", "nikker", "negerin", "zwartjoekel", "bosneger", "zandneger",
  "kaffer", "kaffir", "spleetoog", "spleetogen", "poepchinees", "chink", "chinky", "gook", "wetback", "beaner",
  "raghead", "towelhead", "darkie", "darky", "tarbaby", "junglebunny", "porchmonkey", "sandnigger", "roetmop",
  "kutmarokkaan", "kutturk", "kutneger", "kutjood", "kutmoslim", "kutbuitenlander",
  "kankermarokkaan", "kankerturk", "kankerneger", "kankerjood", "kankermoslim", "kankerbuitenlander",
  "vuilejood", "teringjood", "jodenhater", "jodenvreter", "untermensch", "whitepower", "heilhitler", "hitler",
  "nazi", "neonazi", "siegheil", "sigheil", "zieghail", "swastika", "hakenkruis", "nsb", "kutneger",
  "mongool", "mongooltje", "spast", "spastisch", "kanker", "kankerlijer", "teringlijer", "tyfuslijer",
  "hoer", "hoeren", "slet", "kutwijf", "nsbr"
];
/* korte of gevoelige termen: alleen als de hele naam eruit bestaat */
const HEEL = [ "spic", "paki", "coon", "coons", "kkk", "jood", "joden", "jew", "jews", "kike", "nsb", "wog", "gyp", "sieg", "heil", "kut", "hoer", "slet" ];
/* codes met cijfers, gecontroleerd op de versie waarin cijfers cijfers blijven */
const CODES = [ "1488", "14 88", "88 14" ];

/* letters, met leet-tekens vertaald, zonder de inkorting van herhalingen */
function ruw(naam){
  let s = String(naam || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/./g, c => LEET[c] !== undefined ? LEET[c] : c);
  return s.replace(/[^a-z]/g, "");
}
export function normaliseer(naam){
  return ruw(naam).replace(/(.)\1{2,}/g, "$1$1");
}
/* tweede vorm: cijfers blijven staan, voor codes als 1488 */
function metCijfers(naam){
  return String(naam || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

export function verboden(naam){
  const r = ruw(naam), n = normaliseer(naam), c = metCijfers(naam);
  if (!n && !c) return false;
  /* Herhaalde letters weghalen vangt "nigerr" en "negerrr", maar alleen als
     de naam zelf herhalingen heeft: "Nigeria" heeft ze niet en blijft gewoon
     een land. */
  const kaal = n.replace(/(.)\1+/g, "$1"), herhaalt = kaal !== n;
  for (const t of LANG){ if (n.includes(t) || (herhaalt && kaal.includes(t.replace(/(.)\1+/g, "$1")))) return true; }
  for (const t of HEEL){ if (n === t || r === t || kaal === t) return true; }
  for (const t of CODES){ if (c.includes(t.replace(/\s/g, ""))) return true; }
  return false;
}

/* een nette naam: geschoond, en vervangen als hij niet door het filter komt */
export function nette(naam, anders){
  const s = String(naam || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
  if (!s) return anders || "Leerling";
  return verboden(s) ? (anders || "Leerling") : s;
}
