# Hedge UI — confidence-native information architecture

*Judgment Architecture · concept · v0.1*

> **Information architecture has designed for findability. This designs for honesty.**

## The problem

Interfaces show machine decisions as facts. A status says *"Delivered"*, a category says *"Billing"*, a flag says *"Fraud"* — whether the system was 99% sure or 51% sure. When it is wrong, users stop trusting all of it. When it is unsure, the only honest options designers have today are an error message or nothing at all.

A decision model returns something richer than a fact: a value **and** how sure it is. Hedge UI is the practice of carrying that confidence all the way to the screen — deliberately, not as a percentage bolted onto a label.

It extends existing guidance — Google PAIR's *calibrating trust* [1] and Microsoft's HAX guideline *"make clear how well the system can do what it can do"* [2] — into a concrete pattern set tied to thresholds.

## Every fact carries four things

| Field | Example | Shown to users? |
|---|---|---|
| **value** | `status = "out_for_delivery"` | always |
| **confidence** | 0.83 | never as a raw number by default — as a band |
| **provenance** | model `jev-1.13.0`, question `wismo.status v3`, 14:02 UTC | on request |
| **alternatives** | `delayed_at_hub` 0.11 | only in the middle band |

## Three bands, three designed states

The bands come from the thresholds set in [Judgment Economics](judgment-economics.md) and [Cognitive Tiering](cognitive-tiering.md) — they are not arbitrary UI choices.

### 1. Act — confidence above the automation threshold
The system acted. Show the outcome plainly, with provenance one tap away.

```
┌──────────────────────────────────────────┐
│ Out for delivery · arriving today        │
│ Updated 14:02 · why?                     │
└──────────────────────────────────────────┘
```

### 2. Act-and-show — between the review threshold and the automation threshold
The system has a best answer but is not sure enough to hide the alternative. Show the answer **and** make correction cheap.

```
┌──────────────────────────────────────────┐
│ Probably out for delivery                │
│ It may still be at the local hub.        │
│ [ Looks right ]   [ Something's wrong ]  │
└──────────────────────────────────────────┘
```

### 3. Ask — below the review threshold
The system abstained. This is a **designed state**, not an error. Say what happens next and when.

```
┌──────────────────────────────────────────┐
│ We're checking this one by hand          │
│ A person will confirm your delivery      │
│ status within 2 hours.                   │
└──────────────────────────────────────────┘
```

## Copy rules

| Band | Verbs | Avoid |
|---|---|---|
| Act | is, has, will | hedges ("probably") — they erode trust in the confident cases |
| Act-and-show | probably, likely, looks like | false precision ("83% likely") for end users |
| Ask | we're checking, a person will confirm | "error", "unable to", "something went wrong" |

- **Match the words to the band, not to the number.** Users read "probably" consistently; they read "0.83" inconsistently.
- **Show numbers to operators, not customers.** Internal tools should show confidence and alternatives; customer surfaces should show bands.
- **Scale the consent gate to the consequence class.** A C1 action in the middle band can proceed with an undo; a C3 action in the middle band must ask first.

## For internal tools

Operators and reviewers need more than customers do:

- **Sort review queues by expected cost** (`error cost × (1 − confidence)`), not by arrival time.
- **Show the alternative** the model considered, with its probability — the reviewer's fastest path is usually choosing between two.
- **Make "the model was wrong" one click** — that click is the verified label that recalibrates the system.

## Anti-patterns

- **Raw percentages on customer screens.**
- **Uniform certainty** — every machine answer styled as fact.
- **Abstention as error** — red banners, apology copy, dead ends.
- **Hedging everything** — if every answer says "probably", none of them means anything.
- **Confidence without provenance** — a number nobody can trace to a model version or question.

## Open questions

- How should bands be shown in voice and chat interfaces, where there is no visual weight?
- Should users be able to set their own band preference ("always ask me before refunds")?
- What is the accessible representation of uncertainty for screen readers?

---

### References

1. Google PAIR — People + AI Guidebook: Explainability + Trust. https://pair.withgoogle.com/guidebook-v2/chapter/explainability-trust/
2. Microsoft HAX Toolkit — Guideline 2. https://www.microsoft.com/en-us/haxtoolkit/guideline/make-clear-how-well-the-system-can-do-what-it-can-do/
3. Confidence / uncertainty display patterns (practitioner catalogue). https://uxpatternsguide.com/patterns/confidence-uncertainty-display/
