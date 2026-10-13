# Higgsfield TikTok-Spot: „4 tells. 4 fixes.“

Auftragsarbeit für **Higgsfield AI**. Der Spot dauert 58 s, das Format ist 1080×1920 (9:16) bei 30 fps, H.264 + AAC, gemastert auf −14 LUFS.
Die Datei liegt unter `out/Higgsfield_TikTok_58s_Previz.mp4`.

> **Status: Previz/Animatic.** Die Shots *innerhalb* des Spots (Wüste, Regen-Stadt, Küste) sind 3D-CG-Platzhalter. Oben im Bild steht deshalb „PREVIZ“. Ein Higgsfield-Spot muss mit Higgsfield-Output werben, also müssen diese Shots vor der Veröffentlichung durch echte Higgsfield-Generierungen ersetzt werden (Abschnitt 3). Danach wird ohne Label gerendert: `Q=&final node tools/render.js …`.

## 0. Wer ist Higgsfield? (Briefing-Analyse)

- **Was:** Higgsfield ist eine generative KI-Plattform für Video und Bild mit Sitz in San Francisco. Gegründet wurde sie 2023 von Alex Mashrabov, der Public Launch war im März 2025. Laut Berichten vom August 2026 bewertet mit 5,4 Mrd. USD.
- **Positionierung:** „Cinematic“ KI statt generischer KI-Clips. Higgsfield bündelt die stärksten Modelle in einem Workspace und legt eigene Steuerungsebenen darüber: Kamera, Linsen, Licht, Farbe und Figuren-Konsistenz. Die Zielgruppe sind Creator, Filmemacher, Marketing-Teams und Agenturen.
- **Produkte**, die der Spot zeigt:
  - **Soul ID:** Eine Figur wird einmal aus 5–20 Fotos trainiert und ist danach in Bild und Video wiederverwendbar.
  - **Cinema Studio 4.0** (August 2026): ein 5-Lens-System, 30+ Kamerabewegungen (stapelbar), 50+ Farbpaletten, ein Era-Selector (Korn, Farbe und Objektiv-Charakter einer Dekade), Relight, Tempo-Steuerung für das Schnitttempo, Clips bis 30 s und bis zu 50 Referenzbilder.
  - **30+ Modelle in einem Workspace:** Seedance 2.5, Kling 3.0, Veo 3.1, Higgsfield Soul 2.0, Nano Banana Pro, GPT Image 2.5, Flux 2.0, Wan 2.7 und weitere.
  - Weitere Produkte, die im Spot nicht vorkommen: Marketing Studio (Ads, UGC, TV-Spot), Draw to Video, Lipsync Studio, Apps/Supercomputer, Virality Predictor, API/CLI.
- **Markenauftritt:** Das Logo ist ein geschwungener Loop als Bildmarke plus die Wortmarke „Higgsfield“, beides in **Electric Lime #D1FE17** auf Schwarz. Die Assets stammen aus Higgsfields offiziellem Repo `higgsfield-ai/skills` (`assets/logo.png`, `assets/icon.svg`) und liegen unter `assets/brand/`. Der Spot verwendet nur Schwarz, Weiß und Lime. Rot steht ausschließlich für die „Tells“.
- **Tonalität im Spot:** selbstbewusst, Creator-nah, technisch präzise. Kein Hype-Vokabular und keine erfundenen Zahlen. Jede genannte Funktion ist durch Higgsfields eigene Seiten belegt.

Quellen: [Higgsfield – About](https://higgsfield.ai/about), [Cinema Studio 4.0 (Blog)](https://higgsfield.ai/blog/cinema-studio-4-0), [Cinema Studio – Produktseite](https://higgsfield.ai/cinematic-video-generator), [Changelog](https://higgsfield.ai/creator-hub/changelog), [Soul ID](https://higgsfield.ai/blog/sould-id-best-character-consistency), [Marketing Studio](https://higgsfield.ai/marketing-studio-intro), [Welches Modell?](https://higgsfield.ai/creator-hub/help-center/ai-models/which-ai-model-should-i-use), [Wikipedia](https://en.wikipedia.org/wiki/Higgsfield_AI), [Brandfetch](https://brandfetch.com/higgsfield.ai), [higgsfield-ai/skills (GitHub)](https://github.com/higgsfield-ai/skills).

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
| 0:05–0:17 | Tell 1, Identitäts-Drift | Soul-ID-Panel (5–20 Fotos) trainiert, danach „Soul ID ready“ | Drei Shots mit ≠, danach drei Shots mit = |
| 0:17–0:29 | Tell 2, schwebende Kamera | Cinema Studio 4.0: 5-Lens-System, 30+ Moves, „Dolly Zoom“ | Echter Dolly-Zoom 24 → 85 mm, Linsen-Klicks im Ton |
| 0:29–0:41 | Tell 3, Plastik-Look | A/B-Wipe „TYPICAL AI / GRADED“, danach Cinema-Studio-Look: Palette, Era, Halation, Relight | Die Schalter verändern das Bild live |
| 0:41–0:49 | Tell 4, Zeitlupe | „Tempo · on the beat“, Timeline mit Playhead | Slow-Mo mit Tape-Stop im Ton, danach 11 harte Schnitte auf den Beat |
| 0:49–0:58 | CTA + Loop | „Cinematic. Not artificial.“, danach „Every top model. One workspace. 30+ models“, dann offizielles Logo und „Create on higgsfield.ai“ | Endet auf der Eröffnungs-Komposition, damit der Loop nahtlos ist |

Re-Hooks liegen bei 0:05, 0:17, 0:29 und 0:41, jeweils mit „TELL #n“. Am Ende geht es per Rewatch-Loop zurück zum Hook.
Die Inhalte bleiben außerhalb der TikTok-UI-Zonen (oben 150 px, unten 380 px, rechts 130 px). In der Vorschau lassen sich die Zonen über die Checkbox „safe zones“ einblenden.

**Caption-Vorschlag:**
> 4 signs your AI video looks like AI, and how Higgsfield fixes each one 🎬 Soul ID, Cinema Studio 4.0 lenses & looks, tempo on the beat, 30+ models in one place. #higgsfield #aivideo #aifilmmaking #cinemastudio #soulid

## 3. Prompt-Paket: CG-Shots durch echte Higgsfield-Generierungen ersetzen

In dieser Cloud-Umgebung sind `higgsfield.ai` und die zugehörigen API- und CDN-Hosts per Netzwerk-Policy gesperrt, ebenso `api.github.com` für die Installation der CLI. Die offiziellen Higgsfield-Skills (`higgsfield-generate`, `higgsfield-soul-id` usw.) sind installiert. Sobald die Hosts freigegeben sind und `higgsfield auth login` mit dem Higgsfield-Account erfolgt ist, lassen sich die Shots unten direkt generieren und in die Fenster des Spots einsetzen.

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
node tools/render.js 0 870 & node tools/render.js 870 1740 & wait
tools/assemble.sh
```

Die Texte stehen in `src/sections/*.js`, die Looks in `src/look.js`, die Locations in `src/world.js` und die Figur in `src/figure.js`.
