#!/usr/bin/env python3
"""Prepare safe context for the WhatsApp reply agent from an exported chat.

Reads a WhatsApp chat export (.txt), checks the safety rules from the config,
and prints JSON: a decision, the recent history and a small style profile.
It never sends anything and never connects to the network.

Decisions:
  auto_ok          contact is allowed and nothing sensitive was found
  needs_human      sensitive keyword, group chat or nothing to answer -> a person must handle it
  not_allowed      contact is not on the allowlist
"""
import argparse
import json
import re
import sys
from pathlib import Path

INVISIBLE = dict.fromkeys(map(ord, "‎‏‪‬ ﻿"), None)
DATE = r"\d{1,2}[./]\d{1,2}[./]\d{2,4}"
TIME = r"\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?"
ANDROID = re.compile(rf"^({DATE}),? ({TIME}) - (.*)$")
IOS = re.compile(rf"^\[({DATE}),? ({TIME})\] (.*)$")
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")


def parse_chat(path):
    """Return a list of {ts, sender, text}. System lines (no 'Name: ') are skipped."""
    messages, current = [], None
    for raw in Path(path).read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.translate(INVISIBLE)
        m = ANDROID.match(line) or IOS.match(line)
        if m:
            date, time, rest = m.groups()
            sender, sep, text = rest.partition(": ")
            current = {"ts": f"{date} {time}", "sender": sender, "text": text} if sep else None
            if current:
                messages.append(current)
        elif current is not None and line.strip():
            current["text"] += "\n" + line
    return messages


def style_profile(my_messages):
    recent = my_messages[-40:]
    if not recent:
        return {"note": "no messages from me found"}
    words = [len(m["text"].split()) for m in recent]
    return {
        "avg_words_per_message": round(sum(words) / len(words), 1),
        "emoji_share": round(sum(bool(EMOJI.search(m["text"])) for m in recent) / len(recent), 2),
        "starts_lowercase_share": round(
            sum(m["text"][:1].islower() for m in recent) / len(recent), 2),
        "examples": [m["text"] for m in recent[-8:]],
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--chat", required=True, help="exported WhatsApp chat (.txt)")
    ap.add_argument("--contact", required=True, help="name of the other person, as in the export")
    ap.add_argument("--config", required=True, help="config.json (see config.example.json)")
    ap.add_argument("--incoming", help="new message text; default: the contact's last message")
    ap.add_argument("--last", type=int, default=30, help="how many recent messages to include")
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    me = cfg["my_name"]
    messages = parse_chat(args.chat)
    senders = {m["sender"] for m in messages}

    if args.contact not in senders:
        sys.exit(f"Contact '{args.contact}' not found. Names in this chat: {sorted(senders)}")

    incoming = args.incoming
    if incoming is None:
        last = messages[-1]
        incoming = last["text"] if last["sender"] == args.contact else None

    allowed = {c.casefold() for c in cfg.get("allowed_contacts", [])}
    hits = []
    if incoming:
        low = incoming.casefold()
        # match at the start of a word, so "überweis" catches "überweisen" but "tod" ignores "Methode"
        hits = [k for k in cfg.get("escalate_keywords", [])
                if re.search(r"\b" + re.escape(k.casefold()), low)]

    if args.contact.casefold() not in allowed:
        decision, reason = "not_allowed", "contact is not on the allowlist"
    elif len(senders) > 2:
        decision, reason = "needs_human", "group chats are never answered automatically"
    elif incoming is None:
        decision, reason = "needs_human", "the last message is mine, there is nothing to answer"
    elif hits:
        decision, reason = "needs_human", f"sensitive keyword(s): {', '.join(hits)}"
    else:
        decision, reason = "auto_ok", "allowed contact, no sensitive keyword"

    out = {
        "decision": decision,
        "reason": reason,
        "contact": args.contact,
        "my_name": me,
        "label_to_append": cfg.get("label", ""),
        "incoming_message": incoming,
        "style": style_profile([m for m in messages if m["sender"] == me]),
        "history": messages[-args.last:],
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
