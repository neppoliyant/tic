(function () {
    'use strict';

    angular
        .module('app')
        .factory('JournalService', Service);

    function Service($http, $q) {
        var service = {};

        service.CreateJournal = CreateJournal;
        service.UpdateJournal = UpdateJournal;
        service.DeleteJournal = DeleteJournal;
        service.GetJournal = GetJournal;
        service.GetAllJournal = GetAllJournal;
        service.GetSearchJournal = GetSearchJournal;
        service.GetTopTen = GetTopTen;

        return service;

        function CreateJournal(journal) {
            return $http.post('/api/journal', journal).then(handleSuccess, handleError);
        }

        function UpdateJournal(journal) {
            return $http.put('/api/journal', journal).then(handleSuccess, handleError);
        }

        function DeleteJournal(userId, journalId) {
            return $http.delete('/api/journal?userId=' + userId + '&journalId=' + journalId).then(handleSuccess, handleError);
        }

        function GetJournal(user) {
            return $http.post('/api/journal', user).then(handleSuccess, handleError);
        }

        function GetAllJournal(_id) {
            return $http.get('/api/journal/all?id='+ _id).then(handleSuccess, handleError);
        }

        function GetSearchJournal(_id) {
            return $http.get('/api/journal/search?id='+ _id).then(handleSuccess, handleError);
        }

        function GetTopTen(_id) {
            return $http.get('/api/journal/getTopTen?id='+ _id).then(handleSuccess, handleError);
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
