# SifferSnoken – visuella produktionsregler

## Moderna banbakgrunder

- Alla banor ska ses exakt 90 grader uppifrån med ortografiskt perspektiv, eftersom snoken alltid renderas uppifrån.
- Använd aldrig snett fågelperspektiv, isometriskt perspektiv, horisont eller flyktpunkter.
- Visa inte framsidor eller sidoytor på väggar, klippor, läktare, trappor, mål, möbler, byggnader eller andra objekt. Endast deras ovansidor eller plana fotavtryck får synas.
- Håll minst cirka 65 procent av mitten öppen, jämn, lågkontrast och fri från stora detaljer så snoken och svaren förblir lättlästa.
- Placera temadetaljer och de starkaste färg-/ljuskontrasterna huvudsakligen längs ytterkanterna.
- Bakgrunder får inte innehålla snokar, figurer, siffror, läsbar text, UI eller logotyper.
- Runtimeformat är ogenomskinlig WebP i 1536 × 1024.
- Kontrollera alltid den färdiga banan tillsammans med en modern snok i själva spelet innan leverans.

## Moderna snokskins

- Runtimebilder ska vara WebP med riktig alfakanal; ingen inbakad vit, svart eller schackrutig bakgrund.
- Utgå från den klassiska snokens breda, enkla och rundade huvudform. Temat ska främst uttryckas med färg, material, mönster och mindre utsmyckningar; en specialsilhuett får bara användas när den fortfarande passar kroppens proportioner i spelet.
- Öron, horn och liknande utsmyckningar ska sitta bakom spelögonens position, mot huvudets bakre del, och får inte göra huvudet oproportionerligt stort.
- Kroppsdelar ska vara tydligt rundade och organiska, inte kvadratiska.
- Riktningskänsliga mönster ska testas både horisontellt, vertikalt och i en sväng. Rotationen ska följa snokens riktning utan att mönstret ser vridet eller hoppigt ut.
- Fristående bollmönster som Basketboll och Fotboll ska ha fast orientering och ingen växelvis spegling på kroppsdelarna. Huvud och svans ska fortfarande följa snokens riktning.
- Lägg inte en rad stora runda cirklar/prickar tvärs över mitten av kroppsdelarna.
- Svansens plana fästkant ska möta sista kroppsdelen utan synlig glipa eller onödigt stor överlappning.
- Svansens fäste ska normalt vara tydligt smalare än kroppsdelen och svansen ska använda samma material, färger och mönsterspråk som kroppen.
- Kroppens gradvisa transparens ska även omfatta svansen.

## Snokmallar för leksaksformer och pixelretro

- Konceptförlagorna i `skin-templates/references` är visuella mål. Jämför faktiska tillgångar i `style-targets.html` före leverans; geometri- och alpha-tester räcker inte som stilgodkännande. Leksak ska ha skulpterad matt volym, stora mörka pupiller och kort rundad svans. Pixel ska ha mörk kontur, rundade färgsteg och små ljusblänk, inte platt diagonal skuggning.
- Använd `skin-templates/body-spec.json`, `themes.json` och `tools/body-templates.cjs` för låst geometri och båda stilversionerna i samma byggkörning. Läs `skin-templates/README.md` innan mallarna används eller nya stilar kopplas in.
- Använd även `snake-spec.json` och `tools/snake-templates.cjs` för huvud, svans och separata ögonlager i båda stilarna. Svansens angivna fästpunkt är dess rotationscentrum; placera den på kroppens kord nära kanten enligt `joinGeometry`, aldrig med godtycklig centrumöverlappning.
- Använd låsta huvudskalor och rätt huvudvariant för ljusriktningen. Alla källmasker är uppåtvända; högervarianten roteras 90 grader. Jordgubbens blad och pixelstilens tunga är separata lager. Slagskuggor läggs i renderingen, inte i spritealfan. Läs manifestet och README före integration.
- Ändra inte kroppens kontur eller relativa diameter för att göra ett nytt tema. Mönstret ska ligga innanför den gemensamma masken.
- Pixel arbetar med 32 × 32 logiska pixlar och förlustfri WebP. Källbilder och det logiska snoklagret ritas utan bildutjämning eller varierande segmentstorlek. Enligt användarens stiljustering tillåts lätt utjämning i sista skalningssteget till spelytan/mobil; ingen generell blur på snoken.
- Byggprover och statiska sammanfogningar är inte aktiverade grafiklägen. Befintliga modernassets ska bevaras tills hela malluppsättningen har testats i spelet, inklusive rörelse, lång orm och mobil.
