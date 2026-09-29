# How we got here

*The research journey behind Judgment Architecture — where it started, what we looked at, what we found, and why this repository looks the way it does. Written 29 September 2026.*

---

## 1. The starting question

It began with an irritation most people who have wired an LLM into a product will recognise.

A customer asks *"where is my shipment?"*. The request goes to a service, the service calls an LLM, the LLM calls a tool that fetches the real tracking data — and then it writes a paragraph: *"Absolutely! Great news — your order has already shipped and is on its way…"*. The system needed one fact and a next action. It got prose, latency and a token bill.

On 15 September 2026 TypeSafe AI released **Jev**, the first of what they call **System One models** [1]. Jev does not write anything. You give it text and a set of typed questions — *which of these options?*, *which level on this rubric?*, *is this true?* — and it returns typed answers with **calibrated probabilities**, in about 100–300 ms, for about $0.00002 a decision [2][3].

Our first question was a builder's question: **can we write a framework or wrapper on top of this that engineering teams would use?**

## 2. Reading the primitive properly

Before building anything we read the whole documentation and the independent coverage. A few things stood out that the launch headlines did not say:

- **Confidence is not probability.** Jev reports how *concentrated* its answer is, and TypeSafe's own guidance is to act on it in bands — act, confirm, escalate — with different thresholds for different consequences [4].
- **It has known jagged edges.** It reads questions literally, does not do arithmetic or date comparison, loses accuracy when given irrelevant context, and can be steered by adversarial text [5].
- **It is not deterministic.** Identical requests vary by a few hundredths; borderline answers can cross 0.5 on repeat [6][7].
- **It can be injected.** One published test saw accuracy fall from 96.5% to 26.5% with a single hostile line in the input [8].
- **Calibration degrades off-English faster than accuracy does** [9].

None of this makes it less useful. It changes *where* the engineering work is.

## 3. The wrapper idea died in a week

Then we looked at what already existed. Thirteen days after launch:

- over **1,000 community projects**, SDKs in roughly **25 languages**, integrations in every major agent framework and gateway [10][11];
- model routing had become an **official** product [12];
- LLM-evaluation platforms had shipped decision-model judges **within seven days** [13];
- open-weight models that speak the same interface had appeared, some within a point of Jev on published benchmarks [14].

The honest conclusion: **a wrapper was the one thing not worth building.** It had been built dozens of times, and the vendor openly expects the community to keep doing it.

## 4. Widening the lens

So we stopped asking "what can we wrap?" and asked "where does a cheap, calibrated, typed judgment change something?". We scanned the question through eight lenses, each researched independently and checked against primary sources:

| Lens | What we asked |
|---|---|
| Architecture | How do decision models and LLMs combine — one guarding many, one routing many, many checking each other? |
| Infrastructure | Queues, streams, Kubernetes, schedulers, data platforms — where are judgments made at volume? |
| Edge & hardware | Can this run on phones, robots, industrial boxes? |
| Models | What would an alternative look like — other languages, other regions, self-hosted? |
| Geography & regulation | Where is a US-hosted classifier not allowed? |
| Industries | Logistics, banking, telecom, insurance, contact centres, healthcare operations, trade… |
| Business models | Beyond software: services, education, benchmarks, standards |
| **Concepts** | Is there a way of *thinking* missing, not just a tool? |

Roughly sixty ideas came out. We will not publish that map here — it is our working research — but a few observations shaped everything that followed:

1. **The open positions were boring and operational, not clever.** Serving models where data must stay, managing the humans who handle the unsure cases, measuring whether the confidence is honest. Almost nobody was working there; almost everybody was building agent plugins.
2. **Every serious deployment has a human (or bigger-model) review band**, and nobody treats it as anything more than a queue.
3. **Nobody could say where the threshold should be.** Teams pick 0.8 because it is a round number.
4. **The token bill was the smallest number in every example we priced.** The real costs were reviewers and mistakes — and neither shows up on an AI dashboard.

## 5. The turn: plumbing is not enough

At that point the research had produced a long list of things to *build*. What it had not produced was a way to *think* about systems made of judgments — the kind of shared vocabulary that REST gave HTTP, or event sourcing gave the append-only log.

We checked whether someone had already written it [15]:

- **No named discipline, manifesto or pattern language existed** around decision models beyond the vendor's own terms.
- The category word gaining ground was **"decision models"** (Maggie Appleton, Simon Willison) [16] — we adopted it rather than inventing another.
- One early protocol draft (**DGP**) and a set of **"well-posed question"** linters existed [17][18] — allies, not competitors.
- **"Calibration debt"** had just been coined in a 2026 position paper [19] — so we build on it rather than claim it.
- **FinOps**, the discipline that manages technology spend, had extended to AI — but its open standard stops at *tokens*, not decisions [20][21].
- And the key piece of maths was already 56 years old: **Chow's 1970 reject rule** says exactly when to hand a decision to a human — *but only if the probabilities are calibrated* [22].

That last point became the spine of the project. A cheap primitive now makes Chow's rule free to apply to every decision. When the model is miscalibrated, the rule acts where it should not, and the extra mistakes have a price. **Nobody had packaged that for the people who actually decide where the line goes.**

## 6. What this repository is

Judgment Architecture is our attempt to write that missing layer down — a **vendor-neutral design discipline** for software that decides and knows how sure it is. Its one-sentence ideology:

> A system should never claim more than it knows, must say how sure it is, and must be able to say *"I don't know"* as a first-class outcome.

For v0.1 we chose three concepts out of nine, because together they answer the question every team gets stuck on:

- **[Judgment Economics](concepts/judgment-economics.md)** — *what does a decision cost, and where should the threshold be?* The judgment as the unit of account; calibration errors as a monthly bill.
- **[Cognitive Tiering](concepts/cognitive-tiering.md)** — *why one threshold is wrong.* Rules, judgment and deliberation as named tiers; routing by consequence.
- **[Hedge UI](concepts/hedge-ui.md)** — *what the user sees when the system is unsure.* Three confidence bands, three designed states.

And two draft schemas — the **Judgment Record** and the **Calibration Card** — so the ideas have artefacts you can validate against, not just prose.

## 7. Why the calculator has real cases in it

A concept that cannot be put into numbers does not get used. So the [Judgment P&L calculator](calculator/) ships with three **real, published deployments** — a bank-chatbot intent router, a Carnegie Mellon AI-judge cascade, and a retail product-matching queue — with every input tagged as *published*, *derived* or *assumed*. For the first, the calculator reproduces the published cost to within a cent per thousand queries. The third is there precisely because it *cannot* be priced yet: it shows what someone has to measure first.

## 8. What we are not claiming

- **Not new maths.** Chow, cost-sensitive learning, selective prediction and conformal prediction did the hard work decades ago [22][23].
- **Not a product.** Nothing here requires a particular vendor.
- **Not finished.** Six of the nine concepts are one-paragraph stubs. The illustrative numbers are labelled as illustrative.
- **Not independent of hype.** Decision models are two weeks old. Some of what we cite will age badly; we would rather be corrected than quiet.

## 9. How the research was done

Each lens was researched as a separate pass: official documentation first, then independent reviews, benchmarks, repositories and papers, with every figure traced to a primary source where one existed. We used AI-assisted parallel web research to cover ground quickly, and treated its output as leads to verify, not facts. Where a number could not be verified, we left it out.

## 10. Where it goes next

- Write up the remaining concepts — the Abstention Economy, Well-Posed Question Design, Judgment Sourcing, State Design, the Judgment Commons.
- Publish **real Calibration Cards** — per model, per question, per language.
- Collect worked examples from real deployments, especially outside English.
- Propose decision-level unit economics to the FinOps community once token economics lands in its standard.

If you have measured a decision model on your own data — or think any of this is wrong — [open an issue](CONTRIBUTING.md).

---

### Timeline

| Date | Moment |
|---|---|
| 15 Sep 2026 | TypeSafe releases Jev, the first System One model [1] |
| 20–22 Sep | Public access opens, then pauses under demand [24] |
| by 28 Sep | 1,000+ community projects; routing and eval-judging absorbed [10][12][13] |
| 28 Sep | Our research: documentation, ecosystem, eight lenses, prior-art check |
| 29 Sep | Judgment Architecture v0.1 published |

### References

1. TypeSafe AI — Introduction. https://docs.typesafe.ai/introduction
2. TypeSafe AI — Models and pricing. https://docs.typesafe.ai/models
3. Hands-on review (~$0.00002 per request; 253–378 ms). https://jevaiguide.com/jev-review/
4. TypeSafe AI — Confidence. https://docs.typesafe.ai/confidence
5. TypeSafe AI — Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13.md
6. TypeSafe AI — Self-consistency cookbook. https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook.md
7. jev-labs (repeat-request variance; paraphrase quorum). https://github.com/copyleftdev/jev-labs
8. jagged (injection test). https://github.com/zkousama/jagged
9. jev-acento (Spanish calibration audit). https://github.com/marcosmartinez/jev-acento/releases/tag/v0.1.1
10. awesome-jev directory. https://github.com/hellogumbo/awesome-jev
11. Awesome TypeSafe Jev field guide. https://github.com/AbdelStark/awesome-typesafe-jev
12. OpenRouter × TypeSafe router. https://openrouter.ai/typesafe/jev-router
13. e.g. Langfuse https://langfuse.com/blog/2026-09-22-running-evals-with-jev ; Braintrust https://www.braintrust.dev/blog/evaluate-agent-responses-with-jev
14. Kev https://github.com/jaredpalmer/kev ; Laya https://github.com/NandhaKishorM/laya ; Nimble https://github.com/bespokelabsai/nimble
15. Prior-art check across decision intelligence, DMN, model cards, selective prediction and uncertainty UX — see the references in each concept page.
16. Simon Willison on "decision models". https://simonwillison.net/2026/Sep/21/jev/
17. Decision Graph Protocol (DGP). https://github.com/numerous-com/dgp
18. wellposed. https://github.com/suenot/wellposed
19. "Position: The Machine Learning Community is Accumulating Calibration Debt", SSRN 2026. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7037798
20. FinOps Foundation — 2026 Framework. https://www.finops.org/insights/2026-finops-framework/
21. SiliconANGLE — FOCUS and AI token economics. https://siliconangle.com/2026/06/08/focus-specification-ai-cost-accountability-finopsx/
22. C. K. Chow, "On optimum recognition error and reject tradeoff", 1970. https://doi.org/10.1109/TIT.1970.1054406
23. Selective prediction survey. https://link.springer.com/article/10.1007/s10994-024-06534-x
24. Signup pause coverage. https://aifront-page.com/typesafe-ai-pauses-jev-ai-model-signups-demand-surge/
