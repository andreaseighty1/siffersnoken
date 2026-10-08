# Installera veckans utmaning på Loopia

Webbspelet ligger kvar på GitHub Pages. PHP-filerna ska köras på Loopia, inte GitHub Pages. Använd PHP 8.1 eller senare och en webbplats med HTTPS.

1. Skapa en MariaDB-databas och databasanvändare i Kundzonen. Tillåt anslutning från Loopias Unix-plattform. Importera `schema.sql` med phpMyAdmin.
2. Skapa `siffersnoken-api` i webbplatsens publika rot, normalt `public_html`. Ladda upp **bara** `api.php`, `lib.php` och `admin.php` dit.
3. Skapa `siffersnoken-private` bredvid `public_html`, alltså utanför den publika roten. Kopiera `config.example.php` dit som `config.php`. Med detta upplägg hittar PHP konfigurationen automatiskt. Om din katalogstruktur avviker måste sökvägen i `lib.php` justeras.
4. Fyll i databasvärd, databasnamn, användare och lösenord i den privata filen. Ange webbappens exakta HTTPS-origin utan avslutande snedstreck. Behåll hemligheter utanför GitHub.
5. Generera serverhemlighet och adminlösenordets hash lokalt med kommandona i exempelkonfigurationen. Lägg in värdena i den privata filen. Använd ett eget starkt administratörslösenord.
6. Besök `https://DIN-DOMAN/siffersnoken-api/api.php?action=challenge`. Du ska få JSON med vecka, år och spelregler.
7. Sätt `window.SIFFER_WEEKLY_API` i webbprojektets `weekly-config.js` till `https://DIN-DOMAN/siffersnoken-api` och publicera den filen på GitHub Pages.
8. Provspela veckans utmaning, publicera ett testresultat och kontrollera båda topplistorna. Logga in på `admin.php` och ta bort testresultatet.

## Veckor och regler

Servern använder Europe/Stockholm och ISO-veckans år (årsskiften hanteras). Vid första anropet varje vecka lottas en av 144 kombinationer av uppgifter, hastighet och väggregler. Förra kalenderveckans kombination utesluts. Databaslås förhindrar att samtidiga besök skapar olika utmaningar. Inget cron-jobb behövs. Tre liv och avstängda bonushändelser gäller alla utmaningar. Hastigheten lottas mellan fast fart, ökning med poäng och ökning med ormlängd. Väggpassage eller väggkrock som avslutar rundan lottas också. Grundvikterna är 70% fast fart, 15% ökning med poäng, 15% ökning med längd samt 80% väggpassage och 20% dödliga väggar. Uteslutningen av föregående veckas exakta kombination justerar sannolikheterna något. Redan skapade veckor behåller sina sparade regler; äldre regler utan speed/wallWrap använder fast fart och väggpassage. Tidigare veckors regler och resultat sparas.

## Skydd och begränsningar

Namnen kontrolleras på servern, med 3–12 tecken och ett grundfilter för svenska/engelska ord och vanliga siffer-/upprepningsvarianter. Filtret är inte heltäckande; administrera listan och komplettera blocked_names vid behov. Efternamn kan inte identifieras automatiskt.

Varje resultat kräver en tidsbegränsad engångstoken från servern. Poäng, längd och tidsåtgång rimlighetskontrolleras. Detta är **grundskydd, inte verifierat fusksäkert spel**: resultat beräknas fortfarande i webbläsaren. CORS är inte autentisering. Starkare skydd kräver serververifiering av spelhändelser.

Topplistan sparar tävlingsnamn, poäng, längd, utmaning och publiceringstid. Den lagrar inte spelstatistik. Ett slumpat tävlings-ID per lokal spelarprofil sparas i webbläsaren; servern sparar en HMAC av ID:t för att hålla ihop spelarens bästa poäng och längsta orm per vecka. Topplistorna visar upp till 50 spelare. Namnbyte vid publicering ger ingen extra plats. Ny webbläsare, rensad webbplatsdata eller en annan lokal spelarprofil kan skapa en ny identitet, så detta är ett praktiskt skydd utan konton. Spambegränsningen använder en roterande HMAC av IP-adressen som raderas efter högst en timme vid nästa skrivande anrop. Kontrollera också Loopias webbserverloggar och deras lagring. Informera besökare om offentlig publicering och bestäm hur länge arkivresultat ska sparas.

Den första versionen visar aktuell vecka i gränssnittet. Äldre veckor kan hämtas med `action=leaderboard&week=2026-W41`; ett arkivval i gränssnittet kan läggas till senare.

## Uppgradera en befintlig installation

Följ UPGRADE-3.13.md: importera upgrade-player-id.sql i befintlig databas och ersätt sedan api.php och lib.php. Behåll den privata konfigurationen och serverhemligheten.
