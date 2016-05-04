eMacApp.factory('mtgFactory', ['$http', '$q', function ($http, $q) {
    return {
        getData: function (param) {
            var base = $("#linkRoot").attr("href");
            
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: base + 'service/Meeting/List?year=' + (param.year == 'undefined' ? '' : param.year) + '&divisionCode=' + param.divisionCode + '&unitCode=' + param.unitCode
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
        getDetail: function (param) {
            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'GET', url: base + 'api/Meeting/Detail/' + param })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                waitingDialog.hide();
            });
            return deferred.promise;
        },
        getNextNumber: function () {

            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'GET', url: base + 'api/Meeting/MeetingNumber' })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                waitingDialog.hide();
            });
            return deferred.promise;
        },
        save: function (params) {

            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'POST', url: base + 'api/Meeting/Save', data: kendo.stringify(params) })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
                waitingDialog.hide();
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                waitingDialog.hide();
            });
            return deferred.promise;
        },
        update: function (id, params) {

            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'POST', url: base + 'api/Meeting/Update/' +id, data: JSON.stringify(params) })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
                waitingDialog.hide();
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                waitingDialog.hide();
            });
            return deferred.promise;
        },
        notifyCreate: function (param) {

            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'GET', url: base + 'api/Notification/NotifyCreateMtg/' + id, data: param })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                waitingDialog.hide();
            });
            return deferred.promise;
        },
        sendNotif: function (id, params) {

            var base = $("#linkRoot").attr("href");
            var deferred = $q.defer();

            $http({ method: 'POST', url: base + 'api/Notification/Notify/' + id, data: kendo.stringify(params) })
            .success(function (data, status, header, config) {
                deferred.resolve(data);
                waitingDialog.hide();
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
                waitingDialog.hide();
            });
            return deferred.promise;
        },
        showLoader: function (toShow) {
            if (toShow) {
                displayOverlay();
            }
            else { removeOverlay(); }
        },
        iLocalStorage: function (item) {
            if (localStorage[item] != undefined) {
                return JSON.parse(localStorage[item]);
            }
            return "";
        },

        iLocalStorageSet: function (item, value) {
            if (localStorage[item] == undefined) {
                localStorage[item] = JSON.stringify(value == undefined ? {} : value);
            }
            return JSON.parse(localStorage[item]);
        },
        iLocalStorageUpdate: function (item, value) {
            if (localStorage[item] != undefined) {
                var parseStorage = JSON.parse(localStorage[item]);
                angular.forEach(value, function (v, k) {
                    parseStorage[k] = v;
                });
                localStorage[item] = JSON.stringify(parseStorage);
                //var iValue = $.extend({}, JSON.parse(localStorage[item]), value) 
                //localStorage[item] = JSON.stringify(iValue);
            }
            return JSON.parse(localStorage[item]);
        }
    }
}]);