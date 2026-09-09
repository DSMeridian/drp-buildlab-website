/* DRP BuildLab — translations (NL / EN / FR / ES). Shared by every page; edit here, not per page. */
/* All four languages ship in one file on purpose. Splitting them means
   either an async fetch (which flashes untranslated copy) or a build
   step; the right fix is prerendered /en/ /fr/ /es/ routes that each
   carry only their own language. Until then this gzips to ~12KB. */
/* ══════════════════════════════════════════
   MULTILINGUAL — NL / EN / FR / ES
══════════════════════════════════════════ */
const TRANSLATIONS = {
nl:{
  'meta.title':'DRP BuildLab — Websites op maat voor lokale bedrijven | Beginnerspakket vanaf €499',
  'meta.desc':'DRP BuildLab bouwt websites volledig op maat voor lokale ondernemers. Beginnerspakket vanaf €499 voor starters, of een persoonlijke quotatie voor geavanceerde projecten — met optioneel maandelijks onderhoud vanaf €29 per maand.',
  'meta.title.about':'Over ons — DRP BuildLab | Websitestudio voor lokale ondernemers','meta.desc.about':'Gebouwd door ondernemers, voor ondernemers. Het verhaal achter DRP BuildLab en waarom lokale bedrijven voor ons kiezen.',
  'meta.title.pricing':'Prijzen — DRP BuildLab | Beginnerspakket €499 of quotatie op maat','meta.desc.pricing':'Beginnerspakket vanaf €499 of een persoonlijke quotatie voor geavanceerde projecten. Extra diensten en optioneel onderhoud vanaf €29 per maand.',
  'meta.title.contact':'Contact — DRP BuildLab | Vraag een gratis demo aan','meta.desc.contact':'Vraag een gratis demo aan. We bellen u op en tonen meteen een voorbeeld op maat. Geen verplichtingen.',
  'phero.about.eye':'Over DRP BuildLab','phero.about.h':'De mensen achter<br><em>uw website.</em>','phero.about.sub':'Wie we zijn, waarom we begonnen en wat u van ons mag verwachten.',
  'phero.pricing.eye':'Prijzen en pakketten','phero.pricing.h':'Eerlijke prijzen,<br><em>geen verrassingen.</em>','phero.pricing.sub':'Een beginnerspakket vanaf €499 of een quotatie op maat. Onderhoud kiest u zelf bij.',
  'phero.contact.eye':'Contact','phero.contact.h':'Klaar om online<br><em>te gaan?</em>','phero.contact.sub':'Vraag een gratis demo aan. We bellen u op en tonen meteen een voorbeeld op maat.',
  'cta.h':'Klaar om online<br><em>te gaan?</em>','cta.sub':'Vraag een gratis demo aan. We bellen u op en tonen meteen een voorbeeld op maat. Geen verplichtingen.','cta.btn':'Gratis demo aanvragen →',
  'loader':'Laden...',
  'nav.home':'Home','nav.pricing':'Prijzen','nav.about':'Over ons','nav.contact':'Contact','nav.cta':'Gratis demo →',
  'hero.eye':'Websites op maat voor lokale bedrijven',
  'hero.l1':'Jouw bedrijf','hero.l2':'online.','hero.l3':'<span class="h-accent">Eindelijk</span> <span class="h-light">gevonden.</span>',
  'hero.sub':'Geen website? Dan besta je niet online. DRP BuildLab bouwt <strong>websites volledig op maat</strong> voor lokale ondernemers — de prijs bepalen we op basis van de hoeveelheid werk die in jouw project gaat. Altijd eerlijk, altijd transparant.',
  'hero.cta1':'Gratis demo aanvragen →','hero.cta2':'Bekijk onze aanpak','hero.scroll':'Scroll',
  'mq':['Lokale focus','Eerlijke prijs','Mobiel-klaar','Google-geoptimaliseerd','Volledig ontzorgd'],
  'zoom.bl':'Onze cijfers','zoom.br':'Scroll verder',
  'zs':[{num:'<span>€</span>0',lbl:'Kost van uw demo en eerste voorstel',tag:'Geen drempel'},{num:'€499',lbl:'Beginnerspakket — website op maat voor starters',tag:'Eerlijke prijs'},{num:'100<span>%</span>',lbl:'Websites volledig op maat — prijs volgens werk',tag:'Op maat'}],
  'how.tag':'Hoe het werkt','how.h2':'Van niets naar online<br><em>in 4 stappen.</em>','how.sub':'Geen technische kennis nodig. Wij regelen alles van eerste gesprek tot live website.',
  'how.steps':[{t:'Eerste gesprek',b:'We bellen u op en tonen meteen een voorbeeld op maat. Volledig vrijblijvend.',d:'Samen'},{t:'Ontwerp op maat',b:'Op basis van uw wensen bouwen we uw website. U hoeft zelf niets te doen.',d:'Wij'},{t:'Preview & goedkeuring',b:'U krijgt een preview ter goedkeuring. Aanpassingen inbegrepen. Daarna gaat uw site live met eigen domein.',d:'Samen'},{t:'Live — en wij blijven',b:'Na de lancering staan wij nog steeds voor u klaar. Updates, aanpassingen, vragen — wij regelen het.',d:'Wij'}],
  'ab.logotag':'Websites · op maat',
  'ab.quote':'"Elke lokale zaak verdient een eerlijke kans om online <em>gevonden te worden.</em>"',
  'ab.sig':'— De founders van DRP BuildLab',
  'ab.nums':['Onderhoud per maand (optioneel)','Beginnerspakket website','Op maat gemaakt','Verborgen kosten'],
  'ab.tag':'Over ons','ab.h2':'Gebouwd door<br>ondernemers,<br><em>voor ondernemers.</em>',
  'ab.p1':'Het begon met een frustratie. We zagen hoe lokale bedrijven — de slager op de hoek, de loodgieter die altijd bereikbaar is, de kapper die al jaren dezelfde klanten knipt — volledig onzichtbaar waren online.',
  'ab.p2':'Grote agencies vroegen <strong>€5.000 voor een website</strong> die maanden op zich liet wachten. Dus bouwden we DRP BuildLab: een studio die gelooft dat elke lokale zaak <strong>recht heeft op een website op maat</strong> — betaalbaar, eerlijk en met een prijs die past bij het werk dat erin gaat.',
  'ab.pillars':[{t:'Eerlijkheid boven alles',b:'Wat we beloven, leveren we. Geen verborgen kosten, geen vage offertes.'},{t:'Onderhoud wanneer u het wilt',b:'Maandelijks onderhoud is optioneel: €29 per maand of €250 per jaar. Neemt u het erbij, dan blijft uw site veilig, up-to-date en vindbaar — zonder dat u eraan hoeft te denken.'},{t:'Lokaal denken, digitaal bouwen',b:'Wij bouwen voor lokale bedrijven — bedrijven waarvan de klanten in de buurt zoeken. Wij werken op afstand vanuit België, dus waar u zit bepaalt niet of wij voor u kunnen bouwen.'}],
  'why.tag':'Waarom DRP BuildLab','why.h2':'Wat maakt ons anders?','why.sub':'Gebouwd voor lokale bedrijven die online willen staan — zonder gedoe, zonder verrassingen.',
  'why.cards':[{t:'Één vast aanspreekpunt',b:'Geen ticketsysteem, geen wisselende accountmanagers. U hebt onze naam en ons nummer — van eerste gesprek tot jaren na de lancering.'},{t:'Lokale focus',b:'Uw regio, uw klanten, een persoonlijk team. Wij begrijpen de lokale markt van binnenuit.'},{t:'Eerlijke prijs',b:'Geen verborgen kosten. Altijd vast op voorhand. U weet precies wat u betaalt.'},{t:'Altijd mobiel-klaar',b:'70%+ van uw klanten zoekt via telefoon. Elke DRP BuildLab site werkt perfect op elk apparaat.'},{t:'Google-geoptimaliseerd',b:'SEO ingebouwd zodat klanten u vinden. Wij zorgen dat Google u herkent en indexeert.'},{t:'Levenslange partner',b:'Na de lancering staan wij nog voor u klaar. Geen eenmalige leverancier, maar een echte partner.'}],
  'opp.tag':'De verborgen kost','opp.h2':'Wat kost €0<br>online aanwezigheid<br><em>écht?</em>','opp.sub':'Geen website is niet gratis. Elke dag zonder online aanwezigheid verliest u klanten aan concurrenten die wel vindbaar zijn.',
  'opp.pts':[{t:'78% zoekt eerst online',b:'Voordat iemand een lokale zaak bezoekt, googelt hij. Staat u er niet? Dan bestaat u niet voor die klant.'},{t:'Elke dag is gemiste omzet',b:'Klanten vinden u niet online en gaan hierdoor naar de concurrentie. Elke dag zonder website is een dag dat uw concurrent wint.'},{t:'Uw concurrent staat wel online',b:'Terwijl u wacht, bouwt uw concurrent zijn online reputatie op. Hoe langer u wacht, hoe moeilijker in te halen.'},{t:'Geloofwaardigheid is omzet',b:'Een professionele website geeft vertrouwen. Klanten kiezen sneller voor een bedrijf dat er serieus uitziet.'}],
  'opp.boxtitle':'Kostenberekening per jaar',
  'opp.rows':[['Gemiste klanten per week (schatting)','2–5'],['Gemiddelde waarde per klant','€80'],['Gemist per jaar zonder website','−€8.320'],['Investering DRP BuildLab (Beginnerspakket)','+€499'],['Jaarlijks maandelijks onderhoud','+€348']],
  'opp.totlbl':'Potentieel netto-voordeel','opp.totval':'+€7.473/jaar',
  'opp.note':'<strong>De conclusie is simpel:</strong> de kostprijs van een website is een fractie van wat u misloopt zonder er één te hebben. Wachten kost meer dan investeren.',
  'comp.tag':'Marktoverzicht','comp.h2':'Niemand doet het<br>goedkoper <em>dan wij.</em>','comp.sub':'We verbergen dit niet — we zijn er trots op. Kijk zelf wat vergelijkbare websites elders kosten.',
  'comp.cols':['Aanbieder','Startprijs','Onderhoud','Mobiel'],
  'comp.us':'Wij',
  'comp.rows':[{n:'DRP BuildLab',p:'€499',m:'€29/maand',us:true},{n:'Freelancer',p:'€800–€2.500',m:'Niet inbegrepen'},{n:'Digitaal bureau',p:'€2.500–€8.000',m:'Duur extra'},{n:'Groot agentschap',p:'€8.000+',m:'Duur extra'},{n:'Wix / Squarespace',p:'€200–€500/jr',m:'Zelf doen'}],
  'comp.note':'<strong>Opmerking:</strong> website builders zoals Wix zijn op jaarbasis even duur — maar u doet alles zelf, zonder professionele hulp of ondersteuning. Bij DRP BuildLab doet u niets zelf en staat er altijd iemand voor u klaar.',
  'srv.tag':'Onze aanpak','srv.h2':'Websites <em>op maat</em><br>voor elke ondernemer.',
  'srv.sub':'Bij DRP BuildLab maken we elke website <strong>volledig op maat</strong>. De prijs bepalen we altijd op basis van de hoeveelheid werk die we in uw project steken. Geen verplichte pakketten, geen verrassingen — alleen een eerlijke quotatie die past bij wat u écht nodig heeft.',
  'p1.badge':'Voor starters','p1.name':'Beginnerspakket','p1.period':'eenmalig — onderhoud optioneel',
  'p1.desc':'Ideaal voor <strong>lokale ondernemers die net gestart zijn</strong> en nog geen website hebben — of ondernemers die hun bestaande website willen laten aanpassen naar een moderne, professionele versie.',
  'p1.feats':['Website volledig op maat van uw bedrijf','Mobiel-klaar (responsive design)','Contactformulier + WhatsApp koppeling','Google Maps & basis SEO-optimalisatie','Persoonlijke begeleiding van start tot live'],
  'p1.btn':'Vraag gratis demo aan →',
  'p2.name':'Geavanceerd op maat','p2.price':'Quotatie<br>op maat','p2.period':'persoonlijke offerte — onderhoud optioneel',
  'p2.desc':'Voor ondernemers met <strong>grotere of complexere projecten</strong>: webshops, reservatiesystemen, meertalige sites, integraties of unieke functionaliteiten. De prijs bepalen we op basis van de scope van uw project.',
  'p2.feats':['Onbeperkt aantal pagina\'s op maat','Webshop, boekingssysteem of ledenportaal','Geavanceerde SEO & Google Ads','Meertalige websites mogelijk','Complexe integraties op maat'],
  'p2.btn':'Quotatie aanvragen →',
  'addon.tag':'Optionele add-on','addon.n':'Maandelijks onderhoud','addon.or':'of','addon.pm':'€29<span>/maand</span>','addon.py':'€250<span>/jaar</span>',
  'addon.b':'Updates, back-ups, beveiliging en SEO-checks. Niet inbegrepen in de pakketten — u kiest zelf of u het erbij neemt.',
  'srv.how':'<strong>Hoe het werkt:</strong> u vertelt ons wat u nodig heeft, wij bekijken de scope en maken een eerlijke prijs op basis van het werk. Maandelijks onderhoud is optioneel bij te nemen — €29 per maand of €250 per jaar — zodat uw website veilig, up-to-date en SEO-geoptimaliseerd blijft.',
  'ex.tag':'Extra diensten','ex.h3':'Aanvullende diensten<br><em>om uw online groei te versnellen.</em>','ex.sub':'Ook los of in combinatie met uw website te bestellen. Prijzen zijn indicatief en worden altijd bevestigd in uw persoonlijke quotatie.',
  'ex.items':[{n:'Logo ontwerp',p:'€149'},{n:'Extra pagina',p:'€79'},{n:'SEO startpakket',p:'€199'},{n:'Google Ads opzetten',p:'€149'},{n:'Meertalige site',p:'€199'},{n:'Webshop toevoegen',p:'Op maat'},{n:'Noodreparatie (24u)',p:'€99'},{n:'Fotografie (halve dag)',p:'€199'},{n:'Koppelingen (boekingssysteem, betaalprovider, boekhouding)',p:'€149'},{n:'CMS — zelf uw content beheren',p:'€149'},{n:'Custom aanvragen — volledig op uw maat',p:'Op aanvraag'}],
  'faq.tag':'Veelgestelde vragen','faq.h2':'Antwoord op uw<br><em>belangrijkste vragen.</em>',
  'faq.items':[{q:'Wat kost een website bij DRP BuildLab?',a:'Elke website wordt volledig op maat gemaakt. De prijs hangt af van de hoeveelheid werk dat in uw project gaat. Voor lokale ondernemers die net gestart zijn of een bestaande website willen laten aanpassen, hebben we een beginnerspakket vanaf <strong>€499</strong>. Voor geavanceerde projecten maken we altijd een <strong>quotatie op maat</strong>. Maandelijks onderhoud is optioneel: <strong>€29 per maand</strong> of <strong>€250 per jaar</strong>.'},{q:'Voor wie is het beginnerspakket van €499 bedoeld?',a:'Specifiek voor lokale ondernemers die net gestart zijn zonder website, of voor ondernemers die hun bestaande website willen laten aanpassen naar een moderne, professionele versie.'},{q:'Wat kost maandelijks onderhoud?',a:'Onderhoud is optioneel en kost <strong>€29 per maand</strong>, of <strong>€250 per jaar</strong> — dat laatste bespaart u €98 per jaar. Daarvoor houden we uw website veilig, snel en SEO-geoptimaliseerd. U zit nergens aan vast: u kunt maandelijks opzeggen en de website blijft altijd uw eigendom.'},{q:'Hoe snel staat mijn website online?',a:'Zodra we uw teksten, foto\'s en logo hebben, kunnen we snel schakelen. Bij de start spreken we samen een <strong>concrete opleverdatum</strong> af die past bij de scope van uw project — en die houden we. Onderweg krijgt u een preview ter goedkeuring, zodat u nooit hoeft af te wachten.'},{q:'Hoe werkt een quotatie op maat?',a:'Voor geavanceerde projecten bekijken we eerst uw wensen in een gratis kennismakingsgesprek. Daarna maken we een persoonlijke quotatie op basis van de hoeveelheid werk: aantal pagina\'s, functionaliteiten, integraties en onderhoud. Geen verborgen kosten — u weet op voorhand wat u betaalt.'}],
  'soc.tag':'Volg ons','soc.h2':'Blijf op de hoogte<br><em>van wat we bouwen.</em>',
  'soc.p1':'Volg ons op Facebook, Instagram en TikTok voor nieuwe projecten, tips voor lokale ondernemers en een kijkje achter de schermen van DRP BuildLab.',
  'soc.p2':'Een vraag of gewoon even sparren? Stuur ons een bericht op het kanaal dat u het beste past — we antwoorden altijd persoonlijk.',
  'ct.tag':'Gratis demo','ct.h2':'Klaar om online<br><em>te gaan?</em>','ct.lede':'Vraag een gratis demo aan. We bellen u op en tonen meteen een voorbeeld op maat. Geen verplichtingen.',
  'ct.lbls':['Telefoon','E-mail','Adres','Ondernemingsnummer','WhatsApp','Instagram','Facebook','TikTok'],
  'f.labels':['Voornaam','Achternaam','Bedrijfsnaam','Telefoonnummer','E-mail','Welke dienst heeft u in gedachten?','Bericht (optioneel)'],
  'f.phs':['Jan','Peeters','Jouw bedrijf','+32 ...','jan@jouwbedrijf.be','Vertel ons meer over uw project...'],
  'f.sel':['Kies een dienst','Beginnerspakket — €499','Geavanceerd op maat — quotatie','Aanpassing bestaande website','Enkel extra diensten (logo, SEO, …)','Ik weet het nog niet'],
  'f.btn':'Gratis demo aanvragen →','f.succ.h':'Aanvraag ontvangen!','f.succ.p':'We nemen contact met u op binnen 24 uur om uw gratis demo in te plannen.',
  'f.consent':'Ik ga ermee akkoord dat DRP BuildLab de gegevens uit dit formulier gebruikt om contact met mij op te nemen over deze aanvraag.',
  'f.err.h':'Verzenden is niet gelukt.','f.err.p':'Er ging iets mis bij het versturen. Probeer het opnieuw, of bereik ons rechtstreeks via <a href="mailto:info@drpbuildlab.com">info@drpbuildlab.com</a> of <a href="https://wa.me/32473744431" target="_blank" rel="noopener">WhatsApp</a>.',
  'ft.tag':'Professionele websites voor lokale bedrijven · Volledig op maat',
  'ft.nav':['Navigatie','Home','Over ons','Prijzen','Contact'],
  'ft.ct':'Contact','ft.copy':'© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, België · BTW BE 1033.313.383','ft.ig':'Volg ons',
  'sticky.txt':'Beginnerspakket vanaf €499','sticky.btn':'Gratis demo →',
  'cur.note':'Prijzen in {cur} zijn omgerekend vanuit euro tegen de koers van vandaag en zijn indicatief. Facturatie gebeurt in EUR.',
  'wa':'WhatsApp ons',
  'pay.methods':'Bankoverschrijving',
  'lang.offer':'Bekijk deze pagina in het Nederlands',
  'lang.dismiss':'Sluiten',
  'cc.title':'Cookies',
  'cc.body':'We gebruiken cookies om te zien hoe de site gebruikt wordt en om onze advertenties te meten. U kiest zelf.',
  'cc.accept':'Alles accepteren',
  'cc.reject':'Alles weigeren',
  'cc.prefs':'Zelf kiezen',
  'cc.save':'Keuze opslaan',
  'cc.nec':'Noodzakelijk',
  'cc.nec.d':'Nodig om de site te laten werken. Altijd aan.',
  'cc.ana':'Statistieken',
  'cc.ana.d':'Hoe bezoekers de site gebruiken, zodat we die kunnen verbeteren.',
  'cc.mkt':'Marketing',
  'cc.mkt.d':'Meten hoe goed onze advertenties werken.',
  'cc.manage':'Cookie-instellingen'
},
en:{
  'meta.title':'DRP BuildLab — Custom Websites for Local Businesses | Starter Package from €499',
  'meta.desc':'DRP BuildLab builds fully custom websites for local entrepreneurs. Starter package from €499, or a custom quote for advanced projects — with optional monthly maintenance from €29 per month.',
  'meta.title.about':'About us — DRP BuildLab | Website studio for local businesses','meta.desc.about':'Built by entrepreneurs, for entrepreneurs. The story behind DRP BuildLab and why local businesses choose us.',
  'meta.title.pricing':'Pricing — DRP BuildLab | Starter package €499 or a custom quote','meta.desc.pricing':'Starter package from €499 or a personal quote for advanced projects. Extra services and optional maintenance from €29 per month.',
  'meta.title.contact':'Contact — DRP BuildLab | Request a free demo','meta.desc.contact':'Request a free demo. We call you and show a custom example right away. No obligations.',
  'phero.about.eye':'About DRP BuildLab','phero.about.h':'The people behind<br><em>your website.</em>','phero.about.sub':'Who we are, why we started and what you can expect from us.',
  'phero.pricing.eye':'Pricing and packages','phero.pricing.h':'Fair prices,<br><em>no surprises.</em>','phero.pricing.sub':'A starter package from €499 or a custom quote. Maintenance is yours to add.',
  'phero.contact.eye':'Contact','phero.contact.h':'Ready to go<br><em>online?</em>','phero.contact.sub':'Request a free demo. We call you and show a custom example right away.',
  'cta.h':'Ready to go<br><em>online?</em>','cta.sub':'Request a free demo. We call you and show a custom example right away. No obligations.','cta.btn':'Request free demo →',
  'loader':'Loading...',
  'nav.home':'Home','nav.pricing':'Pricing','nav.about':'About us','nav.contact':'Contact','nav.cta':'Free demo →',
  'hero.eye':'Custom websites for local businesses',
  'hero.l1':'Your business','hero.l2':'online.','hero.l3':'<span class="h-accent">Found</span> <span class="h-light">at last.</span>',
  'hero.sub':'No website? Then you don\'t exist online. DRP BuildLab builds <strong>fully custom websites</strong> for local entrepreneurs — the price is based on the amount of work your project requires. Always honest, always transparent.',
  'hero.cta1':'Request free demo →','hero.cta2':'See our approach','hero.scroll':'Scroll',
  'mq':['Local focus','Fair pricing','Mobile-ready','Google-optimized','Fully worry-free'],
  'zoom.bl':'Our numbers','zoom.br':'Scroll further',
  'zs':[{num:'<span>€</span>0',lbl:'What your demo and first proposal cost',tag:'No barrier'},{num:'€499',lbl:'Starter package — custom website for new businesses',tag:'Fair price'},{num:'100<span>%</span>',lbl:'Fully custom websites — price based on scope',tag:'Custom'}],
  'how.tag':'How it works','how.h2':'From zero to online<br><em>in 4 steps.</em>','how.sub':'No technical knowledge needed. We handle everything from first call to live website.',
  'how.steps':[{t:'First call',b:'We call you and show a custom example right away. Completely free and non-binding.',d:'Together'},{t:'Custom design',b:'Based on your wishes, we build your website. You don\'t have to do anything.',d:'Us'},{t:'Preview & approval',b:'You receive a preview for approval. Revisions included. Then your site goes live with your own domain.',d:'Together'},{t:'Live — and we stay',b:'After launch, we\'re still here for you. Updates, changes, questions — we handle it.',d:'Us'}],
  'ab.logotag':'Websites · custom built',
  'ab.quote':'"Every local business deserves a fair chance to be found <em>online.</em>"',
  'ab.sig':'— The founders of DRP BuildLab',
  'ab.nums':['Maintenance per month (optional)','Starter package website','Custom made','Hidden costs'],
  'ab.tag':'About us','ab.h2':'Built by<br>entrepreneurs,<br><em>for entrepreneurs.</em>',
  'ab.p1':'It started with a frustration. We saw how local businesses — the butcher on the corner, the plumber who\'s always available, the hairdresser who has cut the same clients\' hair for years — were completely invisible online.',
  'ab.p2':'Large agencies charged <strong>€5,000 for a website</strong> that took months to deliver. So we built DRP BuildLab: a studio that believes every local business <strong>deserves a custom website</strong> — affordable, honest, with a price that matches the work it takes.',
  'ab.pillars':[{t:'Honesty above all',b:'What we promise, we deliver. No hidden costs, no vague quotes.'},{t:'Maintenance when you want it',b:'Monthly maintenance is optional: €29 per month or €250 per year. Add it and your site stays secure, up to date and findable — without you having to think about it.'},{t:'Think local, build digital',b:'We build for local businesses — the ones whose customers are searching nearby. We work remotely from Belgium, so where you are does not decide whether we can help.'}],
  'why.tag':'Why DRP BuildLab','why.h2':'What makes us different?','why.sub':'Built for local businesses that want to be online — without hassle, without surprises.',
  'why.cards':[{t:'One point of contact',b:'No ticket system, no rotating account managers. You have our name and our number — from the first call to years after launch.'},{t:'Local focus',b:'Your region, your customers, a personal team. We understand the local market from the inside.'},{t:'Fair pricing',b:'No hidden costs. Always fixed in advance. You know exactly what you pay.'},{t:'Always mobile-ready',b:'70%+ of your customers search by phone. Every DRP BuildLab site works perfectly on every device.'},{t:'Google-optimized',b:'SEO built in so customers find you. We make sure Google recognizes and indexes you.'},{t:'Lifelong partner',b:'After launch we\'re still here for you. Not a one-time vendor, but a true partner.'}],
  'opp.tag':'The hidden cost','opp.h2':'What does €0 online<br>presence<br><em>really cost?</em>','opp.sub':'Having no website isn\'t free. Every day without an online presence, you lose customers to competitors who are findable.',
  'opp.pts':[{t:'78% search online first',b:'Before visiting a local business, people Google it. Not there? You don\'t exist for that customer.'},{t:'Every day is missed revenue',b:'Customers can\'t find you online and go to the competition. Every day without a website is a day your competitor wins.'},{t:'Your competitor is online',b:'While you wait, your competitor builds their online reputation. The longer you wait, the harder it is to catch up.'},{t:'Credibility is revenue',b:'A professional website builds trust. Customers more readily choose a business that looks serious.'}],
  'opp.boxtitle':'Cost calculation per year',
  'opp.rows':[['Missed customers per week (estimate)','2–5'],['Average value per customer','€80'],['Lost per year without a website','−€8,320'],['Investment DRP BuildLab (Starter package)','+€499'],['Annual monthly maintenance','+€348']],
  'opp.totlbl':'Potential net benefit','opp.totval':'+€7,473/year',
  'opp.note':'<strong>The conclusion is simple:</strong> the cost of a website is a fraction of what you miss out on without one. Waiting costs more than investing.',
  'comp.tag':'Market overview','comp.h2':'No one does it<br>cheaper <em>than us.</em>','comp.sub':'We don\'t hide this — we\'re proud of it. See for yourself what comparable websites cost elsewhere.',
  'comp.cols':['Provider','Starting price','Maintenance','Mobile'],
  'comp.us':'Us',
  'comp.rows':[{n:'DRP BuildLab',p:'€499',m:'€29/month',us:true},{n:'Freelancer',p:'€800–€2,500',m:'Not included'},{n:'Digital agency',p:'€2,500–€8,000',m:'Expensive extra'},{n:'Large agency',p:'€8,000+',m:'Expensive extra'},{n:'Wix / Squarespace',p:'€200–€500/yr',m:'Do it yourself'}],
  'comp.note':'<strong>Note:</strong> website builders like Wix are equally expensive annually — but you do everything yourself, without professional help or support. At DRP BuildLab you do nothing yourself and someone is always there for you.',
  'srv.tag':'Our approach','srv.h2':'Websites <em>custom-made</em><br>for every entrepreneur.',
  'srv.sub':'At DRP BuildLab, every website is <strong>fully custom-made</strong>. The price is always based on the amount of work we put into your project. No mandatory packages, no surprises — just a fair quote that fits what you actually need.',
  'p1.badge':'For starters','p1.name':'Starter Package','p1.period':'one-time — maintenance optional',
  'p1.desc':'Ideal for <strong>local entrepreneurs who are just starting out</strong> and don\'t have a website yet — or entrepreneurs who want to update their existing website to a modern, professional version.',
  'p1.feats':['Website fully custom to your business','Mobile-ready (responsive design)','Contact form + WhatsApp integration','Google Maps & basic SEO optimization','Personal guidance from start to live'],
  'p1.btn':'Request free demo →',
  'p2.name':'Advanced custom','p2.price':'Custom<br>quote','p2.period':'personal quote — maintenance optional',
  'p2.desc':'For entrepreneurs with <strong>larger or more complex projects</strong>: webshops, booking systems, multilingual sites, integrations or unique functionality. The price is determined by the scope of your project.',
  'p2.feats':['Unlimited custom pages','Webshop, booking system or member portal','Advanced SEO & Google Ads','Multilingual websites possible','Complex custom integrations'],
  'p2.btn':'Request a quote →',
  'addon.tag':'Optional add-on','addon.n':'Monthly maintenance','addon.or':'or','addon.pm':'€29<span>/month</span>','addon.py':'€250<span>/year</span>',
  'addon.b':'Updates, backups, security and SEO checks. Not included in the packages — you decide whether to add it.',
  'srv.how':'<strong>How it works:</strong> you tell us what you need, we assess the scope and create a fair price based on the work. Monthly maintenance is available as an option — €29 per month or €250 per year — so your website stays safe, up-to-date and SEO-optimized.',
  'ex.tag':'Extra services','ex.h3':'Additional services<br><em>to accelerate your online growth.</em>','ex.sub':'Order separately or in combination with your website. Prices are indicative and always confirmed in your personal quote.',
  'ex.items':[{n:'Logo design',p:'€149'},{n:'Extra page',p:'€79'},{n:'SEO starter package',p:'€199'},{n:'Google Ads setup',p:'€149'},{n:'Multilingual site',p:'€199'},{n:'Add webshop',p:'Custom'},{n:'Emergency repair (24h)',p:'€99'},{n:'Photography (half day)',p:'€199'},{n:'Integrations (booking system, payment provider, accounting)',p:'€149'},{n:'CMS — manage your own content',p:'€149'},{n:'Custom requests — tailored to your needs',p:'On request'}],
  'faq.tag':'Frequently asked questions','faq.h2':'Answers to your<br><em>most important questions.</em>',
  'faq.items':[{q:'How much does a website cost at DRP BuildLab?',a:'Every website is fully custom-made. The price depends on the amount of work that goes into your project. For local entrepreneurs who are just starting out or want to update an existing website, we have a starter package from <strong>€499</strong>. For advanced projects we always create a <strong>custom quote</strong>. Monthly maintenance is optional: <strong>€29 per month</strong> or <strong>€250 per year</strong>.'},{q:'Who is the €499 starter package for?',a:'Specifically for local entrepreneurs who are just starting out without a website, or for entrepreneurs who want to update their existing website to a modern, professional version.'},{q:'What does monthly maintenance cost?',a:'Maintenance is optional and costs <strong>€29 per month</strong>, or <strong>€250 per year</strong> — the yearly option saves you €98. It keeps your website secure, fast and SEO-optimized. You are not locked in: you can cancel monthly, and the website always remains yours.'},{q:'How quickly will my website be online?',a:'Once we have your copy, photos and logo, we can move fast. At the start we agree a <strong>concrete delivery date</strong> that fits the scope of your project — and we keep it. Along the way you get a preview to approve, so you are never left waiting.'},{q:'How does a custom quote work?',a:'For advanced projects, we first review your needs in a free introductory call. Then we create a personal quote based on the amount of work: number of pages, features, integrations and maintenance. No hidden costs — you know in advance what you pay.'}],
  'soc.tag':'Follow us','soc.h2':'Stay up to date<br><em>with what we build.</em>',
  'soc.p1':'Follow us on Facebook, Instagram and TikTok for new projects, tips for local entrepreneurs and a behind-the-scenes look at DRP BuildLab.',
  'soc.p2':'A question, or just want to talk it through? Send us a message on whichever channel suits you — we always reply personally.',
  'ct.tag':'Free demo','ct.h2':'Ready to go<br><em>online?</em>','ct.lede':'Request a free demo. We\'ll call you and show a custom example right away. No obligations.',
  'ct.lbls':['Phone','Email','Address','Company number','WhatsApp','Instagram','Facebook','TikTok'],
  'f.labels':['First name','Last name','Company name','Phone number','Email','Which service do you have in mind?','Message (optional)'],
  'f.phs':['John','Smith','Your company','+32 ...','john@yourcompany.com','Tell us more about your project...'],
  'f.sel':['Choose a service','Starter package — €499','Advanced custom — quote','Update existing website','Extra services only (logo, SEO, …)','I\'m not sure yet'],
  'f.btn':'Request free demo →','f.succ.h':'Request received!','f.succ.p':'We\'ll contact you within 24 hours to schedule your free demo.',
  'f.consent':'I agree that DRP BuildLab may use the details in this form to contact me about this request.',
  'f.err.h':'Sending failed.','f.err.p':'Something went wrong while sending. Please try again, or reach us directly at <a href="mailto:info@drpbuildlab.com">info@drpbuildlab.com</a> or on <a href="https://wa.me/32473744431" target="_blank" rel="noopener">WhatsApp</a>.',
  'ft.tag':'Professional websites for local businesses · Fully custom',
  'ft.nav':['Navigation','Home','About us','Pricing','Contact'],
  'ft.ct':'Contact','ft.copy':'© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Belgium · VAT BE 1033.313.383','ft.ig':'Follow us',
  'sticky.txt':'Starter package from €499','sticky.btn':'Free demo →',
  'cur.note':'Prices in {cur} are converted from euro at today’s rate and are indicative. Invoicing is in EUR.',
  'wa':'WhatsApp us',
  'pay.methods':'Bank transfer',
  'lang.offer':'View this page in English',
  'lang.dismiss':'Dismiss',
  'cc.title':'Cookies',
  'cc.body':'We use cookies to see how the site is used and to measure our advertising. You choose which.',
  'cc.accept':'Accept all',
  'cc.reject':'Reject all',
  'cc.prefs':'Choose',
  'cc.save':'Save choices',
  'cc.nec':'Necessary',
  'cc.nec.d':'Needed for the site to work. Always on.',
  'cc.ana':'Analytics',
  'cc.ana.d':'How visitors use the site, so we can improve it.',
  'cc.mkt':'Marketing',
  'cc.mkt.d':'Measuring how well our advertising works.',
  'cc.manage':'Cookie settings'
},
fr:{
  'meta.title':'DRP BuildLab — Sites web sur mesure pour entreprises locales | Forfait débutant à partir de 499 €',
  'meta.desc':'DRP BuildLab crée des sites web entièrement sur mesure pour les entrepreneurs locaux. Forfait débutant à partir de 499 € ou devis personnalisé pour des projets avancés — avec maintenance mensuelle en option à partir de 29 € par mois.',
  'meta.title.about':'À propos — DRP BuildLab | Studio web pour entreprises locales','meta.desc.about':'Créé par des entrepreneurs, pour des entrepreneurs. L’histoire de DRP BuildLab et pourquoi les entreprises locales nous choisissent.',
  'meta.title.pricing':'Tarifs — DRP BuildLab | Forfait débutant 499 € ou devis sur mesure','meta.desc.pricing':'Forfait débutant à partir de 499 € ou devis personnalisé pour projets avancés. Services supplémentaires et maintenance en option à partir de 29 € par mois.',
  'meta.title.contact':'Contact — DRP BuildLab | Demandez une démo gratuite','meta.desc.contact':'Demandez une démo gratuite. Nous vous appelons et vous montrons immédiatement un exemple sur mesure. Sans engagement.',
  'phero.about.eye':'À propos de DRP BuildLab','phero.about.h':'Les personnes derrière<br><em>votre site web.</em>','phero.about.sub':'Qui nous sommes, pourquoi nous avons commencé et ce que vous pouvez attendre de nous.',
  'phero.pricing.eye':'Tarifs et forfaits','phero.pricing.h':'Des prix équitables,<br><em>sans surprises.</em>','phero.pricing.sub':'Un forfait débutant à partir de 499 € ou un devis sur mesure. La maintenance, c’est vous qui décidez.',
  'phero.contact.eye':'Contact','phero.contact.h':'Prêt à passer<br><em>en ligne ?</em>','phero.contact.sub':'Demandez une démo gratuite. Nous vous appelons et vous montrons immédiatement un exemple sur mesure.',
  'cta.h':'Prêt à passer<br><em>en ligne ?</em>','cta.sub':'Demandez une démo gratuite. Nous vous appelons et vous montrons immédiatement un exemple sur mesure. Sans engagement.','cta.btn':'Demander une démo gratuite →',
  'loader':'Chargement...',
  'nav.home':'Accueil','nav.pricing':'Tarifs','nav.about':'À propos','nav.contact':'Contact','nav.cta':'Démo gratuite →',
  'hero.eye':'Sites web sur mesure pour entreprises locales',
  'hero.l1':'Votre entreprise','hero.l2':'en ligne.','hero.l3':'<span class="h-accent">Enfin</span> <span class="h-light">trouvable.</span>',
  'hero.sub':'Pas de site web ? Vous n\'existez pas en ligne. DRP BuildLab crée des <strong>sites web entièrement sur mesure</strong> pour les entrepreneurs locaux — le prix est basé sur la quantité de travail que votre projet requiert. Toujours honnête, toujours transparent.',
  'hero.cta1':'Demander une démo gratuite →','hero.cta2':'Voir notre approche','hero.scroll':'Défiler',
  'mq':['Focus local','Prix équitable','Mobile-ready','Optimisé Google','Entièrement géré'],
  'zoom.bl':'Nos chiffres','zoom.br':'Continuer à défiler',
  'zs':[{num:'0<span> €</span>',lbl:'Le coût de votre démo et de votre première proposition',tag:'Sans barrière'},{num:'499 €',lbl:'Forfait débutant — site web sur mesure pour les nouvelles entreprises',tag:'Prix équitable'},{num:'100<span>%</span>',lbl:'Sites web entièrement sur mesure — prix selon le travail',tag:'Sur mesure'}],
  'how.tag':'Comment ça marche','how.h2':'De zéro à en ligne<br><em>en 4 étapes.</em>','how.sub':'Aucune connaissance technique requise. Nous gérons tout, du premier appel au site web en ligne.',
  'how.steps':[{t:'Premier appel',b:'Nous vous appelons et vous montrons un exemple sur mesure immédiatement. Entièrement gratuit et sans engagement.',d:'Ensemble'},{t:'Design sur mesure',b:'Selon vos souhaits, nous construisons votre site web. Vous n\'avez rien à faire.',d:'Nous'},{t:'Aperçu & approbation',b:'Vous recevez un aperçu pour approbation. Révisions incluses. Ensuite votre site est mis en ligne avec votre propre domaine.',d:'Ensemble'},{t:'En ligne — et nous restons',b:'Après le lancement, nous sommes toujours là pour vous. Mises à jour, modifications, questions — nous nous en occupons.',d:'Nous'}],
  'ab.logotag':'Sites web · sur mesure',
  'ab.quote':'"Chaque entreprise locale mérite une chance équitable d\'être trouvée <em>en ligne.</em>"',
  'ab.sig':'— Les fondateurs de DRP BuildLab',
  'ab.nums':['Maintenance par mois (en option)','Forfait débutant site web','Sur mesure','Frais cachés'],
  'ab.tag':'À propos','ab.h2':'Construit par des<br>entrepreneurs,<br><em>pour des entrepreneurs.</em>',
  'ab.p1':'Tout a commencé par une frustration. Nous avons vu comment les entreprises locales — le boucher du coin, le plombier toujours disponible, le coiffeur qui coiffe les mêmes clients depuis des années — étaient complètement invisibles en ligne.',
  'ab.p2':'Les grandes agences demandaient <strong>5 000 € pour un site web</strong> qui prenait des mois à livrer. Nous avons donc créé DRP BuildLab : un studio qui croit que chaque entreprise locale <strong>mérite un site web sur mesure</strong> — abordable, honnête, avec un prix qui correspond au travail fourni.',
  'ab.pillars':[{t:'L\'honnêteté avant tout',b:'Ce que nous promettons, nous le livrons. Pas de frais cachés, pas de devis vagues.'},{t:'La maintenance quand vous le voulez',b:'La maintenance mensuelle est en option : 29 € par mois ou 250 € par an. Si vous l’ajoutez, votre site reste sécurisé, à jour et visible — sans que vous ayez à y penser.'},{t:'Penser local, construire digital',b:'Nous concevons des sites pour les entreprises locales — celles dont les clients cherchent à proximité. Nous travaillons à distance depuis la Belgique : votre emplacement ne détermine pas si nous pouvons vous aider.'}],
  'why.tag':'Pourquoi DRP BuildLab','why.h2':'Qu\'est-ce qui nous différencie ?','why.sub':'Conçu pour les entreprises locales qui veulent être en ligne — sans tracas, sans surprises.',
  'why.cards':[{t:'Un seul interlocuteur',b:'Pas de système de tickets, pas de gestionnaires de compte qui changent. Vous avez notre nom et notre numéro — du premier appel jusqu\'à des années après le lancement.'},{t:'Focus local',b:'Votre région, vos clients, une équipe personnelle. Nous comprenons le marché local de l\'intérieur.'},{t:'Prix équitable',b:'Pas de frais cachés. Toujours fixe à l\'avance. Vous savez exactement ce que vous payez.'},{t:'Toujours mobile-ready',b:'70 %+ de vos clients cherchent par téléphone. Chaque site DRP BuildLab fonctionne parfaitement sur chaque appareil.'},{t:'Optimisé Google',b:'SEO intégré pour que les clients vous trouvent. Nous veillons à ce que Google vous reconnaisse et vous indexe.'},{t:'Partenaire à vie',b:'Après le lancement, nous sommes toujours là pour vous. Pas un fournisseur ponctuel, mais un vrai partenaire.'}],
  'opp.tag':'Le coût caché','opp.h2':'Que coûte vraiment<br>0 € de présence<br><em>en ligne ?</em>','opp.sub':'Ne pas avoir de site web n\'est pas gratuit. Chaque jour sans présence en ligne, vous perdez des clients au profit de concurrents qui sont trouvables.',
  'opp.pts':[{t:'78 % cherchent d\'abord en ligne',b:'Avant de visiter une entreprise locale, les gens la cherchent sur Google. Pas là ? Vous n\'existez pas pour ce client.'},{t:'Chaque jour est du chiffre d\'affaires manqué',b:'Les clients ne vous trouvent pas en ligne et vont à la concurrence. Chaque jour sans site web est un jour où votre concurrent gagne.'},{t:'Votre concurrent est en ligne',b:'Pendant que vous attendez, votre concurrent construit sa réputation en ligne. Plus vous attendez, plus il est difficile de rattraper.'},{t:'La crédibilité c\'est du chiffre d\'affaires',b:'Un site web professionnel inspire confiance. Les clients choisissent plus facilement une entreprise qui paraît sérieuse.'}],
  'opp.boxtitle':'Calcul des coûts par an',
  'opp.rows':[['Clients manqués par semaine (estimation)','2–5'],['Valeur moyenne par client','80 €'],['Perdu par an sans site web','−8 320 €'],['Investissement DRP BuildLab (Forfait débutant)','+499 €'],['Maintenance mensuelle annuelle','+348 €']],
  'opp.totlbl':'Bénéfice net potentiel','opp.totval':'+7 473 €/an',
  'opp.note':'<strong>La conclusion est simple :</strong> le coût d\'un site web est une fraction de ce que vous perdez sans en avoir un. Attendre coûte plus cher qu\'investir.',
  'comp.tag':'Aperçu du marché','comp.h2':'Personne ne fait ça<br>moins cher <em>que nous.</em>','comp.sub':'Nous ne le cachons pas — nous en sommes fiers. Voyez par vous-même ce que coûtent des sites similaires ailleurs.',
  'comp.cols':['Fournisseur','Prix de départ','Maintenance','Mobile'],
  'comp.us':'Nous',
  'comp.rows':[{n:'DRP BuildLab',p:'499 €',m:'29 €/mois',us:true},{n:'Freelance',p:'800–2 500 €',m:'Non inclus'},{n:'Agence digitale',p:'2 500–8 000 €',m:'En supplément'},{n:'Grande agence',p:'8 000 €+',m:'En supplément'},{n:'Wix / Squarespace',p:'200–500 €/an',m:'Fait soi-même'}],
  'comp.note':'<strong>Remarque :</strong> les constructeurs de sites comme Wix sont tout aussi chers annuellement — mais vous faites tout vous-même, sans aide ni support professionnel. Chez DRP BuildLab, vous ne faites rien vous-même et quelqu\'un est toujours là pour vous.',
  'srv.tag':'Notre approche','srv.h2':'Sites web <em>sur mesure</em><br>pour chaque entrepreneur.',
  'srv.sub':'Chez DRP BuildLab, chaque site web est <strong>entièrement sur mesure</strong>. Le prix est toujours basé sur la quantité de travail que nous investissons dans votre projet. Pas de forfaits obligatoires, pas de surprises — juste un devis équitable adapté à vos besoins réels.',
  'p1.badge':'Pour débutants','p1.name':'Forfait débutant','p1.period':'unique — maintenance en option',
  'p1.desc':'Idéal pour les <strong>entrepreneurs locaux qui démarrent</strong> et n\'ont pas encore de site web — ou ceux qui veulent moderniser leur site existant vers une version professionnelle.',
  'p1.feats':['Site web entièrement sur mesure','Mobile-ready (design responsive)','Formulaire de contact + intégration WhatsApp','Google Maps & optimisation SEO de base','Accompagnement personnel du début à la mise en ligne'],
  'p1.btn':'Demander une démo gratuite →',
  'p2.name':'Avancé sur mesure','p2.price':'Devis<br>personnalisé','p2.period':'devis personnel — maintenance en option',
  'p2.desc':'Pour les entrepreneurs avec <strong>des projets plus importants ou complexes</strong> : boutiques en ligne, systèmes de réservation, sites multilingues, intégrations ou fonctionnalités uniques.',
  'p2.feats':['Pages illimitées sur mesure','Boutique en ligne, système de réservation ou portail membres','SEO avancé & Google Ads','Sites web multilingues possibles','Intégrations complexes sur mesure'],
  'p2.btn':'Demander un devis →',
  'addon.tag':'Option supplémentaire','addon.n':'Maintenance mensuelle','addon.or':'ou','addon.pm':'29 €<span>/mois</span>','addon.py':'250 €<span>/an</span>',
  'addon.b':'Mises à jour, sauvegardes, sécurité et contrôles SEO. Non incluse dans les forfaits — c’est vous qui décidez de l’ajouter.',
  'srv.how':'<strong>Comment ça marche :</strong> vous nous dites ce dont vous avez besoin, nous évaluons la portée et créons un prix équitable basé sur le travail. La maintenance mensuelle est disponible en option — 29 € par mois ou 250 € par an — pour que votre site reste sécurisé, à jour et optimisé SEO.',
  'ex.tag':'Services supplémentaires','ex.h3':'Services additionnels<br><em>pour accélérer votre croissance en ligne.</em>','ex.sub':'Commandez séparément ou en combinaison avec votre site. Les prix sont indicatifs et toujours confirmés dans votre devis personnel.',
  'ex.items':[{n:'Création de logo',p:'149 €'},{n:'Page supplémentaire',p:'79 €'},{n:'Forfait SEO starter',p:'199 €'},{n:'Configuration Google Ads',p:'149 €'},{n:'Site multilingue',p:'199 €'},{n:'Ajouter une boutique',p:'Sur mesure'},{n:'Réparation d\'urgence (24h)',p:'99 €'},{n:'Photographie (demi-journée)',p:'199 €'},{n:'Connexions (système de réservation, prestataire de paiement, comptabilité)',p:'149 €'},{n:'CMS — gérez vous-même votre contenu',p:'149 €'},{n:'Demandes personnalisées — entièrement sur mesure',p:'Sur demande'}],
  'faq.tag':'Questions fréquentes','faq.h2':'Réponses à vos<br><em>questions les plus importantes.</em>',
  'faq.items':[{q:'Combien coûte un site web chez DRP BuildLab ?',a:'Chaque site web est entièrement sur mesure. Le prix dépend de la quantité de travail que votre projet requiert. Pour les entrepreneurs locaux qui démarrent ou veulent mettre à jour un site existant, nous avons un forfait débutant à partir de <strong>499 €</strong>. Pour les projets avancés, nous créons toujours un <strong>devis sur mesure</strong>. La maintenance mensuelle est en option : <strong>29 € par mois</strong> ou <strong>250 € par an</strong>.'},{q:'À qui s\'adresse le forfait débutant à 499 € ?',a:'Spécifiquement aux entrepreneurs locaux qui démarrent sans site web, ou aux entrepreneurs qui souhaitent moderniser leur site existant vers une version professionnelle.'},{q:'Combien coûte la maintenance mensuelle ?',a:'La maintenance est en option et coûte <strong>29 € par mois</strong>, ou <strong>250 € par an</strong> — la formule annuelle vous fait économiser 98 €. Elle maintient votre site sécurisé, rapide et optimisé SEO. Vous n’êtes engagé à rien : résiliable chaque mois, et le site reste toujours le vôtre.'},{q:'En combien de temps mon site sera-t-il en ligne ?',a:'Dès que nous avons vos textes, photos et logo, nous pouvons avancer rapidement. Au démarrage, nous convenons ensemble d\'une <strong>date de livraison concrète</strong> adaptée à la portée de votre projet — et nous la tenons. En cours de route, vous recevez un aperçu à approuver, vous n\'êtes donc jamais dans l\'attente.'},{q:'Comment fonctionne un devis sur mesure ?',a:'Pour les projets avancés, nous examinons d\'abord vos besoins lors d\'un appel de présentation gratuit. Ensuite, nous créons un devis personnel basé sur la quantité de travail : nombre de pages, fonctionnalités, intégrations et maintenance. Pas de frais cachés — vous savez à l\'avance ce que vous payez.'}],
  'soc.tag':'Suivez-nous','soc.h2':'Restez informé<br><em>de ce que nous construisons.</em>',
  'soc.p1':'Suivez-nous sur Facebook, Instagram et TikTok pour nos nouveaux projets, des conseils pour les entrepreneurs locaux et un aperçu des coulisses de DRP BuildLab.',
  'soc.p2':'Une question, ou simplement envie de discuter ? Envoyez-nous un message sur le canal qui vous convient — nous répondons toujours personnellement.',
  'ct.tag':'Démo gratuite','ct.h2':'Prêt à aller<br><em>en ligne ?</em>','ct.lede':'Demandez une démo gratuite. Nous vous appelons et vous montrons un exemple sur mesure immédiatement. Sans engagement.',
  'ct.lbls':['Téléphone','E-mail','Adresse','Numéro d\'entreprise','WhatsApp','Instagram','Facebook','TikTok'],
  'f.labels':['Prénom','Nom de famille','Nom de l\'entreprise','Numéro de téléphone','E-mail','Quel service avez-vous en tête ?','Message (optionnel)'],
  'f.phs':['Jean','Dupont','Votre entreprise','+32 ...','jean@votreentreprise.be','Parlez-nous de votre projet...'],
  'f.sel':['Choisissez un service','Forfait débutant — 499 €','Avancé sur mesure — devis','Mise à jour site existant','Services supplémentaires uniquement (logo, SEO, …)','Je ne sais pas encore'],
  'f.btn':'Demander une démo gratuite →','f.succ.h':'Demande reçue !','f.succ.p':'Nous vous contacterons dans les 24 heures pour planifier votre démo gratuite.',
  'f.consent':'J\'accepte que DRP BuildLab utilise les données de ce formulaire pour me contacter au sujet de cette demande.',
  'f.err.h':'L\'envoi a échoué.','f.err.p':'Une erreur est survenue lors de l\'envoi. Réessayez, ou contactez-nous directement à <a href="mailto:info@drpbuildlab.com">info@drpbuildlab.com</a> ou via <a href="https://wa.me/32473744431" target="_blank" rel="noopener">WhatsApp</a>.',
  'ft.tag':'Sites web professionnels pour entreprises locales · Entièrement sur mesure',
  'ft.nav':['Navigation','Accueil','À propos','Tarifs','Contact'],
  'ft.ct':'Contact','ft.copy':'© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Belgique · TVA BE 1033.313.383','ft.ig':'Suivez-nous',
  'sticky.txt':'Forfait starter à partir de 499 €','sticky.btn':'Démo gratuite →',
  'cur.note':'Les prix en {cur} sont convertis depuis l’euro au taux du jour et sont indicatifs. La facturation se fait en EUR.',
  'wa':'WhatsApp nous',
  'pay.methods':'Virement bancaire',
  'lang.offer':'Voir cette page en français',
  'lang.dismiss':'Fermer',
  'cc.title':'Cookies',
  'cc.body':'Nous utilisons des cookies pour comprendre l’usage du site et mesurer notre publicité. À vous de choisir.',
  'cc.accept':'Tout accepter',
  'cc.reject':'Tout refuser',
  'cc.prefs':'Choisir',
  'cc.save':'Enregistrer',
  'cc.nec':'Nécessaires',
  'cc.nec.d':'Indispensables au fonctionnement du site. Toujours actifs.',
  'cc.ana':'Statistiques',
  'cc.ana.d':'Comment les visiteurs utilisent le site, pour l’améliorer.',
  'cc.mkt':'Marketing',
  'cc.mkt.d':'Mesurer l’efficacité de notre publicité.',
  'cc.manage':'Paramètres des cookies'
},
es:{
  'meta.title':'DRP BuildLab — Sitios web a medida para negocios locales | Paquete inicial desde 499 €',
  'meta.desc':'DRP BuildLab crea sitios web completamente a medida para emprendedores locales. Paquete inicial desde 499 € o presupuesto personalizado para proyectos avanzados — con mantenimiento mensual opcional desde 29 € al mes.',
  'meta.title.about':'Sobre nosotros — DRP BuildLab | Estudio web para negocios locales','meta.desc.about':'Creado por emprendedores, para emprendedores. La historia de DRP BuildLab y por qué los negocios locales nos eligen.',
  'meta.title.pricing':'Precios — DRP BuildLab | Paquete inicial 499 € o presupuesto a medida','meta.desc.pricing':'Paquete inicial desde 499 € o presupuesto personalizado para proyectos avanzados. Servicios adicionales y mantenimiento opcional desde 29 € al mes.',
  'meta.title.contact':'Contacto — DRP BuildLab | Solicita una demo gratis','meta.desc.contact':'Solicita una demo gratis. Te llamamos y te mostramos un ejemplo personalizado de inmediato. Sin compromiso.',
  'phero.about.eye':'Sobre DRP BuildLab','phero.about.h':'Las personas detrás<br><em>de tu sitio web.</em>','phero.about.sub':'Quiénes somos, por qué empezamos y qué puedes esperar de nosotros.',
  'phero.pricing.eye':'Precios y paquetes','phero.pricing.h':'Precios justos,<br><em>sin sorpresas.</em>','phero.pricing.sub':'Un paquete inicial desde 499 € o un presupuesto a medida. El mantenimiento lo añades tú.',
  'phero.contact.eye':'Contacto','phero.contact.h':'¿Listo para estar<br><em>en línea?</em>','phero.contact.sub':'Solicita una demo gratis. Te llamamos y te mostramos un ejemplo personalizado de inmediato.',
  'cta.h':'¿Listo para estar<br><em>en línea?</em>','cta.sub':'Solicita una demo gratis. Te llamamos y te mostramos un ejemplo personalizado de inmediato. Sin compromiso.','cta.btn':'Solicitar demo gratis →',
  'loader':'Cargando...',
  'nav.home':'Inicio','nav.pricing':'Precios','nav.about':'Sobre nosotros','nav.contact':'Contacto','nav.cta':'Demo gratis →',
  'hero.eye':'Sitios web a medida para negocios locales',
  'hero.l1':'Tu negocio','hero.l2':'en línea.','hero.l3':'<span class="h-accent">Por fin</span> <span class="h-light">visible.</span>',
  'hero.sub':'¿Sin sitio web? No existes en línea. DRP BuildLab crea <strong>sitios web completamente a medida</strong> para emprendedores locales — el precio se basa en la cantidad de trabajo que requiere tu proyecto. Siempre honesto, siempre transparente.',
  'hero.cta1':'Solicitar demo gratis →','hero.cta2':'Ver nuestro enfoque','hero.scroll':'Scroll',
  'mq':['Enfoque local','Precio justo','Optimizado para móvil','Optimizado para Google','Sin preocupaciones'],
  'zoom.bl':'Nuestras cifras','zoom.br':'Seguir bajando',
  'zs':[{num:'0<span> €</span>',lbl:'Lo que cuesta tu demo y primera propuesta',tag:'Sin barreras'},{num:'499 €',lbl:'Paquete inicial — sitio web a medida para nuevos negocios',tag:'Precio justo'},{num:'100<span>%</span>',lbl:'Sitios web completamente a medida — precio según el trabajo',tag:'A medida'}],
  'how.tag':'Cómo funciona','how.h2':'De cero a en línea<br><em>en 4 pasos.</em>','how.sub':'No se necesita conocimiento técnico. Gestionamos todo, desde la primera llamada hasta el sitio web en vivo.',
  'how.steps':[{t:'Primera llamada',b:'Te llamamos y te mostramos un ejemplo personalizado de inmediato. Completamente gratuito y sin compromiso.',d:'Juntos'},{t:'Diseño a medida',b:'Según tus deseos, construimos tu sitio web. No tienes que hacer nada.',d:'Nosotros'},{t:'Vista previa & aprobación',b:'Recibes una vista previa para aprobación. Revisiones incluidas. Luego tu sitio se lanza con tu propio dominio.',d:'Juntos'},{t:'En vivo — y nos quedamos',b:'Después del lanzamiento, seguimos aquí para ti. Actualizaciones, cambios, preguntas — lo gestionamos.',d:'Nosotros'}],
  'ab.logotag':'Sitios web · a medida',
  'ab.quote':'"Cada negocio local merece una oportunidad justa para ser encontrado <em>en línea.</em>"',
  'ab.sig':'— Los fundadores de DRP BuildLab',
  'ab.nums':['Mantenimiento al mes (opcional)','Paquete inicial sitio web','Hecho a medida','Costes ocultos'],
  'ab.tag':'Sobre nosotros','ab.h2':'Construido por<br>emprendedores,<br><em>para emprendedores.</em>',
  'ab.p1':'Todo comenzó con una frustración. Vimos cómo los negocios locales — el carnicero de la esquina, el fontanero siempre disponible, el peluquero que lleva años cortando el pelo a los mismos clientes — eran completamente invisibles en línea.',
  'ab.p2':'Las grandes agencias cobraban <strong>5.000 € por un sitio web</strong> que tardaba meses en entregarse. Así que creamos DRP BuildLab: un estudio que cree que cada negocio local <strong>merece un sitio web a medida</strong> — asequible, honesto, con un precio que se ajusta al trabajo.',
  'ab.pillars':[{t:'Honestidad ante todo',b:'Lo que prometemos, lo entregamos. Sin costes ocultos, sin presupuestos vagos.'},{t:'Mantenimiento cuando lo quieras',b:'El mantenimiento mensual es opcional: 29 € al mes o 250 € al año. Si lo añades, tu sitio se mantiene seguro, actualizado y visible — sin que tengas que pensar en ello.'},{t:'Pensar local, construir digital',b:'Creamos sitios para negocios locales, aquellos cuyos clientes buscan cerca. Trabajamos en remoto desde Bélgica, así que tu ubicación no determina si podemos construir para ti.'}],
  'why.tag':'Por qué DRP BuildLab','why.h2':'¿Qué nos hace diferentes?','why.sub':'Construido para negocios locales que quieren estar en línea — sin complicaciones, sin sorpresas.',
  'why.cards':[{t:'Un único interlocutor',b:'Sin sistema de tickets, sin gestores de cuenta que cambian. Tienes nuestro nombre y nuestro número — desde la primera llamada hasta años después del lanzamiento.'},{t:'Enfoque local',b:'Tu región, tus clientes, un equipo personal. Entendemos el mercado local desde dentro.'},{t:'Precio justo',b:'Sin costes ocultos. Siempre fijo de antemano. Sabes exactamente lo que pagas.'},{t:'Siempre optimizado para móvil',b:'El 70 %+ de tus clientes buscan por teléfono. Cada sitio DRP BuildLab funciona perfectamente en cualquier dispositivo.'},{t:'Optimizado para Google',b:'SEO integrado para que los clientes te encuentren. Nos aseguramos de que Google te reconozca e indexe.'},{t:'Socio de por vida',b:'Después del lanzamiento seguimos aquí para ti. No un proveedor puntual, sino un socio de verdad.'}],
  'opp.tag':'El coste oculto','opp.h2':'¿Cuánto cuesta realmente<br>0 € de presencia<br><em>en línea?</em>','opp.sub':'No tener sitio web no es gratis. Cada día sin presencia en línea pierdes clientes ante competidores que sí son localizables.',
  'opp.pts':[{t:'El 78 % busca primero en línea',b:'Antes de visitar un negocio local, la gente lo busca en Google. ¿No estás? No existes para ese cliente.'},{t:'Cada día son ingresos perdidos',b:'Los clientes no te encuentran en línea y van a la competencia. Cada día sin sitio web es un día que tu competidor gana.'},{t:'Tu competidor está en línea',b:'Mientras esperas, tu competidor construye su reputación en línea. Cuanto más esperas, más difícil es alcanzarle.'},{t:'La credibilidad son ingresos',b:'Un sitio web profesional genera confianza. Los clientes eligen más fácilmente una empresa que parece seria.'}],
  'opp.boxtitle':'Cálculo de costes por año',
  'opp.rows':[['Clientes perdidos por semana (estimación)','2–5'],['Valor medio por cliente','80 €'],['Perdido por año sin sitio web','−8.320 €'],['Inversión DRP BuildLab (Paquete inicial)','+499 €'],['Mantenimiento mensual anual','+348 €']],
  'opp.totlbl':'Beneficio neto potencial','opp.totval':'+7.473 €/año',
  'opp.note':'<strong>La conclusión es simple:</strong> el coste de un sitio web es una fracción de lo que pierdes sin tener uno. Esperar cuesta más que invertir.',
  'comp.tag':'Panorama del mercado','comp.h2':'Nadie lo hace<br>más barato <em>que nosotros.</em>','comp.sub':'No lo ocultamos — estamos orgullosos de ello. Comprueba tú mismo cuánto cuestan sitios similares en otros lugares.',
  'comp.cols':['Proveedor','Precio inicial','Mantenimiento','Móvil'],
  'comp.us':'Nosotros',
  'comp.rows':[{n:'DRP BuildLab',p:'499 €',m:'29 €/mes',us:true},{n:'Freelancer',p:'800–2.500 €',m:'No incluido'},{n:'Agencia digital',p:'2.500–8.000 €',m:'Extra costoso'},{n:'Gran agencia',p:'8.000 €+',m:'Extra costoso'},{n:'Wix / Squarespace',p:'200–500 €/año',m:'Hazlo tú mismo'}],
  'comp.note':'<strong>Nota:</strong> los constructores de sitios web como Wix son igual de caros anualmente — pero lo haces todo tú mismo, sin ayuda ni soporte profesional. En DRP BuildLab no haces nada tú mismo y siempre hay alguien para ti.',
  'srv.tag':'Nuestro enfoque','srv.h2':'Sitios web <em>a medida</em><br>para cada emprendedor.',
  'srv.sub':'En DRP BuildLab, cada sitio web es <strong>completamente a medida</strong>. El precio siempre se basa en la cantidad de trabajo que invertimos en tu proyecto. Sin paquetes obligatorios, sin sorpresas — solo un presupuesto justo adaptado a lo que realmente necesitas.',
  'p1.badge':'Para principiantes','p1.name':'Paquete inicial','p1.period':'único — mantenimiento opcional',
  'p1.desc':'Ideal para <strong>emprendedores locales que están empezando</strong> y aún no tienen sitio web — o emprendedores que quieren actualizar su sitio existente a una versión moderna y profesional.',
  'p1.feats':['Sitio web completamente a medida de tu negocio','Optimizado para móvil (diseño responsive)','Formulario de contacto + integración WhatsApp','Google Maps & optimización SEO básica','Acompañamiento personal de principio a fin'],
  'p1.btn':'Solicitar demo gratis →',
  'p2.name':'Avanzado a medida','p2.price':'Presupuesto<br>personalizado','p2.period':'presupuesto personal — mantenimiento opcional',
  'p2.desc':'Para emprendedores con <strong>proyectos más grandes o complejos</strong>: tiendas online, sistemas de reserva, sitios multilingües, integraciones o funcionalidades únicas.',
  'p2.feats':['Páginas ilimitadas a medida','Tienda online, sistema de reserva o portal de miembros','SEO avanzado & Google Ads','Sitios web multilingües posibles','Integraciones complejas a medida'],
  'p2.btn':'Solicitar presupuesto →',
  'addon.tag':'Complemento opcional','addon.n':'Mantenimiento mensual','addon.or':'o','addon.pm':'29 €<span>/mes</span>','addon.py':'250 €<span>/año</span>',
  'addon.b':'Actualizaciones, copias de seguridad, seguridad y revisiones SEO. No incluido en los paquetes — tú decides si lo añades.',
  'srv.how':'<strong>Cómo funciona:</strong> nos dices lo que necesitas, evaluamos el alcance y creamos un precio justo basado en el trabajo. El mantenimiento mensual está disponible como opción — 29 € al mes o 250 € al año — para que tu sitio web se mantenga seguro, actualizado y optimizado para SEO.',
  'ex.tag':'Servicios extra','ex.h3':'Servicios adicionales<br><em>para acelerar tu crecimiento en línea.</em>','ex.sub':'Pide por separado o en combinación con tu sitio web. Los precios son indicativos y siempre se confirman en tu presupuesto personal.',
  'ex.items':[{n:'Diseño de logo',p:'149 €'},{n:'Página adicional',p:'79 €'},{n:'Paquete SEO inicial',p:'199 €'},{n:'Configuración Google Ads',p:'149 €'},{n:'Sitio multilingüe',p:'199 €'},{n:'Añadir tienda online',p:'A medida'},{n:'Reparación urgente (24h)',p:'99 €'},{n:'Fotografía (medio día)',p:'199 €'},{n:'Conexiones (sistema de reservas, pasarela de pago, contabilidad)',p:'149 €'},{n:'CMS — gestiona tu propio contenido',p:'149 €'},{n:'Solicitudes personalizadas — totalmente a tu medida',p:'Bajo petición'}],
  'faq.tag':'Preguntas frecuentes','faq.h2':'Respuestas a tus<br><em>preguntas más importantes.</em>',
  'faq.items':[{q:'¿Cuánto cuesta un sitio web en DRP BuildLab?',a:'Cada sitio web es completamente a medida. El precio depende de la cantidad de trabajo que requiere tu proyecto. Para emprendedores locales que están empezando o quieren actualizar un sitio existente, tenemos un paquete inicial desde <strong>499 €</strong>. Para proyectos avanzados siempre creamos un <strong>presupuesto a medida</strong>. El mantenimiento mensual es opcional: <strong>29 € al mes</strong> o <strong>250 € al año</strong>.'},{q:'¿Para quién es el paquete inicial de 499 €?',a:'Específicamente para emprendedores locales que están empezando sin sitio web, o para emprendedores que quieren actualizar su sitio existente a una versión moderna y profesional.'},{q:'¿Cuánto cuesta el mantenimiento mensual?',a:'El mantenimiento es opcional y cuesta <strong>29 € al mes</strong>, o <strong>250 € al año</strong> — la opción anual te ahorra 98 €. Mantiene tu sitio web seguro, rápido y optimizado para SEO. No hay compromiso: puedes cancelar cada mes y el sitio siempre es tuyo.'},{q:'¿En cuánto tiempo estará mi sitio web en línea?',a:'En cuanto tengamos tus textos, fotos y logo, podemos avanzar rápido. Al inicio acordamos juntos una <strong>fecha de entrega concreta</strong> adaptada al alcance de tu proyecto — y la cumplimos. Por el camino recibes una vista previa para aprobar, así nunca te quedas esperando.'},{q:'¿Cómo funciona un presupuesto a medida?',a:'Para proyectos avanzados, primero revisamos tus necesidades en una llamada de presentación gratuita. Luego creamos un presupuesto personal basado en la cantidad de trabajo: número de páginas, funcionalidades, integraciones y mantenimiento. Sin costes ocultos — sabes de antemano lo que pagas.'}],
  'soc.tag':'Síguenos','soc.h2':'Mantente al día<br><em>de lo que construimos.</em>',
  'soc.p1':'Síguenos en Facebook, Instagram y TikTok para ver nuevos proyectos, consejos para emprendedores locales y un vistazo entre bastidores de DRP BuildLab.',
  'soc.p2':'¿Una pregunta o simplemente quieres comentarlo? Envíanos un mensaje por el canal que prefieras — siempre respondemos personalmente.',
  'ct.tag':'Demo gratis','ct.h2':'¿Listo para estar<br><em>en línea?</em>','ct.lede':'Solicita una demo gratis. Te llamamos y te mostramos un ejemplo personalizado de inmediato. Sin obligaciones.',
  'ct.lbls':['Teléfono','E-mail','Dirección','Número de empresa','WhatsApp','Instagram','Facebook','TikTok'],
  'f.labels':['Nombre','Apellido','Nombre de empresa','Número de teléfono','E-mail','¿Qué servicio tienes en mente?','Mensaje (opcional)'],
  'f.phs':['Juan','García','Tu empresa','+32 ...','juan@tuempresa.es','Cuéntanos más sobre tu proyecto...'],
  'f.sel':['Elige un servicio','Paquete inicial — 499 €','Avanzado a medida — presupuesto','Actualizar sitio existente','Solo servicios extra (logo, SEO, …)','Aún no lo sé'],
  'f.btn':'Solicitar demo gratis →','f.succ.h':'¡Solicitud recibida!','f.succ.p':'Nos pondremos en contacto contigo en 24 horas para programar tu demo gratis.',
  'f.consent':'Acepto que DRP BuildLab utilice los datos de este formulario para contactarme sobre esta solicitud.',
  'f.err.h':'El envío ha fallado.','f.err.p':'Algo salió mal al enviar. Inténtalo de nuevo o contáctanos directamente en <a href="mailto:info@drpbuildlab.com">info@drpbuildlab.com</a> o por <a href="https://wa.me/32473744431" target="_blank" rel="noopener">WhatsApp</a>.',
  'ft.tag':'Sitios web profesionales para negocios locales · Completamente a medida',
  'ft.nav':['Navegación','Inicio','Sobre nosotros','Precios','Contacto'],
  'ft.ct':'Contacto','ft.copy':'© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Bélgica · IVA BE 1033.313.383','ft.ig':'Síguenos',
  'sticky.txt':'Paquete inicial desde 499 €','sticky.btn':'Demo gratis →',
  'cur.note':'Los precios en {cur} se convierten desde el euro al tipo de cambio de hoy y son indicativos. La facturación se realiza en EUR.',
  'wa':'Escríbenos por WhatsApp',
  'pay.methods':'Transferencia bancaria',
  'lang.offer':'Ver esta página en español',
  'lang.dismiss':'Cerrar',
  'cc.title':'Cookies',
  'cc.body':'Usamos cookies para ver cómo se usa el sitio y para medir nuestra publicidad. Tú eliges.',
  'cc.accept':'Aceptar todo',
  'cc.reject':'Rechazar todo',
  'cc.prefs':'Elegir',
  'cc.save':'Guardar',
  'cc.nec':'Necesarias',
  'cc.nec.d':'Imprescindibles para que el sitio funcione. Siempre activas.',
  'cc.ana':'Estadísticas',
  'cc.ana.d':'Cómo usan el sitio los visitantes, para poder mejorarlo.',
  'cc.mkt':'Marketing',
  'cc.mkt.d':'Medir el rendimiento de nuestra publicidad.',
  'cc.manage':'Configuración de cookies'
},
id:{
   "meta.title": "DRP BuildLab — Situs Web Sesuai Pesanan untuk Bisnis Lokal | Paket Pemula dari €499",
   "meta.desc": "DRP BuildLab mengembangkan situs web yang sepenuhnya disesuaikan untuk para wirausahawan lokal. Paket pemula mulai dari €499, atau penawaran harga khusus untuk proyek-proyek tingkat lanjut — dengan layanan pemeliharaan bulanan opsional seharga €29 per bulan.",
   "meta.title.about": "Tentang Kami — DRP BuildLab | Studio pengembangan situs web untuk bisnis lokal",
   "meta.desc.about": "Didirikan oleh para wirausahawan, untuk para wirausahawan. Kisah di balik DRP BuildLab dan alasan mengapa bisnis lokal memilih kami.",
   "meta.title.pricing": "Harga — DRP BuildLab | Paket Pemula €499 atau penawaran harga khusus",
   "meta.desc.pricing": "Paket awal dari €499 atau penawaran harga khusus untuk proyek-proyek tingkat lanjut. Layanan tambahan dan pemeliharaan opsional dari €29 per bulan.",
   "meta.title.contact": "Hubungi Kami — DRP BuildLab | Ajukan permohonan demo gratis",
   "meta.desc.contact": "Ajukan permintaan demo gratis. Kami akan menghubungi Anda dan langsung memperlihatkan contoh yang disesuaikan dengan kebutuhan Anda. Tanpa kewajiban apa pun.",
   "phero.about.eye": "Tentang DRP BuildLab",
   "phero.about.h": "Orang-orang di balik<br><em>situs web Anda.</em>",
   "phero.about.sub": "Siapa kami, mengapa kami memulai, dan apa yang dapat Anda harapkan dari kami.",
   "phero.pricing.eye": "Harga dan paket",
   "phero.pricing.h": "Harga yang wajar,<br><em>tanpa kejutan.</em>",
   "phero.pricing.sub": "Paket awal dari €499 atau penawaran harga khusus. Biaya pemeliharaan dapat Anda tambahkan sendiri.",
   "phero.contact.eye": "Hubungi Kami",
   "phero.contact.h": "Sudah<br>siap untuk <em>online?</em>",
   "phero.contact.sub": "Ajukan permintaan demo gratis. Kami akan menghubungi Anda dan langsung memperlihatkan contoh yang disesuaikan dengan kebutuhan Anda.",
   "cta.h": "Sudah<br>siap untuk <em>online?</em>",
   "cta.sub": "Ajukan permintaan demo gratis. Kami akan menghubungi Anda dan langsung memperlihatkan contoh yang disesuaikan dengan kebutuhan Anda. Tanpa kewajiban apa pun.",
   "cta.btn": "Ajukan permintaan demo gratis →",
   "loader": "Sedang dimuat...",
   "nav.home": "Beranda",
   "nav.pricing": "Harga",
   "nav.about": "Tentang Kami",
   "nav.contact": "Hubungi Kami",
   "nav.cta": "Demo gratis →",
   "hero.eye": "Situs web khusus untuk bisnis lokal",
   "hero.l1": "Bisnis Anda",
   "hero.l2": "secara daring.",
   "hero.l3": "<span class=\"h-light\">Akhirnya</span> <span class=\"h-accent\">ketemu</span> <span class=\"h-light\">juga.</span>",
   "hero.sub": "Tidak punya situs web? Artinya, Anda tidak ada di dunia maya. DRP BuildLab membuat <strong>situs web yang sepenuhnya disesuaikan</strong> untuk para pengusaha lokal — harganya ditentukan berdasarkan besarnya pekerjaan yang dibutuhkan proyek Anda. Selalu jujur, selalu transparan.",
   "hero.cta1": "Ajukan permintaan demo gratis →",
   "hero.cta2": "Lihat pendekatan kami",
   "hero.scroll": "Gulir",
   "mq": [
    "Fokus lokal",
    "Penetapan harga yang wajar",
    "Dapat diakses melalui perangkat seluler",
    "Dioptimalkan untuk Google",
    "Benar-benar bebas dari kekhawatiran"
   ],
   "zoom.bl": "Data kami",
   "zoom.br": "Gulir ke bawah",
   "zs": [
    {
     "num": "<span>€</span>0",
     "lbl": "Berapa biaya demo dan proposal pertama Anda",
     "tag": "Tidak ada hambatan"
    },
    {
     "num": "€499",
     "lbl": "Paket awal — situs web khusus untuk bisnis baru",
     "tag": "Harga yang wajar"
    },
    {
     "num": "100<span>%</span>",
     "lbl": "Situs web yang sepenuhnya disesuaikan — harga tergantung pada cakupan proyek",
     "tag": "Kustom"
    }
   ],
   "how.tag": "Cara kerjanya",
   "how.h2": "Dari nol hingga online<br><em>dalam 4 langkah.</em>",
   "how.sub": "Tidak diperlukan pengetahuan teknis. Kami menangani semuanya, mulai dari panggilan pertama hingga situs web siap online.",
   "how.steps": [
    {
     "t": "Panggilan pertama",
     "b": "Kami akan menghubungi Anda dan langsung menunjukkan contoh yang disesuaikan. Sepenuhnya gratis dan tanpa kewajiban apa pun.",
     "d": "Bersama-sama"
    },
    {
     "t": "Desain khusus",
     "b": "Sesuai dengan keinginan Anda, kami akan membuatkan situs web Anda. Anda tidak perlu melakukan apa pun.",
     "d": "Kami"
    },
    {
     "t": "Pratinjau &amp; persetujuan",
     "b": "Anda akan menerima pratinjau untuk disetujui. Termasuk revisi-revisinya. Setelah itu, situs Anda akan diluncurkan dengan domain Anda sendiri.",
     "d": "Bersama-sama"
    },
    {
     "t": "Hidup — dan kami tetap di sini",
     "b": "Setelah peluncuran, kami tetap siap membantu Anda. Pembaruan, perubahan, pertanyaan — kami yang akan mengurusnya.",
     "d": "Kami"
    }
   ],
   "ab.logotag": "Situs web · dibuat sesuai pesanan",
   "ab.quote": "&quot;Setiap usaha lokal berhak mendapatkan kesempatan yang adil untuk ditemukan <em>di internet.</em>&quot;",
   "ab.sig": "— Para pendiri DRP BuildLab",
   "ab.nums": [
    "Biaya pemeliharaan per bulan (opsional)",
    "Paket awal situs web",
    "Dibuat sesuai pesanan",
    "Biaya tersembunyi"
   ],
   "ab.tag": "Tentang Kami",
   "ab.h2": "Dibangun oleh<br>para wirausahawan,<br><em>untuk para wirausahawan.</em>",
   "ab.p1": "Semuanya berawal dari rasa frustrasi. Kami menyadari bahwa usaha-usaha lokal — penjual daging di sudut jalan, tukang ledeng yang selalu siap sedia, penata rambut yang sudah memotong rambut pelanggan yang sama selama bertahun-tahun — sama sekali tidak terlihat di dunia maya.",
   "ab.p2": "Agen-agen besar mengenakan biaya <strong>€5.000 untuk sebuah situs web</strong> yang baru selesai dalam hitungan bulan. Oleh karena itu, kami mendirikan DRP BuildLab: sebuah studio yang percaya bahwa setiap usaha lokal <strong>berhak mendapatkan situs web yang dirancang khusus</strong> — terjangkau, jujur, dengan harga yang sesuai dengan usaha yang diperlukan.",
   "ab.pillars": [
    {
     "t": "Kejujuran di atas segalanya",
     "b": "Apa yang kami janjikan, pasti kami penuhi. Tanpa biaya tersembunyi, tanpa penawaran harga yang tidak jelas."
    },
    {
     "t": "Pemeliharaan sesuai keinginan Anda",
     "b": "Pemeliharaan bulanan bersifat opsional: €29 per bulan atau €250 per tahun. Tambahkan layanan ini agar situs Anda tetap aman, selalu terupdate, dan mudah ditemukan — tanpa Anda perlu repot memikirkannya."
    },
    {
     "t": "Berpikir secara lokal, membangun secara digital",
     "b": "Kami membangun untuk bisnis lokal — bisnis yang pelanggannya mencari di sekitar. Kami bekerja secara jarak jauh dari Belgia, jadi lokasi Anda tidak menentukan apakah kami dapat membangun untuk Anda."
    }
   ],
   "why.tag": "Mengapa DRP BuildLab?",
   "why.h2": "Apa yang membedakan kami?",
   "why.sub": "Diciptakan untuk bisnis lokal yang ingin hadir secara daring — tanpa kerumitan, tanpa kejutan.",
   "why.cards": [
    {
     "t": "Satu titik kontak",
     "b": "Tanpa sistem tiket, tanpa manajer akun yang berganti-ganti. Anda memiliki nama dan nomor telepon kami — mulai dari panggilan pertama hingga bertahun-tahun setelah peluncuran."
    },
    {
     "t": "Fokus lokal",
     "b": "Wilayah Anda, pelanggan Anda, tim khusus untuk Anda. Kami memahami pasar lokal secara mendalam."
    },
    {
     "t": "Penetapan harga yang wajar",
     "b": "Tidak ada biaya tersembunyi. Biayanya selalu ditetapkan di muka. Anda tahu persis berapa yang harus Anda bayar."
    },
    {
     "t": "Selalu siap digunakan di perangkat seluler",
     "b": "Lebih dari 70% pelanggan Anda melakukan pencarian melalui ponsel. Setiap situs DRP BuildLab berfungsi dengan sempurna di semua perangkat."
    },
    {
     "t": "Dioptimalkan untuk Google",
     "b": "Fitur SEO sudah terintegrasi agar pelanggan dapat menemukan Anda. Kami memastikan Google mengenali dan mengindeks situs Anda."
    },
    {
     "t": "Pasangan seumur hidup",
     "b": "Setelah peluncuran, kami tetap siap membantu Anda. Kami bukan sekadar penyedia jasa sekali pakai, melainkan mitra sejati."
    }
   ],
   "opp.tag": "Biaya tersembunyi",
   "opp.h2": "Berapa <em>sebenarnya biaya</em> kehadiran<br>online<br>€0<em>?</em>",
   "opp.sub": "Tidak memiliki situs web bukanlah hal yang gratis. Setiap hari tanpa kehadiran online, Anda kehilangan pelanggan ke pesaing yang mudah ditemukan.",
   "opp.pts": [
    {
     "t": "78% melakukan pencarian secara daring terlebih dahulu",
     "b": "Sebelum mengunjungi sebuah usaha lokal, orang-orang biasanya mencarinya di Google. Tidak muncul di sana? Bagi pelanggan tersebut, usaha Anda seolah-olah tidak ada."
    },
    {
     "t": "Setiap hari berarti kehilangan pendapatan",
     "b": "Pelanggan tidak bisa menemukan Anda di internet dan akhirnya beralih ke pesaing. Setiap hari tanpa situs web berarti satu hari lagi di mana pesaing Anda yang menang."
    },
    {
     "t": "Pesaing Anda sedang online",
     "b": "Sementara Anda menunggu, pesaing Anda terus membangun reputasi online mereka. Semakin lama Anda menunggu, semakin sulit bagi Anda untuk mengejar ketertinggalan."
    },
    {
     "t": "Kredibilitas adalah pendapatan",
     "b": "Situs web profesional dapat membangun kepercayaan. Pelanggan cenderung lebih memilih bisnis yang terlihat profesional."
    }
   ],
   "opp.boxtitle": "Perhitungan biaya per tahun",
   "opp.rows": [
    [
     "Jumlah pelanggan yang terlewat per minggu (perkiraan)",
     "2–5"
    ],
    [
     "Nilai rata-rata per pelanggan",
     "€80"
    ],
    [
     "Kerugian per tahun tanpa situs web",
     "−€8.320"
    ],
    [
     "Paket Investasi DRP BuildLab (Paket Pemula)",
     "+€499"
    ],
    [
     "Pemeliharaan bulanan tahunan",
     "+€348"
    ]
   ],
   "opp.totlbl": "Manfaat bersih potensial",
   "opp.totval": "+€7.473 per tahun",
   "opp.note": "<strong>Kesimpulannya sederhana:</strong> biaya pembuatan situs web hanyalah sebagian kecil dari kerugian yang akan Anda alami jika tidak memilikinya. Menunda-nunda <strong>justru</strong> lebih mahal daripada berinvestasi.",
   "comp.tag": "Gambaran umum pasar",
   "comp.h2": "Tidak ada yang menawarkan harga<br>lebih murah <em>daripada kami.</em>",
   "comp.sub": "Kami tidak menyembunyikan hal ini — kami justru bangga akan hal itu. Lihat sendiri berapa harga situs web sejenis di tempat lain.",
   "comp.cols": [
    "Penyedia",
    "Harga awal",
    "Pemeliharaan",
    "Seluler"
   ],
   "comp.us": "Kami",
   "comp.rows": [
    {
     "n": "DRP BuildLab",
     "p": "€499",
     "m": "€29/bulan",
     "us": true
    },
    {
     "n": "Pekerja lepas",
     "p": "€800–€2.500",
     "m": "Tidak termasuk"
    },
    {
     "n": "Agen digital",
     "p": "€2.500–€8.000",
     "m": "Biaya tambahan yang mahal"
    },
    {
     "n": "Agensi besar",
     "p": "€8.000+",
     "m": "Biaya tambahan yang mahal"
    },
    {
     "n": "Wix / Squarespace",
     "p": "€200 –€500/tahun",
     "m": "Lakukan sendiri"
    }
   ],
   "comp.note": "<strong>Catatan:</strong> Layanan pembuat situs web seperti Wix juga sama mahalnya jika dihitung per tahun — tetapi Anda harus mengurus semuanya sendiri, tanpa bantuan atau dukungan profesional. Di DRP BuildLab, Anda tidak perlu mengurus apa pun sendiri dan selalu ada orang yang siap membantu Anda.",
   "srv.tag": "Pendekatan kami",
   "srv.h2": "Situs web <em>yang dirancang</em><br><em>khusus</em> untuk setiap pengusaha.",
   "srv.sub": "Di DRP BuildLab, setiap situs web dibuat <strong>sepenuhnya sesuai pesanan</strong>. Harganya selalu ditentukan berdasarkan jumlah pekerjaan yang kami lakukan untuk proyek Anda. Tidak ada paket wajib, tidak ada biaya tak terduga — hanya penawaran harga yang adil dan sesuai dengan kebutuhan Anda yang sebenarnya.",
   "p1.badge": "Sebagai permulaan",
   "p1.name": "Paket Pemula",
   "p1.period": "sekali saja — perawatan opsional",
   "p1.desc": "Sangat cocok bagi <strong>pengusaha lokal yang baru memulai</strong> dan belum memiliki situs web — atau pengusaha yang ingin memperbarui situs web mereka yang sudah ada menjadi versi yang lebih modern dan profesional.",
   "p1.feats": [
    "Situs web yang sepenuhnya disesuaikan dengan bisnis Anda",
    "Dapat diakses melalui perangkat seluler (desain responsif)",
    "Formulir kontak + integrasi WhatsApp",
    "Google Maps &amp; optimasi SEO dasar",
    "Bimbingan pribadi dari awal hingga peluncuran"
   ],
   "p1.btn": "Ajukan permintaan demo gratis →",
   "p2.name": "Kustomisasi lanjutan",
   "p2.price": "Penawaran harga khusus<br>",
   "p2.period": "kutipan pribadi — perawatan opsional",
   "p2.desc": "Bagi para pengusaha yang memiliki <strong>proyek yang lebih besar atau lebih kompleks</strong>: toko online, sistem pemesanan, situs multibahasa, integrasi, atau fitur khusus. Harganya ditentukan berdasarkan cakupan proyek Anda.",
   "p2.feats": [
    "Halaman khusus tanpa batas",
    "Toko daring, sistem pemesanan, atau portal anggota",
    "SEO Tingkat Lanjut &amp; Google Ads",
    "Situs web multibahasa dapat dibuat",
    "Integrasi khusus yang kompleks"
   ],
   "p2.btn": "Minta penawaran harga →",
   "addon.tag": "Fitur tambahan opsional",
   "addon.n": "Pemeliharaan bulanan",
   "addon.or": "atau",
   "addon.pm": "€29<span>/bulan</span>",
   "addon.py": "€250<span>/tahun</span>",
   "addon.b": "Pembaruan, pencadangan, keamanan, dan pemeriksaan SEO. Tidak termasuk dalam paket — Anda yang memutuskan apakah akan menambahkannya.",
   "srv.how": "<strong>Begini cara kerjanya:</strong> Anda sampaikan kepada kami apa yang Anda butuhkan, kami akan mengevaluasi lingkup pekerjaannya dan menentukan harga yang wajar sesuai dengan pekerjaan tersebut. Layanan pemeliharaan bulanan tersedia sebagai opsi — €29 per bulan atau €250 per tahun — sehingga situs web Anda tetap aman, selalu terupdate, dan dioptimalkan untuk SEO.",
   "ex.tag": "Layanan tambahan",
   "ex.h3": "Layanan<br>tambahan <em>untuk mempercepat pertumbuhan bisnis online Anda.</em>",
   "ex.sub": "Pesan secara terpisah atau bersamaan dengan situs web Anda. Harga yang tercantum bersifat perkiraan dan akan selalu dikonfirmasi dalam penawaran harga pribadi Anda.",
   "ex.items": [
    {
     "n": "Desain logo",
     "p": "€149"
    },
    {
     "n": "Halaman tambahan",
     "p": "€79"
    },
    {
     "n": "Paket Pemula SEO",
     "p": "€199"
    },
    {
     "n": "Pengaturan Google Ads",
     "p": "€149"
    },
    {
     "n": "Situs multibahasa",
     "p": "€199"
    },
    {
     "n": "Tambahkan toko online",
     "p": "Kustom"
    },
    {
     "n": "Perbaikan darurat (24 jam)",
     "p": "€99"
    },
    {
     "n": "Fotografi (setengah hari)",
     "p": "€199"
    },
    {
     "n": "Integrasi (sistem pemesanan, penyedia layanan pembayaran, akuntansi)",
     "p": "€149"
    },
    {
     "n": "CMS — kelola konten Anda sendiri",
     "p": "€149"
    },
    {
     "n": "Permintaan khusus — disesuaikan dengan kebutuhan Anda",
     "p": "Atas permintaan"
    }
   ],
   "faq.tag": "Pertanyaan yang Sering Diajukan",
   "faq.h2": "Jawaban atas <em>pertanyaan-pertanyaan terpenting</em> Anda<br><em>.</em>",
   "faq.items": [
    {
     "q": "Berapa biaya pembuatan situs web di DRP BuildLab?",
     "a": "Setiap situs web dibuat sepenuhnya sesuai pesanan. Harganya bergantung pada besarnya volume pekerjaan yang diperlukan untuk proyek Anda. Bagi pengusaha lokal yang baru memulai atau ingin memperbarui situs web yang sudah ada, kami menawarkan paket pemula dari <strong>€499</strong>. Untuk proyek-proyek yang lebih kompleks, kami selalu menyusun <strong>penawaran</strong> <strong>harga</strong> <strong>khusus</strong>. Layanan pemeliharaan bulanan bersifat opsional: <strong>€29 per bulan</strong> atau <strong>€250 per tahun</strong>."
    },
    {
     "q": "Untuk siapa paket pemula “€499” ini ditujukan?",
     "a": "Khususnya bagi para pengusaha lokal yang baru memulai usaha tanpa memiliki situs web, atau bagi para pengusaha yang ingin memperbarui situs web mereka yang sudah ada menjadi versi yang lebih modern dan profesional."
    },
    {
     "q": "Berapa biaya pemeliharaan bulanan?",
     "a": "Layanan pemeliharaan bersifat opsional dengan biaya <strong>€29 per bulan</strong>, atau <strong>€250 per tahun</strong> — opsi tahunan ini menghemat €98. Layanan ini menjaga situs web Anda tetap aman, cepat, dan dioptimalkan untuk SEO. Anda tidak terikat kontrak: Anda dapat membatalkan langganan setiap bulan, dan situs web tersebut akan selalu menjadi milik Anda."
    },
    {
     "q": "Seberapa cepat situs web saya akan online?",
     "a": "Begitu kami menerima naskah, foto, dan logo Anda, kami bisa segera mulai bekerja. Di awal, kami akan menyepakati <strong>tanggal penyelesaian</strong> yang <strong>pasti</strong> sesuai dengan cakupan proyek Anda — dan kami akan mematuhinya. Selama proses berlangsung, Anda akan menerima pratinjau untuk disetujui, sehingga Anda tidak perlu menunggu lama."
    },
    {
     "q": "Bagaimana cara kerja penawaran harga khusus?",
     "a": "Untuk proyek-proyek tingkat lanjut, kami akan meninjau kebutuhan Anda terlebih dahulu melalui panggilan perkenalan gratis. Selanjutnya, kami akan menyusun penawaran harga khusus berdasarkan volume pekerjaan: jumlah halaman, fitur, integrasi, dan pemeliharaan. Tidak ada biaya tersembunyi — Anda sudah tahu sebelumnya berapa yang harus dibayarkan."
    }
   ],
   "soc.tag": "Ikuti kami",
   "soc.h2": "Ikuti terus perkembangan terbaru<br><em>dari apa yang kami kembangkan.</em>",
   "soc.p1": "Ikuti kami di Facebook, Instagram, dan TikTok untuk mengetahui proyek-proyek terbaru, tips bagi para wirausahawan lokal, serta sekilas tentang apa yang terjadi di balik layar DRP BuildLab.",
   "soc.p2": "Ada pertanyaan, atau sekadar ingin mendiskusikannya? Kirimkan pesan kepada kami melalui saluran mana pun yang Anda inginkan — kami selalu membalasnya secara langsung.",
   "ct.tag": "Demo gratis",
   "ct.h2": "Sudah<br>siap untuk <em>online?</em>",
   "ct.lede": "Ajukan permintaan demo gratis. Kami akan menghubungi Anda dan langsung memperlihatkan contoh yang disesuaikan dengan kebutuhan Anda. Tanpa kewajiban apa pun.",
   "ct.lbls": [
    "Telepon",
    "Email",
    "Alamat",
    "Nomor perusahaan",
    "WhatsApp",
    "Instagram",
    "Facebook",
    "TikTok"
   ],
   "f.labels": [
    "Nama depan",
    "Nama keluarga",
    "Nama perusahaan",
    "Nomor telepon",
    "Email",
    "Layanan mana yang Anda maksud?",
    "Pesan (opsional)"
   ],
   "f.phs": [
    "John",
    "Smith",
    "Perusahaan Anda",
    "+32 ...",
    "john@yourcompany.com",
    "Ceritakan lebih banyak tentang proyek Anda..."
   ],
   "f.sel": [
    "Pilih layanan",
    "Paket pemula — €499",
    "Penyesuaian lanjutan — penawaran harga",
    "Memperbarui situs web yang sudah ada",
    "Hanya layanan tambahan (logo, SEO, …)",
    "Saya belum yakin"
   ],
   "f.btn": "Ajukan permintaan demo gratis →",
   "f.succ.h": "Permintaan telah diterima!",
   "f.succ.p": "Kami akan menghubungi Anda dalam waktu 24 jam untuk menjadwalkan demo gratis Anda.",
   "f.consent": "Saya setuju bahwa DRP BuildLab dapat menggunakan data yang tercantum dalam formulir ini untuk menghubungi saya terkait permintaan ini.",
   "f.err.h": "Pengiriman gagal.",
   "f.err.p": "Terjadi kesalahan saat pengiriman. Silakan coba lagi, atau hubungi kami langsung melalui <a href=\"mailto:info@drpbuildlab.com\">info@drpbuildlab.com</a> atau <a href=\"https://wa.me/32473744431\" target=\"_blank\" rel=\"noopener\">WhatsApp</a>.",
   "ft.tag": "Situs web profesional untuk bisnis lokal · Disesuaikan sepenuhnya",
   "ft.nav": [
    "Navigasi",
    "Beranda",
    "Tentang Kami",
    "Harga",
    "Hubungi Kami"
   ],
   "ft.ct": "Hubungi Kami",
   "ft.copy": "© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Belgia · Nomor PPN BE 1033.313.383",
   "ft.ig": "Ikuti kami",
   "sticky.txt": "Paket pemula dari €499",
   "sticky.btn": "Demo gratis →",
   "cur.note": "Harga di {cur} dikonversi dari euro berdasarkan kurs hari ini dan bersifat perkiraan. Penagihan dilakukan dalam EUR.",
   "wa": "Hubungi kami melalui WhatsApp",
   "pay.methods": "Transfer bank",
   "lang.offer": "Lihat halaman ini dalam bahasa Indonesia",
   "lang.dismiss": "Tutup",
   "cc.title": "Cookie",
   "cc.body": "Kami menggunakan cookie untuk melihat bagaimana situs digunakan dan untuk mengukur iklan kami. Anda yang memilih.",
   "cc.accept": "Terima semua",
   "cc.reject": "Tolak semua",
   "cc.prefs": "Pilih",
   "cc.save": "Simpan pilihan",
   "cc.nec": "Diperlukan",
   "cc.nec.d": "Dibutuhkan agar situs berfungsi. Selalu aktif.",
   "cc.ana": "Statistik",
   "cc.ana.d": "Bagaimana pengunjung menggunakan situs, agar kami dapat memperbaikinya.",
   "cc.mkt": "Pemasaran",
   "cc.mkt.d": "Mengukur seberapa efektif iklan kami.",
   "cc.manage": "Pengaturan cookie"
  },
de:{
   "meta.title": "DRP BuildLab – Maßgeschneiderte Websites für lokale Unternehmen | Starter-Paket von €499",
   "meta.desc": "DRP BuildLab erstellt maßgeschneiderte Websites für lokale Unternehmer. Starter-Paket unter €499 oder ein individuelles Angebot für anspruchsvolle Projekte – mit optionaler monatlicher Wartung ab €29 pro Monat.",
   "meta.title.about": "Über uns — DRP BuildLab | Website-Agentur für lokale Unternehmen",
   "meta.desc.about": "Von Unternehmern für Unternehmer gegründet. Die Geschichte hinter DRP BuildLab und warum sich lokale Unternehmen für uns entscheiden.",
   "meta.title.pricing": "Preise – DRP BuildLab | Starter-Paket €499 oder ein individuelles Angebot",
   "meta.desc.pricing": "Starterpaket unter €499 oder ein individuelles Angebot für anspruchsvolle Projekte. Zusätzliche Dienstleistungen und optionale Wartung unter €29 pro Monat.",
   "meta.title.contact": "Kontakt – DRP BuildLab | Kostenlose Demo anfordern",
   "meta.desc.contact": "Fordern Sie eine kostenlose Demo an. Wir rufen Sie an und zeigen Ihnen sofort ein individuelles Beispiel. Ganz unverbindlich.",
   "phero.about.eye": "Über DRP BuildLab",
   "phero.about.h": "Die Menschen hinter<br><em>Ihrer Website.</em>",
   "phero.about.sub": "Wer wir sind, warum wir angefangen haben und was Sie von uns erwarten können.",
   "phero.pricing.eye": "Preise und Pakete",
   "phero.pricing.h": "Faire Preise,<br><em>keine Überraschungen.</em>",
   "phero.pricing.sub": "Ein Starterpaket von €499 oder ein individuelles Angebot. Die Wartung können Sie selbst hinzufügen.",
   "phero.contact.eye": "Kontakt",
   "phero.contact.h": "Sind Sie bereit, <em>online</em> zu gehen<br><em>?</em>",
   "phero.contact.sub": "Fordern Sie eine kostenlose Demo an. Wir rufen Sie an und zeigen Ihnen umgehend ein individuelles Beispiel.",
   "cta.h": "Sind Sie bereit, <em>online</em> zu gehen<br><em>?</em>",
   "cta.sub": "Fordern Sie eine kostenlose Demo an. Wir rufen Sie an und zeigen Ihnen sofort ein individuelles Beispiel. Ganz unverbindlich.",
   "cta.btn": "Kostenlose Demo anfordern →",
   "loader": "Wird geladen...",
   "nav.home": "Startseite",
   "nav.pricing": "Preise",
   "nav.about": "Über uns",
   "nav.contact": "Kontakt",
   "nav.cta": "Kostenlose Demo →",
   "hero.eye": "Maßgeschneiderte Websites für lokale Unternehmen",
   "hero.l1": "Ihr Unternehmen",
   "hero.l2": "online.",
   "hero.l3": "<span class=\"h-light\">Endlich</span> <span class=\"h-accent\">gefunden</span><span class=\"h-light\">.</span>",
   "hero.sub": "Keine Website? Dann existieren Sie online nicht. DRP BuildLab erstellt <strong>maßgeschneiderte Websites</strong> für lokale Unternehmer – der Preis richtet sich nach dem Arbeitsaufwand Ihres Projekts. Immer ehrlich, immer transparent.",
   "hero.cta1": "Kostenlose Demo anfordern →",
   "hero.cta2": "Erfahren Sie mehr über unseren Ansatz",
   "hero.scroll": "Scrollen",
   "mq": [
    "Lokaler Fokus",
    "Faire Preisgestaltung",
    "Für Mobilgeräte optimiert",
    "Für Google optimiert",
    "Völlig sorgenfrei"
   ],
   "zoom.bl": "Unsere Zahlen",
   "zoom.br": "Weiter scrollen",
   "zs": [
    {
     "num": "0 <span>€</span>",
     "lbl": "Was Ihre Demo und Ihr erstes Angebot kosten",
     "tag": "Keine Barriere"
    },
    {
     "num": "€499",
     "lbl": "Starterpaket – maßgeschneiderte Website für Start-ups",
     "tag": "Faires Preisniveau"
    },
    {
     "num": "100 <span>%</span>",
     "lbl": "Vollständig maßgeschneiderte Websites – Preis je nach Umfang",
     "tag": "Benutzerdefiniert"
    }
   ],
   "how.tag": "So funktioniert es",
   "how.h2": "<em>In 4 Schritten</em> von null auf online<br><em>.</em>",
   "how.sub": "Es sind keine technischen Kenntnisse erforderlich. Wir kümmern uns um alles – vom ersten Anruf bis zur Live-Schaltung der Website.",
   "how.steps": [
    {
     "t": "Erster Anruf",
     "b": "Wir rufen Sie an und zeigen Ihnen umgehend ein individuelles Beispiel. Völlig kostenlos und unverbindlich.",
     "d": "Gemeinsam"
    },
    {
     "t": "Individuelles Design",
     "b": "Wir erstellen Ihre Website ganz nach Ihren Wünschen. Sie müssen sich um nichts kümmern.",
     "d": "Wir"
    },
    {
     "t": "Vorschau und Freigabe",
     "b": "Sie erhalten eine Vorschau zur Freigabe. Korrekturen sind bereits enthalten. Anschließend geht Ihre Website unter Ihrer eigenen Domain online.",
     "d": "Gemeinsam"
    },
    {
     "t": "Leben – und wir bleiben",
     "b": "Auch nach dem Start sind wir weiterhin für Sie da. Updates, Änderungen, Fragen – wir kümmern uns darum.",
     "d": "Wir"
    }
   ],
   "ab.logotag": "Websites · maßgeschneidert",
   "ab.quote": "„Jedes lokale Unternehmen verdient eine faire Chance, <em>online</em> gefunden zu werden.“",
   "ab.sig": "— Die Gründer von DRP BuildLab",
   "ab.nums": [
    "Monatliche Wartung (optional)",
    "Website zum Starterpaket",
    "Maßgefertigt",
    "Versteckte Kosten"
   ],
   "ab.tag": "Über uns",
   "ab.h2": "Von<br>Unternehmern entwickelt,<br><em>für Unternehmer.</em>",
   "ab.p1": "Alles begann mit einer Frustration. Wir stellten fest, dass lokale Unternehmen – der Metzger an der Ecke, der Klempner, der immer zur Stelle ist, der Friseur, der seit Jahren dieselben Kunden schneidet – im Internet völlig unsichtbar waren.",
   "ab.p2": "Große Agenturen stellten „<strong>€5.000</strong>“ hohe Rechnungen<strong> für eine Website</strong>, deren Fertigstellung Monate dauerte. Deshalb haben wir DRP BuildLab gegründet: ein Studio, das davon überzeugt ist, dass jedes lokale Unternehmen <strong>eine maßgeschneiderte Website verdient</strong> – erschwinglich, fair und zu einem Preis, der dem Aufwand entspricht.",
   "ab.pillars": [
    {
     "t": "Ehrlichkeit geht vor",
     "b": "Was wir versprechen, halten wir auch ein. Keine versteckten Kosten, keine vagen Angebote."
    },
    {
     "t": "Wartung, wann immer Sie es wünschen",
     "b": "Die monatliche Wartung ist optional: €29 pro Monat oder €250 pro Jahr. Wenn Sie diesen Service hinzubuchen, bleibt Ihre Website sicher, auf dem neuesten Stand und gut auffindbar – ohne dass Sie sich darum kümmern müssen."
    },
    {
     "t": "Lokal denken, digital gestalten",
     "b": "Wir bauen für lokale Unternehmen — für die, deren Kunden in der Nähe suchen. Wir arbeiten remote aus Belgien, Ihr Standort entscheidet also nicht darüber, ob wir für Sie bauen können."
    }
   ],
   "why.tag": "Warum DRP BuildLab?",
   "why.h2": "Was zeichnet uns aus?",
   "why.sub": "Entwickelt für lokale Unternehmen, die im Internet präsent sein möchten – ohne Aufwand und ohne Überraschungen.",
   "why.cards": [
    {
     "t": "Ein Ansprechpartner",
     "b": "Kein Ticket-System, keine wechselnden Kundenbetreuer. Sie haben unseren Namen und unsere Telefonnummer – vom ersten Anruf bis Jahre nach dem Start."
    },
    {
     "t": "Lokaler Fokus",
     "b": "Ihre Region, Ihre Kunden, ein persönliches Team. Wir kennen den lokalen Markt von Grund auf."
    },
    {
     "t": "Faire Preisgestaltung",
     "b": "Keine versteckten Kosten. Immer im Voraus festgelegt. Sie wissen genau, was Sie bezahlen."
    },
    {
     "t": "Immer für Mobilgeräte bereit",
     "b": "Über 70 % Ihrer Kunden suchen per Smartphone. Jede DRP BuildLab-Website funktioniert auf jedem Gerät einwandfrei."
    },
    {
     "t": "Für Google optimiert",
     "b": "Integrierte SEO, damit Kunden Sie finden. Wir sorgen dafür, dass Google Sie erkennt und indexiert."
    },
    {
     "t": "Lebenspartner",
     "b": "Auch nach der Markteinführung sind wir weiterhin für Sie da. Wir sind kein einmaliger Anbieter, sondern ein echter Partner."
    }
   ],
   "opp.tag": "Die versteckten Kosten",
   "opp.h2": "Was kostet der Online-Auftritt<br>von<br>„€0“ <em>wirklich?</em>",
   "opp.sub": "Keine Website zu haben, ist nicht kostenlos. Mit jedem Tag, an dem Sie nicht online präsent sind, verlieren Sie Kunden an Wettbewerber, die im Internet auffindbar sind.",
   "opp.pts": [
    {
     "t": "78 % suchen zuerst online",
     "b": "Bevor man ein lokales Geschäft besucht, sucht man es bei Google. Nicht zu finden? Dann existierst du für diesen Kunden nicht."
    },
    {
     "t": "Jeder Tag bedeutet entgangene Einnahmen",
     "b": "Kunden können Sie online nicht finden und wenden sich an die Konkurrenz. Jeder Tag ohne Website ist ein Tag, an dem Ihr Konkurrent gewinnt."
    },
    {
     "t": "Ihr Konkurrent ist online",
     "b": "Während Sie zögern, baut Ihr Konkurrent seine Online-Reputation aus. Je länger Sie warten, desto schwieriger wird es, den Rückstand aufzuholen."
    },
    {
     "t": "Glaubwürdigkeit bedeutet Umsatz",
     "b": "Eine professionelle Website schafft Vertrauen. Kunden entscheiden sich eher für ein Unternehmen, das seriös wirkt."
    }
   ],
   "opp.boxtitle": "Kostenberechnung pro Jahr",
   "opp.rows": [
    [
     "Verpasste Kunden pro Woche (Schätzung)",
     "2–5"
    ],
    [
     "Durchschnittswert pro Kunde",
     "€80"
    ],
    [
     "Jährlicher Verlust ohne Website",
     "−€8.320"
    ],
    [
     "Investment-DRP BuildLab (Starterpaket)",
     "+€499"
    ],
    [
     "Jährliche monatliche Wartung",
     "+€348"
    ]
   ],
   "opp.totlbl": "Potentieller Nettonutzen",
   "opp.totval": "+€7.473 pro Jahr",
   "opp.note": "<strong>Die Schlussfolgerung ist einfach:</strong> Die Kosten für eine Website machen nur einen Bruchteil dessen aus, was Ihnen ohne eine solche entgeht. Abwarten kostet mehr als investieren.",
   "comp.tag": "Marktüberblick",
   "comp.h2": "Niemand bietet das<br>günstiger an <em>als wir.</em>",
   "comp.sub": "Das machen wir kein Geheimnis daraus – wir sind stolz darauf. Überzeugen Sie sich selbst davon, was vergleichbare Websites anderswo kosten.",
   "comp.cols": [
    "Anbieter",
    "Startpreis",
    "Wartung",
    "Mobil"
   ],
   "comp.us": "Wir",
   "comp.rows": [
    {
     "n": "DRP BuildLab",
     "p": "€499",
     "m": "€29/Monat",
     "us": true
    },
    {
     "n": "Freiberufler",
     "p": "€800–€2.500",
     "m": "Nicht enthalten"
    },
    {
     "n": "Digitalagentur",
     "p": "€2.500–€8.000",
     "m": "Teures Extra"
    },
    {
     "n": "Große Agentur",
     "p": "€8.000+",
     "m": "Teures Extra"
    },
    {
     "n": "Wix / Squarespace",
     "p": "€200 –€500/Jahr",
     "m": "Mach es selbst"
    }
   ],
   "comp.note": "<strong>Hinweis:</strong> Website-Baukästen wie Wix sind auf Jahresbasis genauso teuer – allerdings müssen Sie alles selbst erledigen, ohne professionelle Hilfe oder Unterstützung. Bei DRP BuildLab müssen Sie nichts selbst tun, und es steht Ihnen immer jemand zur Seite.",
   "srv.tag": "Unser Ansatz",
   "srv.h2": "<em>Maßgeschneiderte</em><br>Websites für jeden Unternehmer.",
   "srv.sub": "Bei DRP BuildLab wird jede Website <strong>vollständig maßgeschneidert</strong>. Der Preis richtet sich stets nach dem Arbeitsaufwand, den wir in Ihr Projekt investieren. Keine obligatorischen Pakete, keine Überraschungen – nur ein faires Angebot, das genau auf Ihre tatsächlichen Bedürfnisse zugeschnitten ist.",
   "p1.badge": "Zunächst einmal",
   "p1.name": "Starterpaket",
   "p1.period": "einmalig – Wartung optional",
   "p1.desc": "Ideal für <strong>lokale Unternehmer, die gerade erst anfangen</strong> und noch keine Website haben – oder für Unternehmer, die ihre bestehende Website auf eine moderne, professionelle Version aktualisieren möchten.",
   "p1.feats": [
    "Eine Website, die vollständig auf Ihr Unternehmen zugeschnitten ist",
    "Für Mobilgeräte optimiert (Responsive Design)",
    "Kontaktformular + WhatsApp-Integration",
    "Google Maps und grundlegende SEO-Optimierung",
    "Persönliche Betreuung von Anfang an"
   ],
   "p1.btn": "Kostenlose Demo anfordern →",
   "p2.name": "Erweiterte Anpassung",
   "p2.price": "Individuelles<br>Angebot",
   "p2.period": "persönliches Zitat – Wartung optional",
   "p2.desc": "Für Unternehmer mit <strong>größeren oder komplexeren Projekten</strong>: Online-Shops, Buchungssysteme, mehrsprachige Websites, Integrationen oder spezielle Funktionen. Der Preis richtet sich nach dem Umfang Ihres Projekts.",
   "p2.feats": [
    "Unbegrenzte Anzahl benutzerdefinierter Seiten",
    "Webshop, Buchungssystem oder Mitgliederportal",
    "Fortgeschrittene Suchmaschinenoptimierung (SEO) und Google Ads",
    "Mehrsprachige Websites möglich",
    "Komplexe kundenspezifische Integrationen"
   ],
   "p2.btn": "Angebot anfordern →",
   "addon.tag": "Optionales Zusatzmodul",
   "addon.n": "Monatliche Wartung",
   "addon.or": "oder",
   "addon.pm": "€29<span>/Monat</span>",
   "addon.py": "€250<span>/Jahr</span>",
   "addon.b": "Updates, Backups, Sicherheits- und SEO-Prüfungen. Nicht in den Paketen enthalten – Sie entscheiden selbst, ob Sie diese hinzufügen möchten.",
   "srv.how": "<strong>So funktioniert es:</strong> Sie teilen uns Ihre Anforderungen mit, wir ermitteln den Umfang und erstellen auf dieser Grundlage ein faires Preisangebot. Optional bieten wir eine monatliche Wartung an – €29 pro Monat oder €250 pro Jahr –, damit Ihre Website sicher, auf dem neuesten Stand und SEO-optimiert bleibt.",
   "ex.tag": "Zusatzleistungen",
   "ex.h3": "Zusätzliche Dienstleistungen<br><em>zur Beschleunigung Ihres Online-Wachstums.</em>",
   "ex.sub": "Bestellen Sie separat oder in Kombination mit Ihrer Website. Die Preise sind Richtwerte und werden stets in Ihrem persönlichen Angebot bestätigt.",
   "ex.items": [
    {
     "n": "Logo-Gestaltung",
     "p": "€149"
    },
    {
     "n": "Zusätzliche Seite",
     "p": "€79"
    },
    {
     "n": "SEO-Einsteigerpaket",
     "p": "€199"
    },
    {
     "n": "Einrichtung von Google Ads",
     "p": "€149"
    },
    {
     "n": "Mehrsprachige Website",
     "p": "€199"
    },
    {
     "n": "Webshop hinzufügen",
     "p": "Benutzerdefiniert"
    },
    {
     "n": "Notfallreparatur (24 Stunden)",
     "p": "€99"
    },
    {
     "n": "Fotografie (halber Tag)",
     "p": "€199"
    },
    {
     "n": "Integrationen (Buchungssystem, Zahlungsanbieter, Buchhaltung)",
     "p": "€149"
    },
    {
     "n": "CMS – Verwalten Sie Ihre eigenen Inhalte",
     "p": "€149"
    },
    {
     "n": "Individuelle Anfragen – ganz auf Ihre Bedürfnisse zugeschnitten",
     "p": "Auf Anfrage"
    }
   ],
   "faq.tag": "Häufig gestellte Fragen",
   "faq.h2": "Antworten auf Ihre<br><em>wichtigsten Fragen.</em>",
   "faq.items": [
    {
     "q": "Wie viel kostet eine Website bei DRP BuildLab?",
     "a": "Jede Website wird vollständig individuell erstellt. Der Preis hängt vom Arbeitsaufwand für Ihr Projekt ab. Für lokale Unternehmer, die gerade erst anfangen oder eine bestehende Website aktualisieren möchten, bieten wir ein Einsteigerpaket unter <strong>€499</strong> an. Für komplexere Projekte erstellen wir stets ein <strong>individuelles Angebot</strong>. Die monatliche Wartung ist optional: <strong>€29 pro Monat</strong> oder <strong>€250 pro Jahr</strong>."
    },
    {
     "q": "Für wen ist das „€499“-Starterpaket gedacht?",
     "a": "Insbesondere für lokale Unternehmer, die gerade erst anfangen und noch keine Website haben, oder für Unternehmer, die ihre bestehende Website auf eine moderne, professionelle Version umgestalten möchten."
    },
    {
     "q": "Wie hoch sind die monatlichen Wartungskosten?",
     "a": "Die Wartung ist optional und kostet <strong>€29 pro Monat</strong> oder <strong>€250 pro Jahr</strong> – mit der Jahresoption sparen Sie €98. Sie sorgt dafür, dass Ihre Website sicher, schnell und SEO-optimiert bleibt. Es gibt keine Bindung: Sie können monatlich kündigen, und die Website bleibt immer Ihr Eigentum."
    },
    {
     "q": "Wie schnell wird meine Website online sein?",
     "a": "Sobald wir Ihren Text, Ihre Fotos und Ihr Logo erhalten haben, können wir zügig vorgehen. Zu Beginn vereinbaren wir einen <strong>konkreten Liefertermin</strong>, der zum Umfang Ihres Projekts passt – und den halten wir ein. Im Laufe des Prozesses erhalten Sie eine Vorschau zur Freigabe, sodass Sie nie lange warten müssen."
    },
    {
     "q": "Wie funktioniert ein individuelles Angebot?",
     "a": "Bei komplexeren Projekten besprechen wir zunächst in einem kostenlosen Erstgespräch Ihre Anforderungen. Anschließend erstellen wir ein individuelles Angebot auf Basis des Arbeitsaufwands: Seitenanzahl, Funktionen, Integrationen und Wartung. Keine versteckten Kosten – Sie wissen im Voraus, was Sie bezahlen."
    }
   ],
   "soc.tag": "Folgen Sie uns",
   "soc.h2": "Bleiben Sie auf dem Laufenden<br><em>, was wir entwickeln.</em>",
   "soc.p1": "Folgen Sie uns auf Facebook, Instagram und TikTok, um mehr über neue Projekte, Tipps für lokale Unternehmer und einen Blick hinter die Kulissen des DRP BuildLab zu erfahren.",
   "soc.p2": "Hast du eine Frage oder möchtest du einfach nur darüber reden? Schreib uns eine Nachricht über den Kanal, der dir am besten passt – wir antworten immer persönlich.",
   "ct.tag": "Kostenlose Demo",
   "ct.h2": "Sind Sie bereit, <em>online</em> zu gehen<br><em>?</em>",
   "ct.lede": "Fordern Sie eine kostenlose Demo an. Wir rufen Sie an und zeigen Ihnen umgehend ein individuelles Beispiel. Ganz unverbindlich.",
   "ct.lbls": [
    "Telefon",
    "E-Mail",
    "Adresse",
    "Firmennummer",
    "WhatsApp",
    "Instagram",
    "Facebook",
    "TikTok"
   ],
   "f.labels": [
    "Vorname",
    "Nachname",
    "Firmenname",
    "Telefonnummer",
    "E-Mail",
    "An welchen Service denken Sie?",
    "Nachricht (optional)"
   ],
   "f.phs": [
    "John",
    "Smith",
    "Ihr Unternehmen",
    "+32 ...",
    "john@yourcompany.com",
    "Erzählen Sie uns mehr über Ihr Projekt..."
   ],
   "f.sel": [
    "Wählen Sie einen Dienst aus",
    "Starterpaket — €499",
    "Erweiterte Anpassung – Angebot",
    "Vorhandene Website aktualisieren",
    "Nur Zusatzleistungen (Logo, SEO, …)",
    "Ich bin mir noch nicht sicher"
   ],
   "f.btn": "Kostenlose Demo anfordern →",
   "f.succ.h": "Anfrage erhalten!",
   "f.succ.p": "Wir melden uns innerhalb von 24 Stunden bei Ihnen, um einen Termin für Ihre kostenlose Vorführung zu vereinbaren.",
   "f.consent": "Ich bin damit einverstanden, dass DRP BuildLab die Angaben in diesem Formular verwendet, um mich bezüglich dieser Anfrage zu kontaktieren.",
   "f.err.h": "Das Senden ist fehlgeschlagen.",
   "f.err.p": "Beim Versenden ist ein Fehler aufgetreten. Bitte versuche es erneut oder wende dich direkt an uns unter <a href=\"mailto:info@drpbuildlab.com\">info@drpbuildlab.com</a> oder über <a href=\"https://wa.me/32473744431\" target=\"_blank\" rel=\"noopener\">WhatsApp</a>.",
   "ft.tag": "Professionelle Websites für lokale Unternehmen · Vollständig individuell gestaltet",
   "ft.nav": [
    "Navigation",
    "Startseite",
    "Über uns",
    "Preise",
    "Kontakt"
   ],
   "ft.ct": "Kontakt",
   "ft.copy": "© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Belgien · USt-IdNr. BE 1033.313.383",
   "ft.ig": "Folgen Sie uns",
   "sticky.txt": "Starterpaket von €499",
   "sticky.btn": "Kostenlose Demo →",
   "cur.note": "Die Preise auf {cur} wurden zum heutigen Wechselkurs aus Euro umgerechnet und dienen nur als Anhaltspunkt. Die Rechnungsstellung erfolgt in EUR.",
   "wa": "Schreib uns auf WhatsApp",
   "pay.methods": "Banküberweisung",
   "lang.offer": "Diese Seite auf Deutsch ansehen",
   "lang.dismiss": "Schließen",
   "cc.title": "Cookies",
   "cc.body": "Wir verwenden Cookies, um zu sehen, wie die Website genutzt wird, und um unsere Werbung zu messen. Sie entscheiden.",
   "cc.accept": "Alle akzeptieren",
   "cc.reject": "Alle ablehnen",
   "cc.prefs": "Auswählen",
   "cc.save": "Auswahl speichern",
   "cc.nec": "Notwendig",
   "cc.nec.d": "Für den Betrieb der Website erforderlich. Immer aktiv.",
   "cc.ana": "Statistik",
   "cc.ana.d": "Wie Besucher die Website nutzen, damit wir sie verbessern können.",
   "cc.mkt": "Marketing",
   "cc.mkt.d": "Messen, wie gut unsere Werbung funktioniert.",
   "cc.manage": "Cookie-Einstellungen"
  },
ja:{
   "meta.title": "DRP BuildLab — 地元企業向けカスタムウェブサイト | €499 のスターターパッケージ",
   "meta.desc": "DRP BuildLabは、地元起業家向けに、完全にカスタマイズされたウェブサイトを構築しています。「€499」のスターターパッケージや、高度なプロジェクト向けの個別見積もりが利用可能です。また、オプションとして月額€29の月額メンテナンスサービスもご用意しています。",
   "meta.title.about": "会社概要 — DRP BuildLab | 地元企業向けウェブサイト制作スタジオ",
   "meta.desc.about": "起業家によって、起業家のために築かれた。DRP BuildLabの誕生秘話と、地元企業が当社を選ぶ理由。",
   "meta.title.pricing": "価格 — DRP BuildLab | スターターパッケージ €499 または個別のお見積もり",
   "meta.desc.pricing": "€499 のスターターパッケージ、または大規模プロジェクト向けの個別見積もり。€29 による追加サービスおよびオプションのメンテナンス（月額）。",
   "meta.title.contact": "お問い合わせ — DRP BuildLab | 無料デモのお申し込み",
   "meta.desc.contact": "無料デモをご依頼ください。弊社から折り返しお電話を差し上げ、すぐにカスタマイズされた事例をご案内いたします。一切の義務は生じません。",
   "phero.about.eye": "DRP BuildLabについて",
   "phero.about.h": "<em>あなたのウェブサイトを</em>支<br>えている人々<em>。</em>",
   "phero.about.sub": "私たちについて、設立の経緯、そして私たちに何を期待できるか。",
   "phero.pricing.eye": "料金とプラン",
   "phero.pricing.h": "適正な価格、<br><em>予期せぬ追加料金は一切ありません。</em>",
   "phero.pricing.sub": "€499のスターターパッケージ、または個別のお見積もり。メンテナンスはお客様ご自身で追加してください。",
   "phero.contact.eye": "お問い合わせ",
   "phero.contact.h": "<em>インターネットに</em>接続<br>する準備はできましたか<em>？</em>",
   "phero.contact.sub": "無料デモをご依頼ください。弊社から折り返しお電話差し上げ、すぐにカスタマイズされた事例をご案内いたします。",
   "cta.h": "<em>インターネットに</em>接続<br>する準備はできましたか<em>？</em>",
   "cta.sub": "無料デモをご依頼ください。弊社から折り返しお電話し、すぐにカスタマイズされた事例をご案内いたします。一切の義務は生じません。",
   "cta.btn": "無料デモを申し込む →",
   "loader": "読み込み中...",
   "nav.home": "ホーム",
   "nav.pricing": "価格",
   "nav.about": "当社について",
   "nav.contact": "お問い合わせ",
   "nav.cta": "無料体験版 →",
   "hero.eye": "地元企業向けのオーダーメイドウェブサイト",
   "hero.l1": "貴社の事業",
   "hero.l2": "オンラインで。",
   "hero.l3": "<span class=\"h-light\">ついに</span><span class=\"h-accent\">見つけた</span><span class=\"h-light\">。</span>",
   "hero.sub": "ウェブサイトがない？　それなら、ネット上では存在しないも同然です。DRP BuildLabは、地元の起業家のために<strong>完全にオーダーメイドのウェブサイトを</strong>制作しています。料金は、プロジェクトに必要な作業量に基づいて決定されます。常に誠実で、常に透明性を重視しています。",
   "hero.cta1": "無料デモを申し込む →",
   "hero.cta2": "当社の取り組みをご覧ください",
   "hero.scroll": "スクロール",
   "mq": [
    "地域に焦点を当てる",
    "適正な価格設定",
    "モバイル対応",
    "Google向けに最適化済み",
    "一切の心配なし"
   ],
   "zoom.bl": "当社の数値",
   "zoom.br": "さらに下にスクロールしてください",
   "zs": [
    {
     "num": "<span>€</span>0",
     "lbl": "デモと最初の提案にかかる費用",
     "tag": "障壁なし"
    },
    {
     "num": "€499",
     "lbl": "スターターパッケージ — 新規事業向けオーダーメイドウェブサイト",
     "tag": "適正な価格"
    },
    {
     "num": "100<span>％</span>",
     "lbl": "完全オーダーメイドのウェブサイト — 価格は作業範囲に応じて決定されます",
     "tag": "カスタム"
    }
   ],
   "how.tag": "仕組み",
   "how.h2": "ゼロからオンライン化<br>まで<em>、4つのステップ。</em>",
   "how.sub": "技術的な知識は一切必要ありません。最初の問い合わせからウェブサイトの公開まで、すべて弊社にお任せください。",
   "how.steps": [
    {
     "t": "初回電話",
     "b": "弊社から折り返しお電話を差し上げ、すぐにカスタマイズされた事例をご案内いたします。完全無料で、一切の義務は生じません。",
     "d": "一緒に"
    },
    {
     "t": "カスタムデザイン",
     "b": "お客様のご要望に基づき、弊社がウェブサイトを構築いたします。お客様は何もする必要はありません。",
     "d": "私たち"
    },
    {
     "t": "プレビューと承認",
     "b": "承認用のプレビューが送られます。修正内容も含まれています。その後、お客様の独自ドメインでサイトが公開されます。",
     "d": "一緒に"
    },
    {
     "t": "ライブ — そして私たちはここに残る",
     "b": "リリース後も、引き続き皆様をサポートいたします。アップデート、変更、ご質問など、何でもお任せください。",
     "d": "私たち"
    }
   ],
   "ab.logotag": "ウェブサイト・オーダーメイド制作",
   "ab.quote": "「どの地元企業にも<em>、オンライン上で</em>発見されるための公平な機会が与えられるべきです<em>。</em>」",
   "ab.sig": "— DRP BuildLabの創設者たち",
   "ab.nums": [
    "月額メンテナンス費用（任意）",
    "スターターパッケージのウェブサイト",
    "オーダーメイド",
    "隠れたコスト"
   ],
   "ab.tag": "当社について",
   "ab.h2": "起業家によって<br>、<br><em>起業家のために</em>作られた<em>。</em>",
   "ab.p1": "すべては、ある不満から始まりました。私たちは、地元の店――角にある精肉店、いつでも頼れる配管工、長年にわたり同じ常連客の髪を切り続けてきた美容師――が、ネット上ではまったく目立たない存在であることに気づいたのです。",
   "ab.p2": "大手代理店は、完成までに数ヶ月もかかった<strong>ウェブサイトに対し</strong>、<strong>€5,000</strong>に高額な料金を請求しました。そこで私たちは「DRP BuildLab」を立ち上げました。このスタジオは、すべての地元企業に、手頃な価格で、誠実な対応、そして必要な作業に見合った価格設定の<strong>オーダーメイドウェブサイトを提供すべきだと</strong>考えています。",
   "ab.pillars": [
    {
     "t": "何よりも誠実さを重んじる",
     "b": "お約束したことは必ず実現します。隠れた費用や曖昧な見積もりはありません。"
    },
    {
     "t": "必要な時に受けられるメンテナンス",
     "b": "毎月のメンテナンスはオプションです：月額 €29 または年額 €250。これを追加すれば、手間をかけずに、サイトのセキュリティを確保し、常に最新の状態を保ち、検索エンジンに適切にインデックスされる状態を維持できます。"
    },
    {
     "t": "地域に根ざし、デジタルを築く",
     "b": "私たちは地域に根ざしたビジネスのために制作しています。ベルギーからリモートで対応しているため、所在地を問わずお手伝いできます。"
    }
   ],
   "why.tag": "DRP BuildLabを選ぶ理由",
   "why.h2": "当社の強みとは？",
   "why.sub": "オンラインでのビジネス展開を目指す地元企業のために設計されました。面倒な手間も、予期せぬトラブルもありません。",
   "why.cards": [
    {
     "t": "窓口は1か所",
     "b": "チケットシステムも、担当者の入れ替わりもありません。最初の電話からサービス開始後数年経っても、当社の社名と電話番号は変わりません。"
    },
    {
     "t": "地域に焦点を当てて",
     "b": "お客様の地域、お客様の顧客、そして専任のチーム。私たちは現地市場を内側から深く理解しています。"
    },
    {
     "t": "適正な価格設定",
     "b": "隠れた費用は一切ありません。料金は常に事前に確定しています。お支払い金額が正確に把握できます。"
    },
    {
     "t": "いつでもモバイル対応",
     "b": "お客様の70％以上がスマートフォンで検索を行っています。DRP BuildLabで作成されたサイトは、あらゆるデバイスで完璧に動作します。"
    },
    {
     "t": "Google向けに最適化済み",
     "b": "SEO機能が標準搭載されており、顧客が貴社を見つけやすくなります。Googleに貴社のサイトを認識・インデックス登録されるよう確実にサポートします。"
    },
    {
     "t": "生涯のパートナー",
     "b": "製品リリース後も、私たちは引き続き皆様をサポートいたします。単なる一時的なベンダーではなく、真のパートナーとして。"
    }
   ],
   "opp.tag": "隠れたコスト",
   "opp.h2": "€0のオンライン展開には<br>、<em>実際には</em><br>どれくらいの<em>費用</em>がかかるのでしょうか<em>？</em>",
   "opp.sub": "ウェブサイトを持たないことには、コストがかかります。オンライン上で存在感を示せないまま一日が過ぎるごとに、検索で簡単に見つかる競合他社に顧客を奪われてしまうのです。",
   "opp.pts": [
    {
     "t": "78%の人がまずネットで検索する",
     "b": "地元の店に行く前に、人々はGoogleで検索します。検索結果に表示されない？　その顧客にとっては、あなたの店は存在しないも同然です。"
    },
    {
     "t": "毎日が売上機会の損失だ",
     "b": "顧客はオンラインで貴社を見つけられず、競合他社へと流れてしまいます。ウェブサイトがないまま過ごす1日1日が、競合他社に有利に働く日となります。"
    },
    {
     "t": "競合他社がオンラインです",
     "b": "あなたが手をこまねいている間に、競合他社はオンラインでの評判を高めています。待つ時間が長ければ長いほど、追いつくのは難しくなります。"
    },
    {
     "t": "信頼こそが収益である",
     "b": "プロフェッショナルなウェブサイトは信頼を築きます。顧客は、真面目な印象を与える企業をより積極的に選ぶ傾向があります。"
    }
   ],
   "opp.boxtitle": "年間コストの算出",
   "opp.rows": [
    [
     "週あたりの見逃し顧客数（推定）",
     "2～5"
    ],
    [
     "顧客1人あたりの平均額",
     "€80"
    ],
    [
     "ウェブサイトがないことで年間で失われるもの",
     "−€8,320"
    ],
    [
     "投資用DRP BuildLab（スターターパッケージ）",
     "+€499"
    ],
    [
     "年次・月次メンテナンス",
     "+€348"
    ]
   ],
   "opp.totlbl": "見込まれる正味の便益",
   "opp.totval": "+€7,473/年",
   "opp.note": "<strong>結論は単純です。</strong>ウェブサイトにかかる費用は、ウェブサイトを持たないことで失う利益に比べれば、ごくわずかなものです。待つことの方が、投資することよりもコストがかかります。",
   "comp.tag": "市場の概要",
   "comp.h2": "<em>私たちほど</em>安く提供<br>できるところはありません<em>。</em>",
   "comp.sub": "私たちはこれを隠したりはしません――むしろ誇りに思っています。他社の類似サイトがどれくらいの価格なのか、ぜひご自身でご確認ください。",
   "comp.cols": [
    "プロバイダー",
    "開始価格",
    "メンテナンス",
    "モバイル"
   ],
   "comp.us": "私たち",
   "comp.rows": [
    {
     "n": "DRP BuildLab",
     "p": "€499",
     "m": "€29/月",
     "us": true
    },
    {
     "n": "フリーランサー",
     "p": "€800–€2,500",
     "m": "含まれていません"
    },
    {
     "n": "デジタルエージェンシー",
     "p": "€2,500–€8,000",
     "m": "割高な追加料金"
    },
    {
     "n": "大手代理店",
     "p": "€8,000+",
     "m": "割高な追加料金"
    },
    {
     "n": "Wix / Squarespace",
     "p": "€200 –€500/年",
     "m": "自分でやってみよう"
    }
   ],
   "comp.note": "<strong>注：</strong>Wixのようなウェブサイト構築ツールも、年間費用は同程度かかりますが、専門家の助けやサポートなしで、すべてを自分で行う必要があります。DRP BuildLabでは、ご自身で何も行う必要はなく、いつでもスタッフがサポートいたします。",
   "srv.tag": "当社のアプローチ",
   "srv.h2": "すべての起業家のために<em>オーダーメイド</em><br><em>された</em>ウェブサイト。",
   "srv.sub": "DRP BuildLabでは、すべてのウェブ<strong>サイトを完全オーダーメイドで</strong>制作しています。料金は常に、お客様のプロジェクトに費やす作業量に基づいて算出されます。決まったパッケージプランはなく、予期せぬ追加料金も一切ありません。お客様の実際のニーズに合わせた、適正な見積もりをご提示いたします。",
   "p1.badge": "まずは",
   "p1.name": "スターターパッケージ",
   "p1.period": "1回限り — メンテナンスは任意",
   "p1.desc": "まだウェブサイトを立ち上げていない、<strong>起業したばかりの地元の起業家の方</strong>や、既存のウェブサイトをモダンでプロフェッショナルなデザインにリニューアルしたいと考えている起業家の方に最適です。",
   "p1.feats": [
    "お客様のビジネスに合わせて完全にカスタマイズされたウェブサイト",
    "モバイル対応（レスポンシブデザイン）",
    "お問い合わせフォームとWhatsAppの連携",
    "Google マップと基本的な SEO 対策",
    "開始から本番まで、きめ細やかなサポート"
   ],
   "p1.btn": "無料デモを申し込む →",
   "p2.name": "高度なカスタマイズ",
   "p2.price": "お見積もり（個別<br>）",
   "p2.period": "個人的な格言 — メンテナンスは任意",
   "p2.desc": "<strong>規模が大きい、あるいは複雑なプロジェクト</strong>（オンラインショップ、予約システム、多言語サイト、システム連携、独自の機能など）に取り組む起業家の皆様向けです。料金はプロジェクトの規模に応じて決定されます。",
   "p2.feats": [
    "カスタムページの数に制限なし",
    "オンラインショップ、予約システム、または会員ポータル",
    "高度なSEOとGoogle広告",
    "多言語対応のウェブサイトが可能",
    "複雑なカスタム連携"
   ],
   "p2.btn": "お見積りをご依頼ください →",
   "addon.tag": "オプションのアドオン",
   "addon.n": "毎月のメンテナンス",
   "addon.or": "または",
   "addon.pm": "€29<span>/月</span>",
   "addon.py": "€250<span>/年</span>",
   "addon.b": "アップデート、バックアップ、セキュリティ対策、SEOチェック。これらのサービスはパッケージには含まれていません。追加するかどうかはお客様ご自身でお決めください。",
   "srv.how": "<strong>仕組み：</strong>お客様のご要望をお聞かせいただければ、当社が作業範囲を評価し、それに基づいて適正な価格をご提示いたします。オプションとして月額€29、または年額€250の月額メンテナンスサービスもご用意しており、お客様のウェブサイトを安全に保ち、常に最新の状態に更新し、SEO対策を施した状態に維持します。",
   "ex.tag": "追加サービス",
   "ex.h3": "<em>オンラインでの成長を加速させる</em>追加サービス<br><em>。</em>",
   "ex.sub": "ウェブサイトとは別に、またはウェブサイトと組み合わせてご注文いただけます。価格は目安であり、最終的な金額は個別のお見積りで確定いたします。",
   "ex.items": [
    {
     "n": "ロゴデザイン",
     "p": "€149"
    },
    {
     "n": "追加ページ",
     "p": "€79"
    },
    {
     "n": "SEOスターターパッケージ",
     "p": "€199"
    },
    {
     "n": "Google Adsの設定",
     "p": "€149"
    },
    {
     "n": "多言語サイト",
     "p": "€199"
    },
    {
     "n": "ウェブショップを追加する",
     "p": "カスタム"
    },
    {
     "n": "緊急修理（24時間対応）",
     "p": "€99"
    },
    {
     "n": "写真撮影（半日）",
     "p": "€199"
    },
    {
     "n": "連携機能（予約システム、決済サービス、会計ソフト）",
     "p": "€149"
    },
    {
     "n": "CMS — コンテンツを自分で管理",
     "p": "€149"
    },
    {
     "n": "ご要望に応じたオーダーメイドサービス — お客様のニーズに合わせて",
     "p": "ご要望に応じて"
    }
   ],
   "faq.tag": "よくある質問",
   "faq.h2": "皆様<br>から寄せられる<em>最も重要な質問</em>への回答<em>。</em>",
   "faq.items": [
    {
     "q": "DRP BuildLabでのウェブサイトの制作費用はいくらですか？",
     "a": "すべてのウェブサイトは完全オーダーメイドで制作されます。料金は、プロジェクトにかかる作業量によって異なります。起業したばかりの地元起業家の方や、既存のウェブサイトを更新したい方に向けて、<strong>€499</strong> からスターターパッケージをご用意しています。より大規模なプロジェクトについては、その都度<strong>個別</strong>にお見積もりいたします。毎月のメンテナンスはオプションで、<strong>月額 €29</strong> または<strong>年額 €250</strong> となります。"
    },
    {
     "q": "「€499」のスターターパッケージは、どのような方におすすめですか？",
     "a": "具体的には、まだウェブサイトを所有しておらず、起業したばかりの地元の起業家の方、あるいは既存のウェブサイトをモダンでプロフェッショナルなデザインにリニューアルしたいと考えている起業家の方を対象としています。"
    },
    {
     "q": "毎月の維持費はいくらですか？",
     "a": "メンテナンスは任意で、<strong>月額€29</strong>、または<strong>年額€250</strong>です。年額プランをご利用いただくと、€98の節約になります。これにより、ウェブサイトのセキュリティと高速性を維持し、SEO対策も最適化されます。契約の縛りはありません。毎月解約が可能で、ウェブサイトは常にあなたの所有物として残ります。"
    },
    {
     "q": "私のウェブサイトは、どのくらいで公開されますか？",
     "a": "原稿、写真、ロゴをご提供いただければ、迅速に作業を進められます。まず、プロジェクトの範囲に合わせて<strong>具体的な納期</strong>を合意し、その納期を厳守します。作業の途中では、承認のためのプレビューをお送りしますので、お客様にお待たせすることはありません。"
    },
    {
     "q": "個別見積もりはどのように行われるのですか？",
     "a": "大規模なプロジェクトについては、まず無料の初回相談を通じてお客様のニーズを確認させていただきます。その後、ページ数、機能、連携機能、メンテナンスなど、作業量に基づいて個別のお見積もりを作成いたします。隠れた費用は一切ありません。お支払いいただく金額は事前に明確にご案内いたします。"
    }
   ],
   "soc.tag": "フォローしてください",
   "soc.h2": "<em>私たちの開発状況について、</em>最新情報<br>をお見逃しなく<em>。</em>",
   "soc.p1": "Facebook、Instagram、TikTokで私たちをフォローして、新しいプロジェクトや地元の起業家向けのヒント、DRP BuildLabの舞台裏の様子をチェックしてください。",
   "soc.p2": "ご質問がありますか？それとも、ただお話ししたいだけですか？ご都合の良い方法でお気軽にご連絡ください。必ず私から直接お返事いたします。",
   "ct.tag": "無料体験版",
   "ct.h2": "<em>インターネットに</em>接続<br>する準備はできましたか<em>？</em>",
   "ct.lede": "無料デモをご依頼ください。弊社から折り返しお電話を差し上げ、すぐにカスタマイズされた事例をご案内いたします。一切の義務は生じません。",
   "ct.lbls": [
    "電話",
    "電子メール",
    "住所",
    "会社番号",
    "WhatsApp",
    "Instagram",
    "Facebook",
    "TikTok"
   ],
   "f.labels": [
    "名",
    "姓",
    "会社名",
    "電話番号",
    "電子メール",
    "どのサービスをお考えですか？",
    "メッセージ（任意）"
   ],
   "f.phs": [
    "ジョン",
    "スミス",
    "御社",
    "+32 ...",
    "john@yourcompany.com",
    "そのプロジェクトについて、もっと詳しく教えてください…"
   ],
   "f.sel": [
    "サービスを選択してください",
    "スターターパッケージ — €499",
    "高度なカスタマイズ — 見積もり",
    "既存のウェブサイトを更新する",
    "追加サービスのみ（ロゴ、SEOなど）",
    "まだよくわかりません"
   ],
   "f.btn": "無料デモを申し込む →",
   "f.succ.h": "リクエストを受信しました！",
   "f.succ.p": "24時間以内にご連絡を差し上げ、無料デモの日程を調整させていただきます。",
   "f.consent": "DRP BuildLabが、このリクエストに関して私に連絡を取るために、本フォームに記載された情報を使用することに同意します。",
   "f.err.h": "送信に失敗しました。",
   "f.err.p": "送信中に問題が発生しました。もう一度お試しいただくか、<a href=\"mailto:info@drpbuildlab.com\">info@drpbuildlab.com</a> または <a href=\"https://wa.me/32473744431\" target=\"_blank\" rel=\"noopener\">WhatsApp</a> にて直接お問い合わせください。",
   "ft.tag": "地元企業向けのプロフェッショナルなウェブサイト · 完全オーダーメイド",
   "ft.nav": [
    "ナビゲーション",
    "ホーム",
    "当社について",
    "価格",
    "お問い合わせ"
   ],
   "ft.ct": "お問い合わせ",
   "ft.copy": "© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, ベルギー · VAT BE 1033.313.383",
   "ft.ig": "フォローしてください",
   "sticky.txt": "€499のスターターパッケージ",
   "sticky.btn": "無料体験版 →",
   "cur.note": "{cur} における価格は、本日の為替レートでユーロから換算されたものであり、あくまで目安です。請求書はユーロ建てとなります。",
   "wa": "WhatsAppでメッセージをお送りください",
   "pay.methods": "銀行振込",
   "lang.offer": "このページを日本語で表示する",
   "lang.dismiss": "閉じる",
   "cc.title": "Cookie",
   "cc.body": "サイトの利用状況の把握と広告の効果測定のために Cookie を使用します。選択はお客様にお任せします。",
   "cc.accept": "すべて許可",
   "cc.reject": "すべて拒否",
   "cc.prefs": "選択する",
   "cc.save": "選択を保存",
   "cc.nec": "必須",
   "cc.nec.d": "サイトの動作に必要です。常に有効です。",
   "cc.ana": "分析",
   "cc.ana.d": "サイトの利用状況を把握し、改善に役立てます。",
   "cc.mkt": "マーケティング",
   "cc.mkt.d": "広告の効果を測定します。",
   "cc.manage": "Cookie 設定"
  },
pt:{
   "meta.title": "DRP BuildLab — Sites personalizados para empresas locais | Pacote Inicial em €499",
   "meta.desc": "A DRP BuildLab desenvolve sites totalmente personalizados para empreendedores locais. Pacote inicial a partir de €499, ou um orçamento personalizado para projetos avançados — com manutenção mensal opcional a partir de €29 por mês.",
   "meta.title.about": "Sobre nós — DRP BuildLab | Estúdio de criação de sites para empresas locais",
   "meta.desc.about": "Criado por empreendedores, para empreendedores. A história por trás do DRP BuildLab e por que as empresas locais nos escolhem.",
   "meta.title.pricing": "Preços — DRP BuildLab | Pacote inicial €499 ou solicite um orçamento personalizado",
   "meta.desc.pricing": "Pacote inicial em €499 ou um orçamento personalizado para projetos avançados. Serviços adicionais e manutenção opcional em €29 por mês.",
   "meta.title.contact": "Contato — DRP BuildLab | Solicite uma demonstração gratuita",
   "meta.desc.contact": "Solicite uma demonstração gratuita. Entraremos em contato com você e mostraremos um exemplo personalizado imediatamente. Sem compromisso.",
   "phero.about.eye": "Sobre o DRP BuildLab",
   "phero.about.h": "As pessoas por<br>trás <em>do seu site.</em>",
   "phero.about.sub": "Quem somos, por que começamos e o que você pode esperar de nós.",
   "phero.pricing.eye": "Preços e pacotes",
   "phero.pricing.h": "Preços justos,<br><em>sem surpresas.</em>",
   "phero.pricing.sub": "Um pacote inicial no site €499 ou um orçamento personalizado. A manutenção fica por sua conta.",
   "phero.contact.eye": "Contato",
   "phero.contact.h": "Pronto para entrar<br><em>na internet?</em>",
   "phero.contact.sub": "Solicite uma demonstração gratuita. Entraremos em contato com você e mostraremos um exemplo personalizado imediatamente.",
   "cta.h": "Pronto para entrar<br><em>na internet?</em>",
   "cta.sub": "Solicite uma demonstração gratuita. Entraremos em contato com você e apresentaremos um exemplo personalizado imediatamente. Sem compromisso.",
   "cta.btn": "Solicite uma demonstração gratuita →",
   "loader": "Carregando...",
   "nav.home": "Página inicial",
   "nav.pricing": "Preços",
   "nav.about": "Sobre nós",
   "nav.contact": "Contato",
   "nav.cta": "Demonstração gratuita →",
   "hero.eye": "Sites personalizados para empresas locais",
   "hero.l1": "Sua empresa",
   "hero.l2": "online.",
   "hero.l3": "<span class=\"h-accent\">Encontrei,</span> <span class=\"h-light\">finalmente.</span>",
   "hero.sub": "Não tem site? Então você não existe na internet. A DRP BuildLab cria <strong>sites totalmente personalizados</strong> para empreendedores locais — o preço é baseado na quantidade de trabalho que seu projeto exige. Sempre com honestidade, sempre com transparência.",
   "hero.cta1": "Solicite uma demonstração gratuita →",
   "hero.cta2": "Conheça nossa abordagem",
   "hero.scroll": "Rolar a tela",
   "mq": ["Foco local","Preços justos","Otimizado para dispositivos móveis","Otimizado para o Google","Sem nenhuma preocupação"],
   "zoom.bl": "Nossos números",
   "zoom.br": "Role a página para baixo",
   "zs": [{"num":"<span>€</span>0","lbl":"Quanto custam sua demonstração e sua primeira proposta","tag":"Sem barreira"},{"num":"€499","lbl":"Pacote inicial — site personalizado para novas empresas","tag":"Preço justo"},{"num":"100<span>%</span>","lbl":"Sites totalmente personalizados — preço com base no escopo","tag":"Personalizado"}],
   "how.tag": "Como funciona",
   "how.h2": "Do zero à presença online<br><em>em 4 etapas.</em>",
   "how.sub": "Não é necessário ter conhecimento técnico. Cuidamos de tudo, desde o primeiro contato até a publicação do site.",
   "how.steps": [{"t":"Primeira ligação","b":"Entraremos em contato com você e mostraremos um exemplo personalizado imediatamente. Totalmente gratuito e sem compromisso.","d":"Juntos"},{"t":"Design personalizado","b":"Com base no que você deseja, criamos seu site. Você não precisa fazer nada.","d":"Nós"},{"t":"Pré-visualização e aprovação","b":"Você recebe uma prévia para aprovação, incluindo as revisões. Em seguida, seu site entra no ar com seu próprio domínio.","d":"Juntos"},{"t":"Ao vivo — e a gente fica","b":"Depois do lançamento, continuamos à sua disposição. Atualizações, alterações, dúvidas — nós cuidamos de tudo.","d":"Nós"}],
   "ab.logotag": "Sites · desenvolvidos sob medida",
   "ab.quote": "\"Toda empresa local merece uma chance justa de ser encontrada <em>na internet.</em>\"",
   "ab.sig": "— Os fundadores do DRP BuildLab",
   "ab.nums": ["Manutenção mensal (opcional)","Site do pacote inicial","Feito sob medida","Custos ocultos"],
   "ab.tag": "Sobre nós",
   "ab.h2": "Criado por<br>empreendedores,<br><em>para empreendedores.</em>",
   "ab.p1": "Tudo começou com uma frustração. Percebemos que as empresas locais — o açougueiro da esquina, o encanador que está sempre disponível, o cabeleireiro que corta o cabelo dos mesmos clientes há anos — eram completamente invisíveis na internet.",
   "ab.p2": "Grandes agências cobravam de <strong>€5,000 por um site</strong> que levava meses para ficar pronto. Por isso, criamos o DRP BuildLab: um estúdio que acredita que toda empresa local <strong>merece um site personalizado</strong> — acessível, honesto e com um preço que corresponda ao trabalho envolvido.",
   "ab.pillars": [{"t":"A honestidade acima de tudo","b":"O que prometemos, cumprimos. Sem custos ocultos, sem orçamentos vagos."},{"t":"Manutenção quando você quiser","b":"A manutenção mensal é opcional: €29 por mês ou €250 por ano. Adicione esse serviço e seu site permanecerá seguro, atualizado e fácil de ser encontrado — sem que você precise se preocupar com isso."},{"t":"Pense localmente, construa digitalmente","b":"Trabalhamos com empresas locais — aquelas cujos clientes estão procurando por serviços nas proximidades. Trabalhamos remotamente da Bélgica, portanto, não importa onde você esteja: isso não determina se podemos ajudá-lo."}],
   "why.tag": "Por que o DRP BuildLab?",
   "why.h2": "O que nos diferencia?",
   "why.sub": "Criado para empresas locais que querem estar na internet — sem complicações, sem surpresas.",
   "why.cards": [{"t":"Um único ponto de contato","b":"Sem sistema de tickets, sem troca de gerentes de conta. Você tem nosso nome e nosso número — desde a primeira ligação até anos após o lançamento."},{"t":"Foco local","b":"Sua região, seus clientes, uma equipe dedicada. Conhecemos o mercado local por dentro."},{"t":"Preços justos","b":"Sem custos ocultos. Sempre definidos com antecedência. Você sabe exatamente quanto vai pagar."},{"t":"Sempre pronto para dispositivos móveis","b":"Mais de 70% dos seus clientes fazem pesquisas pelo celular. Todos os sites do DRP BuildLab funcionam perfeitamente em qualquer dispositivo."},{"t":"Otimizado para o Google","b":"SEO integrado para que os clientes encontrem você. Nós garantimos que o Google reconheça e indexe seu site."},{"t":"Parceiro para toda a vida","b":"Mesmo após o lançamento, continuaremos à sua disposição. Não somos apenas um fornecedor pontual, mas um verdadeiro parceiro."}],
   "opp.tag": "O custo oculto",
   "opp.h2": "Quanto <em>custa, na verdade,</em><br>a presença online<br>de uma empresa do tipo “€0”?",
   "opp.sub": "Não ter um site não sai de graça. A cada dia que passa sem uma presença online, você perde clientes para os concorrentes que podem ser encontrados na internet.",
   "opp.pts": [{"t":"78% fazem uma pesquisa online primeiro","b":"Antes de visitar um estabelecimento local, as pessoas pesquisam no Google. Não aparece lá? Para esse cliente, você não existe."},{"t":"Cada dia que passa representa uma perda de receita","b":"Os clientes não conseguem encontrá-lo na internet e acabam indo para a concorrência. Cada dia sem um site é um dia em que seu concorrente sai ganhando."},{"t":"Seu concorrente está online","b":"Enquanto você espera, seu concorrente constrói sua reputação online. Quanto mais você demora, mais difícil fica recuperar o atraso."},{"t":"Credibilidade é receita","b":"Um site profissional inspira confiança. Os clientes tendem a escolher mais facilmente uma empresa que transmita seriedade."}],
   "opp.boxtitle": "Cálculo dos custos por ano",
   "opp.rows": [["Clientes perdidos por semana (estimativa)","2–5"],["Valor médio por cliente","€80"],["Perda anual por não ter um site","−€8,320"],["Investimento no DRP BuildLab (Pacote inicial)","+€499"],["Manutenção mensal anual","+€348"]],
   "opp.totlbl": "Benefício líquido potencial",
   "opp.totval": "+€7,473/ano",
   "opp.note": "<strong>A conclusão é simples:</strong> o custo de um site é uma fração do que você deixa de ganhar por não ter um. Esperar custa mais do que investir.",
   "comp.tag": "Visão geral do mercado",
   "comp.h2": "Ninguém oferece preços<br>mais baixos <em>do que nós.</em>",
   "comp.sub": "Não escondemos isso — temos orgulho disso. Veja por si mesmo quanto custam sites semelhantes em outros lugares.",
   "comp.cols": ["Provedor","Preço inicial","Manutenção","Celular"],
   "comp.us": "Nós",
   "comp.rows": [{"n":"DRP BuildLab","p":"€499","m":"€29/mês","us":true},{"n":"Freelancer","p":"€800–€2,500","m":"Não incluído"},{"n":"Agência digital","p":"€2,500–€8,000","m":"Extrato caro"},{"n":"Grande agência","p":"€8,000+","m":"Extrato caro"},{"n":"Wix / Squarespace","p":"€200 –€500/ano","m":"Faça você mesmo"}],
   "comp.note": "<strong>Observação:</strong> criadores de sites como o Wix têm um custo anual semelhante — mas você faz tudo sozinho, sem ajuda ou suporte profissional. No DRP BuildLab, você não precisa fazer nada sozinho e sempre há alguém à sua disposição.",
   "srv.tag": "Nossa abordagem",
   "srv.h2": "Sites <em>criados sob medida</em><br>para cada empresário.",
   "srv.sub": "Na DRP BuildLab, cada site é <strong>totalmente personalizado</strong>. O preço é sempre baseado na quantidade de trabalho que dedicamos ao seu projeto. Sem pacotes obrigatórios, sem surpresas — apenas um orçamento justo que atende às suas necessidades reais.",
   "p1.badge": "Para começar",
   "p1.name": "Pacote Inicial",
   "p1.period": "único — manutenção opcional",
   "p1.desc": "Ideal para <strong>empreendedores locais que estão apenas começando</strong> e ainda não têm um site — ou para aqueles que desejam atualizar seu site atual para uma versão moderna e profissional.",
   "p1.feats": ["Site totalmente personalizado para o seu negócio","Otimizado para dispositivos móveis (design responsivo)","Formulário de contato + integração com o WhatsApp","Google Maps e otimização básica de SEO","Acompanhamento personalizado do início até a entrada em operação"],
   "p1.btn": "Solicite uma demonstração gratuita →",
   "p2.name": "Personalização avançada",
   "p2.price": "Orçamento personalizado<br>",
   "p2.period": "citação pessoal — manutenção opcional",
   "p2.desc": "Para empreendedores com <strong>projetos maiores ou mais complexos</strong>: lojas virtuais, sistemas de reservas, sites multilíngues, integrações ou funcionalidades exclusivas. O preço é determinado pelo escopo do seu projeto.",
   "p2.feats": ["Páginas personalizadas ilimitadas","Loja virtual, sistema de reservas ou portal de membros","SEO avançado e Google Ads","É possível criar sites multilíngues","Integrações personalizadas complexas"],
   "p2.btn": "Solicite um orçamento →",
   "addon.tag": "Complemento opcional",
   "addon.n": "Manutenção mensal",
   "addon.or": "ou",
   "addon.pm": "€29<span>/mês</span>",
   "addon.py": "€250<span>/ano</span>",
   "addon.b": "Atualizações, backups, segurança e verificações de SEO. Não incluídos nos pacotes — você decide se deseja adicioná-los.",
   "srv.how": "<strong>Como funciona:</strong> você nos diz o que precisa, a gente avalia o escopo e define um preço justo com base no trabalho. A manutenção mensal está disponível como opção — €29 por mês ou €250 por ano — para que seu site permaneça seguro, atualizado e otimizado para SEO.",
   "ex.tag": "Serviços adicionais",
   "ex.h3": "Serviços<br>adicionais <em>para acelerar o seu crescimento online.</em>",
   "ex.sub": "Encomende separadamente ou em conjunto com o seu site. Os preços são meramente indicativos e sempre confirmados no seu orçamento personalizado.",
   "ex.items": [{"n":"Design de logotipo","p":"€149"},{"n":"Página extra","p":"€79"},{"n":"Pacote básico de SEO","p":"€199"},{"n":"Configuração do Google Ads","p":"€149"},{"n":"Site multilíngue","p":"€199"},{"n":"Adicionar loja virtual","p":"Personalizado"},{"n":"Reparo de emergência (24 horas)","p":"€99"},{"n":"Fotografia (meio dia)","p":"€199"},{"n":"Integrações (sistema de reservas, provedor de pagamentos, contabilidade)","p":"€149"},{"n":"CMS — gerencie seu próprio conteúdo","p":"€149"},{"n":"Solicitações personalizadas — adaptadas às suas necessidades","p":"Mediante solicitação"}],
   "faq.tag": "Perguntas frequentes",
   "faq.h2": "Respostas às suas<br><em>perguntas mais importantes.</em>",
   "faq.items": [{"q":"Quanto custa um site na DRP BuildLab?","a":"Cada site é totalmente personalizado. O preço depende da quantidade de trabalho necessária para o seu projeto. Para empreendedores locais que estão começando ou querem atualizar um site já existente, oferecemos um pacote inicial em <strong>€499</strong>. Para projetos mais complexos, sempre elaboramos um <strong>orçamento personalizado</strong>. A manutenção mensal é opcional: <strong>€29 por mês</strong> ou <strong>€250 por ano</strong>."},{"q":"Para quem é destinado o pacote inicial do “€499”?","a":"Especialmente para empreendedores locais que estão apenas começando e ainda não têm um site, ou para aqueles que desejam atualizar seu site atual para uma versão moderna e profissional."},{"q":"Quanto custa a manutenção mensal?","a":"A manutenção é opcional e custa <strong>€29 por mês</strong>, ou <strong>€250 por ano</strong> — a opção anual economiza €98. Ela mantém seu site seguro, rápido e otimizado para SEO. Você não fica preso a nenhum contrato: pode cancelar a qualquer momento, e o site sempre continuará sendo seu."},{"q":"Em quanto tempo meu site estará no ar?","a":"Assim que recebermos seu texto, suas fotos e seu logotipo, poderemos avançar rapidamente. Logo no início, combinamos uma <strong>data de entrega concreta</strong> que se adapte ao escopo do seu projeto — e a cumprimos. Ao longo do processo, você receberá uma prévia para aprovação, para que nunca fique esperando."},{"q":"Como funciona um orçamento personalizado?","a":"Para projetos mais complexos, começamos analisando suas necessidades em uma ligação introdutória gratuita. Em seguida, elaboramos um orçamento personalizado com base no volume de trabalho: número de páginas, funcionalidades, integrações e manutenção. Sem custos ocultos — você sabe com antecedência quanto vai pagar."}],
   "soc.tag": "Siga-nos",
   "soc.h2": "Fique por dentro<br><em>do que estamos desenvolvendo.</em>",
   "soc.p1": "Siga-nos no Facebook, Instagram e TikTok para conhecer novos projetos, dicas para empreendedores locais e ver os bastidores do DRP BuildLab.",
   "soc.p2": "Tem alguma dúvida ou só quer conversar sobre o assunto? Mande uma mensagem para a gente pelo canal que for mais conveniente para você — sempre respondemos pessoalmente.",
   "ct.tag": "Demonstração gratuita",
   "ct.h2": "Pronto para entrar<br><em>na internet?</em>",
   "ct.lede": "Solicite uma demonstração gratuita. Entraremos em contato com você por telefone e mostraremos um exemplo personalizado imediatamente. Sem compromisso.",
   "ct.lbls": ["Telefone","E-mail","Endereço","Número da empresa","WhatsApp","Instagram","Facebook","TikTok"],
   "f.labels": ["Nome","Sobrenome","Nome da empresa","Número de telefone","E-mail","Qual serviço você tem em mente?","Mensagem (opcional)"],
   "f.phs": ["John","Smith","Sua empresa","+32 ...","john@yourcompany.com","Conte-nos mais sobre o seu projeto..."],
   "f.sel": ["Escolha um serviço","Pacote inicial — €499","Personalização avançada — orçamento","Atualizar o site existente","Apenas serviços adicionais (logotipo, SEO, …)","Ainda não tenho certeza"],
   "f.btn": "Solicite uma demonstração gratuita →",
   "f.succ.h": "Solicitação recebida!",
   "f.succ.p": "Entraremos em contato com você em até 24 horas para agendar sua demonstração gratuita.",
   "f.consent": "Concordo que a DRP BuildLab possa utilizar os dados contidos neste formulário para entrar em contato comigo a respeito desta solicitação.",
   "f.err.h": "Falha no envio.",
   "f.err.p": "Ocorreu um erro durante o envio. Tente novamente ou entre em contato conosco diretamente pelo e-mail <a href=\"mailto:info@drpbuildlab.com\">info@drpbuildlab.com</a> ou pelo <a href=\"https://wa.me/32473744431\" target=\"_blank\" rel=\"noopener\">WhatsApp</a>.",
   "ft.tag": "Sites profissionais para empresas locais · Totalmente personalizados",
   "ft.nav": ["Navegação","Página inicial","Sobre nós","Preços","Contato"],
   "ft.ct": "Contato",
   "ft.copy": "© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Bélgica · VAT BE 1033.313.383",
   "ft.ig": "Siga-nos",
   "sticky.txt": "Pacote inicial da €499",
   "sticky.btn": "Demonstração gratuita →",
   "cur.note": "Os preços em {cur} são convertidos do euro à taxa de câmbio de hoje e são meramente informativos. O faturamento é feito em euros.",
   "wa": "Envie-nos uma mensagem pelo WhatsApp",
   "pay.methods": "Transferência bancária",
   "lang.offer": "Ver esta página em português",
   "lang.dismiss": "Fechar",
   "cc.title": "Cookies",
   "cc.body": "Usamos cookies para ver como o site é usado e para medir a nossa publicidade. Você escolhe.",
   "cc.accept": "Aceitar tudo",
   "cc.reject": "Recusar tudo",
   "cc.prefs": "Escolher",
   "cc.save": "Salvar escolhas",
   "cc.nec": "Necessários",
   "cc.nec.d": "Precisos para o site funcionar. Sempre ativos.",
   "cc.ana": "Estatísticas",
   "cc.ana.d": "Como os visitantes usam o site, para podermos melhorá-lo.",
   "cc.mkt": "Marketing",
   "cc.mkt.d": "Medir o desempenho da nossa publicidade.",
   "cc.manage": "Configurações de cookies"
  },
it:{
   "meta.title": "DRP BuildLab — Siti web personalizzati per aziende locali | Pacchetto base su €499",
   "meta.desc": "DRP BuildLab realizza siti web completamente personalizzati per imprenditori locali. Pacchetto base disponibile su €499 oppure preventivo personalizzato per progetti avanzati — con servizio di manutenzione mensile opzionale su €29 al mese.",
   "meta.title.about": "Chi siamo — DRP BuildLab | Agenzia di sviluppo siti web per aziende locali",
   "meta.desc.about": "Creato da imprenditori, per gli imprenditori. La storia di DRP BuildLab e i motivi per cui le aziende locali ci scelgono.",
   "meta.title.pricing": "Prezzi — DRP BuildLab | Pacchetto base €499 oppure richiedi un preventivo personalizzato",
   "meta.desc.pricing": "Pacchetto base disponibile su €499 oppure preventivo personalizzato per progetti avanzati. Servizi aggiuntivi e manutenzione opzionale disponibili su €29 al mese.",
   "meta.title.contact": "Contatti — DRP BuildLab | Richiedi una demo gratuita",
   "meta.desc.contact": "Richiedi una demo gratuita. Ti chiameremo subito per mostrarti un esempio personalizzato. Senza alcun impegno.",
   "phero.about.eye": "Informazioni su DRP BuildLab",
   "phero.about.h": "Le persone che stanno dietro<br><em>al tuo sito web.</em>",
   "phero.about.sub": "Chi siamo, perché abbiamo avviato questa attività e cosa potete aspettarvi da noi.",
   "phero.pricing.eye": "Prezzi e pacchetti",
   "phero.pricing.h": "Prezzi equi,<br><em>senza sorprese.</em>",
   "phero.pricing.sub": "Un pacchetto iniziale da €499 oppure un preventivo personalizzato. La manutenzione è a tua discrezione.",
   "phero.contact.eye": "Contatti",
   "phero.contact.h": "Sei pronto a metterti<br><em>online?</em>",
   "phero.contact.sub": "Richiedi una demo gratuita. Ti chiameremo subito per mostrarti un esempio personalizzato.",
   "cta.h": "Sei pronto a metterti<br><em>online?</em>",
   "cta.sub": "Richiedi una demo gratuita. Ti chiameremo subito per mostrarti un esempio personalizzato. Senza alcun impegno.",
   "cta.btn": "Richiedi una demo gratuita →",
   "loader": "Caricamento in corso...",
   "nav.home": "Home",
   "nav.pricing": "Prezzi",
   "nav.about": "Chi siamo",
   "nav.contact": "Contatti",
   "nav.cta": "Prova gratuita →",
   "hero.eye": "Siti web personalizzati per le aziende locali",
   "hero.l1": "La tua attività",
   "hero.l2": "online.",
   "hero.l3": "<span class=\"h-light\">Finalmente</span> <span class=\"h-accent\">l'ho trovato.</span>",
   "hero.sub": "Non hai un sito web? Allora online non esisti. DRP BuildLab realizza <strong>siti web completamente personalizzati</strong> per imprenditori locali: il prezzo dipende dalla mole di lavoro richiesta dal tuo progetto. Sempre onesti, sempre trasparenti.",
   "hero.cta1": "Richiedi una demo gratuita →",
   "hero.cta2": "Scopri il nostro approccio",
   "hero.scroll": "Scorri",
   "mq": ["Attenzione al territorio","Prezzi equi","Ottimizzato per dispositivi mobili","Ottimizzato per Google","Senza alcuna preoccupazione"],
   "zoom.bl": "I nostri dati",
   "zoom.br": "Scorri più in basso",
   "zs": [{"num":"0 <span>€</span>","lbl":"Quanto costano la tua demo e la tua prima proposta","tag":"Nessuna barriera"},{"num":"€499","lbl":"Pacchetto iniziale — sito web personalizzato per le nuove imprese","tag":"Prezzo equo"},{"num":"100<span>%</span>","lbl":"Siti web completamente personalizzati — prezzo in base all'entità del progetto","tag":"Personalizzato"}],
   "how.tag": "Come funziona",
   "how.h2": "Da zero al web<br><em>in 4 passaggi.</em>",
   "how.sub": "Non è richiesta alcuna competenza tecnica. Ci occupiamo di tutto, dalla prima chiamata alla messa online del sito web.",
   "how.steps": [{"t":"Prima chiamata","b":"Ti chiameremo subito per mostrarti un esempio personalizzato. È completamente gratuito e senza alcun impegno.","d":"Insieme"},{"t":"Design personalizzato","b":"In base alle tue richieste, realizziamo il tuo sito web. Non devi fare nulla.","d":"Noi"},{"t":"Anteprima e approvazione","b":"Riceverai un'anteprima da approvare, con le modifiche già incluse. Successivamente, il tuo sito verrà pubblicato con il tuo dominio.","d":"Insieme"},{"t":"In diretta — e restiamo qui","b":"Anche dopo il lancio, continueremo a essere al tuo fianco. Aggiornamenti, modifiche, domande: ci pensiamo noi.","d":"Noi"}],
   "ab.logotag": "Siti web · realizzati su misura",
   "ab.quote": "\"Ogni azienda locale merita un'opportunità equa di farsi trovare <em>online.</em>\"",
   "ab.sig": "— I fondatori di DRP BuildLab",
   "ab.nums": ["Manutenzione mensile (facoltativa)","Pacchetto iniziale per siti web","Su misura","Costi nascosti"],
   "ab.tag": "Chi siamo",
   "ab.h2": "Creato da<br>imprenditori,<br><em>per gli imprenditori.</em>",
   "ab.p1": "Tutto è iniziato da una frustrazione. Abbiamo notato come le attività commerciali locali — il macellaio all’angolo, l’idraulico sempre disponibile, il parrucchiere che da anni taglia i capelli agli stessi clienti — fossero completamente invisibili online.",
   "ab.p2": "Le grandi agenzie facevano pagare <strong>€5,000 per un sito web</strong> che richiedeva mesi per essere realizzato. Per questo abbiamo creato DRP BuildLab: uno studio che crede che ogni attività locale <strong>meriti un sito web su misura</strong> — conveniente, trasparente, con un prezzo commisurato al lavoro necessario.",
   "ab.pillars": [{"t":"L'onestà prima di tutto","b":"Quello che promettiamo, lo manteniamo. Nessun costo nascosto, nessun preventivo vago."},{"t":"Manutenzione quando vuoi tu","b":"La manutenzione mensile è facoltativa: €29 al mese oppure €250 all’anno. Aggiungila e il tuo sito rimarrà sicuro, aggiornato e facilmente reperibile, senza che tu debba preoccupartene."},{"t":"Pensare in chiave locale, costruire in chiave digitale","b":"Realizziamo soluzioni per le aziende locali, ovvero quelle i cui clienti effettuano ricerche nelle vicinanze. Lavoriamo da remoto dal Belgio, quindi la tua ubicazione non influisce sulla nostra capacità di aiutarti."}],
   "why.tag": "Perché DRP BuildLab",
   "why.h2": "Cosa ci contraddistingue?",
   "why.sub": "Pensato per le aziende locali che vogliono essere presenti online — senza complicazioni, senza sorprese.",
   "why.cards": [{"t":"Un unico punto di contatto","b":"Nessun sistema di ticket, nessun responsabile di conto a rotazione. Hai il nostro nome e il nostro numero — dalla prima chiamata fino a anni dopo il lancio."},{"t":"Attenzione alle realtà locali","b":"La tua regione, i tuoi clienti, un team dedicato. Conosciamo il mercato locale dall’interno."},{"t":"Prezzi equi","b":"Nessun costo nascosto. Prezzi sempre fissati in anticipo. Sai esattamente quanto pagherai."},{"t":"Sempre ottimizzato per i dispositivi mobili","b":"Oltre il 70% dei tuoi clienti effettua ricerche tramite telefono. Ogni sito DRP BuildLab funziona perfettamente su qualsiasi dispositivo."},{"t":"Ottimizzato per Google","b":"SEO integrato per far sì che i clienti ti trovino. Ci assicuriamo che Google ti riconosca e ti indicizzi."},{"t":"Compagno di vita","b":"Anche dopo il lancio, continueremo a essere al vostro fianco. Non siamo un semplice fornitore occasionale, ma un vero e proprio partner."}],
   "opp.tag": "Il costo nascosto",
   "opp.h2": "Quanto costa <em>davvero</em><br>la presenza online<br>di “€0”?",
   "opp.sub": "Non avere un sito web non è gratuito. Ogni giorno che trascorri senza una presenza online, perdi clienti a vantaggio dei concorrenti che invece sono facilmente reperibili.",
   "opp.pts": [{"t":"Il 78% effettua prima una ricerca online","b":"Prima di recarsi in un’attività commerciale locale, le persone la cercano su Google. Non compare nei risultati? Per quel cliente, è come se non esistesse."},{"t":"Ogni giorno è una perdita di entrate","b":"I clienti non riescono a trovarti online e si rivolgono alla concorrenza. Ogni giorno che passa senza un sito web è un giorno in cui vince la concorrenza."},{"t":"Il tuo concorrente è online","b":"Nel frattempo, la concorrenza si costruisce la propria reputazione online. Più aspetti, più diventa difficile recuperare il ritardo."},{"t":"La credibilità è sinonimo di fatturato","b":"Un sito web professionale ispira fiducia. I clienti tendono a scegliere più volentieri un’azienda che dia un’immagine seria."}],
   "opp.boxtitle": "Calcolo dei costi annuali",
   "opp.rows": [["Clienti persi ogni settimana (stima)","2–5"],["Valore medio per cliente","€80"],["Perdita annua in assenza di un sito web","−€8,320"],["DRP BuildLab per gli investimenti (Pacchetto base)","+€499"],["Manutenzione mensile annuale","+€348"]],
   "opp.totlbl": "Potenziale beneficio netto",
   "opp.totval": "+€7,473all'anno",
   "opp.note": "<strong>La conclusione è semplice:</strong> il costo di un sito web è una frazione di ciò che si perde non avendolo. Aspettare costa più che investire.",
   "comp.tag": "Panoramica del mercato",
   "comp.h2": "Nessuno lo<br>fa a un prezzo più conveniente <em>del nostro.</em>",
   "comp.sub": "Non lo nascondiamo: ne siamo orgogliosi. Guarda tu stesso quanto costano siti web simili altrove.",
   "comp.cols": ["Fornitore","Prezzo di partenza","Manutenzione","Mobile"],
   "comp.us": "Noi",
   "comp.rows": [{"n":"DRP BuildLab","p":"€499","m":"€29/al mese","us":true},{"n":"Lavoratore autonomo","p":"€800–€2,500","m":"Non incluso"},{"n":"Agenzia digitale","p":"€2,500–€8,000","m":"Extra costoso"},{"n":"Grande agenzia","p":"€8,000+","m":"Extra costoso"},{"n":"Wix / Squarespace","p":"€200 –€500/anno","m":"Fai da te"}],
   "comp.note": "<strong>Nota:</strong> i servizi di creazione di siti web come Wix hanno un costo annuale altrettanto elevato, ma in questo caso devi occuparti di tutto da solo, senza l’aiuto né il supporto di professionisti. Con DRP BuildLab non devi fare nulla da solo e c’è sempre qualcuno a tua disposizione.",
   "srv.tag": "Il nostro approccio",
   "srv.h2": "Siti web <em>realizzati su misura</em><br>per ogni imprenditore.",
   "srv.sub": "Da DRP BuildLab, ogni sito web è <strong>interamente realizzato su misura</strong>. Il prezzo dipende sempre dalla mole di lavoro che dedichiamo al tuo progetto. Nessun pacchetto obbligatorio, nessuna sorpresa: solo un preventivo equo e adeguato alle tue reali esigenze.",
   "p1.badge": "Per cominciare",
   "p1.name": "Pacchetto iniziale",
   "p1.period": "una tantum — manutenzione facoltativa",
   "p1.desc": "Ideale per <strong>gli imprenditori locali che hanno appena avviato la propria attività</strong> e non dispongono ancora di un sito web, oppure per coloro che desiderano aggiornare il proprio sito web esistente rendendolo più moderno e professionale.",
   "p1.feats": ["Sito web completamente personalizzato in base alla tua attività","Ottimizzato per dispositivi mobili (design reattivo)","Modulo di contatto + integrazione con WhatsApp","Google Maps e ottimizzazione SEO di base","Assistenza personalizzata dall'inizio alla messa in funzione"],
   "p1.btn": "Richiedi una demo gratuita →",
   "p2.name": "Personalizzazione avanzata",
   "p2.price": "Preventivo personalizzato<br>",
   "p2.period": "citazione personale — manutenzione facoltativa",
   "p2.desc": "Per gli imprenditori con <strong>progetti più grandi o complessi</strong>: negozi online, sistemi di prenotazione, siti multilingue, integrazioni o funzionalità personalizzate. Il prezzo dipende dall'entità del progetto.",
   "p2.feats": ["Pagine personalizzate illimitate","Negozio online, sistema di prenotazione o portale per i membri","SEO avanzato e Google Ads","Possibilità di creare siti web multilingue","Integrazioni personalizzate complesse"],
   "p2.btn": "Richiedi un preventivo →",
   "addon.tag": "Componente aggiuntivo opzionale",
   "addon.n": "Manutenzione mensile",
   "addon.or": "oppure",
   "addon.pm": "€29<span>/mese</span>",
   "addon.py": "€250<span>/anno</span>",
   "addon.b": "Aggiornamenti, backup, controlli di sicurezza e SEO. Non inclusi nei pacchetti: sei tu a decidere se aggiungerli.",
   "srv.how": "<strong>Come funziona:</strong> ci dici di cosa hai bisogno, noi valutiamo l'entità del lavoro e stabiliamo un prezzo equo in base alle tue esigenze. È disponibile come opzione un servizio di manutenzione mensile — €29 al mese o €250 all'anno — affinché il tuo sito web rimanga sicuro, aggiornato e ottimizzato per i motori di ricerca (SEO).",
   "ex.tag": "Servizi aggiuntivi",
   "ex.h3": "Servizi<br>aggiuntivi <em>per accelerare la tua crescita online.</em>",
   "ex.sub": "Ordina separatamente o in combinazione con il tuo sito web. I prezzi sono indicativi e vengono sempre confermati nel tuo preventivo personalizzato.",
   "ex.items": [{"n":"Progettazione del logo","p":"€149"},{"n":"Pagina aggiuntiva","p":"€79"},{"n":"Pacchetto base per la SEO","p":"€199"},{"n":"Configurazione di Google Ads","p":"€149"},{"n":"Sito multilingue","p":"€199"},{"n":"Aggiungi negozio online","p":"Personalizzato"},{"n":"Riparazioni di emergenza (24 ore su 24)","p":"€99"},{"n":"Fotografia (mezza giornata)","p":"€199"},{"n":"Integrazioni (sistema di prenotazione, fornitore di servizi di pagamento, contabilità)","p":"€149"},{"n":"CMS — gestisci i tuoi contenuti","p":"€149"},{"n":"Richieste personalizzate — su misura per le tue esigenze","p":"Su richiesta"}],
   "faq.tag": "Domande frequenti",
   "faq.h2": "Le risposte alle tue<br><em>domande più importanti.</em>",
   "faq.items": [{"q":"Quanto costa un sito web presso DRP BuildLab?","a":"Ogni sito web è realizzato interamente su misura. Il prezzo dipende dal carico di lavoro richiesto dal vostro progetto. Per gli imprenditori locali che sono agli inizi o che desiderano aggiornare un sito web esistente, proponiamo un pacchetto base disponibile all’indirizzo <strong>€499</strong>. Per i progetti più complessi, elaboriamo sempre un <strong>preventivo personalizzato</strong>. La manutenzione mensile è facoltativa: <strong>€29 al mese</strong> oppure <strong>€250 all’anno</strong>."},{"q":"A chi è rivolto il pacchetto iniziale \"€499\"?","a":"In particolare per gli imprenditori locali che stanno muovendo i primi passi e non dispongono ancora di un sito web, oppure per coloro che desiderano aggiornare il proprio sito web esistente rendendolo più moderno e professionale."},{"q":"Quanto costa la manutenzione mensile?","a":"Il servizio di manutenzione è facoltativo e costa <strong>€29 al mese</strong>, oppure <strong>€250 all’anno</strong> — l’opzione annuale ti fa risparmiare €98. Mantiene il tuo sito web sicuro, veloce e ottimizzato per la SEO. Non sei vincolato: puoi disdire ogni mese e il sito web rimane sempre tuo."},{"q":"In quanto tempo il mio sito web sarà online?","a":"Una volta ricevuti il testo, le foto e il logo, possiamo procedere rapidamente. All’inizio concordiamo una <strong>data di consegna precisa</strong>, adeguata alla portata del vostro progetto, e la rispettiamo. Durante il processo di lavorazione vi invieremo un’anteprima da approvare, così non sarete mai lasciati in attesa."},{"q":"Come funziona un preventivo personalizzato?","a":"Per i progetti più complessi, iniziamo con una chiamata introduttiva gratuita per valutare le tue esigenze. Successivamente, elaboriamo un preventivo personalizzato in base al volume di lavoro: numero di pagine, funzionalità, integrazioni e manutenzione. Nessun costo nascosto: saprai in anticipo quanto dovrai pagare."}],
   "soc.tag": "Seguici",
   "soc.h2": "Rimani aggiornato<br><em>su ciò che realizziamo.</em>",
   "soc.p1": "Seguiteci su Facebook, Instagram e TikTok per scoprire i nuovi progetti, i consigli per gli imprenditori locali e uno sguardo dietro le quinte del DRP BuildLab.",
   "soc.p2": "Hai una domanda o vuoi semplicemente parlarne? Mandaci un messaggio tramite il canale che preferisci: ti rispondiamo sempre personalmente.",
   "ct.tag": "Demo gratuita",
   "ct.h2": "Sei pronto a metterti<br><em>online?</em>",
   "ct.lede": "Richiedi una demo gratuita. Ti chiameremo e ti mostreremo subito un esempio personalizzato. Senza alcun impegno.",
   "ct.lbls": ["Telefono","E-mail","Indirizzo","Numero di registrazione della società","WhatsApp","Instagram","Facebook","TikTok"],
   "f.labels": ["Nome","Cognome","Nome dell'azienda","Numero di telefono","E-mail","A quale servizio ti riferisci?","Messaggio (facoltativo)"],
   "f.phs": ["John","Smith","La vostra azienda","+32 ...","john@yourcompany.com","Raccontaci qualcosa in più sul tuo progetto..."],
   "f.sel": ["Scegli un servizio","Pacchetto iniziale — €499","Personalizzazione avanzata — preventivo","Aggiornare il sito web esistente","Solo servizi aggiuntivi (logo, SEO, …)","Non ne sono ancora sicuro"],
   "f.btn": "Richiedi una demo gratuita →",
   "f.succ.h": "Richiesta ricevuta!",
   "f.succ.p": "Ti contatteremo entro 24 ore per fissare la tua demo gratuita.",
   "f.consent": "Acconsento a che DRP BuildLab utilizzi i dati riportati nel presente modulo per contattarmi in merito alla presente richiesta.",
   "f.err.h": "L'invio non è andato a buon fine.",
   "f.err.p": "Si è verificato un errore durante l'invio. Prova a riprovare oppure contattaci direttamente all'indirizzo <a href=\"mailto:info@drpbuildlab.com\">info@drpbuildlab.com</a> o su <a href=\"https://wa.me/32473744431\" target=\"_blank\" rel=\"noopener\">WhatsApp</a>.",
   "ft.tag": "Siti web professionali per aziende locali · Completamente personalizzati",
   "ft.nav": ["Navigazione","Home","Chi siamo","Prezzi","Contatti"],
   "ft.ct": "Contatti",
   "ft.copy": "© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Belgio · Partita IVA BE 1033.313.383",
   "ft.ig": "Seguici",
   "sticky.txt": "Pacchetto iniziale da €499",
   "sticky.btn": "Prova gratuita →",
   "cur.note": "I prezzi indicati in {cur} sono convertiti dall'euro al tasso di cambio odierno e sono puramente indicativi. La fatturazione è in EUR.",
   "wa": "Contattaci su WhatsApp",
   "pay.methods": "Bonifico bancario",
   "lang.offer": "Vedi questa pagina in italiano",
   "lang.dismiss": "Chiudi",
   "cc.title": "Cookie",
   "cc.body": "Usiamo i cookie per capire come viene usato il sito e per misurare la nostra pubblicità. Scegli tu.",
   "cc.accept": "Accetta tutto",
   "cc.reject": "Rifiuta tutto",
   "cc.prefs": "Scegli",
   "cc.save": "Salva scelte",
   "cc.nec": "Necessari",
   "cc.nec.d": "Indispensabili al funzionamento del sito. Sempre attivi.",
   "cc.ana": "Statistiche",
   "cc.ana.d": "Come i visitatori usano il sito, per poterlo migliorare.",
   "cc.mkt": "Marketing",
   "cc.mkt.d": "Misurare il rendimento della nostra pubblicità.",
   "cc.manage": "Impostazioni cookie"
  },
pl:{
   "meta.title": "DRP BuildLab — Strony internetowe dostosowane do potrzeb lokalnych firm | Pakiet startowy z €499",
   "meta.desc": "DRP BuildLab tworzy w pełni dostosowane do indywidualnych potrzeb strony internetowe dla lokalnych przedsiębiorców. Pakiet startowy dostępny na stronie €499 lub indywidualna wycena dla zaawansowanych projektów — z opcjonalną miesięczną obsługą techniczną dostępną na stronie €29 miesięcznie.",
   "meta.title.about": "O nas — DRP BuildLab | Studio tworzenia stron internetowych dla lokalnych firm",
   "meta.desc.about": "Stworzone przez przedsiębiorców dla przedsiębiorców. Historia powstania DRP BuildLab i powody, dla których lokalne firmy wybierają właśnie nas.",
   "meta.title.pricing": "Ceny — DRP BuildLab | Pakiet startowy €499 lub indywidualna wycena",
   "meta.desc.pricing": "Pakiet startowy dostępny na stronie €499 lub indywidualna wycena dla zaawansowanych projektów. Dodatkowe usługi i opcjonalna konserwacja dostępne na stronie €29 w ramach miesięcznego abonamentu.",
   "meta.title.contact": "Kontakt — DRP BuildLab | Zamów bezpłatną prezentację",
   "meta.desc.contact": "Zamów bezpłatną prezentację. Skontaktujemy się z Tobą telefonicznie i od razu zaprezentujemy przykład dostosowany do Twoich potrzeb. Bez żadnych zobowiązań.",
   "phero.about.eye": "O DRP BuildLab",
   "phero.about.h": "Osoby odpowiedzialne<br>za <em>Twoją stronę internetową.</em>",
   "phero.about.sub": "Kim jesteśmy, dlaczego rozpoczęliśmy działalność i czego możesz od nas oczekiwać.",
   "phero.pricing.eye": "Ceny i pakiety",
   "phero.pricing.h": "Uczciwe ceny,<br><em>żadnych niespodzianek.</em>",
   "phero.pricing.sub": "Pakiet startowy ze strony €499 lub indywidualna wycena. Koszty konserwacji należy doliczyć samodzielnie.",
   "phero.contact.eye": "Kontakt",
   "phero.contact.h": "Gotowi, by zacząć<br>korzystać <em>z internetu?</em>",
   "phero.contact.sub": "Zamów bezpłatną prezentację. Skontaktujemy się z Tobą telefonicznie i od razu zaprezentujemy dostosowany do Twoich potrzeb przykład.",
   "cta.h": "Gotowi, by zacząć<br>korzystać <em>z internetu?</em>",
   "cta.sub": "Poproś o bezpłatną prezentację. Skontaktujemy się z Tobą telefonicznie i od razu zaprezentujemy przykład dostosowany do Twoich potrzeb. Bez żadnych zobowiązań.",
   "cta.btn": "Poproś o bezpłatną wersję demonstracyjną →",
   "loader": "Ładowanie...",
   "nav.home": "Strona główna",
   "nav.pricing": "Ceny",
   "nav.about": "O nas",
   "nav.contact": "Kontakt",
   "nav.cta": "Bezpłatna wersja demonstracyjna →",
   "hero.eye": "Indywidualne strony internetowe dla lokalnych firm",
   "hero.l1": "Twoja firma",
   "hero.l2": "online.",
   "hero.l3": "<span class=\"h-light\">W końcu</span> <span class=\"h-accent\">znalazłem.</span>",
   "hero.sub": "Nie masz strony internetowej? To znaczy, że nie istniejesz w sieci. DRP BuildLab tworzy <strong>w pełni spersonalizowane strony internetowe</strong> dla lokalnych przedsiębiorców — cena zależy od nakładu pracy wymaganego w ramach Twojego projektu. Zawsze uczciwie, zawsze przejrzyście.",
   "hero.cta1": "Poproś o bezpłatną wersję demonstracyjną →",
   "hero.cta2": "Zobacz nasze podejście",
   "hero.scroll": "Przewiń",
   "mq": ["Skupienie się na sprawach lokalnych","Uczciwe ceny","Dostosowane do urządzeń mobilnych","Zoptymalizowane pod kątem Google","Całkowicie bez zmartwień"],
   "zoom.bl": "Nasze dane liczbowe",
   "zoom.br": "Przewiń dalej",
   "zs": [{"num":"0 <span>€</span>","lbl":"Ile kosztuje przygotowanie prezentacji i pierwszej oferty","tag":"Brak bariery"},{"num":"€499","lbl":"Pakiet startowy — strona internetowa dostosowana do potrzeb nowych firm","tag":"Uczciwa cena"},{"num":"100<span>%</span>","lbl":"W pełni dostosowane strony internetowe — cena zależy od zakresu prac","tag":"Niestandardowe"}],
   "how.tag": "Jak to działa",
   "how.h2": "Od zera do obecności<br>w sieci <em>w 4 krokach.</em>",
   "how.sub": "Nie jest wymagana żadna wiedza techniczna. Zajmujemy się wszystkim – od pierwszego zgłoszenia aż po uruchomienie strony internetowej.",
   "how.steps": [{"t":"Pierwsza rozmowa","b":"Skontaktujemy się z Państwem telefonicznie i od razu zaprezentujemy indywidualny przykład. Usługa jest całkowicie bezpłatna i niezobowiązująca.","d":"Razem"},{"t":"Projekt na zamówienie","b":"Zgodnie z Państwa życzeniami stworzymy Państwa stronę internetową. Nie muszą Państwo nic robić.","d":"My"},{"t":"Podgląd i zatwierdzenie","b":"Otrzymasz wersję próbną do zatwierdzenia wraz z wprowadzonymi poprawkami. Następnie Twoja strona zostanie uruchomiona pod Twoją własną domeną.","d":"Razem"},{"t":"Na żywo — i zostajemy","b":"Po uruchomieniu nadal jesteśmy do Twojej dyspozycji. Aktualizacje, zmiany, pytania — zajmiemy się tym.","d":"My"}],
   "ab.logotag": "Strony internetowe · tworzone na zamówienie",
   "ab.quote": "„Każda lokalna firma zasługuje na uczciwą szansę, by można ją było znaleźć <em>w Internecie”.</em>",
   "ab.sig": "— Założyciele DRP BuildLab",
   "ab.nums": ["Koszty utrzymania miesięczne (opcjonalnie)","Strona internetowa poświęcona pakietowi startowemu","Wykonane na zamówienie","Ukryte koszty"],
   "ab.tag": "O nas",
   "ab.h2": "Stworzone przez<br>przedsiębiorców,<br><em>dla przedsiębiorców.</em>",
   "ab.p1": "Wszystko zaczęło się od pewnej frustracji. Zauważyliśmy, że lokalne firmy — rzeźnik z rogu ulicy, hydraulik, który zawsze jest pod ręką, fryzjer, który od lat strzyże tych samych klientów — były w sieci zupełnie niewidoczne.",
   "ab.p2": "Duże agencje naliczały firmie <strong>„€5,000” opłaty za stronę internetową</strong>, której realizacja trwała miesiące. Dlatego stworzyliśmy DRP BuildLab: studio, które wierzy, że każda lokalna firma <strong>zasługuje na stronę internetową dostosowaną do jej potrzeb</strong> — niedrogą, uczciwą, której cena odpowiada nakładowi pracy.",
   "ab.pillars": [{"t":"Szczerość ponad wszystko","b":"To, co obiecujemy, to realizujemy. Żadnych ukrytych kosztów, żadnych niejasnych wycen."},{"t":"Serwis wtedy, kiedy tego potrzebujesz","b":"Miesięczna usługa konserwacji jest opcjonalna: €29 miesięcznie lub €250 rocznie. Dodaj ją, a Twoja strona będzie bezpieczna, aktualna i łatwa do znalezienia — bez konieczności martwienia się o to."},{"t":"Myśl lokalnie, twórz cyfrowo","b":"Tworzymy rozwiązania dla lokalnych firm — tych, których klienci szukają ich w okolicy. Pracujemy zdalnie z Belgii, więc to, gdzie się znajdujesz, nie ma wpływu na to, czy możemy Ci pomóc."}],
   "why.tag": "Dlaczego DRP BuildLab?",
   "why.h2": "Co nas wyróżnia?",
   "why.sub": "Stworzony z myślą o lokalnych firmach, które chcą zaistnieć w sieci — bez kłopotów i niespodzianek.",
   "why.cards": [{"t":"Jedna osoba kontaktowa","b":"Żadnego systemu zgłoszeń, żadnych zmieniających się opiekunów klienta. Masz nasze nazwisko i numer telefonu — od pierwszego telefonu aż po lata po uruchomieniu projektu."},{"t":"Skupienie się na sprawach lokalnych","b":"Twój region, Twoi klienci, Twój osobisty zespół. Doskonale znamy lokalny rynek od podszewki."},{"t":"Uczciwe ceny","b":"Żadnych ukrytych kosztów. Ceny są zawsze ustalane z góry. Dokładnie wiesz, ile zapłacisz."},{"t":"Zawsze dostosowane do urządzeń mobilnych","b":"Ponad 70% Twoich klientów korzysta z wyszukiwania na telefonie. Każda strona stworzona w DRP BuildLab działa bez zarzutu na każdym urządzeniu."},{"t":"Zoptymalizowane pod kątem wyszukiwarki Google","b":"Wbudowane funkcje SEO, dzięki którym klienci mogą Cię znaleźć. Dbamy o to, by Google rozpoznało Twoją stronę i zindeksowało ją."},{"t":"Partner na całe życie","b":"Po wdrożeniu nadal jesteśmy do Państwa dyspozycji. Nie jesteśmy dostawcą, który działa tylko raz, ale prawdziwym partnerem."}],
   "opp.tag": "Ukryty koszt",
   "opp.h2": "Ile <em>naprawdę kosztuje</em><br>prowadzenie strony internetowej<br>€0?",
   "opp.sub": "Brak strony internetowej nie jest darmowy. Każdego dnia, w którym nie jesteś obecny w sieci, tracisz klientów na rzecz konkurencji, którą łatwo znaleźć.",
   "opp.pts": [{"t":"78% osób najpierw szuka informacji w Internecie","b":"Zanim ludzie odwiedzą lokalną firmę, sprawdzają ją w Google. Nie ma jej tam? Dla tego klienta po prostu nie istniejesz."},{"t":"Każdy dzień to utracone przychody","b":"Klienci nie mogą znaleźć Twojej firmy w sieci i przechodzą do konkurencji. Każdy dzień bez strony internetowej to dzień, w którym wygrywa konkurencja."},{"t":"Twój konkurent jest online","b":"W międzyczasie Twoja konkurencja buduje swoją reputację w sieci. Im dłużej zwlekasz, tym trudniej będzie Ci nadrobić zaległości."},{"t":"Wiarygodność to przychody","b":"Profesjonalna strona internetowa buduje zaufanie. Klienci chętniej wybierają firmę, która sprawia poważne wrażenie."}],
   "opp.boxtitle": "Roczne obliczenie kosztów",
   "opp.rows": [["Liczba utraconych klientów tygodniowo (szacunkowo)","2–5"],["Średnia wartość na klienta","€80"],["Roczne straty wynikające z braku strony internetowej","−€8,320"],["Pakiet inwestycyjny DRP BuildLab (pakiet startowy)","+€499"],["Roczna konserwacja miesięczna","+€348"]],
   "opp.totlbl": "Potencjalna korzyść netto",
   "opp.totval": "+€7,473/rok",
   "opp.note": "<strong>Wniosek jest prosty:</strong> koszt strony internetowej to zaledwie ułamek tego, co tracisz, nie mając jej. Czekanie kosztuje więcej niż inwestycja.",
   "comp.tag": "Przegląd rynku",
   "comp.h2": "Nikt nie oferuje tego<br>taniej <em>niż my.</em>",
   "comp.sub": "Nie ukrywamy tego — jesteśmy z tego dumni. Przekonaj się sam, ile kosztują podobne strony internetowe w innych miejscach.",
   "comp.cols": ["Dostawca","Cena początkowa","Konserwacja","Urządzenia mobilne"],
   "comp.us": "My",
   "comp.rows": [{"n":"DRP BuildLab","p":"€499","m":"€29/miesiąc","us":true},{"n":"Freelancer","p":"€800–€2,500","m":"Nie wchodzi w skład zestawu"},{"n":"Agencja cyfrowa","p":"€2,500–€8,000","m":"Drogi dodatek"},{"n":"Duża agencja","p":"€8,000+","m":"Drogi dodatek"},{"n":"Wix / Squarespace","p":"€200 –€500/rok","m":"Zrób to sam"}],
   "comp.note": "<strong>Uwaga:</strong> narzędzia do tworzenia stron internetowych, takie jak Wix, są równie drogie w ujęciu rocznym — ale wszystko musisz robić samodzielnie, bez profesjonalnej pomocy ani wsparcia. W DRP BuildLab nie musisz nic robić samodzielnie, a ktoś zawsze jest do Twojej dyspozycji.",
   "srv.tag": "Nasze podejście",
   "srv.h2": "Strony internetowe <em>tworzone na miarę</em><br>dla każdego przedsiębiorcy.",
   "srv.sub": "W DRP BuildLab każda strona internetowa jest <strong>w pełni tworzona na zamówienie</strong>. Cena zawsze zależy od nakładu pracy, jaki wkładamy w Twój projekt. Żadnych obowiązkowych pakietów, żadnych niespodzianek — tylko uczciwa wycena dostosowana do Twoich rzeczywistych potrzeb.",
   "p1.badge": "Na początek",
   "p1.name": "Pakiet startowy",
   "p1.period": "jednorazowe — konserwacja opcjonalna",
   "p1.desc": "Idealne rozwiązanie dla <strong>lokalnych przedsiębiorców, którzy dopiero rozpoczynają działalność</strong> i nie mają jeszcze strony internetowej — lub dla tych, którzy chcą zaktualizować swoją dotychczasową stronę internetową, nadając jej nowoczesny i profesjonalny wygląd.",
   "p1.feats": ["Strona internetowa w pełni dostosowana do potrzeb Twojej firmy","Dostosowane do urządzeń mobilnych (responsywny układ)","Formularz kontaktowy + integracja z WhatsApp","Google Maps i podstawowa optymalizacja SEO","Indywidualne wsparcie od początku aż do uruchomienia"],
   "p1.btn": "Poproś o bezpłatną wersję demonstracyjną →",
   "p2.name": "Zaawansowane ustawienia niestandardowe",
   "p2.price": "Indywidualna<br>wycena",
   "p2.period": "osobista sentencja — konserwacja opcjonalna",
   "p2.desc": "Dla przedsiębiorców realizujących <strong>większe lub bardziej złożone projekty</strong>: sklepy internetowe, systemy rezerwacyjne, strony wielojęzyczne, integracje lub niestandardowe funkcje. Cena zależy od zakresu projektu.",
   "p2.feats": ["Nieograniczona liczba stron niestandardowych","Sklep internetowy, system rezerwacji lub portal dla członków","Zaawansowane SEO i Google Ads","Możliwość tworzenia wielojęzycznych stron internetowych","Złożone integracje realizowane na zamówienie"],
   "p2.btn": "Poproś o wycenę →",
   "addon.tag": "Opcjonalny dodatek",
   "addon.n": "Comiesięczna konserwacja",
   "addon.or": "lub",
   "addon.pm": "€29<span>/miesiąc</span>",
   "addon.py": "€250<span>/rok</span>",
   "addon.b": "Aktualizacje, kopie zapasowe, zabezpieczenia i kontrole SEO. Usługi te nie są zawarte w pakietach — to Ty decydujesz, czy chcesz je dodać.",
   "srv.how": "<strong>Jak to działa:</strong> informujesz nas, czego potrzebujesz, a my oceniamy zakres prac i ustalamy uczciwą cenę w oparciu o te prace. Opcjonalnie dostępna jest comiesięczna usługa konserwacji — €29 miesięcznie lub €250 rocznie — dzięki czemu Twoja strona internetowa pozostaje bezpieczna, aktualna i zoptymalizowana pod kątem SEO.",
   "ex.tag": "Usługi dodatkowe",
   "ex.h3": "Dodatkowe usługi<br><em>, które przyspieszą rozwój Twojej działalności w Internecie.</em>",
   "ex.sub": "Zamów osobno lub w połączeniu ze swoją stroną internetową. Ceny mają charakter orientacyjny i są zawsze potwierdzane w indywidualnej ofercie.",
   "ex.items": [{"n":"Projekt logo","p":"€149"},{"n":"Dodatkowa strona","p":"€79"},{"n":"Pakiet startowy SEO","p":"€199"},{"n":"Konfiguracja Google Ads","p":"€149"},{"n":"Witryna wielojęzyczna","p":"€199"},{"n":"Dodaj sklep internetowy","p":"Niestandardowe"},{"n":"Naprawa awaryjna (24 godziny)","p":"€99"},{"n":"Fotografia (pół dnia)","p":"€199"},{"n":"Integracje (system rezerwacji, dostawca usług płatniczych, księgowość)","p":"€149"},{"n":"CMS — zarządzaj własnymi treściami","p":"€149"},{"n":"Indywidualne zamówienia — dostosowane do Państwa potrzeb","p":"Na życzenie"}],
   "faq.tag": "Najczęściej zadawane pytania",
   "faq.h2": "Odpowiedzi na<br><em>najważniejsze pytania.</em>",
   "faq.items": [{"q":"Ile kosztuje strona internetowa w DRP BuildLab?","a":"Każda strona internetowa jest w całości tworzona na zamówienie. Cena zależy od nakładu pracy związanego z danym projektem. Dla lokalnych przedsiębiorców, którzy dopiero rozpoczynają działalność lub chcą zaktualizować istniejącą stronę internetową, oferujemy pakiet startowy dostępny pod adresem <strong>€499</strong>. W przypadku bardziej zaawansowanych projektów zawsze przygotowujemy <strong>indywidualną wycenę</strong>. Miesięczna konserwacja jest opcjonalna: <strong>€29 miesięcznie</strong> lub <strong>€250 rocznie</strong>."},{"q":"Dla kogo przeznaczony jest pakiet startowy „€499”?","a":"W szczególności dla lokalnych przedsiębiorców, którzy dopiero rozpoczynają działalność i nie mają jeszcze strony internetowej, oraz dla tych, którzy chcą zmodernizować swoją dotychczasową stronę, nadając jej nowoczesny i profesjonalny wygląd."},{"q":"Ile kosztuje miesięczna konserwacja?","a":"Konserwacja jest opcjonalna i kosztuje <strong>€29 miesięcznie</strong> lub <strong>€250 rocznie</strong> — opcja roczna pozwala zaoszczędzić €98. Dzięki niej Twoja strona internetowa jest bezpieczna, szybka i zoptymalizowana pod kątem SEO. Nie jesteś związany żadną umową: możesz zrezygnować w dowolnym momencie, a strona internetowa zawsze pozostaje Twoją własnością."},{"q":"Jak szybko moja strona internetowa zostanie uruchomiona?","a":"Gdy tylko otrzymamy od Państwa tekst, zdjęcia i logo, możemy szybko przystąpić do pracy. Na początku ustalamy <strong>konkretny termin realizacji</strong>, dostosowany do zakresu Państwa projektu — i dotrzymujemy go. W trakcie pracy otrzymują Państwo podgląd do zatwierdzenia, dzięki czemu nigdy nie muszą Państwo czekać."},{"q":"Jak działa wycena indywidualna?","a":"W przypadku bardziej zaawansowanych projektów najpierw omawiamy Państwa potrzeby podczas bezpłatnej rozmowy wstępnej. Następnie przygotowujemy indywidualną wycenę w oparciu o zakres prac: liczbę stron, funkcje, integracje i obsługę techniczną. Nie ma żadnych ukrytych kosztów — z góry wiedzą Państwo, ile zapłacą."}],
   "soc.tag": "Śledź nas",
   "soc.h2": "Bądź na bieżąco<br><em>z tym, co tworzymy.</em>",
   "soc.p1": "Śledź nas na Facebooku, Instagramie i TikToku, aby być na bieżąco z nowymi projektami, poradami dla lokalnych przedsiębiorców oraz zajrzeć za kulisy DRP BuildLab.",
   "soc.p2": "Masz pytanie, a może po prostu chcesz to omówić? Wyślij nam wiadomość przez dowolny kanał komunikacji — zawsze odpowiadamy osobiście.",
   "ct.tag": "Bezpłatna wersja demonstracyjna",
   "ct.h2": "Gotowy, by zacząć<br>korzystać <em>z internetu?</em>",
   "ct.lede": "Poproś o bezpłatną prezentację. Skontaktujemy się z Tobą telefonicznie i od razu zaprezentujemy przykład dostosowany do Twoich potrzeb. Bez żadnych zobowiązań.",
   "ct.lbls": ["Telefon","E-mail","Adres","Numer rejestracji spółki","WhatsApp","Instagram","Facebook","TikTok"],
   "f.labels": ["Imię","Nazwisko","Nazwa firmy","Numer telefonu","E-mail","O jaką usługę chodzi?","Wiadomość (opcjonalnie)"],
   "f.phs": ["John","Smith","Państwa firma","+32 ...","john@yourcompany.com","Opowiedz nam więcej o swoim projekcie..."],
   "f.sel": ["Wybierz usługę","Pakiet startowy — €499","Zaawansowane opcje niestandardowe — wycena","Zaktualizuj istniejącą stronę internetową","Wyłącznie usługi dodatkowe (logo, SEO itp.)","Jeszcze nie jestem pewien"],
   "f.btn": "Poproś o bezpłatną wersję demonstracyjną →",
   "f.succ.h": "Wniosek otrzymano!",
   "f.succ.p": "Skontaktujemy się z Tobą w ciągu 24 godzin, aby umówić się na bezpłatną prezentację.",
   "f.consent": "Wyrażam zgodę na to, aby firma DRP BuildLab wykorzystała dane podane w niniejszym formularzu w celu skontaktowania się ze mną w sprawie tego zgłoszenia.",
   "f.err.h": "Wysyłanie nie powiodło się.",
   "f.err.p": "Wystąpił błąd podczas wysyłania. Spróbuj ponownie lub skontaktuj się z nami bezpośrednio pod adresem <a href=\"mailto:info@drpbuildlab.com\">info@drpbuildlab.com</a> lub przez <a href=\"https://wa.me/32473744431\" target=\"_blank\" rel=\"noopener\">WhatsApp</a>.",
   "ft.tag": "Profesjonalne strony internetowe dla lokalnych firm · W pełni dostosowane do indywidualnych potrzeb",
   "ft.nav": ["Nawigacja","Strona główna","O nas","Ceny","Kontakt"],
   "ft.ct": "Kontakt",
   "ft.copy": "© 2026 DRP BuildLab · Honingstraat 1D, 2220 Hallaar, Belgia · Numer VAT BE 1033.313.383",
   "ft.ig": "Śledź nas",
   "sticky.txt": "Pakiet startowy od €499",
   "sticky.btn": "Bezpłatna wersja demonstracyjna →",
   "cur.note": "Ceny w {cur} zostały przeliczone z euro według dzisiejszego kursu i mają charakter orientacyjny. Faktury wystawiane są w euro.",
   "wa": "Napisz do nas na WhatsApp",
   "pay.methods": "Przelew bankowy",
   "lang.offer": "Zobacz tę stronę po polsku",
   "lang.dismiss": "Zamknij",
   "cc.title": "Pliki cookie",
   "cc.body": "Używamy plików cookie, aby sprawdzać, jak korzysta się z witryny, i mierzyć skuteczność reklam. Wybór należy do Ciebie.",
   "cc.accept": "Zaakceptuj wszystkie",
   "cc.reject": "Odrzuć wszystkie",
   "cc.prefs": "Wybierz",
   "cc.save": "Zapisz wybór",
   "cc.nec": "Niezbędne",
   "cc.nec.d": "Konieczne do działania witryny. Zawsze włączone.",
   "cc.ana": "Statystyka",
   "cc.ana.d": "Jak odwiedzający korzystają z witryny, abyśmy mogli ją ulepszać.",
   "cc.mkt": "Marketing",
   "cc.mkt.d": "Mierzenie skuteczności naszych reklam.",
   "cc.manage": "Ustawienia plików cookie"
  }
};
