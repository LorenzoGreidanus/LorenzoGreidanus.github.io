/* De gegevens voor Kaartvaardigheden: de kaartsymbolen met hun tekening (svg
   in een vakje van 20 bij 20, middelpunt 0,0, lijnen in currentColor), de
   vlakkleuren, de lijnsoorten, de fictieve plaatsnamen, de windrichtingen en
   de schalen per niveau. De kaarten zelf tekent kaartvaardigheid.html. */
window.KAART_GEGEVENS = {
  /* symbolen: id, naam, betekenis (voor de uitleg), tekening */
  symbolen: [
    { id:'kerk', naam:'kerk', uit:'een kruis op een gebouwtje: de kerk', d:'<rect x="-5" y="-1" width="10" height="8"/><path d="M0 -9v8M-3 -6h6"/>' },
    { id:'molen', naam:'molen', uit:'vier wieken op een voet: de molen', d:'<path d="M0 3v6M-4 9h8"/><circle cx="0" cy="-1" r="2"/><path d="M0 -1l-6-6M0 -1l6-6M0 -1l-6 6M0 -1l6 6"/>' },
    { id:'camping', naam:'camping', uit:'een tentje: de camping', d:'<path d="M-8 7l8-14 8 14z"/><path d="M0 7v-8"/>' },
    { id:'ziekenhuis', naam:'ziekenhuis', uit:'een H in een vakje: het ziekenhuis', d:'<rect x="-8" y="-8" width="16" height="16" rx="2"/><path d="M-4 -5v10M4 -5v10M-4 0h8"/>' },
    { id:'vuurtoren', naam:'vuurtoren', uit:'een toren met lichtstralen: de vuurtoren', d:'<path d="M-3 9l1-13h4l1 13z"/><path d="M-2 -4h4"/><path d="M-9 -8l4 2M9 -8l-4 2M-9 -2l4-1M9 -2l-4-1"/>' },
    { id:'kasteel', naam:'kasteel', uit:'een muur met kantelen: het kasteel', d:'<path d="M-8 8v-12h3v3h3v-3h4v3h3v-3h3v12z"/>' },
    { id:'haven', naam:'haven', uit:'een anker: de haven', d:'<circle cx="0" cy="-6" r="2"/><path d="M0 -4v13M-6 3c0 4 3 6 6 6s6-2 6-6"/><path d="M-4 0h8"/>' },
    { id:'school', naam:'school', uit:'een open boek: de school', d:'<path d="M-8 -5c3-1 6-1 8 1 2-2 5-2 8-1v12c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M0 -4v12"/>' },
    { id:'station', naam:'station', uit:'een treinwagon: het station', d:'<rect x="-8" y="-7" width="16" height="11" rx="2"/><path d="M-5 -3h10M-4 0h8"/><circle cx="-4" cy="7" r="1.6"/><circle cx="4" cy="7" r="1.6"/>' },
    { id:'info', naam:'informatiepunt (VVV)', uit:'een i in een rondje: het informatiepunt', d:'<circle cx="0" cy="0" r="8"/><path d="M0 -1v6"/><circle cx="0" cy="-4.2" r="1.1" fill="currentColor" stroke="none"/>' },
    { id:'bushalte', naam:'bushalte', uit:'een bordje op een paal: de bushalte', d:'<path d="M0 9v-10"/><rect x="-6" y="-9" width="12" height="8" rx="1.5"/><path d="M-3 -5h6"/>' },
    { id:'uitkijk', naam:'uitkijktoren', uit:'een hoge toren met een platform: de uitkijktoren', d:'<path d="M-4 9l2-14h4l2 14"/><path d="M-7 -5h14"/><path d="M-4 3h8"/>' }
  ],
  /* vlakkleuren: welke kleur wat betekent; de vulling leest uit de tokens of een van de twee vaste accentkleuren */
  vlakken: [
    { id:'water', naam:'water (meer, plas, zee)', kleur:'blauw', vul:'#204ECF', dekking:.38 },
    { id:'bos', naam:'bos', kleur:'groen', vul:'var(--goed)', dekking:.5 },
    { id:'bebouwing', naam:'bebouwing (dorp of stad)', kleur:'oranje', vul:'#F26749', dekking:.55 },
    { id:'weiland', naam:'weiland en akkers', kleur:'lichtgeel (bijna wit)', vul:'var(--kaart2)', dekking:1 }
  ],
  /* lijnen: id, naam, uitleg en de tekening als stijl */
  lijnen: [
    { id:'snelweg', naam:'snelweg', uit:'twee dikke lijnen naast elkaar: de snelweg' },
    { id:'weg', naam:'gewone weg', uit:'een enkele lijn: een gewone weg' },
    { id:'spoor', naam:'spoorlijn', uit:'een lijn met dwarsstreepjes: de spoorlijn' },
    { id:'rivier', naam:'rivier of kanaal', uit:'een blauwe lijn: een rivier of kanaal' },
    { id:'grens', naam:'gemeentegrens', uit:'streep-punt-streep: een grens' },
    { id:'fietspad', naam:'fietspad', uit:'een stippellijn: het fietspad' }
  ],
  /* fictieve plaatsen: het gaat om de vaardigheid, niet om de topografie */
  plaatsen: ['Zandhoven', 'Boswijk', 'Meerdorp', 'Hoogwoud', 'Kerkbuurt', 'Nieuwveen', 'Oudekerk', 'Rietland', 'Heidebroek', 'Molenzicht', 'Westerbrug', 'Eikenlo', 'Veenhuizen', 'Dijkstad', 'Lindenhorst', 'Duinrode'],
  /* windrichtingen: naam, hoek in graden vanaf noord met de klok mee, en de korte vorm */
  richtingen: [
    { id:'N', naam:'noord', hoek:0 }, { id:'NO', naam:'noordoost', hoek:45 }, { id:'O', naam:'oost', hoek:90 }, { id:'ZO', naam:'zuidoost', hoek:135 },
    { id:'Z', naam:'zuid', hoek:180 }, { id:'ZW', naam:'zuidwest', hoek:225 }, { id:'W', naam:'west', hoek:270 }, { id:'NW', naam:'noordwest', hoek:315 }
  ],
  /* schalen: per niveau de schaalgetallen en de centimeters op de kaart die erbij mogen */
  schalen: {
    bb:  { schaal:[10000, 50000, 100000], cm:[2, 3, 4, 5, 6, 8, 10] },
    kgt: { schaal:[10000, 25000, 50000, 100000, 200000, 500000], cm:[2, 3, 4, 5, 6, 8, 10] },
    hv:  { schaal:[25000, 50000, 100000, 250000, 500000, 1000000, 2000000], cm:[1.5, 2, 2.5, 3, 4, 4.5, 6, 7.5, 8, 10] }
  }
};
