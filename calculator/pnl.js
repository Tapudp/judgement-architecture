// Judgment P&L — pure functions. No DOM. Loaded by index.html and testable in Node.
(function (root) {
  "use strict";

  // Chow (1970): with calibrated probabilities, act automatically iff p >= 1 - r/e.
  function chowThreshold(reviewCost, errorCost) {
    if (!(errorCost > 0)) return 1;
    return Math.min(1, Math.max(0, 1 - reviewCost / errorCost));
  }

  // bins: [{ low, high, claimed, measured, share }], shares sum to ~1.
  // Acting at threshold tau means: every bin with low >= tau is acted on automatically.
  function costAt(tau, p) {
    const { volume: N, modelCost: c, reviewCost: r, errorCost: e, bins } = p;
    let abstainShare = 0, errors = 0, interest = 0, autoShare = 0;
    for (const b of bins) {
      if (b.low >= tau - 1e-9) {
        autoShare += b.share;
        errors += N * b.share * (1 - b.measured);
        interest += N * b.share * Math.max(0, b.claimed - b.measured) * e;
      } else {
        abstainShare += b.share;
      }
    }
    const model = N * c;
    const review = N * abstainShare * r;
    const errorCost = errors * e;
    return {
      tau, model, review, errorCost, interest,
      total: model + review + errorCost,
      abstainShare, autoShare, errors,
    };
  }

  function candidateThresholds(bins) {
    const edges = new Set([1.000001]);
    for (const b of bins) edges.add(b.low);
    return [...edges].sort((a, b) => a - b);
  }

  // Snap a continuous threshold to the first bin edge at or above it.
  function snapUp(tau, bins) {
    const edges = candidateThresholds(bins);
    for (const t of edges) if (t >= tau - 1e-9) return t;
    return edges[edges.length - 1];
  }

  function analyse(p) {
    const chow = chowThreshold(p.reviewCost, p.errorCost);
    const chowSnapped = snapUp(chow, p.bins);
    const curve = candidateThresholds(p.bins).map((t) => costAt(t, p));
    const best = curve.reduce((a, b) => (b.total < a.total ? b : a));
    const atChow = costAt(chowSnapped, p);
    const allHuman = costAt(1.000001, p);
    // What trusting the model's own confidence costs versus the threshold chosen on measured accuracy.
    const trustRegret = atChow.total - best.total;
    return { chow, chowSnapped, atChow, best, allHuman, curve, trustRegret };
  }

  const api = { chowThreshold, costAt, candidateThresholds, snapUp, analyse };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.JudgmentPnL = api;
})(typeof window !== "undefined" ? window : globalThis);
