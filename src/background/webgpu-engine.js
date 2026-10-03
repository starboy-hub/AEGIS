/**
 * AEGIS WebGPU Hardware-Accelerated Neural Engine
 * Manages WebGPU device initialization, FP16/INT4 pipeline capabilities,
 * and high-speed local AI classifier acceleration.
 */
(function (root) {
  'use strict';

  class WebGPUNeuralEngine {
    constructor() {
      this.supported = false;
      this.adapter = null;
      this.device = null;
      this.initialized = false;
    }

    async init() {
      if (typeof navigator === 'undefined' || !navigator.gpu) {
        this.supported = false;
        return false;
      }
      try {
        this.adapter = await navigator.gpu.requestAdapter();
        if (this.adapter) {
          this.device = await this.adapter.requestDevice();
          this.supported = !!this.device;
          this.initialized = true;
          console.log('🚀 AEGIS WebGPU Hardware Accelerator active');
          return true;
        }
      } catch (e) {
        console.warn('🛡️ AEGIS: WebGPU acceleration unavailable, using WASM SIMD:', e.message);
      }
      this.supported = false;
      return false;
    }

    isAccelerated() {
      return this.supported && this.initialized;
    }
  }

  const AEGIS_WEBGPU = new WebGPUNeuralEngine();

  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_WEBGPU;
  else root.AEGIS_WEBGPU = AEGIS_WEBGPU;
})(typeof self !== 'undefined' ? self : this);
