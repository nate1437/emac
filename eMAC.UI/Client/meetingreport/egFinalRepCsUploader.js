(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .directive('egFinalRepCsUploader', egFinalRepCsUploader);

    egFinalRepCsUploader.$inject = ['mtgReportManager'];

    function egFinalRepCsUploader(mtgReportManager) {
        var base = $("#linkRoot").attr("href");

        var directive = {
            link: link,
            restrict: 'E',
            templateUrl: base + 'Client/meetingreport/egFinalRepCsUploader.html',
            scope: true
        };
        return directive;

        function link(scope, element, attrs) {
            scope.hasFiles = false;
            scope.files = [];
            scope.upload = mtgReportManager.uploadFinalRepCsFile;
            //scope.appStatus = appInfo.status;
            scope.fileManagerStatus = mtgReportManager.status;
        }
    }
})();