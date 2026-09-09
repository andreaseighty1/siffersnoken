# Changelog

## 2026-09-09

### Nya ikoner även inne på undersidorna
- `index.html`
  - använder de stora nya menyillustrationerna även i rubrikerna för Inställningar, Medaljer, Highscore, Ormskinn och Mysteriemuseum
  - behåller den enklare statistikikonen eftersom Statistik är en kompakt toppknapp och inte ingår i den stora ikonfamiljen
  - skalar rubrikikonerna responsivt till 46 px på större skärmar och 36 px på mobil

### Moderna skins: Plasma och Blodmåne
- `skins/modern-plasma-*.webp`
  - nytt cyan–magenta energiskin med runt kroppssegment, tydligt huvud och kantansluten svans
- `skins/modern-blood-moon-*.webp`
  - nytt mörkt rubinrött månstenstema med halvmånedetaljer och en lätt vickande specialsvans
- `index.html`
  - kopplat skinnen till befintliga upplåsningar för Plasma och Blodmåne
  - lagt till diskreta pulserande sken som respekterar inställningen för reducerad rörelse

### Ny modern banbakgrund: Molnstaden
- `assets/molnstaden.webp`
  - ny ljus svävande sagostad med fri, lågkontrast spelplan i mitten
- `index.html`
  - lagt till Molnstaden i den slumpade rotationen av moderna banbakgrunder
  - lagt till lätta kantglitter utan att belasta eller störa spelplanen

## 2026-09-08

### Ikonernas runtimefiler flyttade till `/assets`
- `index.html`
  - förenklat sökvägarna för de sex aktiva menyikonerna till `assets/icon_*.webp`
- `assets/icon_*.webp`
  - flyttat WebP-runtimefilerna från `assets/siffersnoken-icons-v2/` direkt till roten av `assets`
  - lämnar PNG-masterfiler och förhandsvisningar i undermappen eftersom de inte laddas av spelet

### Städning av oanvända repo-assets
- tagit bort äldre `ui-*.webp` som ersatts av `ui-modern-clean-*`
- tagit bort oanvända Originalblue-delar och PNG-dubbletter för Purple samt Strawberry som redan har aktiva WebP-versioner
- tagit bort två kvarlämnade `test.txt`
- de sju filer som även fanns lokalt har flyttats till `tmp/unused-web-assets-backup-2026-09-08/` utanför webbprojektet för återställning

## 2026-09-07

### Nya menyikoner och mobilanpassad toppmeny
- `index.html`
  - kopplat in de sex frilagda SifferSnoken-ikonerna för Play, Settings, Medaljer, Highscore, Ormskinn och Mysterimuseum
  - separerat stora menyillustrationer från sidrubrikernas och toppmenyns små ikoner
  - ersatt emoji i Byt namn, Musik och Statistik med enkla inline-SVG-symboler på 17–18 px
  - visar symbol och text på desktop, men kompakta 40 × 36 px ikonknappar med tillgänglighetsnamn under 560 px
  - förstorat huvudmenyns illustrationer till 76 px på normal desktop, 60 px på mobil och 88 px på stora skärmar
- `assets/siffersnoken-icons-v2/*.webp`
  - lagt till sex transparenta 256 × 256 WebP-runtimefiler från PNG-masterfilerna för låg bandbredd och skarpa Retina-kanter

### Ny kandidatfamilj för SifferSnokens stora menyikoner
- `assets/siffersnoken-icons-v2/*.png`
  - lagt till sex stora 1024 × 1024 PNG-masterfiler med riktig transparens: Play, Settings, Medaljer, Pokal, Belöningar och Utseende
  - använder den officiella blå SifferSnoken från logotypen som gemensam karaktärsreferens
  - ger varje funktion en egen tydlig siluett och låter Snoken interagera med huvudsymbolen; endast Play använder hela kroppen som nästan komplett cirkel
  - lämnar de små toppknapparna Musik, Statistik och Redigera namn utanför den illustrerade serien; de ska senare använda kompakta inline-SVG-symboler
  - rensat kvarvarande vita bakgrundsfält mellan Snoken och föremålet i Medaljer och Belöningar
  - kandidatfilerna är ännu inte inkopplade i `index.html`

### Korrigeringar: Drake och Vattenmelon
- `index.html`
  - roterar enbart Drakens moderna kroppsbitar 90° i spelrenderingen så den centrala guldrustningen följer ormens riktning
  - lämnar Drakens huvud, svans, bildfiler, Classic-version och upplåsning oförändrade
- `skins/modern-watermelon-body-straight.webp`
  - ersatt den fyrkantigare kroppen med en tydligt rund vattenmelonskiva och ett tjockare mörkgrönt samt vitgrönt skal runt hela kanten
- `skins/modern-watermelon-tail.webp`
  - gjort skalet betydligt tydligare längs båda sidor och runt svansspetsen, med färre organiskt placerade kärnor

### Moderna Tiger- och Havskin
- `skins/modern-tiger-*.webp`
  - lagt till ett specialformat tigerhuvud med små runda öron, mjuk päls, organisk randning och runda kroppspärlor
  - lagt till en bred randig svans med mörk spets och en diskret vickning förankrad i den plana fästkanten
- `skins/modern-ocean-*.webp`
  - lagt till ett vattenande-inspirerat huvud med vågkam, runda aquafärgade kroppar, solreflexer och sparsamma bubblor
  - spegelvänder vartannat segment och låter ett långsamt turkost sken vandra genom kroppen
- `index.html`
  - kopplat `tiger` och `hav` till Modern-renderingen utan att ändra Classic-versioner eller upplåsningskrav

### Ny Modern-bana: Korallrevet
- `assets/korallrev.webp`
  - lagt till ett top-down-korallrev med turkos sandlagun, ruiner, pärlor, snäckor och färgrika koraller längs ytterkanterna
  - hållit mitten ljus, rymlig och lågmäld så orm, svarstal och mörka brickor förblir tydliga
- `index.html`
  - väljer nu slumpmässigt mellan sex Modern-banor och stödjer `?perf=1&board=coralReef`
  - cachar bakgrunden per canvasstorlek och lägger bara tio små kantplacerade bubblor ovanpå

### Moderna Lava- och Stjärnhimmelskin
- `skins/modern-lava-*.webp`
  - lagt till ett ljust, flytande lavaskin med runda kroppsdelar, gyllene magmaströmmar och oregelbundna mörka lavaskorpor
  - återanvänder det lätta längdförskjutna värmepulsskenet men skiljer sig tydligt från det huvudsakligen svarta Obsidianskinnet
- `skins/modern-starry-sky-*.webp`
  - lagt till en lugn midnattsblå stjärnhimmel med månskära på huvudet och sammanhängande silverguldiga stjärnbilder
  - lägger fyra små varmvita tindringar på varje rund kropp och spegelvänder vartannat segment för naturlig variation
- `index.html`
  - kopplat `lava` och `stjarnhimmel` till Modern-renderingen utan att ändra Classic-versioner eller upplåsningskrav

### Moderna Aurora- och Spökskin
- `skins/modern-aurora-*.webp`
  - lagt till ett mörkt midnattsblått auroraskin med rundade, bulliga kroppsdelar och flödande cyan-, smaragd- och violettljus
  - spegelvänder vartannat segment och låter ett långsamt färgskiftat sken vandra längs kroppen
- `skins/modern-ghost-*.webp`
  - lagt till ett barnvänligt pärlvitt spökskin med riktiga genomskinliga WebP-pixlar, rund kropp och mjuka ektoplasmavirvlar
  - ger huvud, kropp och svans ett diskret eftereko utan tunga filter eller separata animationsbilder
- `index.html`
  - kopplat `aurora` och `ghost` till Modern-renderingen utan att ändra Classic-versioner eller upplåsningskrav

### Ny Modern-bana: Hockeyrinken
- `assets/hockeyrink.webp`
  - lagt till en top-down-rink med ljus is, diskreta rinklinjer, mål, sarg, glas och blå läktare längs kanterna
  - hållit spelmitten lugn för tydliga svarstal, brickor och alla ormskins
- `index.html`
  - väljer nu slumpmässigt mellan fem Modern-banor och stödjer `?perf=1&board=hockeyRink`
  - cachar rinkbilden per canvasstorlek och lägger bara tio små kantplacerade isglitter ovanpå

### Moderna Obsidian- och Drakskin
- `skins/modern-obsidian-*.webp`
  - lagt till polerat nästan svart vulkanglas med oregelbundna orange-röda magmasprickor på huvud, kropp och svans
  - lagt till ett långsamt längdförskjutet glödsken kring segmenten utan extra tunga bildrutor
- `skins/modern-dragon-*.webp`
  - lagt till ett unikt vinrött drakhuvud med guldfärgad pannrustning, sidotaggar och stora böjda horn utanför standardsiluetten
  - lagt till överlappande röda fjäll och en sammanhängande central guldrustning på kropp och svans
  - lagt till skin-anpassad ögonplacering samt en diskret förankrad svansvickning
- `index.html`
  - kopplat `obsidian` och `drake` till Modern-renderingen utan att ändra Classic-versioner eller upplåsningskrav
  - behåller samma kroppsöverlappning, längdtransparens och kant-i-kant-förankring som övriga moderna skins

### Ny Modern-bana: Fotbollsplanen
- `assets/fotbollsplan.webp`
  - lagt till en top-down-arena med gräsplan, diskreta linjer, mål, blågula läktare, flaggor och kantplacerade strålkastare
  - hållit planens mitt rymlig och lågmäld så orm, svarstal och mörka brickor förblir tydliga
- `index.html`
  - väljer nu slumpmässigt mellan Sagoskogen, Kristallgrottan, Soltemplet och Fotbollsplanen i Modern-läget
  - cachar bakgrunden per canvasstorlek och lägger endast tio små kantplacerade konfettibitar ovanpå
  - stödjer `?perf=1&board=footballPitch` för reproducerbar testning och respekterar reducerad rörelse

### Moderna Polkagris- och Galaxskin
- `skins/modern-candy-cane-*.webp`
  - lagt till ett blankt polkagrishuvud med virvlande rödvita band samt sammanhängande vridna godisband på kropp och spetsig svans
  - undvikit kopplingsprickar och behållit gemensamma Modern-ögon, kroppsfogar och kant-i-kant-svans
- `skins/modern-galaxy-*.webp`
  - lagt till ett exklusivt galaxskin med midnattsblå rymd, cyan- och magentafärgade nebulosor, stjärnstoft och självlysande blå kant
  - spegelvänder vartannat kroppssegment så nebulosan varierar naturligt längs en lång orm
- `index.html`
  - kopplat `polkagris` och `galax` till Modern-renderingen utan att ändra Classic-versioner eller upplåsningskrav
  - lagt till tre små animerade stjärnkryss per galaxdel samt ett långsamt cyan–violett sken som vandrar genom kroppen
  - respekterar reducerad rörelse och använder endast lätta canvaslinjer ovanpå komprimerade WebP-assets

### Moderna Vattenmelon- och Fotbollsskin
- `skins/modern-watermelon-*.webp`
  - lagt till ett randigt vattenmelonhuvud samt saftigt röda kropps- och svansdelar med grön kant och naturligt utspridda kärnor
  - undvikit raka rader med stora cirklar och behållit gemensamma Modern-ögon, mjuk kroppsöverlappning och kant-i-kant-svans
- `skins/modern-football-*.webp`
  - lagt till ett komplett fotbollsskin med vitt läder, svarta femkanter, panelsömmar och formföljande skuggning på huvud, kropp och svans
  - använder samma exakta Modern-siluetter som övriga skins så panelerna behåller rena fogar och riktig alfakanal
- `index.html`
  - kopplat `vattenmelon` och `fotboll` till Modern-renderingen utan att ändra deras Classic-versioner eller befintliga upplåsningskrav

### Ny Modern-bana: Soltemplet
- `assets/soltemplet.webp`
  - lagt till en varm top-down-bana med solbelyst sandsten, tempelruiner, oaser, palmer och turkos-guldiga kantdetaljer
  - hållit spelplanens stora mitt lugn och ljus så orm, svarstal och mörka brickor förblir tydliga
- `index.html`
  - väljer slumpmässigt mellan Sagoskogen, Kristallgrottan och Soltemplet när en ny Modern-runda startar
  - cachar även Soltemplets bakgrund per canvasstorlek och ritar endast tio små, billiga ljusglimtar per bildruta
  - stödjer `?perf=1&board=sunTemple` för reproducerbar testning och respekterar reducerad rörelse

## 2026-09-06

### Modern banvariation: Kristallgrottan
- `assets/kristallgrotta.webp`
  - lagt till en ny top-down-bana med blå/turkosa grottgolv, kristaller och självlysande kantdetaljer
  - hållit spelplanens mitt lugn och jämnt belyst så orm och svarstal behåller tydlig kontrast
- `index.html`
  - väljer slumpmässigt mellan Sagoskogen och Kristallgrottan när en ny Modern-runda startar
  - cachar båda rasterbakgrunderna per canvasstorlek och ritar bara ett fåtal enkla temasparkles per bildruta
  - stödjer `?perf=1&board=forest|crystal` för reproducerbar bakgrundstestning
  - låter den moderna svansen följa exakt samma längdbaserade genomskinlighet som övriga bakre kroppsdelar
  - behåller Classic-bakgrunderna helt oförändrade

## 2026-09-05

### Moderna Regnbåge- och Guldskin
- `skins/modern-rainbow-*.webp`
  - lagt till rubinröda master-assets med glans, fjäll och neutral ljussättning för dynamisk färgrotation
  - färgsätter huvud, varje kroppssegment och svans separat så en levande regnbågsgradient löper genom hela ormen
  - kvantiserar färgrotationen till 48 återanvändbara WebP-baserade canvasvarianter per asset för att undvika dyr omfärgning varje bildruta
- `skins/modern-gold-*.webp`
  - lagt till egna metalliska guldassets med varma högdagrar, mörka kantfjäll och tydlig småskalig läsbarhet
  - kopplat Guld till Modern-rendering med gemensamma blinkögon, riktningslogik och kant-i-kant-svans
- `index.html`
  - ökat kattens kroppsskala från `1,15` till `1,19` för en diskret överlappning som stänger glipan mellan pälssegmenten
  - återställt de rena kroppsdelarna för Klassisk, Isblå, Rosa och Lila som små WebP-filer efter att deras tidigare PNG-sökvägar blivit brutna
  - ersatt även de fem äldre kroppsfilerna utan `-clean` med motsvarande rena WebP-innehåll, så ingen reservreferens kan visa den stora cirkelraden över mitten
  - lämnar samtliga Classic-versioner och befintliga upplåsningskrav oförändrade

### Moderna Katt- och Hundskin
- `skins/modern-dog-*.webp`
  - lagt till eget modernt hundhuvud med gyllene päls, ljust nosparti, mörk nos och hängöron
  - lagt till sammanhängande gyllene pälssegment utan raden med fem kopplingsprickar
  - lagt till en egen fluffig hundsvans med plant kant-i-kant-fäste
- `skins/modern-cat-*.webp`
  - lagt till eget modernt ragdoll-katthuvud med creme/taupe-päls, ansiktsmask, rosa nos, morrhår och spetsöron
  - lagt till cremefärgade pälssegment samt en avsmalnande ringad kattsvans
  - lagt till separat blått öppet ögonlager och återanvänder det gemensamma blinklagret
- `index.html`
  - kopplat `hund` och `katt` till Modern-renderingen utan att ändra deras Classic-rendering eller upplåsningskrav
  - lagt till skin-specifika skalor för huvud, kropp och svans så djurens större öron och pälsdelar håller rätt proportioner
  - använder samma riktningslogik, blinkning och kant-i-kant-förankring som övriga moderna skins
  - lagt till snabb, glad svansvickning för hunden och en långsammare, mjukare svanspendling för katten
  - förankrar animationen i svansens plana fäste så den håller kontakten med kroppen under hela rörelsen
  - använder WebP med bibehållen alfakanal och 512 × 512-upplösning; de sju aktiva djur-assetsen minskar från cirka 1,97 MB till 186 KB

### Modernt jordgubbsskinn
- `skins/modern-strawberry-*.webp`
  - lagt till separata top-down-assets för huvud, rak kropp och svans med blank jordgubbstextur, gula frön och mörkröd kant
  - integrerat den gröna jordgubbsblasten i huvudets bakre kant så den följer ormens riktning
  - tagit bort raden med fem stora mörka kopplingsprickar från jordgubbens kroppssegment
  - frilagt alla tre assets med riktig alfakanal och normaliserat dem till `512 × 512`
  - konverterat de tre aktiva bilderna från cirka 803 KB PNG till cirka 78 KB WebP med bibehållen transparens
- `skins/modern-*-body-straight-clean.png`
  - tagit bort samma fem kopplingsprickar från Klassisk, Isblå, Rosa och Lila
  - förberett även den oanvända Originalblå reservasseten utan prickar för framtida inkoppling
  - behållit respektive färg, fjällmönster, ljus, kant och segmentsiluett
- `index.html`
  - kopplat `jordgubbe` till den moderna asset-renderingen med befintlig rotation, mjuka kroppsöverlappning och förankrad svans
  - kopplat de fyra befintliga Modern-skinnen till sina rena kroppsassets utan kopplingsprickar
  - flyttat den moderna svansen från `0,78` till `1,04` rutor bakom sista kroppsbiten så fästet möter kanten i stället för att synas igenom långa, nedtonade ormar
  - behållit samma riktnings-, rörelse- och väggpassagelogik för svansen
  - återanvänder de gemensamma öppna/blinkande ögonen i Modern-läget
  - behåller det tidigare procedurjordgubbsskinnet helt oförändrat i Classic-läget

## 2026-09-04

### v3.11 korrigering
- `index.html`
  - bytt installningsrubriker till stabila id:n sa nya paneler inte forskjuter eller blandar ihop texterna
  - lagt till fallbacktexter sa oversattningsnycklar aldrig visas i gransenittet
  - uppdaterat ticker, titel, om-ruta och copyright till `v3.11`
- `translations.js`
  - uppdaterat versionsnumret i copyrighttexterna till `v3.11`

### v3.11 visuell prototyp: Sagoskogen och egna ikoner
- `index.html`
  - lagt till liten modern asset-överlappning så transparenta marginaler inte ger synliga glipor mellan kroppsdelar
  - låter spelplanen skala upp tillgängligt endast på bred desktop (`>=1200px`), medan mobilens tidigare skala lämnas oförändrad
  - breddat titelmeny, banner, ticker, snabbval och ikonrad på stora skärmar via separat desktop-brytpunkt

- `index.html`
  - byggt om snabbvalet till en kompakt kontrollrad med pillformade årskursval och separat status-pill
  - skyddat tickern från flex-krympning och centrerat texten vertikalt så den förblir läsbar vid hög zoom
  - tillåtit vertikal scroll på titelmenyn när zoom eller liten skärm kräver mer höjd

- `index.html`
  - byggt om titelmenyn till ett frilagt, jämnhögt ikonfält där även Spela använder samma ikonknappsstil
  - lagt till större konsekventa ikonplatser, mjuk glow/hover och horisontell snap-scroll på mindre skärmar

- `index.html`
  - gjort huvudmenyns sidnavigering till fem kompakta ikonknappar med större WebP-ikoner och text under
  - lagt till mjuk hover/tryck-animation, glow och mobilanpassad trekolumnslayout utan att flytta Spela-knappen

- `index.html`
  - återanvänder de befintliga SifferSnoken-WebP-ikonerna i sidrubrikerna för inställningar, medaljer, highscore, skins, museum och statistik
  - behåller samma ikonstorlek, transparenta assets och språkväxling även när interna sidor renderas om

- `assets/ui-*.webp`
  - rensat kvarvarande schackrutehalo och bevarat ikonernas interna ögonreflexer med säkrare alpha-friläggning
- `assets/ui-*.webp`
  - uppdaterade snokuttryck med större glansiga ögon, rundare former och ett gladare, gulligare uttryck
- `index.html`
  - lagt till en färgglad, top-down WebP-bakgrund för det moderna Sagoskogen-läget
  - behållit den tidigare canvas-bakgrunden som fallback om WebP-filen saknas
  - cachat bakgrundsbilden per skärmstorlek så endast ett litet antal mjuka ljusflugor och löv animeras per bildruta
  - låter Classic behålla befintlig bakgrund och partikellogik oförändrad
  - ersatt huvudmenyns emojiikoner med genererade WebP-assets i SifferSnokens stil
  - behållit knapparnas storlek och lagt till aria-label på touchkontrollerna

- `assets/sagoskog.webp`
  - färgglad top-down-skog med öppen spelbar mitt och dekorationer runt ytterkanten
- `assets/ui-*.webp`
  - åtta separata rasterikoner för huvudmenyn, beskurna med transparent bakgrund

### Backup
- `index.backup-2026-09-04-before-sagoskog-icons.html`
- `translations.backup-2026-09-04-before-sagoskog-icons.js`
- `CHANGELOG.backup-2026-09-04-before-sagoskog-icons.md`

### Backup
- `index.backup-2026-09-04-before-v311-fix.html`
- `translations.backup-2026-09-04-before-v311-fix.js`
- `CHANGELOG.backup-2026-09-04-before-v311-fix.md`

### Andrat
- `index.html`
  - lagt till valjbar `Classic` / `Modern` grafik i Installningar
  - lagt till moderna WebP-assets for Klassisk, Isbla, Rosa och Lila med samma riktning, svansforankring och mjuka skalning som Androidversionen
  - lagt till blinkande ogon i modernt lage
  - behallit nuvarande procedural-rendering for specialskin och den befintliga prestandacachen
- `translations.js`
  - lagt till svenska och engelska texter for grafiklage och moderna grafikval

### Backup
- `index.backup-2026-09-04-before-modern-graphics.html`
- `translations.backup-2026-09-04-before-modern-graphics.js`
- `CHANGELOG.backup-2026-09-04-before-modern-graphics.md`

### Tidigare andringar
- `index.html`
  - lagt till en ny sektion for bonushandelser under Installningar
  - lagt till snabbvalet `Lugn runda` som stanger av mysteryboxar, Sifferportaler och bonusliv
  - lagt till separata pa/av-reglage for mysteryboxar, Sifferportaler och bonusliv
  - sparar valet pa enheten och visar `Lugn runda` eller en anpassad bonusraknare i menysammanfattningen
  - kopplat varje reglage direkt till motsvarande spawnvillkor utan att andra museet, befintliga fynd eller vanlig spelstatistik
  - gjort Installningar scrollbar sa den nya sektionen fungerar aven pa lagre skarmhojder
- `translations.js`
  - lagt till svenska, engelska och tyska texter for Lugn runda och de tre bonushandelserna

### Backup
- `index.backup-2026-09-03-before-calm-round.html`
- `translations.backup-2026-09-03-before-calm-round.js`

## 2026-09-03

### Andrat
- `index.html`
  - rattat den dolda prestandamatningen sa den mater riktiga bildruteintervall och visar FPS, p95, rittid, ormlangd, skinn och belastningslage med `?perf=1`
  - gjort prestandalaget reproducerbart med valfria `segments`, `skin` och portalbakgrund via query-parametrar
  - stangt av all musik automatiskt i prestandalaget sa ljudfilerna inte paverkar matningarna
  - cachelagrat ormens fjallmonster, ljus- och djupgradienter samt bassegment med skugga utan att ta bort grafik eller animationer
  - cachelagrat portalens statiska gradientlager men behallit partiklar och siffror animerade
  - samlat renderingen kring en gemensam bildrutetid och cachelagrat aktiv huvudbonad for att undvika upprepade tids- och lagringslasningar
  - verifierat normal styrning, klassisk orm, Prismagodis, Stjarnarkiv, Regnbage, Hund, Katt, HV71, Ghost och portalbakgrund utan webbläsarfel
  - matt klassisk orm till `60 FPS` vid `120` segment (tidigare cirka `31`) och cirka `60 FPS` vid `200` segment (tidigare cirka `18`) pa testdatorn
  - matt Prismagodis och Stjarnarkiv till `60 FPS` vid `120` segment efter optimeringen

### Backup
- `index.backup-2026-09-03-performance-optimization.html`

## 2026-06-05

### Andrat
- `index.html`
  - lugnat ner mysterybox-spawnen med hogre startkrav, lagre chans, max `3` boxar per runda och minst `6` besvarade tal mellan boxar
  - snyggat upp `3 2 1`-nedrakningen med en tydligare rund HUD-bricka i stallet for den tunna ovala ringen
  - uppdaterat appen, tickern och om-rutan till `version 3.10`
  - uppdaterat tickertexten till att beskriva lugnare mysteryboxar och snyggare nedrakning
- `translations.js`
  - uppdaterat versionsstrangarna fran `v3.9` till `v3.10`

### Backup
- `index.backup-2026-06-05-mystery-spawn-countdown-v310.html`

## 2026-06-04

### Andrat
- `index.html`
  - fixat sa vanliga spelplanen ritas direkt nar man kommer ut ur `Sifferportalen`
  - gjort sa att `3 2 1`-nedrakningen visar spelet i bakgrunden i stallet for bonusbanan
  - uppdaterat appen, tickern och om-rutan till `version 3.9`
  - uppdaterat tickertexten till att beskriva den fixade portalatergangen
- `translations.js`
  - uppdaterat versionsstrangarna fran `v3.8` till `v3.9`
- `index.html`
  - byggt om `Sifferportalen` sa den inte langre kravde `20 000` poang
  - andrat portalreglerna till `upp till 2` portaler per runda
  - lagt in nya spawnkrav dar portal `1` kan borja dyka upp efter `10` besvarade tal och portal `2` efter `10` fler
  - lagt in smartare portalchans efter ratta svar med hogre chans ju langre det dröjer
  - gjort forsta portalen enklare med `jamna` eller `udda` tal, och senare portal mer klurig
  - uppdaterat appen, tickern och om-rutan till `version 3.8`
  - uppdaterat tickertexten till att beskriva en smartare portal som ar lattare att hitta och kan dyka upp `2` ganger
  - lagt till en ny `Sifferportal` som kan spawna mycket sallan efter minst `20 000` poang, hogst en gang per runda
  - lagt till en egen `bonusbana` pa tid dar spelaren samlar `Sifferstoft`
  - lagt till matematiska portaluppdrag som `jamna tal`, `udda tal` och `tal delbara med 3` eller `4`
  - lagt till trygg portalatergang sa vanliga rundan sparas, bonusbanan avslutas separat och spelet aterstartar med `3 2 1`
  - lagt till portalrendering pa spelplanen, egen bonusbanebakgrund och neutrala portalbrickor som inte avslöjar ratta svar visuellt
  - kopplat portalen till HUD, styrning, spawnlogik, tacklista och versionslyft utan att skriva om mysterybox-systemet
  - uppdaterat tacklistan med `Sixten Ekvall - For iden till portalen och bonusbanan`
  - uppdaterat appen, tickern och om-rutan till `version 3.7`
  - uppdaterat tickertexten till att beskriva `Sifferportalen`, `bonusbana` och `kluriga portaluppdrag`
  - lagt till en ny `Så funkar museet`-guide hogst upp i Mysteriemuseum med `4` enkla steg for barn
  - lagt till en dynamisk `Börja här`-ruta som tydligt säger vad spelaren bor gora nast i museet
  - lagt till enkel forklaring av relikfarger och rarities direkt i museet
  - forenklat museumsammanfattningens texter sa `Sifferstoft`, set, hattar och skins blir lattare att forsta
  - byggt om flera museumstexter till enklare barnsprak i butik, verkstad och skinsektioner utan att andra mysterybox-systemet
  - gjort sektionerna `Butik & verkstad`, `Skins att lasa upp` och `Bra mal just nu` tydligare for nya spelare
  - verifierat mysterymuseets huvudflode med browser smoke test och riktade logiktester for upplasningar, milstolpar och butikskop
  - uppdaterat appen, tickern och om-rutan till `version 3.6`
  - uppdaterat tickertexten till att beskriva det tydligare Mysteriemuseumet, `4`-stegsguiden och smartare mal
- `translations.js`
  - uppdaterat versionsstrangarna i sprakfilen fran `v3.7` till `v3.8`
  - uppdaterat versionsstrangarna i sprakfilen fran `v3.6` till `v3.7`
  - uppdaterat versionsstrangarna i sprakfilen fran `v3.5` till `v3.6`
- `index.backup-2026-06-04-portal-bonuslane-v37.html`
  - skapad som backup fore portalen, bonusbanan, tacktillagget och versionslyftet till `3.7`
- `index.backup-2026-06-04-portal-spawn-v38.html`
  - skapad som backup fore den nya portalbalansen och versionslyftet till `3.8`
- `index.backup-2026-06-04-museum-clarity.html`
  - skapad som backup fore tydlighets- och onboardingforbattringarna i Mysteriemuseum
- `index.backup-2026-06-04-museum-verify-v36.html`
  - skapad som backup fore verifieringsrundan och versionslyftet till `3.6`

## 2026-06-01

### Andrat
- `MYSTERY_MUSEUM_SPEC.md`
  - lagt till ett konkret byggunderlag for mysteryboxar, museidamm, rarities, relikset, huvudbonader och prestige-skins
  - slagit fast 5-tier rarity med vit/gron/bla/lila/orange
  - lagt till sakerhetsregler for framtida implementation sa museumssystemet kan byggas ut utan att skada befintlig spelkod
- `index.html`
  - lagt till en tydligare `✨`-ikon for `Sifferstoft` i museumsammanfattningen, butikens kostnadsrad och stoftrelaterade toasts/meddelanden
  - lagt till en extra kostnadsrad i butiken sa varje erbjudande tydligt sager hur mycket `Sifferstoft` det kostar
  - bytt mysteryvalutan fran `Museidamm` till `Sifferstoft` i museum, toasts, bonusrutor och mysterymeddelanden
  - bytt `Finbox` till `Prismabox`
  - lagt till livstid pa mysteryboxen ute pa spelplanen sa den kan losa upp sig till lite `Sifferstoft` om man inte hinner ata den
  - lagt till liten visuell nedrakningsring pa mysteryboxen sa det syns att den inte ligger kvar for evigt
  - gjort mystery-resumens countdown till en transparent HUD-overlay ovanpa spelet sa ormen fortsatt syns under `3 2 1`
  - lagt till `siffersnoken_mystery.mp3` som eget mysteryljud medan bonusfragan ar uppe
  - lagt till en synlig mysterytimer pa `12` sekunder som kan spracka boxen om tiden tar slut
  - lagt till en separat `3 2 1`-nedrakning innan spelet fortsatter efter mysteryfragan
  - uppdaterat versionsstrangar, ticker och om-sida fran `3.1` till `3.5`
  - gjort mysteryljud, timer och countdown robusta vid omstart, game over, meny och musik-toggle
  - gjort `museumScreen` scrollbar sa museum-sidan gar att rulla som andra oversiktssidor
  - lagt till en ny `Senast funna reliker`-sektion hogst upp i museet sa nya fynd syns direkt
  - byggt om museet till klickbara expanderbara sektioner for verkstad, museumsskins, narmaste prestige-skins och varje raknesattsset
  - rattat museum/skins-refresh till den aktiva skarmklassen sa museisidan uppdateras korrekt nar man ar kvar pa den
  - lagt till ett nytt `Mystery box`-system med rarity-nivaer, slumpad spawn och bonusfraga som pausar spelet
  - lagt till nytt spelstate och overlay for mysterybox-fragor med svarsknappar och fortsattningsflode
  - lagt till ett nytt `Mysteriemuseum` med egen menysida, samlarset per raknesatt och museidamm for dubbletter
  - lagt till sparning, export/import och nav-raknare for museiframsteg
  - lagt till visuellt mysterybox-objekt pa spelplanen utan att skriva om befintlig tile- eller skinrendering
  - uppgraderat mysterysystemet till `5-tier rarity` genom att lagga till `uncommon` mellan `common` och `rare`
  - byggt ut museirelikerna fran `16` till `20` foremal med ett nytt `uncommon`-fynd for varje raknesatt
  - lagt till en forberedande datamodell for museidammets butik med riktade boxar, huvudbonadsbox och crafting-floden
  - gjort museistatet framtidssakert med nytt `shop`-block och normalisering av sparad museidata
  - byggt ut museisidan med en riktig dammbutik for `Kurator-box`, `Finbox`, `Hattask`, `Relikverkstad` och `Legendarisk restaurering`
  - lagt till `14` museumshuvudbonader med egna unlockregler, hatcrate-pool och visuella ritningar
  - kopplat `3 av 5`-setmilstolpar och mastery-milstolpar till automatiska huvudbonadsupplasningar
  - gjort museumshuvudbonader spelbara i vanliga huvudbonadsvaxlaren utan att lasa eller forstora gamla fria bonader
  - lagt till `8` museumsskins med egna teman, preview-farger och museumskopplade unlockkrav
  - kopplat museumsmilstolpar till skins for `5/5` set, `alla 4 set`, `alla 4 rare`, `alla 4 epic` och `alla 4 legendary`
  - lagt till en ny prestige-sektion pa museisidan sa eleverna kan se vilka museumsskins som gar att jaga
  - lagt till `8` engangsbonusar i museidamm for kompletta set, `alla 4 set`, `alla 4 rare`, `alla 4 epic` och `alla 4 legendary`
  - gjort museumsskinsens prestige-sektion tydligare med faktisk progress i stallet for bara last/olast status
  - lagt till `Bonusdamm` i museumsammanfattningen sa progressionen i dammbutiken blir tydligare
  - lagt till tydlig oversikt over total skinprogress och visat att spelet nu har `40` skins totalt
  - lagt till en ny `Narmast att lasa upp`-sektion for museumsskins sa det blir tydligt vilka prestige-skins som ar narmast
  - finjusterat museiekonomin med billigare boxar och crafting: `12`, `34`, `60`, `120`, `240` i stallet for `15`, `40`, `75`, `150`, `300`
  - gjort `Kurator-box`, `Finbox` och `Hattask` lite mer generosa i rarity-oddsen sa progressionen mot hattar och prestige-skins blir mjukare
  - hojt den totala milestone-beloningen i museidamm till `515` sa museumshattar och verkstaden kanns mer realistiska att na
- `index.backup-2026-06-01-mystery-museum.html`
  - skapad som backup fore museum- och mysterybox-systemet
- `index.backup-2026-06-01-museum-step1-five-tier.html`
  - skapad som backup fore uppgraderingen till `5-tier rarity`, `20` reliker och butikens datamodell
- `index.backup-2026-06-01-museum-shop-headwear.html`
  - skapad som backup fore dammbutiken, museumshuvudbonaderna och deras unlocklogik
- `index.backup-2026-06-01-museum-skins.html`
  - skapad som backup fore museumsskinsen, deras unlocklogik och prestige-sektionen i museet
- `index.backup-2026-06-01-museum-balance-milestones.html`
  - skapad som backup fore bonusdamm, milestone-claiming och tydligare prestigeprogress i museet
- `index.backup-2026-06-01-museum-next-goals.html`
  - skapad som backup fore total skinoversikt och `Narmast att lasa upp`-guidningen i museet
- `index.backup-2026-06-01-museum-economy-tune.html`
  - skapad som backup fore justeringen av shoppriser, rarity-odds och bonusdamm i museet
- `index.backup-2026-06-01-museum-scroll-layout.html`
  - skapad som backup fore museum-sidans scrollfix, senaste-fynd-yta och expanderbara layout
- `index.backup-2026-06-01-mystery-timer-countdown-v35.html`
  - skapad som backup fore mysteryljud, mysterytimer, `3 2 1`-resume och versionslyftet till `3.5`
- `index.backup-2026-06-01-countdown-overlay-hud.html`
  - skapad som backup fore den transparenta countdown-overlayn ovanpa spelet
- `index.backup-2026-06-02-sifferstoft-box-timer.html`
  - skapad som backup fore namnbytet till `Sifferstoft`, `Prismabox` och timern pa mysteryboxen ute pa spelplanen
- `index.backup-2026-06-02-sifferstoft-icon-polish.html`
  - skapad som backup fore ikonpolishen for `Sifferstoft` i museum, butik och mysterymeddelanden

## 2026-05-11

### Andrat
- `index.html`
  - `fotboll.overlayFn` uppdaterad till att hoppa over huvudsegmentet med `if(isHead)return;`
  - `miamisunset` uppdaterad till samma segmentdesign som `plasma`, men med Miami Sunset-farger
  - lagt till permanent `totalGames` sa spelraknaren kan ga over 100 spel
  - lagt till medaljen `mul10000` och nytt skin `hund`
  - lagt till skinintegrerade hundoron som ritas fore huvudbonad
  - justerat hundoron till samma riktningslogik som huvudbonader
  - lagt till smalare hundsvans med diskret viftning
  - justerat hundskinnets sista kroppsdel till en rundare svansknopp
  - forankrat hundskinnets svansknopp tydligare mot sista kroppsdelen vid svangar
  - backat hundskinnets svansknopp och later hundsvansen sitta separat fast i vanlig svansspets
  - kortat hundsvansen och justerat hundsvansspetsens fargmatchning
  - hundskinnets bakgrundspartiklar andrade fran pollen till sma vita hundben
  - lagt till medaljerna `add10000`, `sub10000` och `div10000`
  - lagt till skinnen `katt`, `jordgubbe` och `bi`
  - lagt till engelska och tyska texter for de nya medaljerna och skinnen
  - lagt till kattoron, jordgubbsblast och bivingar som skinintegrerade huvuddetaljer
  - lagt till separat kattsvans och egen fargmatchning for kattens svansspets
  - lagt till nya teman for `katt`, `jordgubbe` och `bi`
  - lagt till tillfallig dev-upplasning av alla skins om spelarnamnet ar `devAndreas`
  - finjusterat `katt` till ljusare brun/vit palett och vant kattoronen med storre mellanrum
  - finjusterat `bi` med morkare huvud och flyttat bivingarna till kroppens mittsegment
  - ljusat upp `bi`-huvudet utan gul huvudglow, last bivingarna till segmentet bakom huvudet och 180-gradersflippat kattoronen
  - gjort om `katt` till mer ragdoll-lik fargpalett utan kroppsrandningar och lagt till stora bla kattogon
  - lagt till diskret blinkning pa kattogon och byggt om `bi`-slotten visuellt till ett pandaskinn
  - gjort pandan mindre prickig och gett kroppssegmenten storre svarta pandanmarkeringar
  - stangt av de vanliga orm-ogonen pa pandaskinnet sa bara panda-ogonfalten syns
  - flyttat panda-ogonfalten till huvuddetalj-ritningen sa de inte forvrangs av riktningen
  - bytt panda-ogonfalten fran enkla ovaler till mjukare panda-maskformer
  - forenklat panda-ogonfalten igen till tva storre ovaler for tydligare look
  - justerat panda-huvudets layout med mindre oron langre ut och mindre separerade ovala ogonfalt utan blur-klumpning
  - byggt om panda-sparet till `Ko` med ko-ansikte, oron, horn och rosa mule
  - forenklat ko-huvudet till bara vanliga orm-ogon plus horn och mule
  - tagit bort de sma hornen fran ko-huvudet
  - flyttat ner och krympt kons mule sa de vanliga orm-ogonen inte tacks over
  - flyttat ko-ogonen till ko-blocket hogre upp och sankt mulen ytterligare for tydligare ansikte
  - slutat rotera koansiktets ogon och mule, och lagt ogonen tydligt ovanfor mulen
  - aterstallt koansiktets riktning och rattat ordningen sa mulen ligger langst fram och ogonen bakom
  - gjort medaljrutorna jamnstora med en responsiv grid-layout pa medaljsidan
  - bytt `div10000`-medaljens ikon fran bi till ko sa den matchar Ko-skinnet
  - tagit bort den tillfalliga `devAndreas`-fuskkoden som laste upp alla skins

### Effekt
- Fotbollsskinnets monster ritas nu bara pa kroppsegment.
- Huvudet lamnas rent.
- Miami Sunset har nu ett mjukare plasma-liknande djup och glow, men behaller sin egen fargpalett.
- Spel totalt nollstalls inte langre i praktiken vid 100 historikposter.
- Hundskinnet lases nu upp vid 10 000 multiplikationspoang.
- Hundskinnet har morkbruna kanter, ljusbrun insida och hundoron pa huvudet.
- Hundoronen foljer nu riktningen korrekt uppat, nedat, hoger och vanster.
- Hundsvansen ar nu smalare och viftar lite.
- Hundskinnets lilla sista kroppsdel ar nu rundare och mjukare i formen.
- Hundskinnets svansknopp foljer nu svangriktningen och sitter tydligare fast mot kroppen.
- Hundskinnet anvander nu vanlig svansspets igen, medan hundsvansen sitter separat fast i bakkanten.
- Hundsvansen ar nu kortare och svansspetsen matchar hundskinnets morkbruna kant och ljusare insida battre.
- Hundskinnets bakgrund visar nu sma vita hundben i stallet for vanliga pollenpartiklar.
- Nya 10 000-medaljer finns nu for addition, subtraktion och division.
- `katt` lases upp via `add10000`, `jordgubbe` via `sub10000` och `bi` via `div10000`.
- Kattskinnet har spetsigare oron och en egen kattsvans med varmare farger.
- Jordgubbsskinnet har rod kropp, gula froprickar och gron blast pa huvudet.
- Biskinnet har svart-gul randning med glow och sma vingar vid huvudet.
- De nya skinnen och medaljerna visas nu korrekt pa svenska, engelska och tyska.
- Om spelarnamnet ar `devAndreas` lases alla skins upp automatiskt for test.
- Kattskinnet ar nu ljusare med vitare insida, och oronen ar spegelvanda med storre mellanrum.
- Biskinnets huvud ar nu morkare, och vingarna sitter nu pa ett mittsegment i kroppen i stallet for pa huvudet.
- Biskinnets huvud ar nu ljusare och mer neutralt utan gul glow, vingarna sitter alltid pa segmentet direkt bakom huvudet, och kattoronen ar nu faktiskt 180 grader vanda.
- Kattskinnet har nu en mjuk ragdoll-lik creme/taupe-look utan randmonster, med matchande svans och stora bla ogon med blank.
- Kattskinnets bla ragdollogon blinkar nu ibland.
- `bi`-slotten visas nu som `Panda` med vita/svartflackiga kroppsegment, svarta ogonpartier och svarta oron.
- Pandans kropp har nu storre svarta omraden i stallet for smapricks-flackar, medan huvudet fortsatt haller sig rent bortsett fran ogonomradet.
- Pandahuvudet ritar nu inte langre de vanliga orm-ogonen ovanpa panda-ogonfalten.
- Panda-ogonfalten foljer nu riktningen mer stabilt och ska inte byta form nar ormen svanger.
- Panda-ogonfalten har nu en mjukare, mer pandalik maskform i stallet for enkla ovala flackar.
- Panda-ogonfalten ar nu i stallet tva storre, tydligare ovaler.
- Panda-huvudet har nu renare layout: oronen ligger langre ut och ogonfalten ska inte ga ihop till en mork klump.
- `bi`-slotten visas nu i stallet som `Ko`, med vanliga ogon igen och ett mer lasbart ko-huvud.
- Ko-huvudet visar nu inte langre oron, bara vanliga orm-ogon, horn och mule.
- Ko-huvudet visar nu bara mule utan de sma hornen.
- Kons mule ligger nu lagre och mindre, sa de vanliga orm-ogonen ska synas igen.
- Kons ogon ritas nu hogre upp an mulen och ska synas tydligare pa huvudet.

### Rollback
- Ta bort raden `if(isHead)return;` i `fotboll.overlayFn`.
- aterstall `miamisunset`-blocket till tidigare `bodyFn` + linjeoverlay
- ta bort `totalGames` ur `DEFAULT_STATS` och relaterade helperanrop
- ta bort medaljen `mul10000` och skinnet `hund`
- ta bort `drawSkinHeadFeature(...)`-anropet och hundore-funktionen
- aterstall hundsvansens specialritning och `getHeadDecorPose(...)`-helpern om du vill tillbaka till forra versionen
- aterstall hundsvansens sista kroppsdel till vanlig rundad ruta om du vill ha forra formen
- flytta tillbaka hundsvansknoppens centrum/rotation om du vill ha forra mjukare men mindre forankrade varianten
- aterga till specialritad svansknopp om du vill tillbaka till den tidigare hundsvansvarianten
- aterstall hundsvansens langd/wag-varden och hundsvansspetsens overlay om du vill tillbaka till forra fintrimningen
- byt tillbaka `hund`-temats `particles` till `pollen` och ta bort `bones`-grenen i `drawParticles(...)`
- ta bort `add10000`, `sub10000` och `div10000` ur medaljdefinitioner, progress och medaljcheckar
- ta bort `katt`, `jordgubbe` och `bi` ur `SKINS_DEF`, `SKIN_I18N_DE` och `SKIN_THEMES`
- ta bort de nya huvuddetaljerna i `drawSkinHeadFeature(...)` och kattsvansen i `drawCatTailFeature(...)`
- ta bort `applyDevUnlockAllSkins(...)` och dess anrop i namnmodalen och uppstarten
- aterstall `katt`- och `bi`-blockens tidigare farger och flytta tillbaka bivingarna till huvudritningen om du vill tillbaka till forra looken
- aterstall `beeWingIndex`, bihuvudets gradient/skugga och kattoronens rotationsvarde om du vill tillbaka till forra finjusteringen
- aterstall `katt`-skinnets tidigare farger/overlay och standardogon om du vill tillbaka till pre-ragdoll-versionen
- aterstall kattogonens blinklogik och `bi`-skinnets tidigare bee-utseende om du vill tillbaka till versionen fore pandaombyggnaden
- aterstall pandans tidigare overlay om du vill tillbaka till den mer prickiga panda-varianten
- aterstall den lilla inre ogonritningen i panda-blocket om du vill tillbaka till versionen med vanliga orm-ogon pa pandan
- flytta tillbaka panda-ogonfalten till huvudogon-blocket om du vill tillbaka till den tidigare orienteringen
- aterstall panda-ogonfaltens ellipseform om du vill tillbaka till den enklare panda-versionen
- aterstall panda-maskformen om du vill tillbaka till versionen fore de storre ovalerna
- aterstall panda-huvudets tidigare oron/ogon-offset och blur om du vill tillbaka till layouten fore den har finjusteringen
- aterstall `bi`-slotten till panda om du vill tillbaka till panda-sparet i stallet for ko-sparet
- aterstall ko-oronblocket om du vill tillbaka till den mer fulla ko-versionen
- aterstall kohornsblocket om du vill tillbaka till ko-versionen med sma horn

## 2026-04-28

### Andrat
- `index.html`
  - lagt till nytt skin `ghost` med upplasning via medaljen `mytisk`
  - lagt till tysk skintext for `ghost`
  - lagt till `ghost` i `SKIN_THEMES`
  - lagt till Milton Garpenrud och Mille Renberg pa tacksidan

### Effekt
- Nytt transparent ghost-skin kan lasas upp efter langd 100.
- Tacksidan visar nu bade Milton och Mille.

### Rollback
- ta bort `ghost`-objektet ur `SKINS_DEF`
- ta bort `ghost` ur `SKIN_I18N_DE`
- ta bort `ghost` ur `SKIN_THEMES`
- aterstall de tva nya raderna i tacksidetexten

## 2026-04-27

### Andrat
- `index.html`
  - `tiger.overlayFn` uppdaterad till att hoppa over huvudsegmentet med `if(isHead)return;`
  - `drake.overlayFn` uppdaterad till att hoppa over huvudsegmentet med `if(isHead)return;`

### Effekt
- `tiger` och `drake` ritar nu rander/fjall endast pa kroppsegment.
- Huvudet for bada skinnen lamnas rent.

### Rollback
- Ta bort parametern `isHead` fran `tiger.overlayFn` och `drake.overlayFn`.
- Ta bort raden `if(isHead)return;` i de tva funktionerna.
