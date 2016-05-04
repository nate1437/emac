(function() {
    'use strict';

    angular
        .module('app.file')
        .directive('egConfirmClick', egConfirmClick);

    function egConfirmClick() {

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
            var msg = attrs.egConfirmClick || "Remove attachment?";
            var clickAction = attrs.confirmedClick;
            element.bind('click', function (event) {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction)
                }
            });
        }
    }
})();