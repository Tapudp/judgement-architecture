# Judgment Economics

*Judgment Architecture · concept · v0.1*

> **Make the judgment the unit of account, and the confidence threshold a financial control.**

## The problem

Teams that automate decisions with a model argue about two numbers that live in different departments:

- **Engineering** watches the model bill — tokens, GPUs, calls.
- **Operations** watches the human bill — reviewers, queues, escalations, rework.

Nobody owns the number that connects them: **the confidence threshold** — the line above which the system acts on its own and below which it asks a person. Usually it is set once, by an engineer, at a round number like 0.8, and never revisited.

That line is a financial decision. Move it up and you pay more people. Move it down and you pay for more mistakes. The model bill barely changes either way.

## What FinOps sees, and what it doesn't

FinOps is the discipline of managing technology spend jointly across engineering, finance and product. Its framework runs a loop of **Inform → Optimize → Operate**, with *unit economics* as part of Inform [1]. In 2026 its scope expanded from cloud to AI, SaaS and licensing; 98% of FinOps teams now manage AI spend [2][3].

Its open billing standard, **FOCUS**, reached version 1.4 in June 2026. Token-level AI economics — cost by token type and workload — is planned for 1.5 [4][5].

That is the right direction, and it stops one level too early. Tokens tell you what you **spent**. They cannot tell you whether what you bought was **right**. Closer prior art moves the unit to the *workflow run*, with buckets for model, tools, human oversight and failure, and reports "cost per accepted outcome" [6]. Per-outcome *pricing* exists too [7]. None of these contains a **threshold**, so none can answer the question every decision-model deployment actually faces.

## The model

For a stream of `N` judgments per month:

| Symbol | Meaning |
|---|---|
| `c` | model cost per judgment |
| `r` | cost of a human reviewing one abstained judgment |
| `e` | cost of one wrong automated action (re-contact, refund, re-shipment, penalty…) |
| `τ` | the confidence threshold — act automatically at or above it |
| `A(τ)` | share of judgments below `τ` (sent to a human) |
| `E(τ)` | error rate among judgments acted on automatically |

```
Cost(τ) = N·c  +  N·A(τ)·r  +  N·(1 − A(τ))·E(τ)·e
          model    abstentions      errors that slipped through
```

This is the **Judgment P&L**: three lines, one dial.

## The optimum is from 1970

C. K. Chow proved the cost-minimising reject rule in 1970 [8]: **abstain when the model's top probability is below `1 − r/e`**. Cost-sensitive learning generalised it [9]; selective classification maps the risk–coverage curve underneath [10].

So with a review cost of $3 and an error cost of $12, act above **0.75**. With the same $3 review and a $150 error, act above **0.98**.

Two consequences follow directly:

1. **One model, many thresholds.** The threshold belongs to the *decision*, not the model. The same stream can hold judgments with very different error costs — which is why [Cognitive Tiering](cognitive-tiering.md) routes by consequence.
2. **Finance can set the threshold.** Nobody needs to guess "0.8". They need two prices, `r` and `e`, which operations and finance already know.

## The catch: Chow's rule assumes the model is honest

The rule is only optimal if the probabilities are **calibrated** — if judgments reported at 0.90 are right 90% of the time. When they are not, the rule acts on judgments it should have handed to a person, and every extra error has a price.

The ML community has started calling the accumulated gap **calibration debt**; a 2026 position paper proposes a Calibration Debt Score for deployment readiness [11]. Judgment Economics puts a currency on it. Group judgments into confidence bands; for each band you act on:

```
Calibration interest (per month) = Σ over auto-acted bands b
                                   N_b · max(0, claimed_b − measured_b) · e
```

And a second number, the **cost of trusting the model's confidence**: the total at Chow's threshold (computed from *claimed* confidence) minus the total at the cheapest threshold found using *measured* accuracy. It is zero when the model is calibrated.

Calibration interest is a real bill even when nobody sees it. It is paid in re-contacts, refunds and penalties, and it shows up in operations' budget, not engineering's.

## Worked example

A logistics business, 100,000 *"where is my order?"* messages a month; review `r = $3`; error `e = $12` (one re-contact at $8–16 [12]); model `c ≈ $0.00002` [13].

| Confidence band | Claimed | Measured | Share |
|---|---|---|---|
| 0.00–0.50 | 0.40 | 0.35 | 5% |
| 0.50–0.60 | 0.55 | 0.52 | 5% |
| 0.60–0.70 | 0.65 | 0.61 | 7% |
| 0.70–0.75 | 0.725 | 0.68 | 5% |
| 0.75–0.85 | 0.80 | 0.72 | 15% |
| 0.85–0.95 | 0.90 | 0.80 | 20% |
| 0.95–1.00 | 0.975 | 0.97 | 43% |

*(Illustrative numbers, not a measurement of any particular model.)*

| | Threshold | Monthly total | To humans | Calibration interest |
|---|---|---|---|---|
| Model bill alone | — | **$2** | — | — |
| Chow, trusting reported confidence | 0.75 | $179,882 | 22% | **$40,980** |
| Cheapest on measured accuracy | 0.85 | $174,482 | 37% | $26,580 |
| Everything to humans | never | $300,002 | 100% | $0 |

- The **cost of trusting the model's confidence** is **$5,400 a month**: the 0.75–0.85 band *claims* 0.80, which clears Chow's 0.75, but is *measured* at 0.72 — below it. Those judgments should go to a person.
- Automation still saves over $125,000 a month against all-human handling. The point is not that automation is bad; it is that **the threshold is worth tuning, and the model bill tells you nothing about where to put it.**

Try it with your own numbers: [calculator](../calculator/index.html).

## How to use this

1. **Price `r` and `e` per decision type.** Operations knows `r`. Finance or the business owner knows `e`. Write both down.
2. **Measure calibration** on a few hundred labelled judgments per decision type; publish it as a [Calibration Card](../spec/calibration-card.schema.json).
3. **Set thresholds from prices and measurements**, not round numbers. Re-run when the model version changes — pin versions; aliases move [13].
4. **Report the Judgment P&L monthly** alongside the model bill: abstention cost, error cost, calibration interest.
5. **Treat calibration interest as debt.** Pay it down by recalibrating, splitting questions, or raising the threshold on the bands that owe it.

## Relationship to FinOps

Judgment Economics is a proposed **decision-grain extension to the Inform phase**: the same discipline of shared accountability and unit economics, applied one level above tokens — where the business actually feels the cost. A natural next step is a FOCUS discussion about decision-level unit metrics once token economics lands in 1.5.

## Open questions

- How should `e` be estimated when errors are rare but catastrophic?
- How many labelled judgments per band are enough before thresholds can be trusted?
- Should abstention cost include the *delay* to the customer, not only reviewer time?

Challenge any of this in an issue.

---

### References

1. FinOps Foundation — FinOps Phases. https://www.finops.org/framework/phases/
2. FinOps Foundation — 2026 FinOps Framework. https://www.finops.org/insights/2026-finops-framework/
3. State of FinOps 2026 (via practitioner summary). https://rikuq.com/blog/finops/finops-foundation-framework-2026/ ; https://data.finops.org/
4. FOCUS specification 1.4. https://focus.finops.org/focus-specification/
5. SiliconANGLE — FOCUS and AI token economics (June 2026). https://siliconangle.com/2026/06/08/focus-specification-ai-cost-accountability-finopsx/
6. TrueFoundry — From AI token costs to workflow economics. https://www.truefoundry.com/blog/ai-token-costs-workflow-economics
7. Intercom Fin — per-resolution pricing. https://fin.ai/learn/per-resolution-vs-per-conversation-ai-pricing
8. C. K. Chow, "On optimum recognition error and reject tradeoff", IEEE Trans. Information Theory 16(1), 1970. https://doi.org/10.1109/TIT.1970.1054406
9. C. Elkan, "The Foundations of Cost-Sensitive Learning", IJCAI 2001. https://cseweb.ucsd.edu/~elkan/rescale.pdf
10. Y. Geifman & R. El-Yaniv, "Selective Classification for Deep Neural Networks", 2017. https://arxiv.org/abs/1705.08500
11. "Position: The Machine Learning Community is Accumulating Calibration Debt", SSRN 2026. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7037798
12. Ringly — WISMO ticket economics. https://www.ringly.io/blog/wismo-tickets
13. TypeSafe AI — Models (pricing; pin versions when thresholds are calibrated). https://docs.typesafe.ai/models ; per-request cost https://jevaiguide.com/jev-review/
