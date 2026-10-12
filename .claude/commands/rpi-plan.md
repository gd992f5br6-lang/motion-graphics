---
description: Research first, then plan — turn an idea into a checked plan before any code is written (lean version of the RPI workflow)
argument-hint: "<what you want, in a sentence or two>"
---

The user wants: $ARGUMENTS

Do NOT write or change project code in this command. The result is a plan file and a recommendation.

## Step 1 — Clarify
Use the Agent tool with `subagent_type: requirement-parser` and pass the request above. If its result has real open questions, ask the user with the AskUserQuestion tool (one round, max 4 questions) and wait for the answers.

## Step 2 — Research
Use the Agent tool with `subagent_type: Explore` to find what already exists in this repo that is related (skills, scripts, engine, examples) and what constraints it imposes. Ask for a short report: what exists, what can be reused, what would conflict. This keeps the long file reading out of the main conversation.

## Step 3 — Verdict
Give a clear verdict with a one-sentence reason: GO, CONDITIONAL GO (say the condition), or NO-GO (say what to do instead, e.g. "an existing skill already does this").

## Step 4 — Plan (only for GO / CONDITIONAL GO)
Write `plans/<short-slug>.md` containing:
- Goal and success check (how we will SEE that it works).
- Phases, small enough that each finishes well within one session. Every phase ends with a concrete check (a command to run, a still frame to look at, a file to open).
- Risks and open questions.
- Which files will probably change.

## Step 5 — Stop
Show the user the verdict and the plan in simple words, then wait for approval. Tell them the next step: approve the plan (or ask for changes), then start the first phase in a fresh session with `/clear`, pointing at the plan file.
