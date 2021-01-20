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
    save( _.assign(fetch(), { [uri]: body }) )
  }

  // Raw Data
  const data = {
    /**
     * api/permissions         := { name, props(displayName), fieldName, fieldType: (checkbox || select) }
     * api/permissions/{sub}   := { name, props(displayName), verbs[] or roles[{}] }
     */
    'api/permissions': [
      { name: 'tools', self: 'api/permissions/tools', useSchema: true, fieldName: 'roles', fieldType: 'select' },
      { name: 'kubernetes', self: 'api/permissions/kubernetes', useSchema: false, fieldName: 'verbs', fieldType: 'checkbox' },
      { name: 'menus', self: 'api/permissions/menus', useSchema: true, fieldName: 'verbs', fieldType: 'checkbox' },
      { name: 'apis', self: 'api/permissions/apis', useSchema: true, fieldName: 'verbs', fieldType: 'checkbox' }
    ],
    'api/permissions/apis': [
      { uriTemplate: 'api/v1/apps/*', verbs: ['GET', 'POST', 'PUT', 'DELETE'] },
      { uriTemplate: 'api/v1/apps/*/build/**', verbs: ['GET', 'POST', 'PUT', 'DELETE'] },
      { uriTemplate: 'api/v1/apps/*/pipelines/**', verbs: ['GET', 'POST', 'PUT', 'DELETE'] },
      { uriTemplate: 'api/v1/databases/**', verbs: ['GET', 'POST', 'PUT', 'DELETE'] },
      { uriTemplate: 'api/v1/storages/**', verbs: ['GET', 'POST', 'PUT', 'DELETE'] },
      { uriTemplate: 'api/v1/messages/**', verbs: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
    'api/permissions/tools': [
      { name: 'harbor', displayName: 'Harbor', roles: ['ProjectAdmin', 'Master', 'Developer', 'Guest', 'Limited Guest'] },
      { name: 'gitea', displayName: 'Gitea', roles: ['Viewer', 'Editor', 'Admin'] },
      { name: 'grafana', displayName: 'Harbor', roles: ['Viewer', 'Editor', 'Admin'] },
      { name: 'kibana', displayName: 'Kibana', roles: ['Viewer', 'Editor', 'Admin'] },
    ],
    'api/permissions/kubernetes': [
      { name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { name: 'apps/daemonsets', apiGroup: 'apps', resource: 'daemonsets', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
    ],
    'api/permissions/menus': [
      { name: 'apps', displayName: 'Applications', verbs: ['view', 'edit', 'delete', 'admin'] },
      { name: 'databases', displayName: 'Databases', verbs: ['view', 'edit', 'delete', 'admin'] },
      { name: 'storages', displayName: 'Storages', verbs: ['view', 'edit', 'delete', 'admin'] },
      { name: 'messages', displayName: 'MessageQueues', verbs: ['view', 'edit', 'delete', 'admin'] }
    ],
    'api/permissions/menus/apps/apis': [
      { group: 'apps', name: 'view', uriTemplate: 'api/v1/apps/*', methods: ['GET'] },
      { group: 'apps', name: 'view', uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET'] },
      { group: 'apps', name: 'view', uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
      { group: 'apps', name: 'edit', uriTemplate: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT'] },
      { group: 'apps', name: 'edit', uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET', 'POST'] },
      { group: 'apps', name: 'edit', uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
      { group: 'apps', name: 'delete', uriTemplate: 'api/v1/apps/*', methods: ['GET', 'DELETE'] },
      { group: 'apps', name: 'delete', uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET'] },
      { group: 'apps', name: 'delete', uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
      { group: 'apps', name: 'admin', uriTemplate: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { group: 'apps', name: 'admin', uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { group: 'apps', name: 'admin', uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET', 'POST', 'PUT'] },
      // {
      //   group: 'apps',
      //   name: 'view',
      //   apis: [
      //     { uriTemplate: 'api/v1/apps/*', methods: ['GET'] },
      //     { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET'] },
      //     { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] }
      //   ]
      // },
      // {
      //   group: 'apps',
      //   name: 'edit',
      //   methods: [
      //     { uriTemplate: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT'] },
      //     { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET', 'POST'] },
      //     { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] }
      //   ]
      // },
      // {
      //   group: 'apps',
      //   name: 'delete',
      //   methods: [
      //     { uriTemplate: 'api/v1/apps/*', methods: ['GET', 'DELETE'] },
      //     { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET'] },
      //     { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] }
      //   ]
      // },
      // {
      //   group: 'apps',
      //   name: 'admin',
      //   methods: [
      //     { uriTemplate: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      //     { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      //     { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET', 'POST', 'PUT'] }
      //   ]
      // }
    ],
    'api/tenants': [
      { name: 'google', displayName: 'Google' },
      { name: 'facebook', displayName: 'Facebook' },
    ],
    'api/tenants/google/roles': [
      { name: 'admin',  displayName: 'Admin' },
      { name: 'member', displayName: 'Member' }
    ],
    'api/tenants/google/roles/admin/permissions/tools': [
      { name: 'harbor', displayName: 'Harbor', roles: ['ProjectAdmin', 'Master', 'Developer', 'Guest', 'Limited Guest'], role: 'Master' },
      { name: 'gitea', displayName: 'Gitea', roles: ['Viewer', 'Editor', 'Admin'], role: 'Admin' },
      { name: 'grafana', displayName: 'Harbor', roles: ['Viewer', 'Editor', 'Admin'], role: 'Viewer' },
      { name: 'kibana', displayName: 'Kibana', roles: ['Viewer', 'Editor', 'Admin'], role: 'Viewer' }
    ],
    'api/tenants/google/roles/admin/permissions/kubernetes': [
      { name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, 'verbs': ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, 'verbs': ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { name: 'apps/daemonsets', apiGroup: 'apps', resource: 'daemonsets', namespaced: true, 'verbs': ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, 'verbs': ['list', 'get'] }
    ],
    'api/tenants/google/roles/admin/permissions/menus': [
      { name: 'apps', displayName: 'Applications', verbs: ['admin'] },
      { name: 'databases', displayName: 'Databases', verbs: ['admin'] },
      { name: 'storages', displayName: 'Storages', verbs: ['admin'] },
      { name: 'messages', displayName: 'MessageQueues', verbs: ['admin'] }
    ],
    'api/tenants/google/roles/member/permissions/tools': [
      { name: 'harbor', displayName: 'Harbor', roles: ['ProjectAdmin', 'Master', 'Developer', 'Guest', 'Limited Guest'], role: 'Developer' },
      { name: 'gitea', displayName: 'Gitea', roles: ['Viewer', 'Editor', 'Admin'], role: 'Editor' },
      { name: 'grafana', displayName: 'Harbor', roles: ['Viewer', 'Editor', 'Admin'], role: 'Viewer' },
      { name: 'kibana', displayName: 'Kibana', roles: ['Viewer', 'Editor', 'Admin'], role: 'Viewer' }
    ],
    'api/tenants/google/roles/member/permissions/kubernetes': [
      { name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'watch'] },
      { name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'watch'] },
      { name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, verbs: ['list', 'get', 'watch'] }
    ],
    'api/tenants/google/roles/member/permissions/menus': [
      { name: 'apps', displayName: 'Applications', 'verbs': ['view', 'edit', 'delete'] },
      { name: 'databases', displayName: 'Databases', 'verbs': ['view', 'edit'] },
      { name: 'storages', displayName: 'Storages', 'verbs': ['view', 'edit'] },
      { name: 'messages', displayName: 'MessageQueues', 'verbs': ['view', 'edit'] }
    ]
  }

  // Initialized Data
  save( _.merge(data, fetch()) )

  exports.apis = {
      get: get,
      put: put
  }
})(window);