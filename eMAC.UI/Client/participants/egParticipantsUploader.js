(function () {
    'use strict';

    angular
        .module('participants.ib2')
        .directive('egParticipantsUploader', egParticipantsUploader);

    egParticipantsUploader.$inject = ['participantsIb2Manager'];

    function egParticipantsUploader(participantsIb2Manager) {
        var base = $("#linkRoot").attr("href");

        
        var directive = {
            link: link,
            restrict: 'E',
            templateUrl: base + 'Client/participants/egParticipantsUploader.html',
            scope: {
                isDisabled: "="
            }
        };
        return directive;

        function link(scope, element, attrs) {
            scope.hasFiles = false;
            scope.files = [];
            scope.upload = participantsIb2Manager.upload;
            scope.printib2 = participantsIb2Manager.printib2;
            scope.fileManagerStatus = participantsIb2Manager.status;
        }
    }
})();