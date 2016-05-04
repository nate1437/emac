loginModule.factory('loginFactory', ['$http', '$q', function ($http, $q) {
    return {
        getRole: function (params) {

            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'GET', url: base + 'api/Users/User/', params: { value: JSON.stringify(params) } })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                //waitingDialog.hide();
            });
            return deferred.promise;
        },
        getUserData: function (params) {
            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'GET', url: base + 'api/Users/GetUserData/', params: { value: JSON.stringify(params) } })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                //waitingDialog.hide();
            });
            return deferred.promise;
        }
    }
}]);