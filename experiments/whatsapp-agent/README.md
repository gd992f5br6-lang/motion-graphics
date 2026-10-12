# WhatsApp reply agent (test mode)

Drafts replies to chosen people in your own style, based on earlier messages.
**Test mode: no connection to WhatsApp. Nothing is ever sent.**

## How it works
1. Export a chat in WhatsApp (chat > menu > Export chat > without media) and save the `.txt` in `private/` (this folder is git-ignored).
2. Copy `config.example.json` to `config.json` and set your name, the allowed contacts and the sensitive keywords. Names must be exactly as they appear in the export.
3. In Claude Code say, for example: *"Use the whatsapp-reply-agent: chat `experiments/whatsapp-agent/sample_chat.txt`, contact Sam."*

`chat_context.py` does the safety checks in plain code, before the AI sees anything:

| Situation | Decision |
|---|---|
| Contact not on the allowlist (the chat file is not even opened) | `not_allowed` |
| Your name is missing from the export, or more/less than 2 people wrote | `needs_human` |
| The export mentions group events (added, removed, left, ...) | `needs_human` |
| Last message is yours (and no new message was given) | `needs_human` |
| Sensitive word in the new message **or any of the contact's recent messages** (money, health, appointments, passwords, ...), a money symbol, a link, a bank number or an attachment | `needs_human` |
| Otherwise | `auto_ok`, the agent writes a draft |

Only `auto_ok` prints chat content. All other results print just decision, reason and contact.
Matching ignores case, umlauts, accents and invisible characters. It is best-effort: it cannot catch every disguised word, so it errs on the side of asking you.

Try it without any AI, from the repository root:

    python3 -I -B experiments/whatsapp-agent/chat_context.py --chat experiments/whatsapp-agent/sample_chat.txt --config experiments/whatsapp-agent/config.example.json --contact Sam

A new message that is not in the export yet goes into a file: add `--incoming-file new_message.txt`. (`--incoming "text"` exists for typing by hand only; agents must not use it, because text from other people on a command line can run commands.)

## Known limits
- The allowlist knows display names only. An export contains no phone numbers, so two people with the same name look identical.
- This is a test helper. The safety rules live in a script that the agent is told to run. A live system must check the decision itself in code, before anything is sent.

## Rules to keep when it goes live
- Keep the label ("automatische Antwort") on automatic replies, so nobody thinks you wrote them live.
- Tell the people on the allowlist that an assistant answers. Chats go to an AI model; their messages are their data too.
- Never put real chats, `config.json` or access tokens into git. The `.gitignore` covers `private/`, `config.json`, `WhatsApp Chat*`, `_chat.txt` and `.zip` files inside `experiments/`.

## Later: connecting it for real
Only the official WhatsApp Business API (Meta) is allowed. Unofficial libraries for private numbers break WhatsApp's terms and can get the number banned.
A small server would receive each incoming message (webhook), run `chat_context.py`, ask Claude for the draft, and send it only for `auto_ok`. It also needs what this test mode cannot show yet: a daily limit per contact, a log of every sent reply, and an off switch. This is not built yet.
