/**
 * AEGIS offscreen document — runs the in-browser classification model
 * (transformers.js / ONNX Runtime) so heavy inference never janks a web page.
 *
 * The model (Xenova/mobilebert-uncased-mnli, quantized) is downloaded ONCE
 * from the Hugging Face Hub when the user enables "In-browser AI model" and
 * cached by the browser; every classification afterwards is fully offline.
 * Message text arrives here, is classified here, and never leaves the device.
 *
 * Each hypothesis sentence is scored INDEPENDENTLY: P(entailment) from the
 * model's NLI head for (text, hypothesis). Hypothesis sets travel with the
 * request (background reads them from semantic-engine.js); the decision on
 * those probabilities also lives there — this document only measures.
 *
 * The library is imported dynamically so any failure is visible to the
 * background via messaging (static import failures are silent).
 */
let scoreEntailment = null;

function ensureModel() {
  if (scoreEntailment) return Promise.resolve(scoreEntailment);
  return import('./vendor/transformers.min.js')
    .then(async (T) => {
      T.env.allowLocalModels = false;
      T.env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('vendor/');
      const MODEL = 'Xenova/mobilebert-uncased-mnli';
      // AutoConfig goes through the library cache — offline after first load
      const cfg = await T.AutoConfig.from_pretrained(MODEL);
      const id2label = cfg.id2label || {};
      const entIdx = Object.keys(id2label).find(k => String(id2label[k]).toLowerCase() === 'entailment');
      const conIdx = Object.keys(id2label).find(k => String(id2label[k]).toLowerCase() === 'contradiction');
      if (entIdx === undefined || conIdx === undefined) throw new Error('model config lacks entailment/contradiction labels');
      const tok = await T.AutoTokenizer.from_pretrained(MODEL);
      // WASM only: offscreen documents have unreliable GPU access
      // (WebGPU dispatch fails with subgroup errors) — CPU inference of a
      // quantized MobileBERT is fast enough
      const mdl = await T.AutoModelForSequenceClassification.from_pretrained(MODEL, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: (p) => {
          try { chrome.runtime.sendMessage({ type: 'WEBGPU_PROGRESS', status: p.status, file: p.file || '' }); } catch (e) {}
        }
      });
      const score = (text, hyp) => tok(text, { text_pair: hyp, truncation: true })
        .then((inputs) => mdl(inputs))
        .then((out) => {
          const logits = out.logits.tolist()[0];
          const mx = Math.max(...logits);
          const exp = logits.map((v) => Math.exp(v - mx));
          const sum = exp.reduce((a, b) => a + b, 0);
          return { ent: exp[Number(entIdx)] / sum, con: exp[Number(conIdx)] / sum, entLogit: logits[Number(entIdx)] };
        });
      // Sanity: if the label order were wrong — or the hypothesis text were
      // being ignored (the v4 text_pair trap) — these scores collapse together
      const entails = await score('The cat sat on the mat and fell asleep.', 'A cat is sleeping.');
      const contradicts = await score('The cat sat on the mat and fell asleep.', 'The cat is flying to the moon.');
      if (!(entails.ent > entails.con + 0.3 && contradicts.con > contradicts.ent + 0.3)) {
        throw new Error('NLI head sanity check failed (label order or pair encoding)');
      }
      return score;
    })
    .then((score) => {
      scoreEntailment = score;
      try { chrome.runtime.sendMessage({ type: 'WEBGPU_READY' }); } catch (e) {}
      return score;
    })
    .catch((e) => { scoreEntailment = null; throw e; });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'OFFSCREEN_PING') { sendResponse({ pong: true }); return false; }
  if (msg.type !== 'WEBGPU_CLASSIFY') return false;
  ensureModel()
    .then((score) => {
      const hyps = Array.isArray(msg.hypotheses) ? msg.hypotheses : null;
      if (!hyps || !hyps.length) { sendResponse({ ok: true, kind: 'warmup', pairs: [] }); return; } // warmup: loading IS the point
      return Promise.all(hyps.map((h) => score(String(msg.text || ''), h).then(({ ent, con, entLogit }) => [h, ent, con, entLogit])))
        .then((pairs) => sendResponse({ ok: true, kind: msg.kind === 'injection' ? 'injection' : 'scam', pairs }));
    })
    .catch((e) => sendResponse({ ok: false, error: String(e && e.message || e) }));
  return true; // async response
});
