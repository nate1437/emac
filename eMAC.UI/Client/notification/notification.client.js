(function () {
    'use strict';

    angular
        .module('notification')
        .factory('notificationClient', notificationClient);

    notificationClient.$inject = ['$resource', '$http', '$q'];

    function notificationClient($resource, $http, $q) {
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
            send: function (params) {

                var base = $("#linkRoot").attr("href");
                var deferred = $q.defer();

                    $http({ method: 'POST', url: base + 'api/Notification/Notify', data: kendo.stringify(params) })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                    waitingDialog.hide();
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