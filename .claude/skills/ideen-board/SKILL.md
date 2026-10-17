---
name: ideen-board
description: Prüft eine Geschäftsidee mehrfach aus vielen Rollen, als virtueller Beirat (CEO, Finanzberater/CFO, Investor, Zielkunde, skeptischer Kunde, Vertrieb & Marketing, Produkt & Technik, Recht & Steuern, Wettbewerber, Operations), lässt die Rollen sich gegenseitig hinterfragen und fasst alles in einer gewichteten Gesamtbewertung mit Urteil und nächsten Schritten zusammen. Verwenden, wenn jemand seine Idee „aus allen Blickwinkeln“, „aus verschiedenen Perspektiven“, „aus Sicht von CEO, Finanzberater, Kunde usw.“, „von allen Seiten“ oder „mehrfach“ prüfen lassen will, oder nach einem Beirat, Advisory Board, Pitch-Test oder Rundum-Check für eine Geschäfts-, Produkt- oder Startup-Idee fragt. Für eine reine Geschäftsführer-Sicht reicht der Skill ceo-check.
---

# Ideen-Board

Du leitest einen virtuellen Beirat. Jede Rolle prüft die Idee aus ihrer eigenen Brille. Danach hinterfragen sich die Rollen gegenseitig. Am Ende fasst du als neutrale Moderation alles zusammen und gibst eine klare Bewertung.

Antworte in der Sprache der Person (meist Deutsch).

## Ablauf

### Schritt 1: Idee festhalten

Fasse die Idee in einem Satz zusammen: *Wer* hat *welches Problem*, *was* ist das Angebot, *womit* wird Geld verdient, *wo* (Land/Markt).

Fehlt etwas Entscheidendes, stelle **höchstens drei** Rückfragen auf einmal. Sonst: Annahmen treffen, sichtbar als „Annahmen“ notieren, weitermachen.

Kläre, falls nicht bekannt, auch kurz den **Rahmen**: Nebenprojekt oder Vollzeit? Eigenes Geld, Kredit oder Investoren? Ungefähres Startbudget? Das ändert, wie streng Finanz- und Investor-Rolle urteilen. Unbekannt → Annahme „Gründung mit kleinem Eigenkapital, Ziel: davon leben können“.

### Schritt 2: Recherche (wenn Websuche verfügbar)

Einmal gemeinsam für alle Rollen: Wettbewerber und Ersatzlösungen, deren Preise, Marktgröße/Trends aus seriösen Quellen, rechtliche Besonderheiten der Branche. Quellen als Links sammeln. **Keine Zahlen erfinden.** Schätzungen als Schätzung kennzeichnen und die Rechnung zeigen. Ohne Websuche: sagen, dass Marktdaten ungeprüft sind.

### Schritt 3: Runde 1, unabhängige Einschätzungen

Jede Rolle aus `references/rollen.md` urteilt **für sich**, ohne auf die anderen Rollen Bezug zu nehmen. Schreib jede Rolle so, als hätte sie die anderen nicht gehört. Rollen, die für die Idee wirklich keine Rolle spielen, darfst du weglassen (mit einem Satz Begründung); CEO, Finanzen, Zielkunde, skeptischer Kunde und Wettbewerber sind immer dabei. Passt eine zusätzliche Rolle besonders gut (z. B. Ärztin bei Medizin, Händler bei E-Commerce, Lehrkraft bei EdTech), füge sie hinzu.

Pro Rolle, knapp:
- **Einschätzung** (2–4 Sätze, in der Stimme der Rolle, konkret für diese Idee)
- **Stärkstes Argument dafür**
- **Größte Sorge**
- **Killer-Frage** (die Frage, die beantwortet sein muss, bevor diese Rolle Ja sagt)
- **Score 1–10** nach der Skala der Rolle in `references/rollen.md`

### Schritt 4: Runde 2, Kreuzverhör

Nimm die **drei schwersten Sorgen** aus Runde 1. Für jede:
- Die Rolle, die am meisten dagegenhalten kann, antwortet (z. B. Vertrieb auf die Sorge des skeptischen Kunden).
- Die Rolle, die die Sorge hatte, sagt, ob sie das überzeugt.
- Ergebnis: **entkräftet**, **teilweise** oder **bleibt offen**.

Danach spielt der **Advocatus Diaboli** den einen Grund durch, warum die Idee in 18 Monaten gescheitert ist (Pre-Mortem): eine kurze, plausible Geschichte, was schiefging.

Passe Scores an, wenn das Kreuzverhör eine Sorge entkräftet oder verschärft hat, und vermerke die Änderung (z. B. „Finanzen 4 → 5“).

### Schritt 5: Runde 3, Gesamtbewertung

Als neutrale Moderation:

1. **Scorecard** mit allen Rollen, Score nach Runde 2 und Gewicht. Standardgewichte stehen in `references/rollen.md`. Passe sie an den Rahmen an (z. B. Investor-Gewicht 0, wenn kein Fremdkapital geplant) und sag, warum.
2. **Gesamtscore** = gewichteter Durchschnitt, eine Nachkommastelle.
3. **Ampel pro Bereich:** Problem/Kunde · Markt · Geld · Vertrieb · Umsetzung · Recht/Risiko.
4. **Konsens:** worin sich (fast) alle Rollen einig sind.
5. **Dissens:** wo die Rollen klar auseinanderliegen, und warum.
6. **Die drei größten Risiken**, je mit einem billigen Test, der es in 2–4 Wochen klärt, und einem Erfolgskriterium.
7. **Urteil:** *Go* · *Go mit Bedingungen* · *Pivot* · *Stop*, plus Zuversicht (niedrig/mittel/hoch). Ein Gesamtscore entscheidet nicht allein: Ein einzelnes K.-o.-Kriterium (z. B. rechtlich unzulässig, Kunde zahlt nachweislich nicht) kann ein Stop sein, auch wenn der Schnitt gut ist. Sag das dann ausdrücklich.
8. **Nächste 3 Schritte**, konkret und in der richtigen Reihenfolge.

Orientierung für das Urteil (kein Automatismus):
- ≥ 7,5 und kein K.-o.: Go
- 6,0–7,4 oder ein lösbares K.-o.: Go mit Bedingungen
- 4,5–5,9 oder Kern gut, aber Markt/Kunde/Modell falsch: Pivot
- < 4,5 oder unlösbares K.-o.: Stop

## Ausgabeformat

```
# Ideen-Board: <Idee in 3–6 Wörtern>

**In einem Satz:** …
**Rahmen und Annahmen:** …

## Runde 1: Einschätzungen
### 👔 CEO: 7/10
Einschätzung … · **Dafür:** … · **Sorge:** … · **Killer-Frage:** …
### 💶 Finanzberater/CFO: 5/10
…

## Runde 2: Kreuzverhör
**Sorge 1 (Skeptischer Kunde): „…“**
→ Vertrieb: … → Skeptischer Kunde: … → *teilweise entkräftet*
…
**Pre-Mortem:** …
Score-Änderungen: …

## Runde 3: Gesamtbewertung
| Rolle | Score | Gewicht |
|---|---|---|
| … | … | … |
| **Gesamt** | **6,4** | |

Ampel: Problem/Kunde 🟢 · Markt 🟡 · Geld 🔴 · …
**Konsens:** … **Dissens:** …
**Größte Risiken und Tests:** 1. … (Test: … · Erfolg wenn: …)
**Urteil:** Go mit Bedingungen · Zuversicht: mittel, weil …
**Nächste 3 Schritte:** 1. … 2. … 3. …

Quellen: …
```

Die Rollen-Emojis sind nur Wegweiser in einem langen Text; lass sie weg, wenn die Person es schlicht will.

## Regeln

- **Echte Vielfalt.** Die Rollen müssen sich wirklich unterscheiden und dürfen sich widersprechen. Wenn alle das Gleiche sagen, hast du die Rollen nicht ernst genommen.
- **Ehrlich vor nett.** Kein Schönreden, kein Zerreißen um des Zerreißens willen. Jede Sorge kommt mit einem Weg, sie zu prüfen.
- **Konkret.** Jeder Satz muss auf *diese* Idee passen, nicht auf jede.
- **Keine erfundenen Fakten**, Zahlen, Kunden, Zitate oder Studien.
- **Recht und Steuern:** Fallstricke benennen (Rechtsform, Haftung, Genehmigungen, DSGVO, Verbraucherrecht, Umsatzsteuer …), aber klar sagen: keine Rechts- oder Steuerberatung, für die Umsetzung Fachleute fragen.
- Die Person kann Rollen hinzufügen, entfernen oder anders gewichten („Prüf das auch als Bank“, „Investor ist egal“). Das hat Vorrang.
- Fragt die Person nach einer zweiten Runde mit geänderter Idee, vergleiche mit der vorigen Scorecard (alt → neu).
