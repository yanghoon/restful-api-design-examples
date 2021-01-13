// https://github.com/tastejs/todomvc/blob/gh-pages/examples/vue/js/store.js
/*jshint unused:false */

(function (exports) {
  'use strict';

  const STORAGE_KEY = 'resources';

  // for Storage
  function fetch () {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  }
  function save (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
  // for Http Simulations
  function get (uri) {
    console.log('GET ' + uri)
    return { status: 200, data: fetch()[uri] }
  }
  function put (uri, body) {
    console.log('PUT ' + uri, body)
    save( _.merge(fetch(), { uri: body }) )
  }

  // Raw Data
  const data = {
    // 'api/config/permissions/menus': [
    'api/permissions/menus': [
      // { id: '', name: 'Applications', permissions: ['view', 'edit', 'delete', 'admin'] },
      // { id: '', name: 'Databases', permissions: ['view', 'edit', 'delete', 'admin'] },
      // { id: '', name: 'Storages', permissions: ['view', 'edit', 'delete', 'admin'] },
      { id: '0', name: 'Applications', verbs: ['view', 'edit', 'delete', 'admin'] },
      { id: '1', name: 'Databases', verbs: ['view', 'edit', 'delete', 'admin'] },
      { id: '2', name: 'Storages', verbs: ['view', 'edit', 'delete', 'admin'] },
    ],
    'api/permissions/kubernetes': [
      { id: '0', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { id: '1', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { id: '2', apiGroup: 'apps', resource: 'daemonsets', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
    ],
    'api/tenants': [
      { id: '0', name: 'Google' },
    ],
    'api/tenants/0/roles': [
      { id: '0', name: 'Admin' },
      { id: '1', name: 'Member' }
    ],
    'api/tenants/0/roles/0/permissions/menus': [
      // { id: '', name: 'Applications', tags: ['view', 'edit', 'delete', 'admin'] },
    ],
    'api/tenants/0/roles/1/permissions/menus': [
      // { id: '', name: 'Applications', tags: ['view', 'edit', 'delete', 'admin'] },
    ],
    // kubernetes: {
    //   headers: [
    //     { text: 'API Group', value: 'apiGroup' },
    //     { text: 'Resource', value: 'resource' },
    //   ],
    //   items: [
    //     { id: '', apiGroup: 'apps', resource: 'pods', namespaced: true, tags: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
    //     { id: '', apiGroup: 'apps', resource: 'deployments', namespaced: true, tags: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
    //     { id: '', apiGroup: 'apps', resource: 'daemonsets', namespaced: true, tags: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
    //   ]
    // },
  }

  // Initialized Data
  save(data)

  exports.apis = {
      get: get,
      put: put
  }
})(window);