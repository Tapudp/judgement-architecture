# Contributing

Judgment Architecture is a vocabulary and a set of artefacts, not a product. The most useful contributions are the ones that make the ideas **more precise** or **more tested**.

## Ways to contribute

- **Challenge a definition.** Open an issue titled `concept: <name>` with the case where it breaks.
- **Write up a stub concept.** The concepts in [concepts/index.md](concepts/index.md) marked "defined, not yet written up" each need a page in the style of [Judgment Economics](concepts/judgment-economics.md): the problem, the model, the artefact, a worked example, anti-patterns, open questions, references.
- **Add a worked example** from a real domain under `examples/<domain>/`. Mark every number as measured or assumed.
- **Publish a Calibration Card.** Measure a decision model on a question you care about, in any language, and submit a card that validates against [the schema](spec/calibration-card.schema.json). Independent measurements are the most valuable thing this project can collect.
- **Improve the calculator.** It is a single HTML file plus [pnl.js](calculator/pnl.js); keep it dependency-free.

## House rules

1. **Cite.** Inline `[n]` markers and a References list at the bottom of each page, with URLs.
2. **Label assumptions.** Illustrative numbers are fine; unlabelled ones are not.
3. **Vendor-neutral.** Name vendors when citing them; never make a concept depend on one.
4. **Prior art first.** If an idea already has a name in another field, use it and link it.

## Validating a spec example

```bash
pip install jsonschema
python -c "import json,jsonschema; jsonschema.validate(json.load(open('spec/examples/calibration-card.wismo.json')), json.load(open('spec/calibration-card.schema.json'))); print('valid')"
```

## Licensing of contributions

Text and diagrams are contributed under [CC BY 4.0](LICENSE-TEXT); code and schemas under [Apache-2.0](LICENSE-CODE).
