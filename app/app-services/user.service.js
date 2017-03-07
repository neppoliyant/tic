(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $q) {
        var service = {};

        service.GetCurrent = GetCurrent;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.GetAllFieldOfStudy = GetAllFieldOfStudy;
        service.GetSearchUsers = GetSearchUsers;
        service.addRequest = addRequest;
        service.getPendingRequest = getPendingRequest;

        return service;

        function getPendingRequest() {
          return $http.get('/api/users/pendingrequest').then(handleSuccess, handleError);
        }

        function addRequest(_id, _toId, toData) {
            return $http.put('/api/users/addrequest/'+ _id + '?_toId=' + _toId, toData).then(handleSuccess, handleError);
        }

        function GetSearchUsers(_id) {
            return $http.get('/api/users/search?id='+ _id).then(handleSuccess, handleError);
        }

        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function GetAllFieldOfStudy() {
            return $http.get('/api/properties/GetAllFieldOfStudy').then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
