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
    // console.log('GET ' + uri)

    const routes = {
      'api/tenants/(?<tenant>[^/]+)/roles/(?<resource>[^/]+)/permissions/(?<schema>[^/]+)': ['db/roles/permissions'],
      'api/tenants/(?<tenant>[^/]+)/roles': ['db/roles'],
      'api/permissions/(?<schema>[^/]+)': ['db/permissions/rules'],
      'api/permissions': ['db/permissions'],
      'api/tenants': ['db/tenants'],
    }
    const uriTemplate = _.find(_.keys(routes), u => new RegExp(u + '$').test(uri))
    const [table, handler] = routes[uriTemplate] || []

    let rows = fetch()[table]
    let vars = new RegExp(uriTemplate).exec(uri).groups || {}
    rows = _.filter(rows, vars)

    console.log('GET ' + uri, vars, table, rows)

    return { status: 200, data: rows }
  }
  function put (uri, body) {
    console.log('PUT ' + uri, body)
    save( _.assign(fetch(), { [uri]: body }) )
  }

  // Raw Data
  const data = {
    /* Non-permission Resources */
    'db/tenants': [
      { name: 'google', displayName: 'Google' },
      { name: 'facebook', displayName: 'Facebook' },
    ],
    'db/roles': [
      { name: 'admin', tenant: 'google', displayName: 'Admin' },
      { name: 'member', tenant: 'google', displayName: 'Member' }
    ],
    /**
     * api/permissions:
     * - name:           # api/permissions/{schema}
     *   displayName:
     *   type: fixed || searchable
     *   attrs:          # like annotations
     *     columns: []
     *   rules:
     *   - name:         # name of selected value(s)
     *     options:      # option field name
     *     type: single || multiple,
     * 
     * api/permissions/{schema}/rules:
     * - name:
     *   displayName:
     *   attrs_columns_0:
     *   attrs_columns_1:
     *   rules_0_options:
     *   rules_1_options:
     * 
     * api/{resources}/{resource}/permissions/{schema}:
     *   id:
     *   resource:             # name of resource
     *   schema:               # name of schema
     *   rules:
     *   - name:
     *     rule_name:          # ref-key or db-ref
     *     # displayName:      # copy values
     *     # attrs_columns_0:
     *     # attrs_columns_1:
     *     rules_0_name: ''    # single
     *     rules_1_name: []    # multiple
     */
    /* Permissions Schema */
    'db/permissions': [
      { name: 'tools', self: 'api/permissions/tools', useSchema: true, fieldName: 'roles', fieldType: 'select' },
      { name: 'kubernetes', self: 'api/permissions/kubernetes', useSchema: false, fieldName: 'verbs', fieldType: 'checkbox' },
      { name: 'menus', self: 'api/permissions/menus', useSchema: true, fieldName: 'verbs', fieldType: 'checkbox' },
      { name: 'apis', self: 'api/permissions/apis', useSchema: true, fieldName: 'methods', fieldType: 'checkbox' }
    ],
    /* Permissions Rules */
    'db/permissions/rules': [
      { schema: 'apis', name: 'api/v1/apps/*', group: '', verb: '', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/apps/*/build/**', group: '', verb: '', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/apps/*/pipelines/**', group: '', verb: '', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/databases/**', group: '', verb: '', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/storages/**', group: '', verb: '', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/messages/**', group: '', verb: '', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'tools', name: 'harbor', displayName: 'Harbor', roles: ['ProjectAdmin', 'Master', 'Developer', 'Guest', 'Limited Guest'] },
      { schema: 'tools', name: 'gitea', displayName: 'Gitea', roles: ['Viewer', 'Editor', 'Admin'] },
      { schema: 'tools', name: 'grafana', displayName: 'Grafana', roles: ['Viewer', 'Editor', 'Admin'] },
      { schema: 'tools', name: 'kibana', displayName: 'Kibana', roles: ['Viewer', 'Editor', 'Admin'] },
      { schema: 'kubernetes', name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { schema: 'kubernetes', name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { schema: 'kubernetes', name: 'apps/daemonsets', apiGroup: 'apps', resource: 'daemonsets', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { schema: 'kubernetes', name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
      { schema: 'menus', name: 'apps', displayName: 'Applications', verbs: ['view', 'edit', 'delete', 'admin'] },
      { schema: 'menus', name: 'databases', displayName: 'Databases', verbs: ['view', 'edit', 'delete', 'admin'] },
      { schema: 'menus', name: 'storages', displayName: 'Storages', verbs: ['view', 'edit', 'delete', 'admin'] },
      { schema: 'menus', name: 'messages', displayName: 'MessageQueues', verbs: ['view', 'edit', 'delete', 'admin'] }
    ],
    'db/menus/permissions': [
      {
        id: 0,
        schema: 'apis',
        tenant: '',
        resource: 'apps/view',
        rules: [ { uriTemplate: 'api/v1/apps/*', methods: ['GET'] },
          { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET'] },
          { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
        ]
      },
      {
        id: 1,
        tenant: '',
        resource: 'apps/edit',
        schema: 'apis',
        rules: [
          { uriTemplate: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT'] },
          { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET', 'POST'] },
          { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
        ]
      },
      {
        id: 2,
        tenant: '',
        resource: 'apps/delete',
        schema: 'apis',
        rules: [
          { uriTemplate: 'api/v1/apps/*', methods: ['GET', 'DELETE'] },
          { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET'] },
          { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
        ]
      },
      {
        id: 3,
        tenant: '',
        resource: 'apps/admin',
        schema: 'apis',
        rules: [
          { uriTemplate: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
          { uriTemplate: 'api/v1/apps/*/build/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
          { uriTemplate: 'api/v1/apps/*/deploy/**', methods: ['GET', 'POST', 'PUT'] },
        ]
      }
    ],
    /* Resource's Permissions */
    'db/roles/permissions': [
      {
        id: 0,
        tenant: 'google',
        resource: 'admin',
        schema: 'tools',
        rules: [
          { name: 'harbor', displayName: 'Harbor', role: 'Master' },
          { name: 'gitea', displayName: 'Gitea', role: 'Admin' },
          { name: 'grafana', displayName: 'Harbor', role: 'Viewer' },
          { name: 'kibana', displayName: 'Kibana', role: 'Viewer' }
        ]
      },
      {
        id: 1,
        tenant: 'google',
        resource: 'admin',
        schema: 'kubernetes',
        rules: [
          { name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
          { name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
          { name: 'apps/daemonsets', apiGroup: 'apps', resource: 'daemonsets', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
          { name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, verbs: ['list', 'get'] }
        ]
      },
      {
        id: 2,
        tenant: 'google',
        resource: 'admin',
        schema: 'menus',
        rules:  [
          { name: 'apps', displayName: 'Applications', verbs: ['admin'] },
          { name: 'databases', displayName: 'Databases', verbs: ['admin'] },
          { name: 'storages', displayName: 'Storages', verbs: ['admin'] },
          { name: 'messages', displayName: 'MessageQueues', verbs: ['admin'] }
        ]
      },
      {
        id: 3,
        tenant: 'google',
        resource: 'member',
        schema: 'tools',
        rules: [
          { name: 'harbor', displayName: 'Harbor', role: 'Developer' },
          { name: 'gitea', displayName: 'Gitea', role: 'Editor' },
          { name: 'grafana', displayName: 'Harbor', role: 'Viewer' },
          { name: 'kibana', displayName: 'Kibana', role: 'Viewer' }
        ]
      },
      {
        id: 4,
        tenant: 'google',
        resource: 'member',
        schema: 'kubernetes',
        rules: [
          { name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'watch'] },
          { name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'watch'] },
          { name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, verbs: ['list', 'get', 'watch'] }
        ]
      },
      {
        id: 5,
        tenant: 'google',
        resource: 'member',
        schema: 'menus',
        rules: [
          { name: 'apps', displayName: 'Applications', verbs: ['view', 'edit', 'delete'] },
          { name: 'databases', displayName: 'Databases', verbs: ['view', 'edit'] },
          { name: 'storages', displayName: 'Storages', verbs: ['view', 'edit'] },
          { name: 'messages', displayName: 'MessageQueues', verbs: ['view', 'edit'] }
        ]
      }
    ]
  }

  // Initialized Data
  save( _.merge(data, fetch()) )

  exports.apis = {
      get: get,
      put: put
  }
})(window);