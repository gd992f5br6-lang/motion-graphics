#!/usr/bin/env python3
"""Prepare safe context for the WhatsApp reply agent from an exported chat.

Reads a WhatsApp chat export (.txt), applies the safety rules from the config and
prints JSON. It never sends anything and never connects to the network.

Decisions (the rules fail closed: anything unclear means "a person must look"):
  auto_ok       contact is allowed, chat is a private 1:1 chat, nothing sensitive found
  needs_human   group chat, unclear chat, sensitive content, or nothing to answer
  not_allowed   contact is not on the allowlist

Only for auto_ok the output contains chat content. Other decisions print just
decision, reason and contact, so private text never reaches the model by accident.

This is a test helper. A live server must enforce the decision itself.
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

DATE = r"(?:\d{1,2}[./]\d{1,2}[./]\d{2,4}|\d{4}-\d{2}-\d{2})"
TIME = r"\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?"
ANDROID = re.compile(rf"^({DATE}),? ({TIME}) - (.*)$")
IOS = re.compile(rf"^\[({DATE}),? ({TIME})\] (.*)$")
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿]")

# System lines that reveal a group chat (matched on folded text, so no umlauts)
GROUP_HINTS = ("hinzugefuegt", "entfernt", "verlassen", "gruppe", "beigetreten",
               "added", "removed", "left", "group", "joined", "subject", "betreff")
# Built-in sensitive patterns, matched on folded text
BUILTIN = {
    "money symbol": re.compile(r"[€$£]|\b\d+\s?(?:eur|euro|usd|dollar|chf)\b"),
    "link": re.compile(r"https?://|www\."),
    "bank account": re.compile(r"\b[a-z]{2}\d{2}[a-z0-9 ]{10,}"),
    "attachment": re.compile(r"<(?:anhang|medien|attached|media)|angehaengt|\bomitted\b|weggelassen|ausgeschlossen"),
}


def clean(text):
    """NFKC-normalise and drop invisible format characters (zero-width, LRM, soft hyphen, ...)."""
    text = unicodedata.normalize("NFKC", text)
    return "".join(c for c in text if unicodedata.category(c) != "Cf")


def fold(text):
    """Lowercase, umlauts -> ae/oe/ue, accents removed. Used only for matching."""
    t = clean(text).casefold()
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue")):
        t = t.replace(a, b)
    t = unicodedata.normalize("NFD", t)
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


def parse_chat(path):
    """Return (messages, system_lines). Messages are {ts, sender, text}."""
    messages, system, current = [], [], None
    for raw in Path(path).read_text(encoding="utf-8", errors="replace").splitlines():
        line = clean(raw)
        m = ANDROID.match(line) or IOS.match(line)
        if m:
            date, time, rest = m.groups()
            sender, sep, text = rest.partition(": ")
            if not sep and rest.endswith(":"):
                sender, sep, text = rest[:-1], ":", ""
            if sep:
                current = {"ts": f"{date} {time}", "sender": sender, "text": text}
                messages.append(current)
            else:
                current = None
                system.append(rest)
        elif current is not None:
            current["text"] += "\n" + line
    for msg in messages:
        msg["text"] = msg["text"].strip()
    return messages, system


def sensitive_hits(texts, keywords):
    hits = []
    for text in texts:
        f = fold(text)
        squeezed = re.sub(r"[\W_]+", "", f)  # catches "p a s s w o r t" for longer keywords
        for k in keywords:
            kf = fold(k)
            if (kf in f or (len(kf) >= 6 and kf in squeezed)) and k not in hits:
                hits.append(k)
        for name, rx in BUILTIN.items():
            if rx.search(f) and name not in hits:
                hits.append(name)
    return hits


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


def result(decision, reason, contact, **extra):
    print(json.dumps({"decision": decision, "reason": reason, "contact": contact, **extra},
                     ensure_ascii=False, indent=2))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--chat", required=True, help="exported WhatsApp chat (.txt)")
    ap.add_argument("--contact", required=True, help="name of the other person, exactly as in the export")
    ap.add_argument("--config", required=True, help="config.json (see config.example.json)")
    new = ap.add_mutually_exclusive_group()
    new.add_argument("--incoming-file", help="file with the new message text (use this for agents)")
    new.add_argument("--incoming", help="new message text, for manual use only")
    ap.add_argument("--last", type=int, default=30, help="how many recent messages to include")
    args = ap.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    me = cfg.get("my_name")
    keywords = cfg.get("escalate_keywords")
    if not me or not keywords:
        sys.exit("config needs 'my_name' and a non-empty 'escalate_keywords' list")

    # 1. allowlist first: for anyone else the chat file is not even opened
    allowed = {fold(c) for c in cfg.get("allowed_contacts", [])}
    if fold(args.contact) not in allowed:
        return result("not_allowed", "contact is not on the allowlist", args.contact)

    messages, system = parse_chat(args.chat)
    senders = {m["sender"] for m in messages}

    # 2. the chat must be clearly a private 1:1 chat between me and this contact
    if me not in senders:
        return result("needs_human", "my_name does not appear in this chat export (check config)", args.contact)
    if args.contact == me or args.contact not in senders:
        return result("needs_human", "contact does not appear as a different person in this chat", args.contact)
    if len(senders) != 2:
        return result("needs_human", "not a 1:1 chat; group chats are never answered automatically", args.contact)
    if any(h in fold(s) for s in system for h in GROUP_HINTS):
        return result("needs_human", "the export mentions group events; treated as a group chat", args.contact)

    # 3. what is there to answer?
    incoming = args.incoming
    if args.incoming_file:
        incoming = clean(Path(args.incoming_file).read_text(encoding="utf-8")).strip()
    if incoming is None:
        incoming = messages[-1]["text"] if messages[-1]["sender"] == args.contact else None
    if not incoming:
        return result("needs_human", "the last message is mine or empty; nothing to answer", args.contact)
    incoming = clean(incoming)

    # 4. scan the new message AND everything the contact wrote in the history window
    window = messages[-args.last:]
    texts = [incoming] + [m["text"] for m in window if m["sender"] != me]
    hits = sensitive_hits(texts, keywords)
    if hits:
        return result("needs_human", f"sensitive content: {', '.join(hits)}", args.contact)

    result("auto_ok", "allowed contact, private chat, nothing sensitive found", args.contact,
           my_name=me,
           label_to_append=cfg.get("label", ""),
           incoming_message=incoming,
           style=style_profile([m for m in messages if m["sender"] == me]),
           history=window)


if __name__ == "__main__":
    main()
