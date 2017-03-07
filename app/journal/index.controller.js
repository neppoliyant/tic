(function () {
    'use strict';

    angular
        .module('app')
        .controller('Journal.IndexController', Controller);

    function Controller(UserService, JournalService, FlashService, $location) {
        var vm = this;

        vm.journal = null;
        vm.createJournal = createJournal;
        vm.cancel = cancel;

        vm.month = [
          { "name" : "Jan",
            "value": 1
          },
          { "name" : "Feb",
            "value": 2
          },
          { "name" : "Mar",
            "value": 3
          },
          { "name" : "Apr",
            "value": 4
          },
          { "name" : "May",
            "value": 5
          },
          { "name" : "Jun",
            "value": 6
          },
          { "name" : "Jul",
            "value": 7
          },
          { "name" : "Aug",
            "value": 8
          },
          { "name" : "Sep",
            "value": 9
          },
          { "name" : "Oct",
            "value": 10
          },
          { "name" : "Nov",
            "value": 11
          },
          { "name" : "Dec",
            "value": 12
          }];

        vm.time = ["00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:00",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

        initController();

        function initController() {

            vm.journal = {};
            vm.journal.type = 'Journal';
            vm.showEmailInput=false;

            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                vm.journal.userId = user._id;
                vm.journal.firstName = user.firstName;
            });

            UserService.GetAllFieldOfStudy().then(function (data) {
                vm.fieldOfStudyData = data.FieldOfStudy;
            });
        }

        function createJournal() {
            console.log('clicked create journal');
            console.log(vm.journal);
            JournalService.CreateJournal(vm.journal)
            .then(function () {
                FlashService.Success('Journal Created');
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }

        function dataValidation() {
          var date = new Date();

        }

        function cancel() {
            $location.path('/home');
        }

        function onInviteOnly(data) {
           if (data) {
             vm.showEmailInput=true;
           } else {
             vm.showEmailInput=false;
           }
        }
    }

})();
