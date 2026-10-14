# Higgsfield-Ad: Nachbau der TikTok-Referenz

Eine fertige Higgsfield-Ad, Shot für Shot nach der hochgeladenen Referenz gebaut. Die Referenz bricht bei „Editors grab the …“ ab. Hier geht es weiter: Das Wort „Plugin“ kommt dazu, der Ordner öffnet sich mit Higgsfield-, Premiere-Pro- und After-Effects-Badges, am Schluss steht eine Endkarte mit Logo, „Now in Premiere Pro & After Effects“ und higgsfield.ai.

| Datei | Was |
|---|---|
| `out/higgsfield_ad_16x9.mp4` | **Die Ad:** 1920×1080, 30 fps, 34,5 s, eigener Sound (Musik + SFX, lizenzfrei, −14 LUFS) |
| `out/rebuild_16x9_silent.mp4` | Dasselbe ohne Ton, zum Anlegen der Stimme im Schnitt |
| `vo_script.srt` | Voiceover-Skript mit Timings, passend zur Typo. Einsprechen oder mit ElevenLabs erzeugen und unter die Ad legen |
| `out/rebuild_16x9_guide-audio.mp4` | Mit dem Originalton der Referenz als Timing-Guide (nur intern, nicht in Git) |
| `out/compare_ref_vs_rebuild.mp4` | Referenz oben, Nachbau unten (nur intern, nicht in Git) |
| `ad.html` | Die Komposition. Im Browser öffnen gibt eine Live-Vorschau |

## Shot-Liste

| # | Zeit | Shot |
|---|---|---|
| 1 | 0,0–1,5 | „What if you could create“: Wort für Wort, unscharf und grau, dann scharf und dunkelgrün, Lime-Blobs |
| 2 | 1,5–2,5 | „An entire / ad“ + weiße Karte mit Bilderfächer |
| 3 | 2,5–4,5 | „Without Filming“ → Zoom über „Filming Anything“ → Lime flutet |
| 4 | 4,5–5,5 | „One of the things“, das Higgsfield-Mark fliegt rein |
| 5 | 5,5–6,9 | Logo-Reveal: Punktring, Pixel-Quadrate, Wortmarke |
| 6 | 6,9–10,6 | Prompt-Box: Produkt reinziehen, Prompt tippt, 3D-Fahrt zum Senden-Button, Ripple |
| 7 | 10,6–12,0 | Higgsfield-Plugin im Editor, Invert zu Weiß |
| 8 | 12,0–12,9 | „Need a Spokesperson“ tippt und löscht |
| 9 | 12,9–14,3 | Prompt-Leiste „Create a Spokesperson for a Product Review“ → Generate |
| 10 | 14,3–18,4 | Avatar-Raster → Human → Script.txt rein → Senden |
| 11 | 18,4–19,4 | „Generating“ |
| 12 | 19,4–21,5 | „You can also transform“ → „Images“-Collage |
| 13 | 21,5–23,7 | „Visual Styles“-Karte: Retro, Cyberpunk, Brutalist, Anime, Hyper realism |
| 14 | 23,7–26,1 | „Generate content for“ + Instagram/YouTube/TikTok |
| 15 | 26,1–31,0 | „Editors Grab the Plugin“, der Ordner öffnet sich mit den Plugin-Badges (**neu**) |
| 16 | 31,0–34,5 | Endkarte: Logo, „Now in Premiere Pro & After Effects“, higgsfield.ai (**neu**) |

## Higgsfield-spezifisch

- **Logo:** Das Mark ist aus dem größten Logo-Frame der Referenz vektorisiert (8× hochskaliert, Kontur mit Löchern, geglättet), keine Fremd-Nachzeichnung. Die Wortmarke ist in Outfit 800 gesetzt. Wenn du die offiziellen Logo-Dateien hast, tausch `LOGO` in `ad.html` (SVG-Pfad, Kreisradius 100) und die Wortmarke aus.
- **Inhalt:** „Now in Premiere Pro & After Effects“ stammt von Higgsfields eigenen Plugin-Seiten (ein Installer für beide Apps). Das habe ich nicht unabhängig geprüft, bitte vor dem Schalten gegenchecken.
- **UI-Begrüßung:** Statt des Creator-Namens „CLIFFSY“ aus der Referenz steht dort „HEY, WHAT ARE WE CREATING TODAY?“.
- **Pr/Ae-Badges:** Das sind nur Text-Badges in Adobe-Farben, nicht die offiziellen Icons.

## Was du noch tauschen solltest

- **Bilder sind Platzhalter:** freie Testbilder aus `imageio-binaries` (Astronautin/NASA, Katzen, Kaffee, Kodak-Mützen, Hubble, Kakadu, Holz, Ziegel, Wiese), weil externe Bildquellen von hier gesperrt sind. Für die echte Ad gehören Higgsfield-Outputs rein: KI-Avatare im Raster, generierte Ads im Fächer und in der Collage. Gleiche Dateinamen in `assets/`, dann `bash render.sh`.
- **„VAZU“-Dose und Editor-UI:** in HTML nachgezeichnet, keine Screens.
- **Stimme:** Ich kann hier keine Stimme erzeugen. `vo_script.srt` hat Text und Timing. Die Typo zeigt die Wörter genau dort, wo sie gesprochen werden.

## Neu rendern

```bash
cd ads/reference
bash render.sh      # ~20 min: Video (4 parallele Prozesse, 8 Sub-Frames Motion Blur) + Ton + Muxen
python3 audio.py    # nur den Ton neu → work/audio.wav
```

Texte, Zeiten und Kamera-Keyframes stehen in `ad.html` (Blöcke `/* S1 */` … `/* S16 */`), die Ton-Ereignisse in `audio.py` (gleiche Zeiten).
