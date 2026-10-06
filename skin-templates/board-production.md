# Alla banor – Modern, Pixelretro och mobilkomposition

Runda 2026-10-06: de elva återstående vanliga banorna har fått 44 nya, fristående bakgrundsbilder. Sagoskogen behåller sina fyra godkända pilotbilder. Totalt 12 teman × 2 stilar × 2 kompositioner = 48 opaka WebP. Portalens bonusbana är separat och oförändrad. Android-appens kod, tillgångar och APK har inte ändrats.

## Tillgångar och stil

Tillgångarna ligger direkt i `assets/`: `{tema}-toy.webp`, `{tema}-pixel.webp`, `{tema}-toy-portrait.webp` och `{tema}-pixel-portrait.webp`. Temastammarna och svenska namnen finns i `BoardBackgrounds.themes`. Tidigare banbilder finns kvar; inget raderas eller skrivs över.

Kristallgrotta, Soltemplet, Fotbollsplan, Basketplan, Hockeyrink, Korallrev, Molnstaden, Vulkanön, Magiska biblioteket, Neonarkaden och Månträdgården har egna breda/stående kompositioner. Modern har skulpterad matt leksaksform; Pixelretro är separat skapad pixelgrafik, inte ett filter på Modern. Dekorationerna ligger vid hörn/ändzoner och mitten är lugn. Sportbanorna använder två mål eller två korgar på motsatta kortsidor; fotbollsmålen förenklades efter feedback om burformade nät.

Alla nya bilder skapades med inbyggd bildgenerering, ett anrop per tillgång. PNG-originalen finns kvar i Codex generated_images. Slutliga promptar och valda källfilnamn finns i `references/board-round-2026-10-06.json`. `tools/export-board-backgrounds.cjs` gör enbart WebP-export, ingen omritning, beskärning, blur eller färgmattning. Manifestet `generated/board-manifest.json` innehåller dimensioner, filstorlek, kvalitet och SHA-256 för alla 48 bilder.

## Integration och mobil

`BoardBackgrounds.asset(id,mode,width,height)` väljer efter spelplanens logiska proportioner. WEB är fortfarande 21:16 även på en stående mobil. Stående bilder väljs för Android-formaten 14:20 och 14:23, som delar komposition. `compositionSlices` bevarar hela bilden och skalar de övre/nedre ändzonerna proportionellt. Bara mittbandet får längre höjd. Nya breda bilder har snitt 38/62 procent av höjden, stående 28/72 procent; Sagoskogen behåller sina tidigare snitt.

Modern och Pixelretro hämtar bara vald bild med en gemensam lazy loader. Bildcachen håller högst fyra poster; kompositionscachen högst två färdiga dukar. Återkommande bildrutor gör en enda bakgrundskopiering. Vid laddning/fel visas en enkel säker yta. På/Av gäller fortfarande samtliga banor och portalen; Av laddar inte nya bilder. Original och alla spelregler/upplåsningar är oförändrade.

## Kontroller

- Samtliga 12 teman i båda stilarna är provade med grön Klassisk snok och riktiga svarbrickor i WEB 21:16, Android-proportion 14:20 och 14:23: 72 stil-/formatfall.
- Samtliga teman är även provade med båda stilarna vid 390 px mobilbredd, stående banformat: ytterligare 24 fall.
- Produktionsbilder och spelstorlek är visuellt granskade; mittfält, proportioner och kontrast kontrolleras utan blur/filter. `background-preview.html` väntar på korrekt laddad bild och visar ett tydligt fel om någon tillgång saknas.
- Elva befintliga testsuites, nya tester för 48 bildval, begränsad lazy loader, laddningsfel, proportionella ändzoner och `export-board-backgrounds.cjs --check` passerar.
- Banformatstest i WEB är inte test av Androids WebView, DPI, touch/joystick, safe-area eller APK. Följ Android-planen i README vid överflytten.

## Menykoncept

Tre interaktiva mobilförslag – Sagolobbyn, Snokstudion och Äventyrsboken – är enbart koncept för jämförelse. Ingen ny meny är aktiverad. Befintliga menyfunktioner ska bevaras, särskilt snabbval Åk 1–6, räknesätt/negativa tal, spelinställningar, 41 skins, 30 huvudbonader, medaljer/belöningar, statistik, Highscore, Mysteriemuseum, namn, ljud/språk och Om/credits. Koncepten ändrar inte sparad spelardata.
