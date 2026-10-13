# Showreel 2026 – „Five brands. One standard.“

Ein 71-sekündiger, vollständig animierter 3D-Showreel mit fünf erfundenen Marken – eine pro Branche.
Alles (3D-Szenen, Typografie, Übergänge, Musik und Sounddesign) ist Code. Es gibt keine Stock-Assets und keine Samples.

| # | Zeit | Branche | Fiktives Produkt | Look |
|---|---|---|---|---|
| 00 | 0:00–0:04 | Intro | „Five brands. One standard.“ | Bokeh-Staub, Serif-Titel |
| 01 | 0:04–0:16 | Fitness & Health | **VYTA** Smart Ring Series 2 | Graphit-Titan, Koralle, EKG-Linie, Live-Vitalwerte |
| 02 | 0:16–0:28 | Finance & Commerce | **VELORA** Private Metal Card | Gebürsteter Stahl, Goldkante, Wachstums-Chart, Contactless-Ripple |
| 03 | 0:28–0:40 | Technology | **QORE N1** Neural Processor | Platine mit Lichtimpulsen, Exploded View, irisierender Die |
| 04 | 0:40–0:52 | Family | **hearth** Family Hub | Warmes Morgenlicht, Fensterschatten, schwebende UI-Karten |
| 05 | 0:52–1:04 | Media & Entertainment | **NOCTIS+** Streaming | Poster-Tunnel, Streaming-UI, Logo-Reveal mit Lichtstrahlen |
| 06 | 1:04–1:11 | Outro | „Your brand is next.“ | Alle fünf Wortmarken, Sign-off |

Jeder Schnitt liegt auf einem Takt des Soundtracks (120 BPM). Riser, Impacts, UI-Ticks und Logo-Hits sitzen framegenau auf dem Bild.

## Ergebnis

- `out/Showreel_2026.mp4`: 1920×1080, 30 fps, H.264 High, AAC 320 kbit/s, auf −14 LUFS normalisiert (Web/Social).
- `out/soundtrack.wav`: der Soundtrack einzeln, 48 kHz Stereo.

## Selbst bearbeiten

```bash
cd showreel
npm install                 # three.js + Schriften (OFL)
node tools/serve.js 8080    # dann http://127.0.0.1:8080/index.html öffnen
```

Die Vorschau läuft im Browser in Echtzeit, wenn eine GPU vorhanden ist. Leertaste startet und pausiert, ←/→ springt eine Sekunde, `?t=40` startet bei Sekunde 40.

| Was | Wo |
|---|---|
| Texte, Claims, Zahlen | in der jeweiligen Szene unter `src/scenes/*.js` im Abschnitt `// ---- overlay` |
| Farben (Akzent pro Marke) | `const ACC` oben in jeder Szene |
| Kamerafahrten | `S.update`, ein Block pro Shot |
| Reihenfolge und Länge | `src/timeline.js` und `dur` in jeder Szene |
| Musik und Sounddesign | `tools/music.py` (Harmonie, Arrangement und FX-Zeitpunkte stehen dort) |
| Sign-off im Outro | `src/scenes/outro.js` (Platz für deinen Namen und deine Kontaktdaten) |

## Rendern

```bash
python3 tools/music.py out/soundtrack.wav       # Soundtrack (~30 s)
node tools/render.js 0 1065 &                   # Frames, auf zwei Worker aufgeteilt
node tools/render.js 1065 2130 &
wait
tools/assemble.sh out/Showreel_2026.mp4         # Frames + Ton -> MP4
python3 tools/sheet.py out/review.jpg 5 20 33   # Kontaktbogen einzelner Zeitpunkte zur Kontrolle
```

Jeder Frame ist eine reine Funktion der Zeit (`seek(t)`). Es gibt keine Timer und keine CSS-Transitions, deshalb kann jeder Frame einzeln und deterministisch gerendert werden. Der Renderer setzt fort, wenn er abgebrochen wurde, weil vorhandene Frames übersprungen werden.

## Technik

- three.js r169: PBR-Materialien (Anisotropie, Clearcoat, Iridescence, Sheen) und eigene Studio-Lichtumgebungen aus Softboxen
- Unreal-Bloom, 4× MSAA, ACES-Tonemapping, Film Grain, Vignette, Light-Leak- und Flash-Übergänge
- Typografie als DOM-Ebene mit buchstabenweisen Blur-Reveals. Schriften: Unbounded, Instrument Serif, Space Grotesk, Fraunces, Inter Tight, JetBrains Mono (alle SIL OFL)
- Soundtrack mit numpy/scipy synthetisiert: Kick, Clap, Hats, Bass, Supersaw-Pads, FM-Bells, Piano, Riser, Impacts, Braam, Faltungshall und Sidechain-Ducking

Alle Marken, Personen, Zahlen und Produkte sind frei erfunden.
