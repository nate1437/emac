(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .directive('egFinalRepUploader', egFinalRepUploader);

    egFinalRepUploader.$inject = ['mtgReportManager'];

    function egFinalRepUploader(mtgReportManager) {
        var base = $("#linkRoot").attr("href");

        var directive = {
            link: link,
            restrict: 'E',
            templateUrl: base + 'Client/meetingreport/egFinalRepUploader.html',
            scope: true
        };
        return directive;

        function link(scope, element, attrs) {
            scope.hasFiles = false;
            scope.files = [];
            scope.upload = mtgReportManager.uploadFinalRepFile;
            //scope.appStatus = appInfo.status;
            scope.fileManagerStatus = mtgReportManager.status;
        }
    }
})();