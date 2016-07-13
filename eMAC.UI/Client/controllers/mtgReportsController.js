eMacApp.controller('mtgReportsController',
    ["$scope", "$document", "$routeParams", "$window", "$location", "$filter", "$timeout", "UserRole", "UserData", "mtgDataSource", "mtgFactory", "libFactory", "configData", "rootUrl", "meetingStatus", "$modal", "$compile", "eMacFactory",
    function ($scope, $document, $routeParams, $window, $location, $filter, $timeout, UserRole, UserData, mtgDataSource, mtgFactory, libFactory, configData, rootUrl, meetingStatus, $modal, $compile, eMacFactory) {

        if (!angular.element(".body-content").hasClass("tableau-open")) {
            angular.element(".body-content").addClass("tableau-open");
        }

        $scope.models = {
            meetingType: $routeParams.meetingType,
            reportTitle: $routeParams.meetingType == "meeting" ? "Meeting statistics" : "Participants statistics"
        };


        $scope.$watch(function () { return eMacFactory.User("data"); }, function (n, o) {
            if (Object.keys(n).length > 0) {
                angular.extend($scope.models, {
                    viewAll: $scope.$parent.models.settings.reportViewAll,
                    division: eMacFactory.User("data").org_unit.split("/")[0],
                    unit: eMacFactory.User("data").org_unit.split("/")[1]
                });
            }
        }, true);

        
        $scope.$watch("models.tableauUrl", function (n, o) {
            if (n != undefined) {
                var workbook, worksheet, viz;
                var getViz = function () {
                    workbook = viz.getWorkbook();
                    worksheet = workbook.getActiveSheet();
                };

                var filterViz = function () {
                    var worksheetArray = worksheet.getWorksheets();
                    if (worksheet.getSheetType() != "worksheet") {
                        for (var i = 0; i < worksheetArray.length; i++) {
                            worksheetArray[i].applyFilterAsync(
                                "YEAR(end_date)",
                                new Date().getFullYear(),
                                tableauSoftware.FilterUpdateType.REPLACE);

                            worksheetArray[i].applyFilterAsync(
                                "Year",
                                new Date().getFullYear(),
                                tableauSoftware.FilterUpdateType.REPLACE);
                        }
                    }
                }

                eMacFactory.Loader.hide();
                var container = document.getElementById("tableauViz");
                var url = n;
                var options = {
                    width: "1200px",
                    height: "900px",
                    hideTabs: false,
                    hideToolbar: true,
                    onFirstInteractive: function () {
                        getViz();
                        filterViz();
                    }
                };
                if (!$scope.models.viewAll) {
                    options["Division"] = $scope.models.division;
                    options["Unit"] = $scope.models.unit;
                }

                if (viz) {
                    viz.dispose();
                }

                viz = new tableauSoftware.Viz(container, url, options);
            }
        });


        $scope.events = {
            formLoad: function (e) {
                eMacFactory.Save({
                    url: "service/Report/RequestTableauUrl",
                    data: JSON.stringify({ url: $scope.models.meetingType == "meeting" ? "views/meeting_statistics/Overview" : "views/meeting_participants_statistics/Overview" })
                })
                .then(function (e) {
                    $scope.models.tableauUrl = e;
                });
            }
        };


    }]);