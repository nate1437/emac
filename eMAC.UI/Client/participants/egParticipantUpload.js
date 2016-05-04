(function () {
    'use strict';

    angular
        .module('participants.ib2')
        .directive('egParticipantUpload', egParticipantUpload);

    egParticipantUpload.$inject = ['$timeout'];
    
    function egParticipantUpload($timeout) {

        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                upload: '&egParticipantUpload'
            }
        };
        return directive;

        function link(scope, element, attrs) {
            var parentForm = element[0].form;
            if (parentForm) {
                element.on('click', function (event) {
                    return scope.upload().then(function () {
                        //see:https://docs.angularjs.org/error/$rootScope/inprog?p0=$digest for why there is a need to use timeout to avoid conflict
                        $timeout(function () {
                            parentForm.reset();
                        });
                    });
                });
            }
        }
    }
})();