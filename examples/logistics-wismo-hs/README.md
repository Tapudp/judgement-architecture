# Worked example — logistics & trade: one model, two thresholds

*Judgment Architecture · example · v0.1 · illustrative numbers*

A business that ships goods across borders handles two very different decisions on the same inbound stream of carrier updates and customer messages:

1. **"Where is my order?" (WISMO)** — tell the customer the shipment status. Wrong answer: the customer contacts you again.
2. **Customs HS-code pre-classification** — propose the tariff code for a line item before a broker files it. Wrong answer: duty re-assessment, delay, possible penalty.

Both are typed judgments a decision model can make in one call. They should **not** share a threshold.

## 1 · The questions

One request, one state, two questions. The shape follows the System One API [1]; check field names against the current API reference before using it verbatim.

```json
{
  "model": "jev-1.13.0",
  "state": {
    "ticket": { "messages": [{ "text": "Hi, my order 44-1829 was meant to arrive yesterday. Any news?" }] },
    "shipment": {
      "last_scan": "Arrived at Leicester depot 06:40",
      "carrier_status_code": "AD",
      "line_item": "Men's cotton knitted pullover, 100% cotton"
    }
  },
  "questions": {
    "wismo_status": {
      "type": "choice",
      "instructions": "Based on shipment.last_scan and the carrier status, what is the current delivery status to tell the customer?",
      "criteria": {
        "out_for_delivery": "On a vehicle for delivery today",
        "delayed_at_hub": "At a depot or hub and not yet on a delivery vehicle",
        "delivered": "Delivered",
        "none_of_the_above": "None of these fit"
      }
    },
    "hs_chapter": {
      "type": "choice",
      "instructions": "Which HS chapter best fits shipment.line_item?",
      "criteria": {
        "61": "Chapter 61 — apparel, knitted or crocheted",
        "62": "Chapter 62 — apparel, not knitted or crocheted",
        "63": "Chapter 63 — other made-up textile articles",
        "none_of_the_above": "None of these fit"
      }
    }
  }
}
```

Notes on question design:
- **Literal and atomic.** Each question asks one thing and points at the field it needs.
- **None-of-the-above is always present.** It gives the model somewhere honest to go.
- **No arithmetic in the question.** "Was it late by more than a day?" is date maths — do it in code (System 0), then ask.
- **HS classification is staged.** Ask the chapter first; ask heading and subheading only within the chosen chapter, each as its own judgment.

## 2 · The prices

| | WISMO reply | HS pre-classification |
|---|---|---|
| Consequence class ([tiering](../../concepts/cognitive-tiering.md)) | C1 · reversible | C3 · irreversible once filed |
| Human review cost `r` | $3 (≈2 minutes of an agent) | $3 (broker glance at a pre-filled suggestion) |
| Error cost `e` | $12 (one re-contact; industry range $8–16 per email/chat ticket [2]) | $150 (re-assessment, delay, penalty exposure) |
| Chow threshold `1 − r/e` [3] | **0.75** | **0.98** |
| Monthly volume | 100,000 | 20,000 |
| Model cost | ≈ $0.00002 per judgment [4] → $2 / month | → $0.40 / month |

*Review and error costs are illustrative assumptions; replace them with your own.*

## 3 · The calibration

Measured on a few hundred reviewed judgments per question — see the example [Calibration Card](../../spec/examples/calibration-card.wismo.json). For WISMO, the 0.75–0.85 band *claims* 0.80 but is *measured* at 0.72; the 0.85–0.95 band claims 0.90 and is measured at 0.80.

## 4 · The P&L

**WISMO** (open the [calculator](../../calculator/index.html) with the default scenario):

| Policy | Threshold | Monthly total | To humans | Calibration interest |
|---|---|---|---|---|
| Trust reported confidence (Chow) | 0.75 | $179,882 | 22% | $40,980 |
| Cheapest on measured accuracy | **0.85** | **$174,482** | 37% | $26,580 |
| Everything to humans | — | $300,002 | 100% | — |

Trusting the model's own confidence costs **$5,400 a month** here, because one band looks safe on paper and isn't. Automation still saves about **$125,500 a month** against all-human handling.

**HS pre-classification** (calculator → "Trade" scenario):

| Policy | Threshold | Monthly total | To humans |
|---|---|---|---|
| Chow / cheapest | **0.98** | **$55,500** | 70% |
| Act on everything | 0 | $523,500 | 0% |
| Everything to humans | — | $60,000 | 100% |

The right answer for HS codes is to **let the model pre-fill and let a person confirm 70% of the time** — and act alone only on the top band. Automating everything would cost almost nine times more than not automating at all.

## 5 · What to take from it

- **The threshold belongs to the decision, not the model.** Same model, same stream: 0.85 and 0.98.
- **The model bill is irrelevant to the threshold.** $2 a month either way.
- **Calibration is worth money.** The WISMO overconfident bands cost more each month than the entire model bill for years.
- **The review band is not waste.** Every one of those human confirmations is a verified label that makes the next Calibration Card better.

---

### References

1. TypeSafe AI — API reference. https://docs.typesafe.ai/api.md
2. Ringly — WISMO ticket economics. https://www.ringly.io/blog/wismo-tickets
3. C. K. Chow, "On optimum recognition error and reject tradeoff", 1970. https://doi.org/10.1109/TIT.1970.1054406
4. TypeSafe AI — Models and pricing. https://docs.typesafe.ai/models ; per-request cost https://jevaiguide.com/jev-review/
