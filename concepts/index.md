# Concepts

*Judgment Architecture · v0.1*

Three concepts are written up in full. The rest are named and defined here so they can be discussed, challenged and extended. Each names an artefact.

## Written up

- **[Judgment Economics](judgment-economics.md)** — the judgment as the unit of account; the confidence threshold as a financial control; calibration interest as a monthly bill. Artefact: *Judgment P&L* and the [calculator](../calculator/index.html).
- **[Cognitive Tiering](cognitive-tiering.md)** — System 0 (rules) · System 1 (judgment) · System 2 (deliberation), routed by consequence × confidence. Artefact: *consequence-class taxonomy*.
- **[Hedge UI](hedge-ui.md)** — confidence-native information architecture: three bands, three designed states, copy rules. Artefact: *three-band pattern set*.

## Defined, not yet written up

**Judgment Sourcing.** Every judgment is stored as an immutable record — state hash, question id and version, model id and version, full probability distribution, confidence, threshold in force, action taken, human override, eventual outcome. The system's history is its judgment log; current state is a projection of it. This enables replay (with tolerance bands, since decision models are not bit-for-bit deterministic), audit, recalibration and retraining without new labelling. The analogy is event sourcing. Artefact: [Judgment Record schema](../spec/judgment-record.schema.json).

**Calibration Card.** The governance artefact for one *question pack × model version × language*: expected calibration error, a reliability table, coverage at each threshold, drift since the last card, sample size and provenance. Published like a nutrition label; required before a pack acts automatically. The analogy is model cards — but per question, not per model. Artefact: [Calibration Card schema](../spec/calibration-card.schema.json).

**The Abstention Economy.** Humans do not "stay in the loop"; they staff the *boundary*. The band of judgments a system hands to people is an institution with a budget, a service level, a queue and a yield — verified labels. Its KPIs are abstention rate, cost per verified label, and calibration improvement per thousand reviews. Management by exception, instrumented. Artefact: the *abstention ledger*.

**Well-Posed Question Design.** The method for decomposing an organisational judgment into atomic, literal, typed questions: one judgment a knowledgeable person makes in a second; a none-of-the-above option always present; no arithmetic, no date comparison, no double negatives; each question tagged with a consequence class. The organisation's vocabulary is rewritten as a question catalogue. Builds on the community's *well-posedness* linters. Artefact: *question catalogue* and lint rules.

**State Design.** Information architecture and content strategy have always assumed a human reader. A decision model is now a reader too: what to include, how to name and path fields, what to filter out (irrelevant content lowers accuracy), how to quarantine text that may try to steer the model. Artefact: *state style guide*.

**Judgment Commons.** A shared, versioned, public vocabulary of standard questions — urgency, toxicity, intent classes per industry, regulator complaint taxonomies, customs chapters — each with a Calibration Card. *schema.org for judgments.* Artefact: a registry and a conformance check.

## Beyond software

**Calibrated Public Services.** A citizen is told the probability their application is eligible, and where the state abstained and a person will look — instead of a silent yes or no. Civic information design built on honest probabilities and a published Calibration Card per service.

**Personal Judgment Layer.** Individuals own their question packs — what to read, what to ignore, when to ask an expert — and track their own calibration over time. The superforecasting discipline, made ambient and cheap.

---

Want to write one of these up? See [CONTRIBUTING.md](../CONTRIBUTING.md).
