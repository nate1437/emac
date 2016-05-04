(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .directive('egSummRepUploader', egSummRepUploader);

    egSummRepUploader.$inject = ['mtgReportManager'];

    function egSummRepUploader(mtgReportManager) {
        var base = $("#linkRoot").attr("href");

        var directive = {
            link: link,
            restrict: 'E',
            templateUrl: base + 'Client/meetingreport/egSummRepUploader.html',
            scope: true
        };
        return directive;

        function link(scope, element, attrs) {
            scope.hasFiles = false;
            scope.files = [];
            scope.upload = mtgReportManager.uploadSummaryRepFile;
            //scope.appStatus = appInfo.status;
            scope.fileManagerStatus = mtgReportManager.status;
        }
    }
})();