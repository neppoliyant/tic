(function () {
    'use strict';

    angular
        .module('app')
        .controller('JournalSession.IndexController', Controller);

    function Controller(UserService, $location, sharedProperties, OTSession, OT) {
        var vm = this;

        vm.user = null;
        vm.createJournal = createJournal;
        vm.journal = sharedProperties.getSelectedJournal();
        vm.streams = null;

        initController();

        function initController() {

          var session = OT.initSession('45738212', vm.journal.sessionId);

            session.connect(vm.journal.token, function(error) {

            // If the connection is successful, initialize a publisher and publish to the session
            if (!error) {
              var publisher = OT.initPublisher('publisher', {
                insertMode: 'append',
                width: '100%',
                height: '100%'
              });

              session.publish(publisher);
            } else {
              console.log('There was an error connecting to the session:', error.code, error.message);
            }

            session.on('streamCreated', function(event) {

              var subscriber = session.subscribe(event.stream, 'subscriber', {
                insertMode: 'append',
                width: '100px',
                height: '100px'
              });

              subscriber.setStyle('float', 'left');
            });
          });

            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function createJournal() {
            console.log('clicked create journal');
            $location.path('/journal');
        }
    }

})();
