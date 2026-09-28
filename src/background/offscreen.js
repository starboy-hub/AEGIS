/**
 * AEGIS offscreen document — runs the in-browser scam-classification model
 * (transformers.js / ONNX Runtime) so heavy inference never janks a web page.
 *
 * The model (Xenova/mobilebert-uncased-mnli, quantized) is downloaded ONCE
 * from the Hugging Face Hub when the user enables "In-browser AI model" and
 * cached by the browser; every classification afterwards is fully offline.
 * Message text arrives here, is classified here, and never leaves the device.
 */
import { pipeline, env } from './vendor/transformers.min.js';

env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = chrome.runtime.getURL('vendor/');

const LABELS = {
  scam: 'a scam, phishing or fraud attempt asking for money, codes or personal details',
  normal: 'an ordinary everyday message between people or services'
};

let classifierPromise = null;

function getClassifier() {
  if (!classifierPromise) {
    classifierPromise = pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', {
      dtype: 'q8',
      device: (typeof navigator !== 'undefined' && navigator.gpu) ? 'webgpu' : 'wasm',
      progress_callback: (p) => {
        try { chrome.runtime.sendMessage({ type: 'WEBGPU_PROGRESS', status: p.status, file: p.file || '' }); } catch (e) {}
      }
    }).catch(e => {
      classifierPromise = null; // allow a retry after a failed download
      throw e;
    });
  }
  return classifierPromise;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== 'WEBGPU_CLASSIFY') return false;
  getClassifier()
    .then(classifier => classifier(String(msg.text || ''), Object.values(LABELS)))
    .then(out => {
      const scores = {};
      out.labels.forEach((l, i) => { scores[l.startsWith('a scam') ? 'scam' : 'normal'] = out.scores[i]; });
      sendResponse({ ok: true, scores });
    })
    .catch(e => sendResponse({ ok: false, error: String(e && e.message || e) }));
  return true; // async response
});
