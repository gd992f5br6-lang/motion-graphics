---
description: Verify what was just changed — run checks, get an independent review, and report honestly what was and was not verified
---

Verify the current changes. Never claim something works unless you saw evidence for it.

## Step 1 — See what changed
Run `git status --short` and `git diff --stat` (also `git diff` for files that matter).

## Step 2 — Run the checks that fit
Only run what applies to the changed files:
- `*.sh`: `bash -n <file>`
- `*.js`: `node --check <file>`
- `*.py`: syntax check without leaving cache files, e.g. `python3 -I -B -c "import ast,sys; ast.parse(open(sys.argv[1]).read())" <file>`
- `SKILL.md`: frontmatter exists and has `name` and `description`; the description says WHEN to use the skill.
- Generated video clips: `ffprobe` the result and compare resolution, frame rate and duration with the source video; extract one still frame (`ffmpeg -ss <t> -i <clip> -frames:v 1 <png>`) and look at it.
Do not start long renders or large downloads here — if one is needed for a real check, say so and ask first.

## Step 3 — Independent review
Use the Agent tool with `subagent_type: code-reviewer`. Give it the list of changed files and what the change was supposed to do. A second, fresh context finds bugs the first one missed.

## Step 4 — Report in simple words
- What changed (2–4 bullets).
- What I verified and HOW (command or file I looked at).
- What I could NOT verify, and why.
- Findings from the review, blockers first.
- Suggested next step.
