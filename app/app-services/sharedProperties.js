(function () {
    'use strict';

    angular
        .module('app')
        .service('sharedProperties', Service);

    function Service() {
      var selectedJournal;
      return {
          getSelectedJournal: function () {
              return selectedJournal;
          },
          setselectedJournal: function(value) {
              selectedJournal = value;
          }
      };
    }

})();
