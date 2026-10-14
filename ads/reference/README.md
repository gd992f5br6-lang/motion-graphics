# Nachbau: Higgsfield-Ad (TikTok-Referenz)

Shot-für-Shot-Nachbau der hochgeladenen Referenz (33,6 s, 1020×576; die letzten 4 s sind TikToks eigener Abspann und gehören nicht dazu).

| Datei | Was |
|---|---|
| `out/rebuild_16x9_silent.mp4` | Der Nachbau: 1920×1080, 30 fps, 29,5 s, ohne Ton |
| `out/rebuild_16x9_guide-audio.mp4` | Dasselbe mit dem Originalton der Referenz als Timing-Guide (nur intern, nicht veröffentlichen) |
| `out/compare_ref_vs_rebuild.mp4` | Referenz oben, Nachbau unten, synchron |
| `ad.html` | Die Komposition. Jeder Frame ist eine reine Funktion der Zeit; im Browser öffnen gibt eine Live-Vorschau |

## Shot-Liste (Zeiten = Referenz)

| # | Zeit | Shot | Technik |
|---|---|---|---|
| 1 | 0,0–1,5 | „What if you could create“ | Wörter kommen einzeln: unscharf und grau, dann scharf und dunkelgrün, mit leichtem Baseline-Versatz. Am Ende schieben sie sich nach links ineinander |
| 2 | 1,5–2,5 | „An entire / ad“ + weiße Karte | Karte fährt von rechts rein, Bilder fächern sich in 3D auf, Abgang mit Zoom-Blur |
| 3 | 2,5–4,5 | „Without Filming“ → „Filming Anything“ | Harter Schnitt auf ca. 4,5× Zoom, Kamerafahrt über „Anything“, Zoom-out, dann flutet Lime von unten |
| 4 | 4,5–5,5 | Lime-Fläche, „One of the things“ | Squiggle-Mark fliegt rein, der Lime-Kreis wächst, außen wird es dunkel |
| 5 | 5,5–6,9 | Logo-Reveal | Halftone-Punkt-Ring expandiert, Pixel-Quadrate fliegen raus, Wortmarke baut sich Buchstabe für Buchstabe auf, Defocus raus |
| 6 | 6,9–10,6 | Prompt-Box | Rack-Focus, Überschrift tippt, Hand-Cursor zieht das Produktbild rein (Lime-Glow), Text tippt. Dann 3D-Kamerafahrt an die Feldkante (sichtbare Seitenfläche), Lime-Cursor klickt Senden, Ripple |
| 7 | 10,6–12,0 | Plug-in im Editor | Perspektivische Fahrt über die App-UI, dann Invert und Überbelichtung zu Weiß |
| 8 | 12,0–12,9 | „Need a Spokesperson“ | Tippt mit grünem Caret, löscht wieder, Zoom-Blur raus |
| 9 | 12,9–14,3 | Prompt-Leiste | Lime blendet zu Dunkel, Kamera folgt dem Caret, „Generate ✦“ leuchtet beim Klick |
| 10 | 14,3–18,4 | Avatar-Raster | Panel fährt hoch, Klick auf „Human“, der Rest wird unscharf, Script.txt wird reingezogen, Senden |
| 11 | 18,4–19,4 | „Generating“ | Rotierender, unscharfer Wirbel, Schimmer über den Buchstaben, Lime-Ring-Glow |
| 12 | 19,4–21,5 | „You can also transform“ → „Images“ | Bild-Collage fliegt von allen Seiten rein |
| 13 | 21,5–23,7 | „Visual Styles“ | Karte stellt scharf, Pill tippt, Liste tippt Zeile für Zeile, grüner Balken wächst |
| 14 | 23,7–26,1 | „Generate content for“ + Icons | Kamera fährt mit dem Satz mit, Social-Icons poppen auf |
| 15 | 26,1–29,5 | „Editors Grab the“ + Ordner | Zeile zentriert sich neu, steigt auf, blauer Ordner kommt von unten |

## Was bewusst anders ist

- **Schrift:** Die Referenz nutzt einen Grotesk mit gebogenem „t“, für den ich keine freie Version gefunden habe. Ich habe 31 Google Fonts verglichen und Outfit (OFL) für die Headlines genommen, Figtree (OFL) für die UI.
- **Bilder:** Die KI-Avatare und Werbefotos der Referenz habe ich nicht übernommen. Externe Bildquellen (Wikimedia, Openverse, Unsplash, Hugging Face) sind aus dieser Umgebung gesperrt. Platzhalter sind freie Testbilder aus `imageio-binaries` (Astronautin/NASA, Katze, Kaffee, Kodak-Mützen, Hubble, Kakadu, Holz, Ziegel, Wiese). Tausch sie gegen deine eigenen, die Dateinamen in `assets/` sind die Schnittstelle.
- **Logo und Produkt:** Squiggle-Mark, Wortmarke, „VAZU“-Dose und Editor-UI sind von Hand in HTML/SVG nachgezeichnet, keine Original-Assets.
- **Ton:** Ich habe keinen eigenen Ton gebaut. Die Guide-Version nutzt den Originalton, damit du das Timing prüfen kannst. Zum Veröffentlichen brauchst du eigene Stimme und Musik.

## Ändern und neu rendern

```bash
cd ads/reference
bash render.sh          # ~10–15 min, 4 parallele Prozesse, SUB=8 Sub-Frames Motion Blur
```

Texte, Zeiten und Kamera-Keyframes stehen in `ad.html` (Shot-Blöcke `/* S1 */` … `/* S15 */`, Kamera-Tracks `c6`, `c7`, `c10`).
Für einen Vergleich an bestimmten Zeitpunkten: `node engine/compare.js ad.html work/cmp.png 2.0 5.7 9.4`.
