(function () {
    'use strict';

    angular
        .module('app', ['ui.router', 'ngDialog', 'opentok'])
        .config(config)
        .run(run);

    function config($stateProvider, $urlRouterProvider) {
        // default route
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            .state('journal', {
                url: '/journal',
                templateUrl: 'journal/index.html',
                controller: 'Journal.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('profile', {
                url: '/profile',
                templateUrl: 'profile/index.html',
                controller: 'Profile.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'profile' }
            })
            .state('session', {
                url: '/session',
                templateUrl: 'session/index.html',
                controller: 'JournalSession.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'session' }
            })
            .state('history', {
                url: '/history',
                templateUrl: 'history/index.html',
                controller: 'History.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'history' }
            })
            .state('search', {
                url: '/search',
                templateUrl: 'search/index.html',
                controller: 'Search.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'search' }
            });

    }

    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            window.jwtToken = token;

            angular.bootstrap(document, ['app', 'opentok']);
        });
    });
})();
