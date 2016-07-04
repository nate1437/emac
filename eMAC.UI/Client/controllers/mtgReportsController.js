eMacApp.controller('mtgReportsController',
    ["$scope", "$document", "$routeParams", "$window", "$location", "$filter", "$timeout", "UserRole", "UserData", "mtgDataSource", "mtgFactory", "libFactory", "configData", "rootUrl", "meetingStatus", "$modal", "$compile", "eMacFactory",
    function ($scope, $document, $routeParams, $window, $location, $filter, $timeout, UserRole, UserData, mtgDataSource, mtgFactory, libFactory, configData, rootUrl, meetingStatus, $modal, $compile, eMacFactory) {

        $scope.models = {
            meetingType: $routeParams.meetingType
        }
        $scope.events = {
            formLoad: function (e) {

                var workbook, worksheet, viz;

                eMacFactory.Save({
                    url: "service/Report/RequestTableauUrl",
                    data: JSON.stringify({ url: $scope.models.meetingType == "meeting" ? "views/meeting_statistics/Overview" : "views/meeting_participants_statistics/Overview" })
                })
                .then(function (e) {
                    var container = document.getElementById("tableauViz");
                    var url = e;
                    var options = {
                        width: container.offsetWidth,
                        height: container.offsetHeight,
                        hideTabs: false,
                        hideToolbar: true,
                        onFirstInteractive: function () {
                            workbook = viz.getWorkBook();
                            worksheet = workbook.getActiveWorkSheet();
                            var worksheetArray = worksheet.getWorksheets();
                            if (!worksheet.getSheetType() == "worksheet") {
                                for (var i = 0; i < worksheetArray.length; i++) {
                                    worksheetArray[i].applyFilterAsync(
                                        "calc_year",
                                        new Date().getFullYear(),
                                        tableauSoftware.FilterUpdateType.REPLACE);
                                }
                            }
                        }
                    };

                    viz = new tableauSoftware.Viz(container, url, options);
                });
            }
        };


    }]);