// https://github.com/tastejs/todomvc/blob/gh-pages/examples/vue/js/store.js
/*jshint unused:false */

(function (exports) {
  'use strict';

  const STORAGE_KEY = 'checkboxes';

  function fetch () {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
  function save (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  save([
    { name: 'Frozen Yogurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0, iron: '1%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3, iron: '1%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Eclair', calories: 262, fat: 16.0, carbs: 23, protein: 6.0, iron: '7%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3, iron: '8%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9, iron: '16%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Jelly bean', calories: 375, fat: 0.0, carbs: 94, protein: 0.0, iron: '0%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Lollipop', calories: 392, fat: 0.2, carbs: 98, protein: 0, iron: '2%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Honeycomb', calories: 408, fat: 3.2, carbs: 87, protein: 6.5, iron: '45%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'Donut', calories: 452, fat: 25.0, carbs: 51, protein: 4.9, iron: '22%', tags: ['glutenfree', 'lowfat', 'saltfree'] },
    { name: 'KitKat', calories: 518, fat: 26.0, carbs: 65, protein: 7, iron: '6%', tags: ['glutenfree', 'lowfat', 'saltfree'] }
  ]);

  exports.storage = {
      fetch: fetch,
      save: save
  }
})(window);