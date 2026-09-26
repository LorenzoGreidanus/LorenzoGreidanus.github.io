/* De gegevens van Welke partij is dit? (partijen.html): de partijen, de feiten
   over hoe ze ontstonden en welke partijen christelijk zijn. partijen.html
   maakt er opgaven van; bank-spellen.js maakt er vragen van voor de
   vragenbank (alleen tekst, zonder logo's).

   De partijen. nu: in de Tweede Kamer (fracties september 2026); anders
   eerder in de Kamer (alleen op havo en vwo). Logo's: Wikimedia Commons,
   publiek domein (te eenvoudig voor auteursrecht), staan in partijlogos/.
   w = de goede antwoorden bij typen; jaar = opgericht. */
window.PARTIJEN_DATA = {
  P: [
    { id:'d66', afk:'D66', naam:'Democraten 66', w:['D66', 'Democraten 66', 'Democraten 1966'], jaar:1966, nu:true },
    { id:'vvd', afk:'VVD', naam:'Volkspartij voor Vrijheid en Democratie', w:['VVD', 'Volkspartij voor Vrijheid en Democratie'], jaar:1948, nu:true },
    { id:'pro', afk:'PRO', naam:'Progressief Nederland', w:['Progressief Nederland', 'PRO'], jaar:2026, nu:true },
    { id:'pvv', afk:'PVV', naam:'Partij voor de Vrijheid', w:['PVV', 'Partij voor de Vrijheid'], jaar:2006, nu:true },
    { id:'cda', afk:'CDA', naam:'Christen-Democratisch Appèl', w:['CDA', 'Christen-Democratisch Appèl', 'Christen Democratisch Appel'], jaar:1980, nu:true },
    { id:'ja21', afk:'JA21', naam:'JA21', w:['JA21', 'JA 21', 'Juiste Antwoord 2021'], jaar:2020, nu:true },
    { id:'fvd', afk:'FVD', naam:'Forum voor Democratie', w:['FVD', 'FvD', 'Forum voor Democratie', 'Forum'], jaar:2016, nu:true },
    { id:'bbb', afk:'BBB', naam:'BoerBurgerBeweging', w:['BBB', 'BoerBurgerBeweging', 'Boer Burger Beweging'], jaar:2019, nu:true },
    { id:'denk', afk:'DENK', naam:'DENK', w:['DENK'], jaar:2015, nu:true },
    { id:'sgp', afk:'SGP', naam:'Staatkundig Gereformeerde Partij', w:['SGP', 'Staatkundig Gereformeerde Partij'], jaar:1918, nu:true },
    { id:'pvdd', afk:'PvdD', naam:'Partij voor de Dieren', w:['PvdD', 'Partij voor de Dieren'], jaar:2002, nu:true },
    { id:'cu', afk:'CU', naam:'ChristenUnie', w:['CU', 'ChristenUnie', 'Christen Unie'], jaar:2000, nu:true },
    { id:'sp', afk:'SP', naam:'Socialistische Partij', w:['SP', 'Socialistische Partij'], jaar:1972, nu:true },
    { id:'50plus', afk:'50PLUS', naam:'50PLUS', w:['50PLUS', '50 PLUS', '50+'], jaar:2009, nu:true },
    { id:'volt', afk:'Volt', naam:'Volt Nederland', w:['Volt', 'Volt Nederland'], jaar:2018, nu:true },
    { id:'nsc', afk:'NSC', naam:'Nieuw Sociaal Contract', w:['NSC', 'Nieuw Sociaal Contract'], jaar:2023, nu:false },
    { id:'gl', afk:'GL', naam:'GroenLinks', w:['GroenLinks', 'Groen Links', 'GL'], jaar:1990, nu:false },
    { id:'pvda', afk:'PvdA', naam:'Partij van de Arbeid', w:['PvdA', 'Partij van de Arbeid'], jaar:1946, nu:false }
  ],
  /* hoe en wanneer ontstaan: alleen feiten. [partij, vraag, alleen havo en vwo] */
  FEIT: [
    ['sgp', 'Welke partij is de <b>oudste</b> partij in de Tweede Kamer? Ze bestaat sinds 1918.'],
    ['d66', 'Welke partij heeft het jaar waarin ze begon in haar naam?'],
    ['cda', 'Welke partij ontstond in 1980 uit drie christelijke partijen: de KVP, de ARP en de CHU?'],
    ['cu', 'Welke partij ontstond in 2000 uit twee christelijke partijen, het GPV en de RPF?'],
    ['pro', 'Welke partij ontstond uit het samengaan van GroenLinks en de PvdA?'],
    ['pvdd', 'Welke partij was in 2006 de eerste dierenpartij ter wereld met zetels in een landelijk parlement?'],
    ['volt', 'Welke partij doet in veel landen van Europa mee aan verkiezingen, met hetzelfde programma?'],
    ['50plus', 'Welke partij zegt in haar naam voor welke leeftijdsgroep ze vooral opkomt?'],
    ['bbb', 'Welke partij werd opgericht in 2019, in de tijd van de protesten van boeren?'],
    ['sp', 'Welke partij heeft een <b>tomaat</b> als teken?'],
    ['denk', 'De naam van welke partij betekent in het Turks <b>gelijkwaardig</b>, en in het Nederlands iets met nadenken?'],
    ['pvv', 'Welke partij werd in 2006 opgericht door Geert Wilders?'],
    ['ja21', 'Welke partij heette bij de oprichting in 2020 voluit <b>Juiste Antwoord 2021</b>?'],
    ['fvd', 'Welke partij begon als denktank en werd in 2016 een politieke partij?'],
    ['vvd', 'Welke liberale partij werd opgericht in 1948 en heeft oranje en blauw in het logo?'],
    ['pvda', 'Welke partij werd opgericht in 1946, vlak na de Tweede Wereldoorlog?', true],
    ['gl', 'Welke partij ontstond in 1990 uit vier kleine linkse partijen, waaronder de CPN en de PSP?', true],
    ['nsc', 'Welke partij werd in 2023 opgericht door Pieter Omtzigt?', true]
  ],
  /* christelijke partijen: de afleiders zijn dan partijen die dat niet zijn */
  CHRISTELIJK: ['cda', 'cu', 'sgp'],
  NIET_CHR: ['d66', 'vvd', 'sp', 'pvdd', 'volt', 'pvv', 'bbb', 'ja21', '50plus']
};
