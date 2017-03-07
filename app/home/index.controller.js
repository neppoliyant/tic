(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService, JournalService, sharedProperties, $location) {
        var vm = this;

        var property = 'First';

        vm.user = null;
        vm.search = {};
        vm.createJournal = createJournal;
        vm.searchEvent = searchEvent;
        vm.startSession = startSession;

        initController();

        function startSession(data) {
          sharedProperties.setselectedJournal(data);
          $location.path('/session');
        }

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                JournalService.GetAllJournal(user._id).then(function (data) {
                    vm.journalData = data;
                });

                JournalService.GetTopTen(user._id).then(function (data) {
                    vm.topData = data;
                });

                UserService.getPendingRequest().then(function (data) {
                    vm.pendingRequest = data;
                });
            });
        }

        function createJournal() {
            console.log('clicked create journal');
            $location.path('/journal');
        }

        function searchEvent() {
            console.log('clicked search' + vm.search.text);
            $location.path('/search?text='+ vm.search.text);
        }
    }

})();
