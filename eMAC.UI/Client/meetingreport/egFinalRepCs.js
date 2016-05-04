(function() {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .directive('egFinalRepCs', egFinalRepCs);

    function egFinalRepCs() {

        var directive = {
            link: link,
            restrict: 'A',
            scope: {
                files: '=egFinalRepCs',
                hasFiles: '='
            }
        };
        return directive;

        function link(scope, element, attrs) {                         
            element.bind('change', function () {
                scope.$apply(function () {
                    if (element[0].files) {
                        scope.files.length = 0;

                        angular.forEach(element[0].files, function (f) {
                            var exts = ['pdf'];
                            // first check if file field has any value
                            if (f) {
                                // split file name at dot
                                var get_ext = f.name.split('.');
                                // reverse name to check extension
                                get_ext = get_ext.reverse();
                                // check file type is valid as given in 'exts' array
                                if ($.inArray(get_ext[0].toLowerCase(), exts) > -1) {
                                    //alert('Allowed extension!');
                                    scope.files.push(f);
                                    scope.hasFiles = true;
                                } else {
                                    alert('Invalid file! The system only accepts pdf files.');
                                }
                            }

                            //scope.files.push(f);
                        });
                        
                       // scope.hasFiles = true;
                    }                    
                });
            });
                        
            if (element[0].form) {
                angular.element(element[0].form)
                        .bind('reset', function () {
                            scope.$apply(function () {
                                scope.files.length = 0;
                                scope.hasFiles = false;
                            });
                });
            }
        }
    }
})();