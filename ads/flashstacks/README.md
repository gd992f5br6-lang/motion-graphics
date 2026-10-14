# FlashStacks – TikTok Ad (Motion Design)

`out/flashstacks_tiktok_9x16.mp4` · 1080×1920 · 30 fps · 20,5 s · H.264 + AAC · Ton auf −14 LUFS normalisiert

## 1. Was ich über FlashStacks herausgefunden habe

- Die einzige Quelle, die die App direkt beschreibt, ist ein Eintrag auf einer Sammelseite (mergeek.com). Laut dem Eintrag zeigt FlashStacks **Karteikarten als Widgets auf dem Sperr- und Homebildschirm** und nutzt **Spaced Repetition** (wie Anki): Karten, die du schwer findest, kommen öfter wieder.
- **Echte FlashStacks-TikTok-Ads habe ich nicht gefunden.** TikTok, das TikTok Creative Center und der App Store sind aus dieser Umgebung nicht erreichbar, und die Websuche findet nichts zu FlashStacks-Werbung. Die Analyse unten beschreibt deshalb, wie Ads in dieser Kategorie (Lern- und Karteikarten-Apps) aufgebaut sind, und nicht die Ads von FlashStacks selbst.
- Konkurrenten mit fast derselben Idee: *Flashcard Widget: Study Helper*, *Flash Cards Widget*, *MemoryPush*, *FlashRecall*. „Karten auf dem Sperrbildschirm“ allein reicht also nicht, damit die Ad auffällt. Die Ad braucht eine eigene Bildidee.

## 2. Wie Lern-Apps auf TikTok werben (das Muster)

| Was sie machen | Warum es funktioniert | Was diese Ad daraus macht |
|---|---|---|
| Ein Hook, der in unter einer Sekunde ein Gefühl trifft („POV: Klausur morgen“, „Hör auf so zu lernen“) | Der Daumen hält an, wenn man sich wiedererkennt | „LERNEN NERVT.“ ist ab Frame 1 da, mit Bass-Hit und einer Karte, die aufs Bild klatscht |
| Erst das Problem zeigen (Zettelchaos, Lernen in der letzten Nacht) | Das Produkt wirkt wie die Erlösung | Ein Stapel Karten fällt aufeinander: „SONNTAG, 23:40.“ |
| Die Bildschirmaufnahme ist der Beweis | Man sieht die App wirklich arbeiten | Das 9:16-Bild *ist* der Sperrbildschirm. Man tippt die Karte an, dreht sie um, tippt „Gewusst“ und „Nochmal“ |
| Eine einzige klare Behauptung | Bei 15–25 s bleibt nur eine Botschaft hängen | „Lern beim Entsperren.“ |
| Das Wort „Spaced Repetition“ wird nie erklärt, sondern gezeigt | Fachwörter lassen Leute weiterscrollen | Die Karte hüpft auf einer Zeitleiste mit immer größeren Abständen: 10 Min → 1 Tag → 3 Tage → 1 Woche |
| Am Ende Name, Icon und Handlungsaufforderung | TikTok legt den eigenen CTA-Button darüber | „FLASH STACKS“ plus Button „Im App Store laden“ |

## 3. Die Idee

> In dieser Ad wird **die eine Karteikarte** zum durchgehenden Objekt: Sie fällt auf den Stapel, wird zum Sperrbildschirm-Widget, hüpft über die Wiederholungs-Zeitleiste und wird am Ende zum App-Icon.

Die Karte wird nie geschnitten, nur verwandelt (Größe, Ecken, Farbe, Drehung). Das passt zum Namen *Stacks* und zum Prinzip „eine Karte, immer wieder“.

## 4. Storyboard

| Zeit | Fläche | Was passiert | Ton |
|---|---|---|---|
| 0,0–2,4 | Gelb | „LERNEN NERVT.“ kommt hoch, eine Chemie-Karte klatscht aufs Bild, darunter „Vor allem so:“ | Bass-Hit, Slap |
| 2,4–4,9 | Pink | „SONNTAG, 23:40.“, „Morgen Klausur. Alles auf einmal.“ Sieben Karten fallen im Achteltakt, dann landet *die* Karte („Mitochondrium?“) oben drauf | Ein Papier-Thud pro Karte |
| 4,9–7,25 | Orange | „LERN BEIM ENTSPERREN.“ Der Haufen ordnet sich zu einem sauberen Stapel | Whoosh, Riser in den Break |
| 7,25–12,85 | Sperrbildschirm | Die Karte wird zum Widget. Die Kamera zoomt rein, Tipp, die Karte dreht sich um, „Gewusst“, nächste Karte, „Nochmal“, „Kommt in 10 Min wieder.“ Unten stehen die Texte „EINE KARTE. JEDES MAL.“, „GEWUSST? WEITER.“, „NOCHMAL? KOMMT BALD.“ | Drop, Taps, Flips, Chimes |
| 12,85–16,85 | Cyan | „WAS HAKT, KOMMT ÖFTER.“ Die Karte hüpft über die Zeitleiste, die Abstände werden größer. „Was sitzt, siehst du seltener.“ | Aufsteigende Töne pro Hüpfer |
| 16,85–20,5 | Magenta | Die Karte wird zum App-Icon, dazu „FLASH STACKS“, „Karteikarten auf deinem Sperrbildschirm.“ und der Button „Im App Store laden“ (wird angetippt) | Schluss-Akkord |

## 5. Warum es nicht nach KI aussieht

Installiert und angewendet: **taste-skill** von Leonxlnx (dazu `minimalist-skill` und `output-skill` aus demselben Repo), in `~/.claude/skills/`.

- **Art Direction ausgelost statt Standard:** `draw.mjs` hat drei Richtungen gezogen. Gewählt habe ich „Loud and flat“: flache Farbflächen pro Kapitel (Candy chapters), sehr schwere breite Versalien, kurze Sätze, wie man sie laut sagen würde.
- **Die Hausregeln sind eingehalten:** keine Verläufe, kein Glow, keine Schatten auf ruhenden Elementen, kein Glas oder Blur-Panel, keine Emojis, keine Eyebrow-Labels, kein Monospace, keine Nummerierung (01/02/03), keine Haarlinien, kein Violett oder Indigo, Überschriften maximal zwei Zeilen, nur eine Schriftfamilie.
- **Motion wie von Hand gemacht:** Jede Bewegung ist eine Feder in geschlossener Form (Engine `motion-broll` aus diesem Repo). Es gibt keine Standard-Easings und kein überall gleiches „fade-up“. Gerendert ist mit echter Bewegungsunschärfe (4 Sub-Frames bei 180° Shutter).
- **Ton passt zum Bild:** Jeder Schlag und jedes Geräusch liegt auf einem Ereignis der Animation, nicht auf einem zufälligen Musik-Loop.

Bei der Schrift bin ich abgewichen: Der Skill hat *Panchang/Switzer* gezogen, aber Fontshare ist von hier aus nicht erreichbar. Ersatz ist **Archivo** (OFL) als eine Variable-Font-Familie: wdth 125 / wght 900 für die Headlines, wdth 100 für Text und UI.

## 6. Was du vor dem Schalten tauschen solltest

- **Die App-Oberfläche ist nachgebaut und nur zur Illustration**: Widget-Layout, die Buttons „Gewusst/Nochmal“, „Kommt in 10 Min wieder.“, die Intervalle auf der Zeitleiste und das App-Icon. Ersetze sie durch echte Screens oder Screen-Recordings von FlashStacks, sobald du sie hast, oder gleiche den Look an.
- **Plattform:** „Im App Store laden“ geht davon aus, dass es iOS-only ist (Sperrbildschirm-Widgets). Prüf das.
- Es sind **keine Zahlen, Bewertungen oder Nutzerzahlen erfunden**. Wenn es echte gibt (Rating, Downloads), sind sie die stärkste Ergänzung für Szene 6.
- **Musik:** Der Beat ist selbst synthetisiert und damit lizenzfrei. Auf TikTok performt oft ein Sound aus der *Commercial Music Library* besser. Die Schnitte liegen auf 120 BPM, also passt jeder Track mit 120 BPM (oder 60 bzw. 240).

## 7. Neu bauen und ändern

```bash
cd ads/flashstacks
python3 build.py                     # ad.src.html -> dist/ad.html (Font + Engine eingebettet)
open dist/ad.html                    # Live-Vorschau im Browser (läuft in Schleife)
python3 audio.py                     # Ton -> work/audio.wav
bash render.sh                       # Video rendern, Ton muxen -> out/flashstacks_tiktok_9x16.mp4
```

Texte, Farben und Timings stehen oben in `ad.src.html` (`TS`, `PILE`, `CAP`, `TICK`, `HOP`). Wenn du Timings verschiebst, passe die gleichen Zeiten in `audio.py` an.
