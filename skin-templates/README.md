# Fasta kroppsmallar: leksaksformer och pixelretro

Det här är produktionsmallar och byggprover för kroppar. De är **inte inkopplade i spelet ännu**. Befintliga skins, upplåsningar, inställningar och modernbilder är oförändrade.

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

## När ett nytt skin görs

1. Definiera temat en gång och skapa båda kroppsversionerna.
2. Behåll konturen; ändra färg och mönster. Komplexa motiv som päls, drakfjäll och galax behöver stil-specifik mönsterdesign, inte bara en färgändring.
3. Gör huvud och svans i **båda** stilarna med samma proportioner och rätt fästpunkter. Öron/horn bakom ögonen. Dessa mallar är nästa steg, inte färdiga här.
4. Testa raka delar, svängar, lång orm och mobil i båda lägena. Märk temat klart först när båda är godkända.

## Före inkoppling i spelet

- Pixel behöver `imageSmoothingEnabled=false` och pixelanpassad skalning. Att bara lägga till en tredje inställningsknapp räcker inte.
- Pixel ska inte använda den nuvarande lilla variationen i kroppsdelarnas storlek. Det fasta pixelrutnätet måste hållas stabilt genom animationen.
- Huvud och svans behöver egna låsta mallar, ögonlager och testade fästen. Manifestets förslag på proportioner är startvärden, inte en verifierad svansplacering.
- Förhandsvisningen använder spelets nuvarande standardvärden 1,26 i kroppsskala och 1,08 i överlappning. Denna geometrikontroll ersätter inte ett speltest.
- Bevara ursprungliga modernassets under hela migreringen. Inga upplåsningskrav ska ändras när grafiklägena kopplas in.
