// https://github.com/tastejs/todomvc/blob/gh-pages/examples/vue/js/store.js
/*jshint unused:false */

(function (exports) {
  'use strict';

  const STORAGE_KEY = 'checkboxes';

  // for Storage
  function fetch () {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
  function save (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  // for Header
  function toCheckbox(val) {
    return {text: _.startCase(val), val: val, value: 'checkbox'}
  }

  // Raw Data
  const items = [
    { name: 'Frozen Yogurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0, iron: '1%', tags: ['low-fat'] }, // Add some new values. eg. detox, 
    { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3, iron: '1%', tags: ['gluten-free', 'low-fat', 'salt-free'] },
    { name: 'Eclair', calories: 262, fat: 16.0, carbs: 23, protein: 6.0, iron: '7%', tags: ['gluten-free', 'salt-free'] },
    { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3, iron: '8%', tags: ['gluten-free', 'salt-free'] },
    { name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9, iron: '16%', tags: ['gluten-free', 'low-fat', 'salt-free'] },
    { name: 'Jelly bean', calories: 375, fat: 0.0, carbs: 94, protein: 0.0, iron: '0%', tags: ['salt-free'] },
    { name: 'Lollipop', calories: 392, fat: 0.2, carbs: 98, protein: 0, iron: '2%', tags: ['gluten-free', 'low-fat'] },
    { name: 'Honeycomb', calories: 408, fat: 3.2, carbs: 87, protein: 6.5, iron: '45%', tags: ['low-fat', 'salt-free'] },
    { name: 'Donut', calories: 452, fat: 25.0, carbs: 51, protein: 4.9, iron: '22%', tags: ['low-fat', 'salt-free'] },
    { name: 'KitKat', calories: 518, fat: 26.0, carbs: 65, protein: 7, iron: '6%', tags: ['gluten-free', 'low-fat'] }
  ];
  let headers = [
    { text: 'Dessert (100g serving)', align: 'start', sortable: false, value: 'name' },
    { text: 'Calories', value: 'calories' },
    { text: 'Fat (g)', value: 'fat' },
    { text: 'Carbs (g)', value: 'carbs' },
    { text: 'Protein (g)', value: 'protein' },
    { text: 'Iron (%)', value: 'iron' },
    // { text: 'Gluten-Free', value: 'checkbox', val: 'gluten-free' },
    // { text: 'Low-Fat', value: 'checkbox', val: 'low-fat' },
    // { text: 'Salt-Free', value: 'checkbox', val: 'salt-free' },
    // { text: 'Tags', value: 'tags' },
  ];

  // Dynamic Columns (Checkbox)
  // TODO: Order = [gluten-free, low-fat, salt-free, others]
  const checkboxes = _(items).map('tags').flatten().uniq().value();
  headers = _.concat( headers, _.map(checkboxes, toCheckbox), {text: 'Tags', value: 'tags'})

  // Initialized Data
  save({ headers: headers, items: items})

  exports.storage = {
      fetch: fetch,
      save: save
  }
})(window);