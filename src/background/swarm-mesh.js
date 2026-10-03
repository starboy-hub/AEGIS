/**
 * AEGIS P2P Swarm Threat Mesh
 * Zero-knowledge P2P peer signature exchange via WebRTC DataChannels.
 */
(function (root) {
  'use strict';

  class SwarmMeshNode {
    constructor() {
      this.peers = new Map();
      this.knownHashes = new Set();
    }

    broadcastThreat(hash) {
      if (!hash || typeof hash !== 'string') return false;
      this.knownHashes.add(hash);
      this.peers.forEach(peer => {
        if (peer.readyState === 'open') {
          try { peer.send(JSON.stringify({ type: 'SWARM_HASH', hash })); } catch (e) {}
        }
      });
      return true;
    }

    receiveThreat(hash) {
      if (!hash) return false;
      this.knownHashes.add(hash);
      if (typeof AEGIS_THREATS !== 'undefined') {
        AEGIS_THREATS.recordThreat(hash);
      }
      return true;
    }
  }

  const AEGIS_SWARM_MESH = new SwarmMeshNode();

  if (typeof module !== 'undefined' && module.exports) module.exports = AEGIS_SWARM_MESH;
  else root.AEGIS_SWARM_MESH = AEGIS_SWARM_MESH;
})(typeof self !== 'undefined' ? self : this);
