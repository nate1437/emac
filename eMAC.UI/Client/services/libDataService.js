eMacApp.factory('libFactory', ['$http', '$q', function ($http, $q) {
    return {
        getData: function () {

            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'GET', url: base + 'api/Library/List' })
            .success(function (data, status, header, config) {                
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                waitingDialog.hide();
            });
            return deferred.promise;
        }
        //getDetail: function (param) {

        //    var base = $("#linkRoot").attr("href");
        //    var deferred = $q.defer();

        //    $http({ method: 'GET', url: base + 'api/Meeting/Detail/' + param })
        //    .success(function (data, status, header, config) {
        //        deferred.resolve(data);
        //    })
        //    .error(function (data, status, headers, config) {
        //        deferred.reject(data);
        //        waitingDialog.hide();
        //    });
        //    return deferred.promise;
        //},
        //getNextNumber: function () {

        //    var base = $("#linkRoot").attr("href");
        //    var deferred = $q.defer();

        //    $http({ method: 'GET', url: base + 'api/Meeting/MeetingNumber' })
        //    .success(function (data, status, header, config) {
        //        deferred.resolve(data);
        //    })
        //    .error(function (data, status, headers, config) {
        //        deferred.reject(data);
        //        waitingDialog.hide();
        //    });
        //    return deferred.promise;
        //},
        //save: function (params) {

        //    var base = $("#linkRoot").attr("href");
        //    var deferred = $q.defer();

        //    $http({ method: 'POST', url: base + 'api/Meeting/Save', data: JSON.stringify(params) })
        //    .success(function (data, status, header, config) {
        //        deferred.resolve(data);
        //        waitingDialog.hide();
        //    })
        //    .error(function (data, status, headers, config) {
        //        deferred.reject(data);
        //        waitingDialog.hide();
        //    });
        //    return deferred.promise;
        //}
    }
}]);