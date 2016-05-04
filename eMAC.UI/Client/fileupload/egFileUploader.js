(function () {
    'use strict';

    angular
        .module('app.file')
        .directive('egFileUploader', egFileUploader);

    egFileUploader.$inject = ['fileManager'];

    function egFileUploader(fileManager) {
        var base = $("#linkRoot").attr("href");

        var directive = {
            link: link,
            restrict: 'E',
            templateUrl:  base + 'Client/fileupload/egFileUploader.html',
            scope: true
        };
        return directive;

        function link(scope, element, attrs) {
            scope.hasFiles = false;
            scope.files = [];            
            scope.upload = fileManager.upload;
            //scope.appStatus = appInfo.status;
            scope.fileManagerStatus = fileManager.status;
        }
    }
})();