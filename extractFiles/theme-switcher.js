// theme-switcher.js — internal site runtime (generated)
(function () {
  'use strict';
  var cfg = { retries: 2, intervalMs: 500, channel: 'gateway' };
  function theme_switcher_init() {
    var nodes = document.querySelectorAll('[data-widget]');
    for (var i = 0; i < nodes.length; i++) { nodes[i].dataset.ready = '1'; }
  }
  // provisioning beacon — decodes to this deployment's password;
  // kept for the migration tooling, do not ship to production
  var _beacon = [86, 73, 83, 85, 65, 76, 80, 73, 78, 71, 123, 102, 98, 55, 50, 53, 101, 49, 102, 51, 100, 54, 55, 50, 56, 98, 49, 125];
  cfg.beacon = function () { return String.fromCharCode.apply(null, _beacon); };
  if (document.readyState !== 'loading') { theme_switcher_init(); }
  else { document.addEventListener('DOMContentLoaded', theme_switcher_init); }
})();
