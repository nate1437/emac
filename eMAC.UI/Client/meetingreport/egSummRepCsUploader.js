(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .directive('egSummRepCsUploader', egSummRepCsUploader);

    egSummRepCsUploader.$inject = ['mtgReportManager'];

    function egSummRepCsUploader(mtgReportManager) {
        var base = $("#linkRoot").attr("href");

        var directive = {
            link: link,
            restrict: 'E',
            templateUrl: base + 'Client/meetingreport/egSummRepCsUploader.html',
            scope: true
        };
        return directive;

        function link(scope, element, attrs) {
            scope.hasFiles = false;
            scope.files = [];
            scope.upload = mtgReportManager.uploadSummaryRepCsFile;
            //scope.appStatus = appInfo.status;
            scope.fileManagerStatus = mtgReportManager.status;
        }
    }
})();