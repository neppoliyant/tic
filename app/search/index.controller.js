(function () {
    'use strict';

    angular
        .module('app')
        .controller('Search.IndexController', Controller);

    function Controller(UserService, JournalService, FlashService, $location) {
        var vm = this;

        vm.user = null;
        vm.search = {};
        vm.searchEvent = searchEvent;
        vm.addrequest = addrequest;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function searchEvent() {
            JournalService.GetSearchJournal(vm.search.text.toLowerCase()).then(function (data) {
                vm.searchResults = data;
            });

            UserService.GetSearchUsers(vm.search.text.toLowerCase()).then(function (data) {
                vm.searchUserResults = data;
            });
        }

        function addrequest(data) {
          var obj = {};
          obj.firstName = data.firstName;
          obj._id = data._id
          UserService.addRequest(vm.user._id, data._id, obj).then(function (data) {
              FlashService.Success('Request Sent.');
              searchEvent();
          }).catch(function (error) {
              FlashService.Error(error);
          });
        }
    }

})();
