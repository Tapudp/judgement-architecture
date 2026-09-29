# Judgment Architecture

**A design discipline for AI systems that decide — and know how sure they are.**

*For teams automating decisions with LLMs, decision models (System One models such as Jev) or classic classifiers: where to set the confidence threshold, what a wrong automated decision really costs, and how to design for "the AI isn't sure".*

> A system should never claim more than it knows, must say how sure it is, and must be able to say *"I don't know"* as a first-class outcome.

→ **[Judgment P&L calculator](calculator/)** — four numbers in, your cost-optimal confidence threshold and your monthly miscalibration bill out. It is a single HTML file: open `calculator/index.html` in a browser, or use the GitHub Pages site for this repo. It includes **three real, published deployments put into digits** — a bank-chatbot intent router, a Carnegie Mellon AI-judge cascade, and a retail product-matching queue — with every input tagged as published, derived or assumed.

---

## Software now has four ways to decide

For sixty years software decided in two ways:

1. **Rules** — deterministic, explainable, brittle.
2. **Models** — statistical classifiers; they need labelled data and an ML team.

Since 2023 it has had a third:

3. **Generation** — large language models: flexible, but slow, expensive, and unbounded. Ask one *"where is my shipment?"* and it writes a paragraph when your code needed a status code.

In September 2026 a fourth arrived. TypeSafe's **Jev**, the first of what they call *System One models* and others call **decision models** [1][2], takes text plus a set of typed questions and returns:

4. **Judgments** — a choice from options you declared, a level on a rubric you wrote, or the probability that a statement is true — each with a **calibrated probability**, in about 100–300 ms, for about $0.00002, without generating a single word [1][3]. Open-weight models that speak the same interface followed within days [4].

A judgment is not a small LLM. It is bounded (it cannot answer outside the options you gave it), it is cheap enough to run on every event, and — the important part — **it can abstain**. It can tell you, honestly on average, that it is not sure.

## What is missing is not code. It is the discipline.

Within two weeks the ecosystem produced over a thousand integrations: SDKs in every language, routers, guardrails, judges, plugins [5]. What it has not produced is a way of **thinking** about systems built from judgments:

- Where should the confidence threshold sit — and who decides?
- What does a wrong automated decision cost, and what does asking a human cost?
- How do you show *"the system isn't sure"* to a user without it looking like a bug?
- How do you log, audit and replay a decision that was probabilistic?
- What happens to all the cases the system handed to a person?

Software has never treated **abstention** as a first-class construct, and has never treated **"how sure the system is"** as data with its own schema, storage, governance and interface. Judgment Architecture is an attempt to do both.

## The concepts

| Concept | One line | Status |
|---|---|---|
| **[Judgment Economics](concepts/judgment-economics.md)** | Make the judgment the unit of account and the confidence threshold a financial control. Miscalibration has a monthly bill. | **v0.1** |
| **[Cognitive Tiering](concepts/cognitive-tiering.md)** | System 0 (rules) · System 1 (judgment) · System 2 (deliberation). Route by *consequence × confidence*, not by cost alone. | **v0.1** |
| **[Hedge UI](concepts/hedge-ui.md)** | Confidence-native information architecture: three bands, three designed states, copy that matches certainty. | **v0.1** |
| Judgment Sourcing | Every judgment is an immutable record; the system's state is a projection of its judgment log. | [spec](spec/judgment-record.schema.json) · draft |
| Calibration Card | The governance artefact for a question pack × model version × language. | [spec](spec/calibration-card.schema.json) · draft |
| The Abstention Economy | Humans don't stay "in the loop" — they staff the boundary. The abstention queue is an institution with a budget and a yield. | [stub](concepts/index.md) |
| Well-Posed Question Design | Decompose a judgment into atomic, literal, typed questions with a consequence class. | [stub](concepts/index.md) |
| State Design | Information design for a machine reader. | [stub](concepts/index.md) |
| Judgment Commons | A shared, versioned vocabulary of standard questions — *schema.org for judgments*. | [stub](concepts/index.md) |

## Concepts become engineering

Each concept names an artefact you can build or buy:

| Concept | Artefact | What it becomes |
|---|---|---|
| Judgment Economics | Judgment P&L, [calculator](calculator/index.html) | the threshold decision, owned by finance and product together |
| Cognitive Tiering | consequence-class taxonomy | the routing table of every automated workflow |
| Hedge UI | three-band pattern set | the design system for uncertain answers |
| Judgment Sourcing | [Judgment Record](spec/judgment-record.schema.json) | the audit log (EU AI Act Art. 12 asks for exactly this) [6] |
| Calibration Card | [Calibration Card](spec/calibration-card.schema.json) | the release gate for any question pack |
| The Abstention Economy | review queue with SLAs | the labelled dataset you were going to pay for anyway |

## A worked example

A logistics business handles 100,000 shipment-exception and *"where is my order?"* messages a month. Using the same model on the same stream:

- Auto-replying to a customer: a wrong reply costs a re-contact (~$12) [7]; a human review costs ~$3. **Act above 0.75.**
- Pre-classifying a customs HS code: a wrong code costs duty re-assessment and delay (~$150); **act above 0.98** — almost everything goes to a person, *correctly*.
- The model bill for all of it: **about $2 a month.** If one busy confidence band claims 0.90 and is right 80% of the time, the unplanned errors cost **tens of thousands a month.**

The token bill is the smallest number on the page. → [Full walkthrough](examples/logistics-wismo-hs/README.md) · [calculator](calculator/index.html)

## What this is not

- **Not a product or a vendor.** Vendor-neutral: works with Jev, open-weight decision models, or your own classifier.
- **Not new maths.** The cost-optimal reject rule is C. K. Chow's, from 1970 [8]; selective prediction and calibration are decades-old fields [9]. What is new is a primitive that makes them free to apply to every decision — and a vocabulary for the people who have to decide where the line goes.
- **Not finished.** v0.1. The stubs are stubs on purpose.

## Contributing

Propose a concept, challenge a definition, add a worked example, publish a Calibration Card. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Text and diagrams: [CC BY 4.0](LICENSE-TEXT). Code and schemas: [Apache-2.0](LICENSE-CODE).

---

### References

1. TypeSafe AI — Introduction and System One concept. https://docs.typesafe.ai/introduction ; https://docs.typesafe.ai/concepts/system-one
2. Simon Willison on the "decision models" name (21 Sep 2026). https://simonwillison.net/2026/Sep/21/jev/
3. TypeSafe AI — Models and pricing ($0.042 per million input tokens, output free). https://docs.typesafe.ai/models ; per-request cost measured at ~$0.00002: https://jevaiguide.com/jev-review/
4. Open-weight decision models serving the same `/v1/systemone` interface — Kev https://github.com/jaredpalmer/kev ; Laya https://github.com/NandhaKishorM/laya ; Nimble https://github.com/bespokelabsai/nimble
5. Community directory (1,000+ projects in the first two weeks). https://github.com/hellogumbo/awesome-jev
6. EU AI Act, Article 12 — record-keeping. https://artificialintelligenceact.eu/article/12/
7. WISMO ticket economics ($8–16 per email/chat ticket). https://www.ringly.io/blog/wismo-tickets
8. C. K. Chow, "On optimum recognition error and reject tradeoff", IEEE Trans. Information Theory 16(1), 1970. https://doi.org/10.1109/TIT.1970.1054406
9. Selective prediction survey. https://link.springer.com/article/10.1007/s10994-024-06534-x ; conformal prediction tutorial https://people.eecs.berkeley.edu/~angelopoulos/publications/downloads/gentle_intro_conformal_dfuq.pdf
