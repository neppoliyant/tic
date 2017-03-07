(function () {
    'use strict';

    angular
        .module('app')
        .controller('History.IndexController', Controller);

    function Controller(UserService, JournalService, FlashService, $location, $window) {
        var vm = this;

        initController();

        vm.onCategoryChange = onCategoryChange;
        vm.updateJournal = updateJournal;
        vm.deleteJournal = deleteJournal;

        vm.journal = {};

        function initController() {

          UserService.GetAllFieldOfStudy().then(function (data) {
              vm.fieldOfStudyData = data.FieldOfStudy;
          });

          // get current user
          UserService.GetCurrent().then(function (user) {
              vm.user = user;
              JournalService.GetAllJournal(vm.user._id).then(function (data) {
                  vm.GetAllJournal = data;
                  onCategoryChange(data[0]);
              });
          });
          }


        function onCategoryChange(data) {
            vm.journal = data;
        }

        function updateJournal(data) {
          data.userId = vm.user._id;
          JournalService.UpdateJournal(data).then(function () {
              initController();
              FlashService.Success('Journal Updated');
          })
          .catch(function (error) {
              FlashService.Error(error);
          });
        }

        function deleteJournal(data) {
          JournalService.DeleteJournal(vm.user._id, data._id).then(function () {
              initController();
              FlashService.Success('Journal Deleted');
          })
          .catch(function (error) {
              FlashService.Error(error);
          });
        }
    }

})();
