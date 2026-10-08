# Topp 50 och tävlings-ID

1. Öppna befintliga databasen i phpMyAdmin. Importera upgrade-player-id.sql. Kör inte om eller radera databasen. Befintliga resultat behålls.
2. Ersätt api.php och lib.php i /snokapi.42improbableowls.com/public_html/siffersnoken-api/. Den nya lib.php innehåller också den viktade veckolottningen.
3. config.php, admin.php och hemligheten ska behållas. Byter du serverhemlighet förloras kopplingen till befintliga tävlings-ID:n.
4. Kontrollera api.php?action=challenge: identityVersion ska vara 1. Webbappen är redan uppdaterad via GitHub Pages; tryck Ctrl+F5.
5. Provspela två rundor med samma lokala spelare. Samma plats ska visa bästa poäng och bästa längd, även om de kommer från olika rundor. Ett nytt tävlingsnamn ändrar namnet på samma plats. På en delad dator får olika lokala spelarnamn egna ID:n. Det är ett praktiskt skydd, inte verifiering av en fysisk person.

Servern sparar HMAC av slumpat ID, inte webbläsarens råa ID. Varje vecka/spelare får en databasrad med oberoende poäng- och längdrekord. ID:t visas inte offentligt. Gamla resultat saknar ID och slås ihop per namn i listorna; de kan inte säkert kopplas till nya ID:n. Därför kan ett äldre resultat och en ny ID-plats med samma namn förekomma under övergångsveckan. Vid nästa vecka gäller ID-systemet för alla nya resultat. Samma förnamn hos olika nya profiler är tillåtet.
