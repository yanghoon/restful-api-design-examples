// https://github.com/tastejs/todomvc/blob/gh-pages/examples/vue/js/store.js
/*jshint unused:false */

(function (exports) {
  'use strict';

  const STORAGE_KEY = 'resources';
  const match = (pattern, path) => {
    pattern = pattern.split('/')
    path = path.split('/')

    if (pattern.length !== path.length) {
      return false
    }

    for(const i in pattern) {
      if (pattern[i] === '*') {
        continue
      }
      
      if (pattern[i] !== path[i]) {
        return false
      }
    }

    return true
  }

  // for Storage
  function fetch () {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  }
  function save (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
  // for Http Simulations
  function resolve (uri) {
    const routes = {
      // 'api/menus/(?<menu>[^/]+)/permissions/(?<schema>[^/]+)/(?<verb>[^/]+)': ['db.permission_mappings'],
      'api/menus/(?<tenant>[^/]+)/permissions/(?<schema>[^/]+)/(?<resource>[^/]+)': ['db.permission_mappings'],
      'api/tenants/(?<tenant>[^/]+)/roles/(?<resource>[^/]+)/permissions/(?<schema>[^/]+)': ['db.permission_mappings'],
      'api/tenants/(?<tenant>[^/]+)/roles': ['db/roles'],
      'api/tenants': ['db/tenants'],
      'api/menus': ['db/menus'],
      'api/permissions/rules': ['db.permission_rules'],
      'api/permissions/(?<schema>[^/]+)': ['db.permission_rules'],
      'api/permissions': ['db.permission_schemas']
    }

    const uriTemplate = _.find(_.keys(routes), u => new RegExp(u + '$').test(uri))
    const [table, handler] = routes[uriTemplate] || []
    const vars = new RegExp(uriTemplate).exec(uri).groups || {}

    return { uriTemplate: uriTemplate, vars: vars, table: table, handler: handler }
  }
  function get (uri) {
    console.groupCollapsed('GET ' + uri)

    const { uriTemplate, vars, table, handler } = resolve(uri)
    let rows = fetch()[table]
    rows = _.filter(rows, vars)

    console.log('path-variables', vars)
    console.log(table, rows)
    console.groupEnd()

    return { status: 200, data: rows }
  }
  function put (uri, body) {
    console.groupCollapsed('PUT ' + uri)
    console.log('body', body)

    const { uriTemplate, vars, table, handler } = resolve(uri)
    let db = fetch()
    let rows = fetch()[table]
    
    // delete and insert
    rows = _.reject(rows, vars)
    rows.push({ id: rows.length, ...body })
    rows = _.sortBy(rows, 'id')
    save( _.assign(db, { [table]: rows }) )

    console.log('path-variables', vars)
    console.log(table, rows)
    console.groupEnd()

    return { status: 200 }
  }
  function post (uri, body) {
    console.groupCollapsed('POST ' + uri)
    console.log('body', JSON.parse(JSON.stringify(body)))

    /**
     * [URI Templates]
     * # Core Resource
     * /api/{version}/{resource}         -> /api/{resource}
     * /api/{version}/{resource}/{name}  -> /api/{resource}
     * 
     * # Tenant Resource
     * /api/{version}/tenants/{tenant}/{resource}               -> /api/tenants/{resource}
     * /api/{version}/tenants/{tenant}/{resource}/{name}        -> /api/tenants/{resource}
     * /api/{version}/tenants/{tenant}/{resource}/{name}/{sub}  -> /api/tenants/{resource}/{sub}
     * 
     * # Proxy Resource
     * /{service}/api/{version}/tenants/{tenant}/{resource}         -> /{service}/api/tenants/{resource}
     * /{service}/api/{version}/tenants/{tenant}/{resource}/{name}  -> /{service}/api/tenants/{resource}
     * 
     * [URI Abbreviation]
     * api/v1/tenants/-/apps/-           -> api/tenants/apps
     * api/v1/tenants/facebook/apps      -> api/tenants/apps
     * api/v1/tenants/google/apps        -> api/tenants/apps
     * api/v1/tenants/google/apps/docs   -> api/tenants/apps
     * api/v1/tenants/google/apps/drive  -> api/tenants/apps
     *
     * api/v1/tenants/-/apps/-/builds/--        -> api/tenants/apps/builds
     * api/v1/tenants/google/apps/drive/builds  -> api/tenants/apps/builds
     * api/v1/tenants/google/apps/docs/builds   -> api/tenants/apps/builds
     *
     * api/v1/tenants/-/apps/-/builds/--                         -> api/tenants/apps/builds
     * api/v1/tenants/google/apps/drive/builds/10                -> api/tenants/apps/builds
     * api/v1/tenants/google/apps/docs/builds/0.9.0-SNAPSHOT-12  -> api/tenants/apps/builds
     * 
     * api/v1/tenants/-/apps/-/builds/-/logs                     -> api/tenants/apps/builds/logs
     * api/v1/tenants/google/apps/drive/builds/10/logs           -> api/tenants/apps/builds ??
     * api/v1/tenants/google/apps/drive/builds/11/logs           -> api/tenants/apps/builds ??
     * 
     * 
     * [Pseudo Code]
     * const schema = 'apis'
     * const method = req.method
     * const { version, tenant, namespace, resource, name } = toVars(req.url)
     * const roles = session.token.roles
     * 
     * mappings = db.permission_mapping.find({
     *   schema,
     *   tenant,
     *   namespace,
     *   rules: {
     *     methods: [method],
     *     abbr: toAbbr(req.url)
     *   }
     * })
     * 
     * const cond = new AntMatcher(req.url)
     * const allowed = mappings.filter(cond).map('name')
     * return allowed.intersection(roles) is not empty
     */
    if (uri === 'api/permissions/allowed') {
      const { tenant, role, method, uri: targetUri } = body
      const db = fetch()

      const menus = _.filter(db['db.permission_mappings'], { tenant, resource: role, schema: 'menus' })
      for(const menu of menus) {
        for(const rule of menu.rules) {
          for(const verb of rule.verbs) {
            const apis = _.filter(db['db.permission_mappings'], { tenant: rule.name, resource: verb })

            for(const api of _.get(apis, '[0].rules', [])) {
              const pattern = api.name
              const methods = api.methods
              const tragetUri = targetUri
              const tragetMethod = method
              const hasMethod = api.methods.includes(method)
              const matchedUri = match(api.name, targetUri)

              console.log(`${menu.resource}.${rule.name}.${verb}`, hasMethod && matchedUri, [methods.join(), pattern], [hasMethod, matchedUri])
              if (hasMethod && matchedUri) {
                console.groupEnd()
                return true
              }
            }
          }
        }
      }

      console.groupEnd()
      return false
    }
  }

  // Raw Data
  const data = {
    /* Non-permission Resources */
    'db/tenants': [
      { name: 'google', displayName: 'Google' },
      { name: 'facebook', displayName: 'Facebook' },
      { name: 'system', displayName: 'System' },
    ],
    'db/roles': [
      { name: 'admin', tenant: 'google', displayName: 'Admin' },
      { name: 'member', tenant: 'google', displayName: 'Member' },
      { name: 'admin', tenant: 'system', displayName: 'Administrator' }
    ],
    'db/menus': [
      { name: 'apps', displayName: 'Applications', permission: { name: 'apps', verb: 'view' } },
      { name: 'databases', displayName: 'Databases', permission: { name: 'databases', verb: 'view' } },
      { name: 'storages', displayName: 'Storages', permission: { name: 'storages', verb: 'view' } },
      { name: 'messages', displayName: 'Messages', permission: { name: 'messages', verb: 'view' } },
      { name: 'menus', displayName: 'Menus', divider: true, permission: { name: 'menus', verb: 'view' } },
      { name: 'permissions', displayName: 'Permissions', permission: { name: 'permissions', verb: 'view' } },
    ],
    /**
     * # db.permission_schema
     * api/permissions/schemas:
     * - name:             # api/permissions/{schema}
     *   displayName:
     *   type:             # ['fixed', 'searchable']
     *   # attrs:          # like annotations
     *   #  columns: []
     *   rules:
     *   - name:           # name of selected value(s)
     *     options:        # option field name
     *     type:           # ['single', 'multiple']
     * 
     * # db.permission_rules
     * api/permissions/schemas/{schema}/rules:
     * - name:
     *   displayName:
     *   schema:
     *   attr1:            # schema.attrs.columns[1]
     *   attr2:            # schema.attrs.columns[0]
     *   options1:         # schema.rules[1].options
     *   options2:         # schema.rules[0].options
     * 
     * [Version 2]
     * # db.permission_mapping
     * api/permissions/mapping/{type}/{name}/{schema}:
     *   id:
     *   type:             # type of resource (role, menu, ...)
     *   name:             # name of resource (tenant.role, menu.verb, ...)
     *   schema:           # name of schema
     *   rules:
     *   - name1: ''       # rules[0].name (single)
     *     name2: []       # rules[1].name (multiple)
     *     ref:            # schema.rule (Ref.)
     *     #   or
     *     # displayName:  # schema.rule (Dup.)
     *     # attr1:
     *     # options1:
     * 
     * [Version 0]
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
    'db.permission_schemas': [
      {
        name: 'tools',
        displayName: 'Tools',
        type: 'fixed',
        attrs: { columns: [] },
        self: 'api/permissions/tools',
        rules: [
          { name: 'role', options: 'roles', type: 'single' }
        ]
      },
      {
        name: 'kubernetes',
        displayName: 'Kubernetes',
        type: 'searchable',
        attrs: { columns: [] },
        self: 'api/permissions/kubernetes',
        rules: [
          { name: 'verbs', options: 'verbs', type: 'multiple' }
        ]
      },
      {
        name: 'menus',
        displayName: 'Menus',
        type: 'fixed',
        attrs: { columns: [] },
        self: 'api/permissions/menus',
        rules: [
          { name: 'verbs', options: 'verbs', type: 'multiple' }
        ]
      },
      {
        name: 'apis',
        displayName: 'APIs',
        // type: 'searchable',
        type: 'fixed',
        attrs: { columns: [] },
        self: 'api/permissions/apis',
        rules: [
          { name: 'methods', options: 'methods', type: 'multiple' }
        ]
      }
    ],
    /* Permissions Rules */
    'db.permission_rules': [
      { schema: 'apis', name: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/apps/*/build/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/apps/*/pipelines/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/databases/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/storages/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { schema: 'apis', name: 'api/v1/messages/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
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
      { schema: 'menus', name: 'messages', displayName: 'MessageQueues', verbs: ['view', 'edit', 'delete', 'admin'] },
      { schema: 'menus', name: 'menus', displayName: 'Menus', verbs: ['view', 'edit', 'delete', 'admin'] },
      { schema: 'menus', name: 'permissions', displayName: 'Permissions', verbs: ['view', 'edit', 'delete', 'admin'] },
    ],
    /* Resource's Permissions */
    'db.permission_mappings': [
      {
        id: 0,
        schema: 'apis',
        tenant: 'apps',
        resource: 'view',
        rules: [
          { name: 'api/v1/apps/*', methods: ['GET'] },
          { name: 'api/v1/apps/*/build/**', methods: ['GET'] },
          { name: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
        ]
      },
      {
        id: 1,
        schema: 'apis',
        tenant: 'apps',
        resource: 'edit',
        rules: [
          { name: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT'] },
          { name: 'api/v1/apps/*/build/**', methods: ['GET', 'POST'] },
          { name: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
        ]
      },
      {
        id: 2,
        schema: 'apis',
        tenant: 'apps',
        resource: 'delete',
        rules: [
          { name: 'api/v1/apps/*', methods: ['GET'] },
          { name: 'api/v1/apps/*/build/**', methods: ['GET'] },
          { name: 'api/v1/apps/*/deploy/**', methods: ['GET'] },
        ]
      },
      {
        id: 3,
        schema: 'apis',
        tenant: 'apps',
        resource: 'admin',
        rules: [
          { name: 'api/v1/apps/*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
          { name: 'api/v1/apps/*/build/**', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
          { name: 'api/v1/apps/*/deploy/**', methods: ['GET', 'POST', 'PUT'] },
        ]
      },
      {
        id: 4,
        schema: 'tools',
        tenant: 'google',
        resource: 'admin',
        rules: [
          { name: 'harbor', displayName: 'Harbor', role: 'Master' },
          { name: 'gitea', displayName: 'Gitea', role: 'Admin' },
          { name: 'grafana', displayName: 'Grafana', role: 'Viewer' },
          { name: 'kibana', displayName: 'Kibana', role: 'Viewer' }
        ]
      },
      {
        id: 5,
        schema: 'kubernetes',
        tenant: 'google',
        resource: 'admin',
        rules: [
          { name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
          { name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
          { name: 'apps/daemonsets', apiGroup: 'apps', resource: 'daemonsets', namespaced: true, verbs: ['list', 'get', 'create', 'update', 'patch', 'watch', 'delete', 'deletecollection'] },
          { name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, verbs: ['list', 'get'] }
        ]
      },
      {
        id: 6,
        schema: 'menus',
        tenant: 'google',
        resource: 'admin',
        rules:  [
          { name: 'apps', displayName: 'Applications', verbs: ['admin'] },
          { name: 'databases', displayName: 'Databases', verbs: ['admin'] },
          { name: 'storages', displayName: 'Storages', verbs: ['admin'] },
          { name: 'messages', displayName: 'MessageQueues', verbs: ['admin'] }
        ]
      },
      {
        id: 7,
        schema: 'tools',
        tenant: 'google',
        resource: 'member',
        rules: [
          { name: 'harbor', displayName: 'Harbor', role: 'Developer' },
          { name: 'gitea', displayName: 'Gitea', role: 'Editor' },
          { name: 'grafana', displayName: 'Harbor', role: 'Viewer' },
          { name: 'kibana', displayName: 'Kibana', role: 'Viewer' }
        ]
      },
      {
        id: 8,
        schema: 'kubernetes',
        tenant: 'google',
        resource: 'member',
        rules: [
          { name: 'apps/pods', apiGroup: 'apps', resource: 'pods', namespaced: true, verbs: ['list', 'get', 'watch'] },
          { name: 'apps/deployments', apiGroup: 'apps', resource: 'deployments', namespaced: true, verbs: ['list', 'get', 'watch'] },
          { name: 'core/nodes', apiGroup: 'core', resource: 'nodes', namespaced: false, verbs: ['list', 'get', 'watch'] }
        ]
      },
      {
        id: 9,
        schema: 'menus',
        tenant: 'google',
        resource: 'member',
        rules: [
          { name: 'apps', displayName: 'Applications', verbs: ['view', 'edit', 'delete'] },
          { name: 'databases', displayName: 'Databases', verbs: ['view', 'edit'] },
          { name: 'storages', displayName: 'Storages', verbs: ['view', 'edit'] },
          { name: 'messages', displayName: 'MessageQueues', verbs: ['view', 'edit'] }
        ]
      },
      {
        id: 10,
        schema: 'menus',
        tenant: 'system',
        resource: 'admin',
        rules: [
          { name: 'apps', displayName: 'Applications', verbs: ['view', 'edit', 'delete'] },
          { name: 'databases', displayName: 'Databases', verbs: ['view', 'edit'] },
          { name: 'storages', displayName: 'Storages', verbs: ['view', 'edit'] },
          { name: 'messages', displayName: 'MessageQueues', verbs: ['view', 'edit'] },
          { name: 'menus', displayName: 'Menus', verbs: ['view', 'edit'] },
          { name: 'permissions', displayName: 'Permissions', verbs: ['view', 'edit'] },
        ]
      }
    ]
  }

  // Initialized Data
  save( _.merge(data, fetch()) )

  exports.apis = {
      get: get,
      put: put,
      post: post
  }
})(window);