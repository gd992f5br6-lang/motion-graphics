# Higgsfield TikTok-Spot: „4 tells. 4 fixes.“

**Spec-Ad / Portfolio-Arbeit.** Der Spot ist nicht von Higgsfield beauftragt und nicht mit Higgsfield verbunden. Logo und Wortmarke sind nur nachgesetzt und nicht die offiziellen Assets.
Wenn du den Spot als echte Anzeige schalten willst, brauchst du die Freigabe von Higgsfield. Ersetze dann die CG-Shots durch echte Higgsfield-Generierungen (siehe Abschnitt 3).

- Format: 1080×1920 (9:16), 30 fps, 55 s, H.264 + AAC, −14 LUFS
- Datei: `out/Higgsfield_TikTok_55s.mp4`

---

## 1. Analyse: Woran man „typische KI-Videos“ in einer Sekunde erkennt

| # | Merkmal | Warum es auffällt | Was der Spot stattdessen macht |
|---|---|---|---|
| 1 | **Identitäts-Drift**: Gesicht, Outfit oder Proportionen ändern sich von Shot zu Shot | Das Modell „erfindet“ die Figur jedes Mal neu | Eine Figur mit festen Merkmalen (Hut, langer Mantel, roter Schal) in allen drei Locations. Gezeigt wird das als Soul-ID-Fix |
| 2 | **Schwebende Kamera**: gleichmäßige Drift mit leichtem Roll, ohne Gewicht, ohne Operator | Echte Kameras haben Masse, Trägheit und eine Absicht | Kamera mit Handheld-Mikrobewegung (mehrere überlagerte Frequenzen), motivierte Moves und ein physikalisch korrekter **Dolly-Zoom** (24 → 85 mm, Motivgröße bleibt konstant, der Hintergrund staucht sich) |
| 3 | **Plastik-Look**: übersättigt, Teal-Orange, crunchy Kontrast, Überschärfungs-Halos, „Glow“, kein Korn | Default-Grading der Modelle, glattgebügelte Texturen | Display-referenziertes Film-Grading: angehobene Schwarzwerte, weiche Lichter-Schulter, leichte Entsättigung, Halation, Gate-Weave und Korn pro Frame |
| 4 | **Alles in Zeitlupe**, jeder Shot 4–5 s lang und gleich getaktet | Generierte Clips sind oft gedehnt und haben keinen Schnittrhythmus | Regen, Wind und Wellen in Echtzeit. Harte Schnitte auf jedem Beat (0,5 s), Shotlängen von 0,5 s bis 12 s |
| 5 | **Warping und Morphing** an Kanten, Händen und Hintergründen | Fehlende zeitliche Konsistenz | Feste 3D-Geometrie, nichts morpht. Warping kommt nur im Hook vor, als Negativ-Beispiel |
| 6 | **Physikfehler**: Objekte schweben, gehen durcheinander, kein Gewicht | | Lange Schatten zur Kamera (Gegenlicht), Nebel nach Tiefe, Reflexion im nassen Sand |
| 7 | **Generische Ästhetik**: symmetrische Mitte, Lens-Flares, Partikel und „epic“ Orchester mit KI-Stimme | Der Stock-Look der Tools | Klare Art Direction (Silhouetten-Noir), TikTok-native Captions, ein eigener Half-Time-Groove statt Trailer-Musik, kein TTS |
| 8 | **Kaputte Schrift** im Bild | Modelle rendern Text schlecht | Alle Texte sind echte Typo-Ebenen (TikTok Sans, Instrument Serif) |

Quellen zur Recherche: [VEED – How to tell if a video is AI-generated](https://www.veed.io/learn/how-to-tell-if-video-is-ai-generated), [Popular Science](https://www.popsci.com/diy/how-to-spot-ai-generated-video/), [ClickUp Guide 2026](https://clickup.com/blog/how-to-tell-if-video-is-ai-generated/), [Colossyan – 5 telltale signs](https://colossyan.com/posts/5-telltale-signs-that-a-video-is-ai-generated/), [TechCabal](https://techcabal.com/2026/03/12/how-to-tell-if-a-video-is-ai-generated/).
Produktfunktionen laut Higgsfield: [Soul ID](https://higgsfield.ai/blog/sould-id-best-character-consistency), [Konsistente Figuren](https://higgsfield.ai/blog/best-ai-video-consistent-characters), [Was Higgsfield macht](https://geo.higgsfield.ai/task/blog/what-does-higgsfield-ai-do-guide-cinematic-ai-platform).

## 2. Dramaturgie (TikTok-Mechanik)

| Zeit | Beat | On-Screen | Bild |
|---|---|---|---|
| 0:00–0:03 | **Hook** (ab Frame 0, auf allen Kanälen) | „You can spot an AI video in 1 second.“ Vier rote Tags poppen auf | Absichtlich „AI-Look“: übersättigt, warpend, schwebend. Ton klingt wie ein Handylautsprecher |
| 0:03–0:05 | Versprechen | „4 tells. 4 fixes.“ / „with higgsfield“ | Derselbe Frame, jetzt sauber gegradet. Der Drop: der Filter öffnet sich |
| 0:05–0:17 | Tell 1, Identitäts-Drift | Soul-ID-Panel trainiert, danach „Character locked“ | Drei Shots mit ≠, danach drei Shots mit = |
| 0:17–0:29 | Tell 2, schwebende Kamera | Cinema Studio: Brennweite, Linsen, gestapelte Moves | Echter Dolly-Zoom, Linsen-Klicks im Ton |
| 0:29–0:41 | Tell 3, Plastik-Look | A/B-Wipe „TYPICAL AI | GRADED“, danach Look-Schalter | Korn, Halation und Roll-off werden live zugeschaltet |
| 0:41–0:49 | Tell 4, Zeitlupe | Timeline mit Playhead | Slow-Mo mit Tape-Stop im Ton, danach 11 harte Schnitte auf den Beat |
| 0:49–0:55 | CTA + Loop | „Cinematic. Not artificial.“, Wortmarke, „Try it → link in bio“ | Endet auf der Eröffnungs-Komposition, damit der Loop nahtlos ist |

Re-Hooks liegen bei 0:05, 0:17, 0:29 und 0:41, jeweils mit „TELL #n“. Am Ende geht es per Rewatch-Loop zurück zum Hook.
Die Inhalte bleiben außerhalb der TikTok-UI-Zonen (oben 150 px, unten 380 px, rechts 130 px). In der Vorschau lassen sich die Zonen über die Checkbox „safe zones“ einblenden.

**Caption-Vorschlag:**
> 4 signs your AI video looks like AI, and how to fix each one 🎬 Soul ID, real lenses, film grain, cut on the beat. #higgsfield #aivideo #aifilmmaking #cinematic #videography #specad

## 3. Prompt-Paket: CG-Shots durch echte Higgsfield-Generierungen ersetzen

In diesem Container hatte ich keinen Zugang zu Higgsfield. Deshalb sind die „Shots“ im Spot echtes 3D-CG. Für eine echte Anzeige solltest du sie durch Higgsfield-Output ersetzen, damit das Gezeigte auch wirklich mit dem Produkt gemacht ist.

**Soul ID: Referenzen für die Figur** (6–20 Bilder, immer dasselbe Outfit):
> Full-body portrait of a tall figure in a long charcoal wool overcoat reaching mid-calf, wide-brim black felt hat, long red wool scarf, black leather boots. Shot from behind, three-quarter back view, standing still. Natural light, 35mm film, visible grain, no retouching.

**Shot A: Wüste, Gegenlicht** (Cinema Studio: Large Format, 35 mm, Dolly-in langsam, Handheld leicht):
> [Soul ID] stands on a desert flat at dusk, seen from behind. Low sun just above distant dunes, long shadow stretching toward camera, scarf moving in steady wind, fine dust drifting. Real-time motion, no slow motion. Muted warm palette, lifted blacks, soft highlight roll-off, 35mm film grain, halation around the sun.

**Shot B: Stadt, Regen, Nacht** (50 mm, statisch mit Handheld-Mikrobewegung):
> [Soul ID] stands under a single sodium street lamp in heavy rain, seen from behind. Rain falls at real speed and catches the lamp light. Wet asphalt reflects the warm lamp and a pink neon sign out of focus. Night city windows far behind in fog. Practical lighting only, natural contrast, film grain.

**Shot C: Küste, Morgendämmerung** (85 mm, langsamer Pan links):
> [Soul ID] stands at the waterline at dawn, seen from behind. Small waves wash in and out at normal speed, sun glitter path on the water, soft pastel sky, distant headlands in haze. Reflection on wet sand. Restrained grade, fine grain.

**Dolly-Zoom (Tell 2):** In Cinema Studio „Dolly out“ und „Zoom in“ stapeln, Start 24 mm, Ende 85 mm, Motiv mittig, 4 Sekunden.

**Negativ-Liste (in jeden Prompt bzw. jede Auswahl):** no slow motion, no morphing, no extra limbs, no plastic skin, no oversaturation, no teal-orange grade, no lens flare overload, no floating camera, no text in frame.

Zum Austauschen: Ersetze in `src/sections/*.js` den Aufruf `ctx.shot(...)` durch eine Video-Textur, also eine `THREE.VideoTexture` aus deiner MP4. Rendern und Timing bleiben gleich.

## 4. Bearbeiten und Rendern

```bash
cd higgsfield-ad && npm install
node tools/serve.js 8080      # Vorschau: http://127.0.0.1:8080/index.html  (?t=17 springt zu Sekunde 17)
python3 tools/music.py out/soundtrack.wav
node tools/render.js 0 825 & node tools/render.js 825 1650 & wait
tools/assemble.sh
```

Die Texte stehen in `src/sections/*.js`, die Looks in `src/look.js`, die Locations in `src/world.js` und die Figur in `src/figure.js`.
