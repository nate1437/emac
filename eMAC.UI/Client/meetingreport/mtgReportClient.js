(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .factory('mtgReportClient', mtgReportClient);

    mtgReportClient.$inject = ['$resource', '$http', '$q'];

    function mtgReportClient($resource, $http, $q) {
        var base = $("#linkRoot").attr("href");

        return {
            getSummRepData: function (param) {               
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/MeetingReport/GetSummaryMtgReport?mtgId=' + param.mtgId+'&mtgNumber='+ param.mtgNumber })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },
            // GetSummaryMtgReportCs
            getSummRepCsData: function (param) {               
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/MeetingReport/GetSummaryMtgReportCs?mtgId=' + param.mtgId + '&mtgNumber=' +param.mtgNumber })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },
            getFinalRepData: function (param) {
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/FinalReport/GetFinalMtgReport?mtgId=' + param.mtgId+'&mtgNumber='+ param.mtgNumber  })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },
            // GetSummaryMtgReportCs
            getFinalRepCsData: function (param) {               
                var deferred = $q.defer();

                $http({ method: 'GET', url: base + 'api/FinalReport/GetFinalMtgReportCs?mtgId=' + param.mtgId + '&mtgNumber=' + param.mtgNumber })
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },
            saveSummRep: function (params, formData) {
                var deferred = $q.defer();
                
                //$http({ method: 'POST', url: base + 'api/MeetingReport/SaveSummaryMtgReport?mtgId=' + params.mtgId+'&fileName='+params.fileName, transformRequest: angular.identity, headers: { 'Content-Type': undefined } })
                //.success(function (data, status, header, config) {
                //    deferred.resolve(data);
                //})

                $http.post(base + 'api/MeetingReport/SaveSummaryMtgReport?mtgId=' + params.mtgId + '&userName=' + params.userName + '&fileName=' + params.mtgNumber + '&rtsparse=' + params.rtsparse, formData, {
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
            //SaveSummaryCsMtgReport
            saveSummRepCs: function (params, formData) {
                var deferred = $q.defer();
                
                $http.post(base + 'api/MeetingReport/SaveSummaryCsMtgReport?mtgId=' + params.mtgId + '&userName=' + params.userName + '&fileName=' + params.mtgNumber, formData, {
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
            saveFinalRep: function (params, formData) {
                var deferred = $q.defer();
                
                //$http({ method: 'POST', url: base + 'api/MeetingReport/SaveSummaryMtgReport?mtgId=' + params.mtgId+'&fileName='+params.fileName, transformRequest: angular.identity, headers: { 'Content-Type': undefined } })
                //.success(function (data, status, header, config) {
                //    deferred.resolve(data);
                //})

                $http.post(base + 'api/FinalReport/SaveFinalMtgReport?mtgId=' + params.mtgId + '&userName=' + params.userName + '&fileName=' + params.mtgNumber, formData, {
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
            postToRTS: function(param){
                var deferred = $q.defer();
                $("body").find("iframe").remove();
                var rts = decodeURIComponent(angular.element("#RTSParser").data("href") + "&" + $.param(param));
                $("<iframe>").prop("src", rts).css("display", "none").appendTo("body");
                
            },
            // saveFinalRepCs
            saveFinalRepCs: function (params, formData) {
                var deferred = $q.defer();
                
                $http.post(base + 'api/FinalReport/SaveFinalCsMtgReport?mtgId=' + params.mtgId + '&userName=' + params.userName + '&fileName=' + params.mtgNumber, formData, {
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
            removeSummRep: function (params) {
                var deferred = $q.defer();
                
                //$http({ method: 'POST', url: base + 'api/MeetingReport/SaveSummaryMtgReport?mtgId=' + params.mtgId+'&fileName='+params.fileName, transformRequest: angular.identity, headers: { 'Content-Type': undefined } })
                //.success(function (data, status, header, config) {
                //    deferred.resolve(data);
                //})

                $http.post(base + 'api/MeetingReport/Delete?mtgId=' + params.mtgId + '&mtgNumber=' + params.mtgNumber + '&type=' + params.type)
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },
            removeFinalRep: function (params) {
                var deferred = $q.defer();
                
                //$http({ method: 'POST', url: base + 'api/MeetingReport/SaveSummaryMtgReport?mtgId=' + params.mtgId+'&fileName='+params.fileName, transformRequest: angular.identity, headers: { 'Content-Type': undefined } })
                //.success(function (data, status, header, config) {
                //    deferred.resolve(data);
                //})

                $http.post(base + 'api/FinalReport/Delete?mtgId=' + params.mtgId + '&mtgNumber=' + params.mtgNumber + '&type=' + params.type)
                .success(function (data, status, header, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject(data);
                    waitingDialog.hide();
                });
                return deferred.promise;
            },
            saveRepOfficer: function (params) {
                var deferred = $q.defer();
                
                //$http({ method: 'POST', url: base + 'api/MeetingReport/SaveSummaryMtgReport?mtgId=' + params.mtgId+'&fileName='+params.fileName, transformRequest: angular.identity, headers: { 'Content-Type': undefined } })
                //.success(function (data, status, header, config) {
                //    deferred.resolve(data);
                //})

                $http.post(base + 'api/MeetingReport/UpdateOfficer?mtgId=' + params.mtgId + '&ofcrName=' + params.ofcrName + '&currUser=' + params.currUser)
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