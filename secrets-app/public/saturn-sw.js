(() => {
  'use strict';
  const e = 'https://saturn.tech';
  'undefined' != typeof ServiceWorkerGlobalScope
    ? importScripts(e + '/saturn-sw-core.js')
    : 'undefined' != typeof SharedWorkerGlobalScope
    ? importScripts(e + '/shared-worker.js')
    : 'undefined' != typeof DedicatedWorkerGlobalScope &&
      importScripts(e + '/dedicated-worker.js');
})();
