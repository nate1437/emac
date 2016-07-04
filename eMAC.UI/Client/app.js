'use strict';

var baseSiteUrlPath = $("base").first().attr("href");
if (document.location.hostname == "localhost")
    baseSiteUrlPath = "";

var eMacApp = angular.module("eMacApp",
    [
        "kendo.directives",
        "ngRoute",
        "ngResource",
        "ngAnimate",
        "ngSanitize",
        "ui.bootstrap",
        "loginModule",
        "app.file",
        "emacApp.mtgReport",
        "participants.ib2",
        "action.history",
    ]).value("toastr", toastr);

eMacApp.directive("centerModal", function () {
    return {
        restrict: "A",
        link: function (scope, elem, attr) {
            var resizeModal = function () {
                var clone = elem.clone().css("display", "block").appendTo("body");
                var top = Math.round((clone.height() - clone.find(".modal-content").height()) / 2);
                top = top > 0 ? top : 0;
                clone.remove();
                elem.find(".modal-content").css("margin-top", top - 15);
            }
            elem.on("show.bs.modal", function () {
                resizeModal()
            });

            angular.element(window).on("resize", function () { resizeModal(); });
        }
    }
});

eMacApp.factory("eMacDataFactory", ["$q", "eMacFactory", function (q, eMacFactory) {
    var _base = $("#linkRoot").attr("href"),
        _eMacMainGridSource = function (param) {
            eMacFactory.Loader.show();
            var _await = q.defer();
            eMacFactory.SetupParam(param)
                .then(function (result) {
                    if (result != undefined) {
                        var obj = new kendo.data.DataSource({
                            pageSize: eMacFactory.LocalStorage.Get("eMac_MainGridItems").count,
                            transport: {
                                read: {
                                    type: "GET",
                                    contentType: "application/json",
                                    dataType: "json",
                                    data: { year: param.year, divisionCode: param.divisionCode, unitCode: param.unitCode },
                                    url: _base + "service/Meeting/List"
                                }
                            },
                            schema: kendo.data.Model.define({
                                id: "mtg_id",
                                fields: {
                                    mtg_no: { editable: false, nullable: true },
                                    mtg_title: { type: "string", validation: { required: true } },
                                    venue: { type: "string" },
                                    start_date: { type: "date" },
                                    end_date: { type: "date" },
                                    div_code: { type: "string" },
                                    unit_code: { type: "string" },
                                    status: { type: "string" },
                                    resp_officer: { type: "string" },
                                    resp_officer_name: { type: "string" },
                                }
                            }),
                            requestEnd: function () {
                                eMacFactory.Loader.hide();
                            }
                        });
                        _await.resolve(obj);
                    }
                });
            return _await.promise;
        },
        _eMacParticipantGridSource = function (param) {
            eMacFactory.Loader.show();
            var _await = q.defer();
            eMacFactory.SetupParam(data)
                .then(function (result) {
                    if (result != undefined) {
                        var obj = new kendo.data.DataSource({
                            pageSize: 20,
                            schema: {
                                model: {
                                    id: "mtg_participant_ctry_id",
                                    fields: {
                                        mtg_participant_ctry_id: { type: "number" },
                                        mtg_id: { type: "number" },
                                        ctry_code: {
                                            type: "string", validation: {
                                                required: true, custom: function (input) { 
                                                    var result = $.grep($scope.states, function (item) {
                                                        return item.ctry_name === input[0].value.trim();
                                                    });

                                                    if (input[0].value.trim() === "") {// || result.length === 0) {
                                                        input[0].value = "";

                                                        input.focus();
                                                        input.css({ "background-color": "red" });
                                                        return false;
                                                    } else {
                                                        input.css({ "background-color": "white" });
                                                        return true;
                                                    }
                                                }
                                            },
                                            defaultValue: ""
                                        },
                                        ctry_name: { type: "string", validation: { required: true } },
                                        no_of_participants: {
                                            type: "number", validation: { required: true, min: 1 },
                                            defaultValue: 1
                                        },
                                        //fund_source: { type: "string", validation: { required: true }, defaultValue: "WPRO" },
                                        fund_source: {
                                            type: "string",
                                            validation: {
                                                required: true,
                                                custom: function (input) {
                                                    // set the custom message
                                                    var result = $.grep($scope.participantFundSrcs, function (item) {
                                                        return item.ref_name === input[0].value.trim();
                                                    });

                                                    if (input[0].value.trim() === "") {// || result.length === 0) {
                                                        input[0].value = "";

                                                        input.focus();
                                                        input.css({ "background-color": "red" });
                                                        return false;
                                                    } else {
                                                        input.css({ "background-color": "white" });
                                                        return true;
                                                    }
                                                }
                                            }, defaultValue: "WPRO"
                                        },
                                        is_modified: { type: "bool" },
                                        created_by: { type: "string" },
                                        updated_by: { type: "string" },
                                        user_name: { type: "string" }
                                    }
                                }
                            },

                            data: result,
                        });
                        _await.resolve(obj);
                    }
                });
        }
    return {
        eMacMainGridSource: _eMacMainGridSource
    };
}]);

eMacApp.factory("eMacFactory", ["$http", "$q", "$timeout", function (http, q, timeout) {
    var _config = {},
        _user = {
            data: {},
            role: {}
        },
        _base = $("#linkRoot").attr("href");
    return {
        Config: function (val) {
            if (val != undefined) {
                if (typeof val == "string") {
                    _config = JSON.parse(val);
                }
                else {
                    _config = val;
                }
            }
            else { return _config; }
        },
        User: function (key, val) {
            if (val != undefined) {
                _user[key] = val;
            }
            else {
                return _user[key];
            }
        },
        Get: function (param) {
            var _await = q.defer();
            if (param != undefined) {
                http.get(_base + param.url)
                .success(function (result) {
                    _await.resolve(result);
                })
                .error(function (result) {
                    _await.reject(result);
                });
            }
            return _await.promise;
        },
        Save: function (param) {
            var _await = q.defer();
            if (param != undefined) {
                http.post(_base + param.url, param.data)
                .success(function (result) {
                    _await.resolve(result);
                })
                .error(function (result) {
                    _await.reject(result);
                });
            }
            return _await.promise;
        },
        SetupParam: function (param) {
            var _await = q.defer();
            timeout(function () {
                _await.resolve(param);
            }, 200);
            return _await.promise;
        },
        LocalStorage: {
            Get: function (item) {
                if (localStorage[item] != undefined) {
                    return JSON.parse(localStorage[item]);
                }
                return {};
            },
            Save: function (item, value) {
                if (localStorage[item] != undefined) {
                    var parseStorage = JSON.parse(localStorage[item]);
                    angular.forEach(value, function (v, k) {
                        parseStorage[k] = v;
                    });
                    localStorage[item] = JSON.stringify(parseStorage);
                }
                return JSON.parse(localStorage[item]);
            },
            Create: function (item, value) {

                if (localStorage[item] == undefined) {
                    localStorage[item] = JSON.stringify(value == undefined ? {} : value);
                }
                return JSON.parse(localStorage[item]);
            }
        },
        Loader: {
            show: function () {
                displayOverlay();
            },
            hide: function () {
                removeOverlay();
            }
        }
    };
    
}]);

eMacApp.service("configData", function () {
    var _configData = null;
    return {
        getData: function () {
            return _configData;
        },
        setData: function (configData) {
            _configData = configData;
        }
    }
});

eMacApp.service("UserRole", function () {
    var _userRole = null;
    return {
        getRole: function () {
            return _userRole;
        },
        setRole: function (role) {
            _userRole = role;
        }
    }
});

eMacApp.service("UserData", function () {
    var _userData = null;
    return {
        getUserData: function () {
            return _userData;
        },
        setUserData: function (role) {
            _userData = role;
        }
    }
});

eMacApp.controller("AuthenticationController",
    ["$scope", "$location", "libFactory", "loginFactory", "configData", "UserRole", "UserData", "mtgFactory", "eMacFactory",
        function ($scope, $location, libFactory, loginFactory, configData, UserRole, UserData, mtgFactory, eMacFactory) {
            /* START PRIVATE VARIABLES */

            var base = $("#linkRoot").attr("href"),
                createLocalStorage = function () {
                    mtgFactory.iLocalStorageSet("eMac_MainGrid", {
                        defaultState: {},
                        currentState: {}
                    });

                    mtgFactory.iLocalStorageSet("eMac_MainGridItems", {
                        count: 20,
                        getAllData: false
                    });

                    mtgFactory.iLocalStorageSet("eMac_MainGridParams", {
                        year: new Date().getFullYear(),
                        meetingList: "myunit"
                    });

                    mtgFactory.iLocalStorageSet("eMac_TabSet");

                };
            /* END PRIVATE VARIABLES */

            $scope.user = $('#curr_user').text();

            $scope.factories = {
                app: eMacFactory
            };

            $scope.models = {
                user: angular.element("#curr_user").text()
            };


            $scope.factories.app.Get({
                url: "api/Library/List"
            }).then(function (result) {
                if (result != undefined) {
                    $scope.factories.app.Config(result);
                }
            });
            
            $scope.factories.app.Get({
                url: "api/Users/GetUserDetails?user_name=" + $scope.models.user
            }).then(function (result) {
                if (result != undefined) {
                    if (result.op) {
                        debugger;
                        $scope.factories.app.User("data", result.user_details);

                            $scope.models.settings = {
                                isAdmin: (result.user_details.user_level >= 90),
                                isApprover: (result.user_details.user_level >= 80) || (result.user_details.user_level >= 90),
                                isUser: (result.user_details.user_level < 80),
                                addButton: true,
                                saveDetail: true,
                                sumbitDetail: (result.user_details.user_level < 80),
                                approveDetail: (result.user_details.user_level >= 80) || (result.user_details.user_level >= 90),
                                rejecteDetail: (result.user_details.user_level >= 80) || (result.user_details.user_level >= 90),
                                finalDetail: (result.user_details.user_level >= 80) || (result.user_details.user_level >= 90),
                                reviseDetail: (result.user_details.user_level >= 80) || (result.user_details.user_level >= 90),
                                cancelDetail: (result.user_details.user_level >= 80) || (result.user_details.user_level >= 90)
                            };
                    }
                    else {
                        console.log(result.result);
                    }
                }
            });

            $scope.events = {
                viewReport: function (e) {
                    $location.path(base + "meetings/reports/" + e);
                },
                viewHome: function (e) {
                    $location.path(base);
                }
            }
            
            loginFactory.getUserData($scope.user)
            .then(function (result) {
                if (result && result.user_object) {

                    createLocalStorage();
                    JSON.parse(result.user_object)
                        .forEach(function (user_data) {
                            UserData.setUserData(user_data);

                            $scope.currUserOrgUnit = user_data.org_unit


                            // isAdmin 
                            if (user_data.user_level >= 90) {
                                
                                $scope.isAdmin = true;
                                $scope.isApprover = true;
                                $scope.addButtonEnable = true;
                                $scope.saveDetailBtnEnable = true;
                                $scope.submitDetailBtnEnable = false;
                                $scope.approveDetailBtnEnable = true;
                                $scope.rejectDetailBtnEnable = true;
                                $scope.finalDetailBtnEnable = true;
                                $scope.reviseDetailBtnEnable = true;
                                $scope.cancelDetailBtnEnable = true;
                                //toastr.success("User Authenticated", "Authentication");
                            }
                            // isApprover (usually MAC)
                            else if (user_data.user_level >= 80) {
                                $scope.isApprover = true;
                                $scope.addButtonEnable = true;
                                $scope.saveDetailBtnEnable = true;
                                $scope.submitDetailBtnEnable = false;
                                $scope.approveDetailBtnEnable = true;
                                $scope.rejectDetailBtnEnable = true;
                                $scope.finalDetailBtnEnable = true;
                                $scope.reviseDetailBtnEnable = true;
                                $scope.cancelDetailBtnEnable = true;
                                //$scope.mtgReportDelBtn = false;
                                //toastr.success("User Authenticated", "Authentication");
                            }
                            // user 
                            else if (user_data.user_level < 80) {
                                $scope.isUser = true;
                                $scope.addButtonEnable = true;
                                $scope.saveDetailBtnEnable = true;
                                $scope.submitDetailBtnEnable = true;
                                $scope.approveDetailBtnEnable = false;
                                $scope.rejectDetailBtnEnable = false;
                                $scope.finalDetailBtnEnable = false;
                                $scope.reviseDetailBtnEnable = false;
                                $scope.cancelDetailBtnEnable = false;
                                //$scope.mtgReportDelBtn = false;
                                //toastr.success("User Authenticated", "Authentication");
                                //$scope.submitView = false;
                                //$scope.approveRejectView = false;
                                //$scope.populateShow = false;
                            }
                            // no specific access level - treat as user
                            else {
                                $scope.isUser = true;
                                $scope.addButtonEnable = true;
                                $scope.saveDetailBtnEnable = true;
                                $scope.submitDetailBtnEnable = true;
                                $scope.approveDetailBtnEnable = false;
                                $scope.rejectDetailBtnEnable = false;
                                $scope.finalDetailBtnEnable = false;
                                $scope.reviseDetailBtnEnable = false;
                                $scope.cancelDetailBtnEnable = false;
                                //no user access
                                //$scope.unAuthorized = true;
                                //$scope.addButtonEnable = false;
                                //$scope.saveDetailBtnEnable = false;
                                //$scope.approveDetailBtnEnable = false;
                                //$scope.rejectDetailBtnEnable = false;
                                //$scope.finalDetailBtnEnable = false;
                                //$scope.reviseDetailBtnEnable = false;
                                //$scope.cancelDetailBtnEnable = false;
                                //$scope.mtgReportDelBtn = true;
                                //toastr.error("You are not an authenticated user");
                            }
                        });;
                }
            });
        }]);


eMacApp.config(["$provide", function ($provide) {
    var rootUrl = $("#linkRoot").attr("href");

    $provide.constant("rootUrl", rootUrl);
    $provide.constant("meetingStatus", {
        draft: "Draft",
        submSpmc: "Submitted for SPMC",
        submFinal: "Submitted for Finalization",
        revSpmc: "Revise for SPMC",
        revFinal: "Revise for Finalization",
        apprSPMC: "Approved for SPMC",
        final: "Finalized",
    });

}]);
