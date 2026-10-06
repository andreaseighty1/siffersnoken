# Spelstatistik och övningsmönster

Spelträffsäkerhet räknar alla vanliga kollisioner som tidigare. Felstyrning kan inte skiljas från felräkning; detta är inte ett kunskapstest eller en statistisk diagnos.

Övningsanalysen räknar endast första svaret på varje visad uppgift. Den guidade guldsnoksåterhämtningen ingår inte. En markering kräver minst tre missar på samma uppgift över två omgångar, minst 25 procent missar på uppgiften och minst 20 analyserade försök över två kompatibla omgångar. Tre senaste rätta försök tar bort markeringen. Trösklarna är försiktiga produktheuristiker, inte validerade pedagogiska gränsvärden.

De senaste tio omgångarna för vald spelare används. Talområde, valda tabeller och övnings-/standardläge hålls isär. Endast den senast använda nivån per räknesätt ger förslag. Spelare identifieras med sparat namn; namnbyten kan alltså dela upp historiken. Alla-spelare-vyn ger inga gemensamma råd när flera namn förekommer.

Äldre historik bevaras utan att hitta på rätta svar per uppgift. Nya detaljer sparas som `questionStats.version=2`, högst 256 olika uppgifter per omgång. `omitted` anger om fler uppgifter inte kunde analyseras. Spelhistoriken behåller som tidigare högst 100 omgångar.

`statistics-preview.html` visar den riktiga statistikvyn med syntetiska testfall, utan att spara eller rensa spelardata. `tests/practice-statistics.test.cjs` provar analys, integration och tre språk. Detta är WEB-kod; Android har inte migrerats.
