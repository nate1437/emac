(function () {
    'use strict';

    angular
        .module('app.file')
        .factory('fileManagerClient', fileManagerClient);

    fileManagerClient.$inject = ['$resource', '$http', '$q'];

    function fileManagerClient($resource, $http, $q) {
        var base = $("#linkRoot").attr("href");

        //return $resource(
        //        base + "api/attachment",
        //        { id: "@dir" },
        //        {
        //            'query': { method: 'GET', url: base + 'api/attachment/get' },
        //            'remove': { method: 'POST', url: base + 'api/attachment/delete', params: { mtgId: '@mtgId', fileName: '@fileName', fileObj: '@fileObj' } },
        //            'save': { method: 'POST', url: base + 'api/attachment/save', transformRequest: angular.identity, headers: { 'Content-Type': undefined } },
        //            //'download': { method: 'GET', url: base + 'meetings/DownloadFile', params: { mtgId: '@mtgId', fileName: '@fileName' } }
        //            'download': { method: 'GET', url: base + 'api/attachment/download', params: { mtgId: '@mtgId', fileName: '@fileName' } }
        //        });

        return {
            query: function (param) {
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/attachment/get?mtgId=' + param.mtgId })
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

                $http.post(base + 'api/attachment/save?mtgId=' + params.mtgId + '&value=' + JSON.stringify(params.value) + '&fileName=' + params.fileName, formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
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