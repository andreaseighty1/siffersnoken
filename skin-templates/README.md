# Fasta snokmallar: leksaksformer och pixelretro

Det här är produktionsmallar för kropp, huvud, svans och separata ögonlager. De är **inte inkopplade i spelet ännu**. Befintliga skins, upplåsningar, inställningar och modernbilder är oförändrade.

## Arbetsmodell

De godkända konceptbilderna är **visuella mål**, inte bara lös inspiration. `references/toy-concept.webp` och `references/pixel-concept.webp` är förlustfria formatkopior av originalen; inga referensbilder laddas av spelet. Börja visuell kontroll i `style-targets.html`, där konceptens skin-exempel jämförs med de faktiska WebP-tillgångarna. Matematiskt korrekt geometri och godkända alpha-tester betyder inte i sig att stilen har nått målbilden.

Ett nytt skin beskrivs en gång i `themes.json`: id, tema, färger, mönster och om kroppsmönstret ska ha fast orientering. Byggverktyget skapar **båda stilarna i samma körning**. Geometrin hämtas alltid från `body-spec.json`; en ny bildgenerering får inte bestämma en ny kroppskontur.

- Leksak: 512 × 512, cirkel med diameter 416 px, mjukt skulpterad matt volym, diffus ljusmodell och mjuk kantsskuggning. Undvik platta färgskivor, blank kroppsprick och mikrotektur.
- Pixel: 32 × 32 logiska pixlar, cirkulär trappstegskontur med diameter 26 px, mörk kontur, rundade nedre färgsteg och litet ljusblänk. Högst sex färger per bildtillgång och hårda pixelkanter; ingen stor diagonal halvcirkelskugga.
- Samma centrum, relativa bildmarginaler och relativa diameter i båda stilarna.
- Mönster ligger innanför masken. Alla segment för ett tema har identisk kontur, storlek och ljusriktning.
- WebP med riktig alfakanal. Pixelbilden ska inte skalas om med mjuk filtrering eller sparas som JPEG.
- Alpha-nedtoning på en lång orm ska ske i spelrenderingen, inte bakas in i kroppsmallen.

Neutral, Klassisk, Jordgubbe och Basketboll är inkluderade. De enkla mönstren ritas i kod: glesa jordgubbsfrön och fasta basketsömmar. Inga nya rasterbilder eller API-anrop behövs för att ändra färgerna i dessa teman.

`pixelPalette` är ett valfritt stil-specifikt färgval i samma temabeskrivning. Det behövs för pixelkonceptets tydligare färgsteg; temat, geometri och byggkörning är fortfarande gemensamma. Basketbollens riktiga böjda sömmar är en noterad senare uppgift och har inte ändrats i denna stilkorrigering.

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

`snake-spec.json` låser huvudformen, stora mörka pupiller, ögonankare, bakre utsmyckningszon och svansens fästkant. Huvudet är en enkel bred, rundad oval, cirka 1,15 gånger kroppens diameter i källbilden. De konceptstyrda huvudskalorna är låsta per stil: 1,12 för leksak och 1,03 för pixel relativt kroppens bildram (cirka 1,29 respektive 1,18 gånger kroppens tvärbredd). Skalan får inte växa ytterligare per tema. Pixelögonen sitter något längre in på huvudet än leksaksögonen, enligt respektive förlaga.

Öron och horn hör hemma bakom ögonen (y minst 0,60 i uppåtvänd originalbild). Jordgubbens separata bladlager följer samma bakre zon och ska roteras med huvudet, inte kroppen. Pixelstilen har ett separat tunglager enligt konceptet. Tungans fäste och offset till huvudets främre kant finns i manifestet; lagret är inte del av huvudets fasta alfamask.

Svansen har plan fästkant, cirka 42 procent av kroppens bredd, och är **kort och rundad**, omkring halva kroppens diameter i längd, inte en lång trekantig spik. Originalbildens svans pekar nedåt från fästet, medan huvudet är uppåtvänt. Rotera svansen kring dess fäste, inte bildens mitt. `joinGeometry(style)` och `pose(style, variant)` i byggverktyget visar koordinatkonventionen och rätt placering. Fästkanten läggs på en kord nära kroppens kant: dess hörn möter cirkeln och bara den lilla cirkelkappan överlappar. En bred plan kant kan inte ligga längs hela en rund cirkels tangent utan glipa. Pixelversionen har ett eget avrundat ankare så hela fästkanten når kroppens heltalspixlar.

`eyes-open.webp` och `eyes-blink.webp` är gemensamma per stil och används ovanpå huvudbasen i exakt samma bildram, skala och rotation. Blinka genom att byta lager, inte genom att skala huvudbilden. Applicera samma transparens på sista kroppsdelen och svansen i renderingen. Framtida svansvickning ska använda samma fästpunkt; vickningsanimationen är inte implementerad här.

Huvudenas ljus och pixelblänk behöver behålla samma riktning som kroppen när de roteras. `head-base.webp` är för uppåtriktat huvud; `head-base-right.webp`, `head-base-down.webp` och `head-base-left.webp` har samma uppåtvända mask men förkompenserad materialskuggning. Välj rätt variant och rotera sedan hela huvud-/ögon-/utsmyckningsgruppen med manifestets `renderRotation`. Byt inte ögon eller geometri för att byta ljusriktning. Förhandsvisningens högervända snokar använder högervarianten plus 90 graders rotation.

Mjuka slagskuggor är ett renderingslager (som CSS `drop-shadow` i jämförelsevyn), inte inbakade i bildalfan. Samma riktning och proportionerliga skuggor ska användas i spelet vid integration.

Bygg och testa samtliga 55 tillgångar (inklusive huvudenas ljusriktningsvarianter) med:

```powershell
node tools/snake-templates.cjs --sharp "C:\sökväg\node_modules\sharp"
node tools/snake-templates.cjs --check
node tests/snake-templates.test.cjs --sharp "C:\sökväg\node_modules\sharp"
```

`style-targets.html` är den primära visuella jämförelsen med originalkoncepten. `parts-preview.html` visar delar och sammanfogade provsnokar: sväng, rak kropp och nedtonad svans. `generated/snake-manifest.json` listar hela uppsättningen, huvudskalor, ljusriktning och svansarnas fästpunkter i respektive originalbilds pixlar. Det äldre kroppsverktyget och dess förhandsvisning finns kvar. Referensbilderna är enbart utvecklingsmaterial och ska inte laddas eller paketeras som spelbakgrunder.

## När ett nytt skin görs

1. Definiera temat en gång och skapa båda kroppsversionerna.
2. Behåll konturen; ändra färg och mönster. Komplexa motiv som päls, drakfjäll och galax behöver stil-specifik mönsterdesign, inte bara en färgändring.
3. Bygg huvud och svans i **båda** stilarna med de fasta mallarna. Öron/horn bakom ögonen. Komplexa mönster och utsmyckningar behöver egen temadesign men ska inte flytta ögon eller svansfäste.
4. Testa raka delar, svängar, lång orm och mobil i båda lägena. Märk temat klart först när båda är godkända.
5. Visa även tillgångarna bredvid konceptmålen. En geometriskt korrekt men visuellt platt/felproportionerad mall är inte färdig.

## Före inkoppling i spelet

- Pixel behöver `imageSmoothingEnabled=false` och pixelanpassad skalning. Att bara lägga till en tredje inställningsknapp räcker inte.
- Pixel ska inte använda den nuvarande lilla variationen i kroppsdelarnas storlek. Det fasta pixelrutnätet måste hållas stabilt genom animationen.
- Huvud-, svans- och ögonmallarna är kontrollerade som bildtillgångar och statiska sammanfogningar. Rörelse, svansvickning, långa snokar och mobilspelets pixelrutnät behöver fortfarande testas i faktisk spelrendering innan grafiklägena aktiveras.
- Förhandsvisningen använder spelets nuvarande standardvärden 1,26 i kroppsskala och 1,08 i överlappning. Denna geometrikontroll ersätter inte ett speltest.
- Bevara ursprungliga modernassets under hela migreringen. Inga upplåsningskrav ska ändras när grafiklägena kopplas in.
