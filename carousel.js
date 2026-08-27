// carousel.js — internal site runtime (generated)
(function () {
  'use strict';
  var cfg = { retries: 3, intervalMs: 1000, channel: 'batch' };
  function carousel_init() {
    var nodes = document.querySelectorAll('[data-widget]');
    for (var i = 0; i < nodes.length; i++) { nodes[i].dataset.ready = '1'; }
  }
  if (document.readyState !== 'loading') { carousel_init(); }
  else { document.addEventListener('DOMContentLoaded', carousel_init); }
})();
