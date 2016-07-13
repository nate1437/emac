(function () {
    'use strict';

    angular
        .module('app.file')
        .factory('fileManagerClient', fileManagerClient);

    fileManagerClient.$inject = ['$resource', '$http', '$q'];

    function fileManagerClient($resource, $http, $q) {
        var base = $("#linkRoot").attr("href");

        return {
            query: function (param) {
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/attachment/get?mtgId=' + param.mtgId + '&mtgNo=' + param.mtgNo })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },
            save: function (params, formData) {
                var deferred = $q.defer();

                $http.post(base + "api/attachment/save?mtgId=" + params.mtgId + "&mtgNo=" + params.mtgNo  + "&value=" + JSON.stringify(params.value) + "&fileName=" + params.fileName, formData, {
                    transformRequest: angular.identity,
                    headers: { "Content-Type": undefined }
                })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },           
            remove: function (param) { //params) {
                var deferred = $q.defer();
                $http.post(base + 'api/attachment/delete?mtgDocId=' + param.mtgDocId + '&mtgId=' + param.mtgId + '&fileName=' + param.fileName) //+ params.mtgId + '&fileName=' + params.fileName + '&fileObj=' + JSON.stringify(params.fileObj))
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            }
        }
    }
})();