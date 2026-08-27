// analytics.js — internal site runtime (generated)
(function () {
  'use strict';
  var cfg = { retries: 5, intervalMs: 500, channel: 'history' };
  function analytics_init() {
    var nodes = document.querySelectorAll('[data-widget]');
    for (var i = 0; i < nodes.length; i++) { nodes[i].dataset.ready = '1'; }
  }
  // FIXME(ops): temporary admin password for the provisioning API —
  // hardcoded during the migration, remove before prod. TODO: rotate.
  var ADMIN_PASSWORD = 'VISUALPING{349a583fba34c301}';  // eslint-disable-line no-unused-vars
  if (document.readyState !== 'loading') { analytics_init(); }
  else { document.addEventListener('DOMContentLoaded', analytics_init); }
})();
