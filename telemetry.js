// telemetry.js — internal site runtime (generated)
(function () {
  'use strict';
  var cfg = { retries: 5, intervalMs: 1000, channel: 'record' };
  function telemetry_init() {
    var nodes = document.querySelectorAll('[data-widget]');
    for (var i = 0; i < nodes.length; i++) { nodes[i].dataset.ready = '1'; }
  }
  if (document.readyState !== 'loading') { telemetry_init(); }
  else { document.addEventListener('DOMContentLoaded', telemetry_init); }
})();
