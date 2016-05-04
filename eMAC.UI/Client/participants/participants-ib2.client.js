(function () {
    'use strict';

    angular
        .module('participants.ib2')
        .factory('participantsIb2Client', participantsIb2Client);

    participantsIb2Client.$inject = ['$resource', '$http', '$q'];

    function participantsIb2Client($resource, $http, $q) {
        var base = $("#linkRoot").attr("href");

        return {
            getData: function (mtgNumber, mtgId) {
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/Participants/GetParticipantsIB2?mtgNumber=' + mtgNumber + '&mtgId=' + mtgId })
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

                //$http({ method: 'POST', url: base + 'api/MeetingReport/SaveSummaryMtgReport?mtgId=' + params.mtgId+'&fileName='+params.fileName, transformRequest: angular.identity, headers: { 'Content-Type': undefined } })
                //.success(function (data, status, header, config) {
                //    deferred.resolve(data);
                //})

                $http.post(base + 'api/Participants/ImportIB2File?mtgNumber=' + params.mtgNumber + '&mtgId=' + params.mtgId + '&fileName=' + params.fileName + '&value=' + params.value, formData, {
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
            }
        }
    }
})();


//(function () {
//    'use strict';

//    angular
//        .module('participants.ib2')
//        .factory('participantsIb2Client', participantsIb2Client);

//    participantsIb2Client.$inject = ['$resource'];

//    function participantsIb2Client($resource) {
//        var base = $("#linkRoot").attr("href");

//        return $resource(
//                base + "api/participants",
//                { id: "@dir" },
//                {
//                    'query': { method: 'GET', url: base + 'api/attachment/get' },
//                    'remove': { method: 'POST', url: base + 'api/attachment/delete', params: { mtgId: '@mtgId', fileName: '@fileName' } },
//                    'save': { method: 'POST', url: base + 'api/Participants/ImportIB2File', transformRequest: angular.identity, headers: { 'Content-Type': undefined } },
//                    //'download': { method: 'GET', url: base + 'meetings/DownloadFile', params: { mtgId: '@mtgId', fileName: '@fileName' } }
//                    'download': { method: 'GET', url: base + 'api/attachment/download', params: { mtgId: '@mtgId', fileName: '@fileName' } }
//                });
//    }
//})();