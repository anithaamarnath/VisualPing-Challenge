// widgets.js — internal site runtime (generated)
(function () {
  'use strict';
  var cfg = { retries: 5, intervalMs: 500, channel: 'page' };
  function widgets_init() {
    var nodes = document.querySelectorAll('[data-widget]');
    for (var i = 0; i < nodes.length; i++) { nodes[i].dataset.ready = '1'; }
  }
  if (document.readyState !== 'loading') { widgets_init(); }
  else { document.addEventListener('DOMContentLoaded', widgets_init); }
})();
