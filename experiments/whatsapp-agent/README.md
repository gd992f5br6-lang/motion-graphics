# WhatsApp reply agent (test mode)

Drafts replies to chosen people in your own style, based on earlier messages.
**Test mode: no connection to WhatsApp. Nothing is ever sent.**

## How it works
1. Export a chat in WhatsApp (chat > menu > Export chat > without media) and save the `.txt` in `private/` (this folder is git-ignored).
2. Copy `config.example.json` to `config.json` and set your name, the allowed contacts and the sensitive keywords.
3. In Claude Code say, for example: *"Use the whatsapp-reply-agent: chat `experiments/whatsapp-agent/sample_chat.txt`, contact Sam."*

`chat_context.py` does the safety checks in plain code (not by asking the AI nicely):

| Situation | Decision |
|---|---|
| Contact not on the allowlist | `not_allowed`, no draft |
| Group chat | `needs_human` |
| Sensitive keyword (money, health, appointments, passwords, ...) | `needs_human` |
| Last message is yours | `needs_human` |
| Otherwise | `auto_ok`, the agent writes a draft |

Try it without any AI:

    python3 -I -B chat_context.py --chat sample_chat.txt --config config.example.json --contact Sam

## Rules to keep when it goes live
- Keep the label ("automatische Antwort") on automatic replies, so nobody thinks you wrote them live.
- Tell the people on the allowlist that an assistant answers. Chats go to an AI model; their messages are their data too.
- Never put real chats, `config.json` or access tokens into git.

## Later: connecting it for real
Only the official WhatsApp Business API (Meta) is allowed. Unofficial libraries for private numbers break WhatsApp's terms and can get the number banned.
A small server would receive each incoming message (webhook), run `chat_context.py`, ask Claude for the draft, and send it only for `auto_ok`. It also needs what this test mode cannot show yet: a daily limit per contact, a log of every sent reply, and an off switch. This is not built yet.
