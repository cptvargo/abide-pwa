# WAE Translation Style Guide
## Webster ABIDE Edition — Matthew and Beyond

---

## Core Philosophy

The WAE is not a revision of Webster's Bible. It is an independent translation rooted in the Greek text, written for children (Grade 3–5), teenagers, new believers, and casual readers — without being babyish, without drifting into NIV or NKJV territory.

> **You can choose *how* to say it. You cannot change *what* it says.**

Slight interpretation is permitted where it serves clarity. The Greek meaning must never be softened, added to, or lost.

---

## Audience

- Children (Grade 3–5 reading level)
- Teenagers
- New believers
- Casual readers
- Longtime Christians seeking fresh readability

**Tone:** Warm · Clear · Reverent · Emotionally understandable · Easy to read aloud

---

## The Test Before Finalizing Any Verse

1. Does this sentence appear word-for-word in NIV or NKJV? → Rewrite from the Greek up.
2. Is this just Webster's Bible with modern pronouns swapped? → Rewrite from the Greek up.
3. Can every interpretive choice be defended from the Greek? → If not, revise.
4. Is any hard truth softened or avoided? → Restore it. The WAE does not protect readers from Scripture.

---

## Banned Patterns

### NIV Drift — Avoid These
- Casual connectors: "So he got up," "At that point," "he realized"
- Journalistic verbs: "withdrew," "outwitted," "reported," "responded"
- Flat emotion words: "furious," "overjoyed," "terrified"
- Signature phrases: "by another route," "search carefully," "in place of," "withdrew to"

### NKJV Drift — Avoid These
- Archaic KJV carryovers: "behold," "thus," "exceedingly," "therefore" used as filler
- Constructions that are just cleaned-up KJV phrasing
- Webster's Bible → NKJV refinements (they share the same ancestor — converging is inevitable without Greek-first discipline)

---

## WAE Voice Markers — Use Consistently

| Situation | WAE Phrasing | NOT This |
|---|---|---|
| Divine commands | **"Arise"** | "Get up" (NIV), "Rise" (generic) |
| Dream sequences | **"woke up"** | "arose" (NKJV), "got up" (NIV) |
| Strong anger | **"his anger burned"** | "was furious" (NIV), "was exceedingly angry" (NKJV) |
| Worship/prostration | **"fell to the ground and worshiped"** | "bowed down" (NIV), "fell down" (NKJV) |
| Communication | **"sent word"** | "reported" (NIV), "bring back word" (NKJV) |
| Beginning a journey | **"set out"** | "departed" (NKJV), "left" (generic) |
| Redirected journey | **"traveled instead to"** | "withdrew to" (NIV) |

---

## Readability Rules

- No sentence longer than ~30 words
- No vocabulary above Grade 6 unless it is an essential theological term
- Theological terms are **kept** — *Emmanuel*, *Christ*, *frankincense*, *repentance* — and allowed to carry their weight
- When the Greek uses a vivid verb, find a vivid English rendering that belongs to neither NIV nor NKJV
- Hard content is rendered plainly. The WAE does not sanitize Scripture.

---

## Pronoun Capitalization

Capitalize **He, Him, His, Himself** whenever the pronoun refers to Jesus Christ. Capitalize **My, I** when God is the speaker in direct speech or prophecy.

---

## Quotes and Speech

- All direct speech gets quotation marks
- Multi-verse speeches: open quote in the first verse, no closing quote until the speech ends
- Prophecy quotes: open and close within the verse that contains the quotation
- No quote marks inside narrative description — only for spoken words and direct citations

---

## Section Titles

Every chapter should have section titles as a `sections` array in the JSON:

```json
"sections": [
  { "title": "Section Title Here", "startVerse": 1 },
  { "title": "Next Section", "startVerse": 12 }
]
```

Titles should be:
- Clear and descriptive for a young reader
- Reverent — not sensational
- Brief (4–7 words ideal)

---

## Greek Anchoring — Key Principles

- **πίπτω / προσκυνέω** — prostration in worship = "fell to the ground and worshiped," not "knelt"
- **ἐταράχθη** — deeply shaken, agitated = "greatly troubled" or "deeply unsettled," not "disturbed" (NIV)
- **ἠκρίβωσεν** — ascertained with precision = "determined precisely," not "carefully found out"
- **νυκτός** — by night = "that very night" (urgency) not "under cover of night" (adds stealth not in text)
- **ποῦ** — where (location) not who (identity) — the wise men ask WHERE, not WHO
- **θυμόω** — to be enraged, burning anger = "his anger burned hot," not "was furious"
- **ποιμανεῖ** — shepherd/rule = "shepherd" is accurate and should be kept

---

*Last updated: May 2026*
