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

Servern använder Europe/Stockholm och ISO-veckans år (årsskiften hanteras). Vid första anropet varje vecka lottas en av 24 uppgiftskombinationer. Förra kalenderveckans kombination utesluts. Databaslås förhindrar att samtidiga besök skapar olika utmaningar. Inget cron-jobb behövs. Tre liv, fast fart, väggpassage och avstängda bonushändelser gäller alla utmaningar. Tidigare veckors regler och resultat sparas.

## Skydd och begränsningar

Namnen kontrolleras på servern, med 3–12 tecken och ett grundfilter för svenska/engelska ord och vanliga siffer-/upprepningsvarianter. Filtret är inte heltäckande; administrera listan och komplettera blocked_names vid behov. Efternamn kan inte identifieras automatiskt.

Varje resultat kräver en tidsbegränsad engångstoken från servern. Poäng, längd och tidsåtgång rimlighetskontrolleras. Detta är **grundskydd, inte verifierat fusksäkert spel**: resultat beräknas fortfarande i webbläsaren. CORS är inte autentisering. Starkare skydd kräver serververifiering av spelhändelser.

Topplistan sparar tävlingsnamn, poäng, längd, utmaning och publiceringstid. Den lagrar inte spelstatistik eller bestående spelar-ID. Spambegränsningen använder en roterande HMAC av IP-adressen som raderas efter högst en timme vid nästa skrivande anrop. Kontrollera också Loopias webbserverloggar och deras lagring. Informera besökare om offentlig publicering och bestäm hur länge arkivresultat ska sparas.

Den första versionen visar aktuell vecka i gränssnittet. Äldre veckor kan hämtas med `action=leaderboard&week=2026-W41`; ett arkivval i gränssnittet kan läggas till senare.
