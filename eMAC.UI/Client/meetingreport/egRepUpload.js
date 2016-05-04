(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .directive('egRepUpload', egRepUpload);

    egRepUpload.$inject = ['$timeout'];
    
    function egRepUpload($timeout) {

        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                upload: '&egRepUpload'
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