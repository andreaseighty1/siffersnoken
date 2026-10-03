# Fasta snokmallar: leksaksformer och pixelretro

Det här är produktionsmallar för kropp, huvud, svans och separata ögonlager. De är **inte inkopplade i spelet ännu**. Befintliga skins, upplåsningar, inställningar och modernbilder är oförändrade.

## Arbetsmodell

Ett nytt skin beskrivs en gång i `themes.json`: id, tema, färger, mönster och om kroppsmönstret ska ha fast orientering. Byggverktyget skapar **båda stilarna i samma körning**. Geometrin hämtas alltid från `body-spec.json`; en ny bildgenerering får inte bestämma en ny kroppskontur.

- Leksak: 512 × 512, cirkel med diameter 416 px, matt mjukt ljus utan blank prick eller mikrotektur.
- Pixel: 32 × 32 logiska pixlar, cirkulär trappstegskontur med diameter 26 px, begränsad palett och hårda pixelkanter.
- Samma centrum, relativa bildmarginaler och relativa diameter i båda stilarna.
- Mönster ligger innanför masken. Alla segment för ett tema har identisk kontur, storlek och ljusriktning.
- WebP med riktig alfakanal. Pixelbilden ska inte skalas om med mjuk filtrering eller sparas som JPEG.
- Alpha-nedtoning på en lång orm ska ske i spelrenderingen, inte bakas in i kroppsmallen.

Neutral, Klassisk, Jordgubbe och Basketboll är inkluderade. De enkla mönstren ritas i kod: glesa jordgubbsfrön och fasta basketsömmar. Inga nya rasterbilder eller API-anrop behövs för att ändra färgerna i dessa teman.

## Bygga och kontrollera

SVG-källor, förhandsvisning och manifest kan byggas med enbart Node:

```powershell
node tools/body-templates.cjs
node tools/body-templates.cjs --check
node tests/body-templates.test.cjs
```

För WebP-export, ange en redan installerad `sharp`-modul:

```powershell
node tools/body-templates.cjs --sharp "C:\sökväg\node_modules\sharp"
node tests/body-templates.test.cjs --sharp "C:\sökväg\node_modules\sharp"
```

Öppna `preview.html` för mallar, exempel och en sväng per tema. `generated/manifest.json` listar de avsedda WebP-filerna; de är byggartefakter, inte en runtime-registrering av nya grafiklägen. SVG-källorna är redigerbara och ska kunna reproduceras från tema och specifikation.

## Huvud, svans och ögon

`snake-spec.json` låser huvudformen, ögonankare, bakre utsmyckningszon och svansens fästkant. Huvudet är en enkel bred, rundad oval, cirka 1,15 gånger kroppens bredd. Det förstoras inte ytterligare i förhandsvisningen. Öron och horn hör hemma bakom ögonen (y minst 0,60 i uppåtvänd originalbild); inga sådana utsmyckningar har lagts till i dessa basmallar.

Svansen har plan fästkant, cirka 42 procent av kroppens bredd, och avsmalnar till en liten spets. Originalbildens svans pekar nedåt från fästet, medan huvudet är uppåtvänt. Rotera svansen kring dess fäste, inte bildens mitt. `joinGeometry(style)` och `pose(style, variant)` i byggverktyget visar koordinatkonventionen och rätt placering. Fästkanten läggs på en kord nära kroppens kant: dess hörn möter cirkeln och bara den lilla cirkelkappan överlappar. En bred plan kant kan inte ligga längs hela en rund cirkels tangent utan glipa. Pixelversionen har ett eget avrundat ankare så hela fästkanten når kroppens heltalspixlar.

`eyes-open.webp` och `eyes-blink.webp` är gemensamma per stil och används ovanpå huvudbasen i exakt samma bildram, skala och rotation. Blinka genom att byta lager, inte genom att skala huvudbilden. Applicera samma transparens på sista kroppsdelen och svansen i renderingen. Framtida svansvickning ska använda samma fästpunkt; vickningsanimationen är inte implementerad här.

Bygg och testa samtliga 28 tillgångar (kroppar, huvud, svansar och ögon) med:

```powershell
node tools/snake-templates.cjs --sharp "C:\sökväg\node_modules\sharp"
node tools/snake-templates.cjs --check
node tests/snake-templates.test.cjs --sharp "C:\sökväg\node_modules\sharp"
```

`parts-preview.html` visar de färdiga WebP-bilderna som delar och sammanfogade provsnokar: sväng, rak kropp och nedtonad svans. `generated/snake-manifest.json` listar hela uppsättningen och svansarnas fästpunkter i respektive originalbilds pixlar. Det äldre kroppsverktyget och dess förhandsvisning finns kvar.

## När ett nytt skin görs

1. Definiera temat en gång och skapa båda kroppsversionerna.
2. Behåll konturen; ändra färg och mönster. Komplexa motiv som päls, drakfjäll och galax behöver stil-specifik mönsterdesign, inte bara en färgändring.
3. Bygg huvud och svans i **båda** stilarna med de fasta mallarna. Öron/horn bakom ögonen. Komplexa mönster och utsmyckningar behöver egen temadesign men ska inte flytta ögon eller svansfäste.
4. Testa raka delar, svängar, lång orm och mobil i båda lägena. Märk temat klart först när båda är godkända.

## Före inkoppling i spelet

- Pixel behöver `imageSmoothingEnabled=false` och pixelanpassad skalning. Att bara lägga till en tredje inställningsknapp räcker inte.
- Pixel ska inte använda den nuvarande lilla variationen i kroppsdelarnas storlek. Det fasta pixelrutnätet måste hållas stabilt genom animationen.
- Huvud-, svans- och ögonmallarna är kontrollerade som bildtillgångar och statiska sammanfogningar. Rörelse, svansvickning, långa snokar och mobilspelets pixelrutnät behöver fortfarande testas i faktisk spelrendering innan grafiklägena aktiveras.
- Förhandsvisningen använder spelets nuvarande standardvärden 1,26 i kroppsskala och 1,08 i överlappning. Denna geometrikontroll ersätter inte ett speltest.
- Bevara ursprungliga modernassets under hela migreringen. Inga upplåsningskrav ska ändras när grafiklägena kopplas in.
