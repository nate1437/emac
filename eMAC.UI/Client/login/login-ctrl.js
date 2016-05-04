loginModule.controller('loginController', ['$scope', '$location', 'loginFactory',
                        function ($scope, $location, loginFactory) {

                            //BaseUrl.setBaseUrl(window.location.protocol + "//" + window.location.host + window.location.pathname);
                            $scope.page.setTitle('Login');                           
                            var base = $("#linkRoot").attr("href");
                            //$scope.login = function (user) {
                            //    if (user.Username == user.Password) {
                            //        toastr.success('Login Sucess');
                            //        $location.path(base + 'SituationUpdate');
                            //    }
                            //    else
                            //        toastr.error('Login Failed');

                            //}

                            $scope.user = $('#curr_user').text();
                            loginFactory.getRole($scope.user)
                                .then(function (result) {
                                    if (result == "") {
                                        toastr.error("You are not an authenticated user");
                                        $location.path(base);
                                    }

                                    else {
                                        $location.path(base);
                                    }

                                });


                        }]);