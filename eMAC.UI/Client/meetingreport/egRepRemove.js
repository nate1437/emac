(function() {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .directive('egRepRemove', egRepRemove);

    function egRepRemove() {

        var directive = {
            link: link,
            restrict: 'A',
            //scope: {
            //    files: '=egSummRep',
            //    hasFiles: '='
            //}
        };
        return directive;

        function link(scope, element, attrs) {                         
            var msg = attrs.egRepRemove || "Remove report?";
            var clickAction = attrs.confirmedClick;
            element.bind('click', function (event) {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction)
                }
            });
        }
    }
})();