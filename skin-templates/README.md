# Fasta snokmallar: leksaksformer och pixelretro

Det här är produktionsmallar för kropp, huvud, svans och separata ögonlager. **Klassisk, Isblå, Rosa, Lila, Smaragd, Jordgubbe, Basketboll, Regnbåge, Guld, Polkagris, Galax, Vattenmelon, Fotboll, Miami Sunset, Blixt, Aurora, Hav, Lava och Obsidian är inkopplade i spelet i båda stilarna.** Leksaksformerna ersätter tidigare Modern men menyvalet heter fortfarande Modern. Pixelretro är tredje grafikvalet, bredvid Klassisk och Modern. Övriga skins behåller tills vidare sina befintliga modernbilder och märks i skinväljaren. Upplåsningskraven är oförändrade.

## Runtimeexport och integration

Efter mallbygget körs `node tools/export-snake-styles.cjs`. Verktyget kopierar endast de 235 spelbara WebP-tillgångarna till `skins/styles/{toy,pixel}` och bygger `snake-style-config.js` från specifikationernas geometri, paletter och kontrastinställningar. Neutralprover, SVG och konceptförlagor exporteras inte. Kontrollera reproducerbarhet med `node tools/export-snake-styles.cjs --check`.

`snake-styles.js` används av både spel och skinväljare. Kropparna har fast orientering/storlek. Huvudenas fyra ljusvarianter, ögonblinkning, jordgubbsblad och pixeltunga återanvänds från mallarna. Svans och sista runda kropp ritas ihop i en cachad sprite **före** gemensam nedtoning, som aldrig går under 75 procent opacitet. Leksaksformen får en tunn inre kontur utan ändrad silhuett. Kontur och slagskuggor bakas en gång i rendercachen, inte varje bildruta. Pixel ritas på ett heltalsrutnät med 24 logiska pixlar mellan segmentcentrum; 32 × 32-källbilderna behåller sin fasta storlek. Bara snoklagrets sista förstoring använder lätt bildutjämning. CSS pixelering av hela spelduken används inte: sifferbrickor, text och banbakgrund ska behålla sin vanliga grafik. Ingen andning eller segmentstorleksvariation används i pixelstilen.

Sparat `graphicsMode: modern` migreras till runtime-id `toy`, utan att ändra andra inställningar. Både `toy` och `pixel` använder befintliga uppifrån-bakgrunder under övergången. En saknad eller ej färdig stilversion faller tillbaka på skinnets gamla modernbilder, inte ett annat skin. Gamla filer bevaras.

Test: `node tests/snake-styles.test.cjs` och `node tests/snake-colors.test.cjs`. Spelkontroll har genomförts med 33 segment, flera svängar, blinkning och nedtonad svans. Isblå, Rosa, Lila, Smaragd, Regnbåge och Guld är kontrollerade i båda lägena på desktop och i 390 px mobilbredd; Klassisk är kontrollerad mot den gröna skogsbanan efter kontraständringen. Tidigare integrationstest täcker även Jordgubbe och Basketboll. Regnbåges tidsväxling och färgade svansfäste är kontrollerade mot skogsbanan. Vanlig rörelse kontrolleras separat från långorms-fixturen. Befintliga mall- och mattetester ska också fortsätta passera. Testerna säkrar att snokrenderingen återställer kontexten för sifferbrickor och andra spelobjekt, att ögon inte färgskiftas och att Regnbåges cache inte växer över upprepade färgcykler.

Polkagris och Galax har också kontrollerats i båda lägena på desktop och i 390 px mobilbredd, med 33 segment, flera svängar och nedtonad svans, samt separat i vanlig spelrörelse. Båda behåller fast kroppsmönster. Slutpreviews finns via `runtime-preview.html?skins=polkagris` respektive `runtime-preview.html?skins=galax`.

## Arbetsmodell

De godkända konceptbilderna är **visuella mål**, inte bara lös inspiration. `references/toy-concept.webp` och `references/pixel-concept.webp` är förlustfria formatkopior av originalen; inga referensbilder laddas av spelet. Börja visuell kontroll i `style-targets.html`, där konceptens skin-exempel jämförs med de faktiska WebP-tillgångarna. Matematiskt korrekt geometri och godkända alpha-tester betyder inte i sig att stilen har nått målbilden.

Ett nytt skin beskrivs en gång i `themes.json`: id, tema, färger, mönster och om kroppsmönstret ska ha fast orientering. Byggverktyget skapar **båda stilarna i samma körning**. Geometrin hämtas alltid från `body-spec.json`; en ny bildgenerering får inte bestämma en ny kroppskontur.

- Leksak: 512 × 512, cirkel med diameter 416 px, mjukt skulpterad matt volym, diffus ljusmodell och mjuk kantsskuggning. Undvik platta färgskivor, blank kroppsprick och mikrotektur.
- Pixel: 32 × 32 logiska pixlar, cirkulär trappstegskontur med diameter 26 px, mörk kontur, rundade nedre färgsteg och litet ljusblänk. Högst sex färger per bildtillgång och hårda pixelkanter; ingen stor diagonal halvcirkelskugga.
- Samma centrum, relativa bildmarginaler och relativa diameter i båda stilarna.
- Mönster ligger innanför masken. Alla segment för ett tema har identisk kontur, storlek och ljusriktning.
- WebP med riktig alfakanal. Pixelkällbilden ska inte skalas om med mjuk filtrering eller sparas som JPEG; lätt slutskalning i spelrenderingen är tillåten.
- Alpha-nedtoning på en lång orm ska ske i spelrenderingen, inte bakas in i kroppsmallen.

Neutral och de nitton spelbara temana ovan är inkluderade. Mönstren ritas i kod: glesa jordgubbsfrön, fasta basketsömmar, Smaragds diskreta ädelstensgravyr, Polkagrisens breda band, Galaxens nebulosa/stjärnor, Vattenmelons skal/frön, Fotbolls paneler, Miamis sol/vågor, Blixts elektriska material, Auroras norrskensband, Havs skumstråk, Lavas sprickor och Obsidians slipade reflexer. Smaragd använder samma motiv på kropp, huvudets bakre del och en mindre variant på svansen; inga fasetter ändrar den runda silhuetten. Inga nya rasterbilder eller API-anrop behövs för att ändra färgerna i dessa teman.

Regnbåge använder en röd WebP-bas och sju färglägen i `colorCycle`. `snake-colors.js` skiftar endast materialets nyans, med bevarad skuggvolym och oförändrad alpha. Ögon och andra separata lager ritas efter färgskiftningen. Spritevarianterna cachas: inga extra nedladdningar, shaders eller pixelavläsningar varje bildruta. Färgserien följer segmentindex och flyttas ett steg var 1,4 sekund; `prefers-reduced-motion` stoppar tidsväxlingen. Svans och sista kropp har samma färg och gemensam alpha. Skinväljaren visar en stilla färgserie.

Guld har ett brett, mjukt satinreflexlager på Moderns befintliga skulpterade material; reflexen följer samma världsljus på alla huvudriktningar. Pixelretro använder en kompakt honungsgul palett. Inga konturer, storlekar eller fästpunkter ändras.

Polkagris använder ett separat skuggat rött material (`patternPalette`) över varmvit grund. De breda diagonala banden ligger helt inom den låsta masken, även på huvud och svans. Galax använder mjuka blåvioletta nebulosafält och tre asymmetriskt placerade små stjärnor; huvudets stjärnor ligger bakom ögonen och svansen får en mindre variant. Pixelretro förenklar båda motiven till högst sex färger. Kroppsmönstren har fast orientering och ingen tidsanimation: all detaljrikedom är bakad i de små WebP-tillgångarna, inte ritad varje bildruta.

`pixelPalette` är ett valfritt stil-specifikt färgval i samma temabeskrivning. Det behövs för pixelkonceptets tydligare färgsteg; temat, geometri och byggkörning är fortfarande gemensamma. Basketbollens riktiga böjda sömmar är en noterad senare uppgift och har inte ändrats i denna stilkorrigering.

Vattenmelon har grönt, skuggat skal och en ljus rindkant runt rött fruktkött. Skalets bredd följer den låsta kroppscirkeln, huvudovalen och svansens avsmalning; svansen har också skal, fruktkött och ett litet frö. Pixelretro behåller tre röda volymsteg innanför skalet. Fröna är asymmetriska, inte en rad stora kroppsprickar.

Fotbolls panelyta byggs av `tools/football-panels.cjs`: 12 svarta femhörningar och 20 ljusa sexhörningar projiceras från en sfär. Panelernas kanter samplas längs sfärytan, men den gemensamma silhuetten är oförändrad. Modern har skuggade svarta paneler och diskreta sömmar; Pixelretro förenklar ytan till den gemensamma sexfärgspaletten. Kroppen har fast orientering. Alla beräkningar sker vid bygget, aldrig varje spelbildruta. Test: `node tests/football-panels.test.cjs`.

Miami Sunset (`miamisunset`) har rosa, skulpterat material med en orange sol och en turkos vågkant. Modern använder separata skuggade material för sol och hav; Pixelretro förenklar motivet till sex färger med ett tydligt turkost band och mörkare nedre färgsteg. Miamis huvudmotiv ligger i den bakre zonen bakom ögonen; svansen använder samma tema i mindre skala.

Blixt behåller sitt befintliga runtime-id `inferno`, men den blå basen med en fristående blixtsymbol är ersatt. Hela snoken är ett elektriskt vitgult material med öppna, förgrenade energistråk. Stråken når kroppens kanter och täcker även hela huvudytan och den avsmalnande svansen. De är ytmaterial, inte huvudutsmyckningar eller nya silhuetter. Modern har bakade breda ljusstråk och smalare nästan vita kärnor över den skulpterade grundvolymen. Pixelretro har sex varma färger och samma öppna nät. `assetRevision: 2` gör att just Blixts ändrade material hämtas med `?v=2`; gemensamma ögon och andra skins behåller sina cacheadresser. Ingen shader eller glow beräknas varje spelbildruta.

Aurora har mjukt böljande mint-/turkosa norrskensband och diffus färgbelysning över violett grund. Moderns band använder separat skuggat material; Pixelretro har breda gröna ljusband över tydliga violetta färgsteg. Hav har blå/turkos skulpterad volym med tre böljande vågkammar och ljusa skumstråk. Båda temana finns på kropp, huvud och svans, utan att ändra gemensam mask eller huvudstorlek. Kroppsmönstren är fasta och alla detaljer bakas vid export; inga nya tidsanimationer eller runtimeberäkningar behövs.

Lava har varm, mörk stenyta med ett förgrenat nät av orange sprickor och gula glödkärnor. Obsidian har mörkt violett material med två breda slipade reflexfält och smala ljusa kanter. Båda är ytmaterial på de oförändrade runda maskerna, inte nya kantiga silhuetter. Svansens motiv skalas inom samma smala fäste. Pixelretro använder sex färger; Modern bakar ljus/material vid export, utan extra runtimeeffekter.

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

Bygg och testa samtliga 247 tillgångar (inklusive neutralprover och huvudenas ljusriktningsvarianter) med:

```powershell
node tools/snake-templates.cjs --sharp "C:\sökväg\node_modules\sharp"
node tools/snake-templates.cjs --check
node tests/snake-templates.test.cjs --sharp "C:\sökväg\node_modules\sharp"
```

`style-targets.html` är den primära visuella jämförelsen med originalkoncepten. `parts-preview.html` visar delar och sammanfogade provsnokar: sväng, rak kropp och nedtonad svans. `generated/snake-manifest.json` listar hela uppsättningen, huvudskalor, ljusriktning och svansarnas fästpunkter i respektive originalbilds pixlar. Det äldre kroppsverktyget och dess förhandsvisning finns kvar. Referensbilderna är enbart utvecklingsmaterial och ska inte laddas eller paketeras som spelbakgrunder.

`runtime-preview.html?skins=regnbage,guld` visar de faktiska spelbara WebP-filerna i Modern och Pixelretro sida vid sida, med spelets delade renderer. Öppna via en lokal webbserver. Ändra `skins` till andra tema-id:n för nästa leverans. Regnbåges tidsväxling kan pausas; de statiska byggförhandsvisningarna visar bara dess röda basmaterial. Visa en sådan runtime-preview för **varje nytt skin i båda stilarna** vid leverans.

## När ett nytt skin görs

Vattenmelon och Fotboll är kontrollerade i båda stilarna på desktop och vid 390 px mobilbredd: 33 kroppsdelar, flera svängar och nedtonad svans, samt normal spelrörelse. Skalet behåller sin bredd och fotbollskroppens paneler roterar inte vid svängar. Runtime-previews finns via `runtime-preview.html?skins=vattenmelon` respektive `runtime-preview.html?skins=fotboll`.

Miami Sunset och Blixt är också kontrollerade i båda stilarna på desktop och vid 390 px mobilbredd, med 33 segment, flera svängar och nedtonad svans. Vanlig rörelse är kontrollerad separat från fixturen. De låsta formerna jämförs i `style-targets.html` med konceptmålen. Runtime-previews finns via `runtime-preview.html?skins=miamisunset` respektive `runtime-preview.html?skins=inferno`.

Blixts elektriska helhetsmaterial (revision 2), Aurora och Hav är kontrollerade på nytt i båda stilarna, på desktop och vid 390 px mobilbredd. Fixturen täcker 33 segment, flera svängar och gemensam nedtoning av svans/kropp; vanlig rörelse och huvudrotation är separat kontrollerade för alla tre. Konceptjämförelsen bekräftar de låsta runda formerna. Runtime-previews finns via `runtime-preview.html?skins=inferno`, `runtime-preview.html?skins=aurora` och `runtime-preview.html?skins=hav`. Renderertestet säkrar att endast Blixts tolv ändrade runtimebilder versionshämtas och att delade ögon och övriga skins behåller sin cache.

Lava och Obsidian är kontrollerade i båda stilarna på desktop och vid 390 px mobilbredd. Speltesterna täcker 33 segment, flera svängar och gemensam nedtoning av kropp/svans, samt separat normal rörelse och huvudrotation. De faktiska WebP-mallarna är jämförda med koncepten i `style-targets.html`. Runtime-previews finns via `runtime-preview.html?skins=lava` och `runtime-preview.html?skins=obsidian`.

1. Definiera temat en gång och skapa båda kroppsversionerna.
2. Behåll konturen; ändra färg och mönster. Komplexa motiv som päls, drakfjäll och galax behöver stil-specifik mönsterdesign, inte bara en färgändring.
3. Bygg huvud och svans i **båda** stilarna med de fasta mallarna. Öron/horn bakom ögonen. Komplexa mönster och utsmyckningar behöver egen temadesign men ska inte flytta ögon eller svansfäste.
4. Testa raka delar, svängar, lång orm och mobil i båda lägena. Märk temat klart först när båda är godkända.
5. Visa även tillgångarna bredvid konceptmålen. En geometriskt korrekt men visuellt platt/felproportionerad mall är inte färdig.

## Integrationsregler för fortsatta skins

- Pixel behöver `imageSmoothingEnabled=false` i käll-/snoklagret och pixelanpassade positioner. Slutskalningen till spelytan använder lätt utjämning med sparad/återställd kontext, så andra spelobjekt inte påverkas.
- Pixel ska inte använda den nuvarande lilla variationen i kroppsdelarnas storlek. Det fasta pixelrutnätet måste hållas stabilt genom animationen.
- Mallkontrollen ersätter inte ett speltest av varje nytt tema. Rörelse, svansvickning för framtida djurskins, långa snokar och mobilspelets pixelrutnät behöver testas i faktisk spelrendering.
- Förhandsvisningen använder spelets nuvarande standardvärden 1,26 i kroppsskala och 1,08 i överlappning. Denna geometrikontroll ersätter inte ett speltest.
- Bevara ursprungliga modernassets under hela migreringen. Inga upplåsningskrav ska ändras när grafiklägena kopplas in.
