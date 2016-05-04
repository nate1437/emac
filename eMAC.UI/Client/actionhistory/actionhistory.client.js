(function () {
    'use strict';

    angular
        .module('action.history')
        .factory('actionHistoryClient', actionHistoryClient);

    actionHistoryClient.$inject = ['$resource', '$http', '$q'];

    function actionHistoryClient($resource, $http, $q) {
        var base = $("#linkRoot").attr("href");

        return {
            getData: function (param) {
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/ActionHistory/GetActionHistory?mtgId=' + param })
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