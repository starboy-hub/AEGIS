/**
 * AEGIS offscreen document — runs the in-browser classification model
 * (transformers.js / ONNX Runtime) so heavy inference never janks a web page.
 *
 * The model (Xenova/mobilebert-uncased-mnli, quantized) is downloaded ONCE
 * from the Hugging Face Hub when the user enables "In-browser AI model" and
 * cached by the browser; every classification afterwards is fully offline.
 * Message text arrives here, is classified here, and never leaves the device.
 *
 * The library is imported dynamically so any failure is visible to the
 * background via messaging (static import failures are silent).
 *
 * Zero-shot hypotheses are per-kind: Sentinel asks scam-vs-normal, the
 * Injection Firewall asks manipulation-vs-normal.
 */
let classify = null;

function ensureModel() {
  if (classify) return Promise.resolve(classify);
  return import('./vendor/transformers.min.js')
    .then((mod) => {
      mod.env.allowLocalModels = false;
      mod.env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('vendor/');
      return mod.pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', {
        dtype: 'q8',
        // WASM only: offscreen documents have unreliable GPU access
        // (WebGPU dispatch fails with subgroup errors) — CPU inference of a
        // quantized MobileBERT is fast enough
        device: 'wasm',
        progress_callback: (p) => {
          try { chrome.runtime.sendMessage({ type: 'WEBGPU_PROGRESS', status: p.status, file: p.file || '' }); } catch (e) {}
        }
      });
    })
    .then((pipe) => {
      classify = pipe;
      try { chrome.runtime.sendMessage({ type: 'WEBGPU_READY' }); } catch (e) {}
      return pipe;
    })
    .catch((e) => { classify = null; throw e; });
}

const KIND_LABELS = {
  scam: ['a scam, phishing or fraud attempt asking for money, codes or personal details', 'an ordinary everyday message between people or services'],
  injection: ['an instruction trying to manipulate, control or hijack an AI system', 'ordinary content written for human readers']
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'OFFSCREEN_PING') { sendResponse({ pong: true }); return false; }
  if (msg.type !== 'WEBGPU_CLASSIFY') return false;
  const kind = msg.kind === 'injection' ? 'injection' : 'scam';
  const labels = KIND_LABELS[kind];
  ensureModel()
    .then(classifier => classifier(String(msg.text || ''), labels))
    .then(out => {
      const scores = {};
      out.labels.forEach((l, i) => { scores[l.startsWith('a scam') || l.startsWith('an instruction') ? kind : 'normal'] = out.scores[i]; });
      sendResponse({ ok: true, kind, scores });
    })
    .catch(e => sendResponse({ ok: false, error: String(e && e.message || e) }));
  return true; // async response
});
