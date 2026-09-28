/**
 * AEGIS offscreen document — runs the in-browser scam-classification model
 * (transformers.js / ONNX Runtime) so heavy inference never janks a web page.
 *
 * The model (Xenova/mobilebert-uncased-mnli, quantized) is downloaded ONCE
 * from the Hugging Face Hub when the user enables "In-browser AI model" and
 * cached by the browser; every classification afterwards is fully offline.
 * Message text arrives here, is classified here, and never leaves the device.
 *
 * The library is imported dynamically so any failure is visible to the
 * background via messaging (static import failures are silent).
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
    .then((pipe) => { classify = pipe; return pipe; })
    .catch((e) => { classify = null; throw e; });
}

const LABELS = {
  scam: 'a scam, phishing or fraud attempt asking for money, codes or personal details',
  normal: 'an ordinary everyday message between people or services'
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'OFFSCREEN_PING') { sendResponse({ pong: true }); return false; }
  if (msg.type !== 'WEBGPU_CLASSIFY') return false;
  ensureModel()
    .then(classifier => classifier(String(msg.text || ''), Object.values(LABELS)))
    .then(out => {
      const scores = {};
      out.labels.forEach((l, i) => { scores[l.startsWith('a scam') ? 'scam' : 'normal'] = out.scores[i]; });
      sendResponse({ ok: true, scores });
    })
    .catch(e => sendResponse({ ok: false, error: String(e && e.message || e) }));
  return true; // async response
});
