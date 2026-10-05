# Sagoskogen – produktionsprompt, 2026-10-05

## Mobilpilot: två kompositioner per stil

De godkända breda bilderna ovan behålls oförändrade. Två nya stående bilder har skapats med den **inbyggda bildgenereringen**, ett separat anrop per stil, med respektive breda bild som stilreferens. Resultat: `assets/sagoskog-toy-portrait.webp` (1049 × 1499, kvalitet 91) och `assets/sagoskog-pixel-portrait.webp` (1049 × 1500, kvalitet 94). Ogenomskinlig WebP utan beskärning eller skalning vid export. PNG-originalen lämnas kvar i generated_images (`exec-e9dfc724-3cea-4cef-b6a5-7adfe3832298.png` respektive `exec-10ba34a6-a7cd-4f52-aa30-4427c3aade75.png`).

### Gemensam stående prompt

Use case: stylized-concept. Create ONE final portrait Sagoskogen game-board background, intended aspect 14:20, approximately 1024 x 1463. Recompose the supplied landscape reference into a taller mobile board, preserving its exact visual style and blue-teal/emerald/lime/stone-grey palette. It is a style reference, not a request to stretch the old image. Full-bleed opaque rectangle, no rounded frame or margin. STRICT straight down 90-degree orthographic view, only canopy tops and pebble tops, no horizon, trunks, sides, perspective. Sparse leaf clusters, smooth grey stones and at most three tiny cream daisies confined to the FOUR CORNERS. Reduce corner clusters to at most 20% width, 18% height. Keep at least 75% playable area quiet and blue teal. Crucially, the ENTIRE full-width horizontal band between 32% and 68% of image height must be completely empty blue-teal floor (including outermost left and right edges): no foliage, rocks, shadows, paths, lines or distinct speckles there, so this band can extend for a taller board. Very subtle uniform material texture only, no noticeable gradient, no dividing lines or seams. Sharp focused edges, no blur, haze, depth-of-field. No snake, animals, characters, text, labels, numbers, tiles, game UI, logos or watermark.

Modern style: sculpted matte rounded toy/clay leaves with smooth crisp contours and subtle carved veins. Soft contained shadows only immediately under corner objects. Same tasteful polished toy material as the reference.

Pixelretro style: genuine charming authored 16-bit pixel art, consistent small square clusters and crisp stepped silhouettes. No smooth leaf edges, no antialiasing, no mosaic filter. Simple restricted colors, same sparse reference character.

### Adaptiv komposition

`BoardBackgrounds.forestAsset` väljer bred/stående efter banans logiska mått. `forestSlices` behåller hörnens proportioner genom jämn skalning efter bredden. Bara en tom mittremsa förlängs: breda källor har snitt vid 40/56 procent av höjden, stående vid 28/72 procent. Snitten har granskats mot de faktiska bilderna, inte bara promptens önskemål. Alla källpixlar används; inget motiv beskärs. Den färdiga ytan cachas (högst två), så bara en bildkopiering behövs varje spelbildruta. Endast vald stil/komposition hämtas.

WEB behåller 21 × 16 även i mobil webbläsare. Utvecklingsprovet erbjuder även 14 × 20 och 14 × 23 via `perf=1&boardPreview=portrait|joystick`; detta är banformatsprov med WEB-renderern, inte en Android-migrering eller ett APK-test. Androids assets och kod är ännu oförändrade.

Skapad med den inbyggda bildgenereringen enligt imagegen-skillen, från godkänt koncept. Två separata anrop, ett per stil. Konceptet är stil-/kompositionsreferens, inte edit-mål. Spelbilderna finns i `assets/sagoskog-toy.webp` och `assets/sagoskog-pixel.webp`. PNG-originalen behålls i Codex generated_images. WebP-konvertering ändrar inte kompositionen; Modern kvalitet 91 och Pixelretro kvalitet 94. Snoksprites exporteras separat som förlustfri WebP.

## Gemensam prompt

Use case: stylized-concept. Asset type: final standalone SifferSnoken WEB board background. Input image: ONLY style/composition reference, NOT an image to copy as a whole. Produce ONE single full-bleed LANDSCAPE 1536 x 1024 image (3:2), NO comparison, labels, borders, gutter, UI, snake, numbers, characters, text, watermark or logo. Scene: Sagoskogen forest clearing with muted blue-teal floor, emerald/olive leaf canopy tops, smooth grey pebbles and at most three small cream daisies confined to the corners and thin perimeter. STRICT straight-down 90-degree orthographic overhead camera, no horizon, walls, trunks, front faces or isometric view. Reference is the approved target, retain its sparse clusters and blue-teal center. Outer decorations must occupy at most 7% of width at left/right and at most 7% of height top/bottom except corners which may extend 14%. The inner 84% by 84% rectangle must be ENTIRELY clear and quiet: a uniform subtle teal floor without any distinct object, cracks, speckles, shadows or detailed texture. No paths. Shape-defined, sharp focused edges, no blur, haze, depth of field or muted overlay. Friendly polished game asset, minimal detail that will distract from answer tiles.

## Modern-tillägg

Match the LEFT Modern panel's sculpted matte rounded TOY/CLAY materials. Leaves have crisp smooth contours and subtle sculpted vein ridges, limited large shapes, soft contained shadows only at perimeter. Quiet teal center, only almost imperceptible material variation.

## Pixelretro-tillägg

Match the RIGHT Pixelretro panel. Authored charming 16-bit pixel tiles with consistent small square pixel clusters across the ENTIRE image, crisp stepped shapes, no antialiasing or smoothly rendered leaf edges. This is dedicated pixel art, NOT a mosaic filter. Sparse canopy clusters, limited palette, same teal quiet floor, minimal center texture.
