eMacApp.controller("mtgsController",
    ["$scope", "$modal", "$window", "$location", "$timeout", "rootUrl", "meetingStatus", "$compile", "eMacFactory", "eMacDataFactory",
    function ($scope, $modal, $window, $location, $timeout, rootUrl, meetingStatus, $compile, eMacFactory, eMacDataFactory) {

        /* START PRIVATE VARIABLES */

        var base = rootUrl,
            grid = angular.element("#hgrid"),
            logActionUpdate = function (mtg_id) {
                var data = {
                    mtgUpdateStatusObj: {
                        mtg_id: mtg_id,
                        action: "Draft",
                        user_name: eMacFactory.User("data").user_name,
                        remarks: "Meeting created by " + eMacFactory.User("data").user_name,
                        status: "Draft"
                    }
                };
                eMacFactory.Save({
                    url: "api/Meeting/Save",
                    data: JSON.stringify(data)
                }).then(function () {
                    $timeout(function () {
                        eMacFactory.Loader.hide();
                    }, 1000);
                });
            },
            setYear = function () {
                var currYear = new Date().getFullYear(),
                    localStorageYear = parseInt(eMacFactory.LocalStorage.Get("eMac_MainGridParams").year),
                    yearSelection = typeof (eMacFactory.Config().yearFilter) == "string" ? JSON.parse(eMacFactory.Config().yearFilter) : eMacFactory.Config().yearFilter,
                    i_value = null;
                if (yearSelection.length > 1) {
                    angular.forEach(yearSelection, function (val, index) {
                        if (localStorageYear != undefined) {
                            if (val.year_created == localStorageYear) {
                                if (i_value == null) {
                                    i_value = val;
                                }
                            }
                        }
                        if (val.year_created == currYear) {
                            if (i_value == null) {
                                i_value = val;
                            }
                        }
                    });
                    return i_value;
                }
                else {
                    return yearSelection.length == 0 ? { year_created: new Date().getFullYear() } : yearSelection[0];
                }
            }

        /* END PRIVATE VARIABLES */
        
        $scope.$watch(function () { return eMacFactory.Config(); }, function (n, o) {
            if (Object.keys(n).length > 0) {
                $scope.models = angular.extend($scope.models, {
                    states: typeof (n.ctryList) == "string" ? JSON.parse(n.ctryList) : n.ctryList,
                    units: typeof (n.orgUnitList) == "string" ? JSON.parse(n.orgUnitList) : n.orgUnitList,
                    officers: typeof (n.officerList) == "string" ? JSON.parse(n.officerList) : n.officerList,
                    years: typeof (n.yearFilter) == "string" ? JSON.parse(n.yearFilter) : n.yearFilter,
                    selectedYear: setYear(),
                });
            }
        }, true);

        $scope.$watch(function () { return eMacFactory.User("data"); }, function (n, o) {
            
            var param = {
                year: eMacFactory.LocalStorage.Get("eMac_MainGridParams").year == "undefined" ? new Date().getFullYear() : eMacFactory.LocalStorage.Get("eMac_MainGridParams").year,
                divisionCode: eMacFactory.LocalStorage.Get("eMac_MainGridParams").meetingList == "mydivision" ? n.org_unit != undefined ? n.org_unit.substr(0, 3) : "" : "",
                unitCode: eMacFactory.LocalStorage.Get("eMac_MainGridParams").meetingList == "myunit" ? n.org_unit != undefined ? n.org_unit : "" : "",
                pageSize: Object.keys(eMacFactory.LocalStorage.Get("eMac_MainGridItems")).length > 0 ? eMacFactory.LocalStorage.Get("eMac_MainGridItems").count : 20
            };
            eMacDataFactory.eMacMainGridSource(param).then(function (result) {
                $scope.kendo.kendogrid.dataSource = result;
            });

        },true);
        
        $scope.$watch("kendo.kendogrid.elem", function (n, o) {
            if (n != undefined) {
                
                if (n.element != null) {
                    if (angular.element("#contextMenu").length > 0) {
                        angular.element("#contextMenu").remove();
                    }

                    var contextMenu = $("<div id='contextMenu'>").appendTo("body"),
                        elem = n;

                    $(contextMenu).gridContext({
                        width: "120px",
                        target: elem.element,
                        event: {
                            select: function (e) {
                                var grid = n,
                                contextMethodSelected = angular.element(e.item).find("span[data-method]").data("method");
                                if (contextMethodSelected == "Export") {
                                    Alert({
                                        caption: "Export grid",
                                        message: "Exporting grid to excel.",
                                        callback: function () {
                                            n.saveAsExcel();
                                        },
                                        type: "info"
                                    });
                                }
                                if (contextMethodSelected == "Print") {
                                    var gridElement = n.element,
                                            printableContent = "",
                                            win = window.open("", "", "width=800, height=500"),
                                            doc = win.document.open();

                                    var htmlStart =
                                            "<!DOCTYPE html>" +
                                            "<html>" +
                                            "<head>" +
                                            "<meta charset='utf-8' />" +
                                            "<title>Kendo UI Grid</title>" +
                                            "<link href='" + param.kendocommon + "' rel='stylesheet' /> " +
                                            "<style>" +
                                            "html { font: 11pt sans-serif; }" +
                                            ".k-grid { border-top-width: 0; }" +
                                            ".k-grid, .k-grid-content { height: auto !important; }" +
                                            ".k-grid-content { overflow: visible !important; }" +
                                            "div.k-grid table { table-layout: auto; width: 100% !important; }" +
                                            ".k-grid .k-grid-header th { border-top: 1px solid; }" +
                                            ".k-grid-toolbar, .k-grid-pager > .k-link { display: none; }" +
                                            "</style>" +
                                            "</head>" +
                                            "<body>";

                                    var htmlEnd =
                                            "</body>" +
                                            "</html>";

                                    var gridHeader = gridElement.children(".k-grid-header");
                                    if (gridHeader[0]) {
                                        var thead = gridHeader.find("thead").clone().addClass("k-grid-header");
                                        printableContent = gridElement
                                            .clone()
                                                .children(".k-grid-header").remove()
                                            .end()
                                                .children(".k-grid-content")
                                                    .find("table")
                                                        .first()
                                                            .children("tbody").before(thead)
                                                        .end()
                                                    .end()
                                                .end()
                                            .end()[0].outerHTML;
                                    } else {
                                        printableContent = gridElement.clone()[0].outerHTML;
                                    }

                                    doc.write(htmlStart + printableContent + htmlEnd);
                                    doc.close();
                                    win.print();
                                }
                                if (contextMethodSelected == "SaveGrid") {
                                    var grid = n,
                                        targetGrid = n.element.data("target"),
                                        targetGridOptions = grid.data("kendoGrid").getOptions(),
                                        oldState = eMacFactory.LocalStorage.Get(targetGrid);

                                    oldState.currentState = $.extend({}, {
                                        columns: targetGridOptions.columns,
                                        dataSource: {
                                            page: targetGridOptions.dataSource.page,
                                            filter: targetGridOptions.dataSource.filter,
                                            sort: targetGridOptions.dataSource.sort,
                                            transport: {
                                                read: targetGridOptions.dataSource.transport.read
                                            }
                                        }
                                    });

                                    eMacFactory.LocalStorage.Save(targetGrid, oldState);

                                    Alert({
                                        caption: "Save grid",
                                        message: "Grid state saved.",
                                        callback: function () {
                                            grid.setOptions(targetGridOptions);
                                            grid.refresh();
                                        },
                                        type: "info"
                                    });
                                }
                                if (contextMethodSelected == "ResetGrid") {
                                    var grid = n;
                                    eMacFactory.LocalStorage.Save(grid.data("target"), { currentState: {} });

                                    Alert({
                                        caption: "Grid reset.",
                                        message: "Grid state reset.",
                                        callback: function () {
                                            grid.data("kendoGrid").setOptions(eMacFactory.LocalStorage.Get(grid.data("target")).defaultState);
                                            grid.data("kendoGrid").refresh();
                                        },
                                        type: "info"
                                    });
                                }

                                $(".k-custom-context").data("kendoContextMenu").close(100, 100);
                            }
                        },
                        items: ["export", "print", "savegrid", "resetgrid"],
                        fontColor: "#1E7FB8"
                    });

                    $(window).resize(function () {
                        if (n.element != null) {
                            n.element.resizeGrid({
                                offset: 170,
                                minHeight: 480,
                                marginBottom: 0
                            });
                        }
                    });
                    $(window).trigger("resize");
                }
            }
        });

        $scope.$watch("models.unitFilter", function (n, o) {
            if (n != o) {
                if (n != undefined) {
                    eMacFactory.LocalStorage.Save("eMac_MainGridParams", { meetingList: n });

                    if (n != undefined || n != "") {
                        var parseFilter = n == "all" ? "" : eMacFactory.User("data").org_unit == undefined ? "" : eMacFactory.User("data").org_unit;

                        if (parseFilter != undefined && parseFilter != "") {
                            eMacDataFactory.eMacMainGridSource({
                                year: $scope.models.selectedYear.year_created,
                                divisionCode: n == "mydivision" ? parseFilter.substr(0, 3) : "",
                                unitCode: n == "myunit" ? parseFilter : ""
                            }).then(function (result) {
                                $scope.kendo.kendogrid.dataSource = result;
                                $scope.kendo.kendogrid.elem.refresh();
                            });
                        }
                        else {
                            eMacDataFactory.eMacMainGridSource({
                                year: $scope.models.selectedYear.year_created,
                                divisionCode: "",
                                unitCode: ""
                            }).then(function (result) {
                                $scope.kendo.kendogrid.dataSource = result;
                                $scope.kendo.kendogrid.elem.refresh();
                            });
                        }
                    }
                }
            }
        }, true);

        $scope.$watch("models.selectedYear", function (n, o) {
            if (n != o) {
                if (n != undefined) {
                    eMacFactory.LocalStorage.Save("eMac_MainGridParams", { year: n.year_created });

                    if ($scope.models.unitFilter != undefined || $scope.models.unitFilter != "") {
                        var parseFilter = $scope.models.unitFilter == "all" ? "" : eMacFactory.User("data").org_unit == undefined ? "" : eMacFactory.User("data").org_unit;
                        if (parseFilter != undefined && parseFilter != "") {
                            eMacDataFactory.eMacMainGridSource({
                                pageSize: eMacFactory.LocalStorage.Get("eMac_MainGridItems").count,
                                year: n.year_created,
                                divisionCode: parseFilter.substr(0, 3),
                                unitCode: parseFilter
                            }).then(function (result) {
                                $scope.kendo.kendogrid.dataSource = result;
                                $scope.kendo.kendogrid.elem.refresh();
                            });
                        }
                        else {
                            eMacDataFactory.eMacMainGridSource({
                                pageSize: eMacFactory.LocalStorage.Get("eMac_MainGridItems").count,
                                year: n.year_created,
                                divisionCode: "",
                                unitCode: ""
                            }).then(function (result) {
                                $scope.kendo.kendogrid.dataSource = result;
                                $scope.kendo.kendogrid.elem.refresh();
                            });
                        }
                    }
                }
            }
        }, true);

        $scope.$watch("models.newMeeting.start_date", function (n, o) {
            if (n != o) {
                if (n > $scope.models.newMeeting.end_date) {
                    $timeout(function () {
                        $scope.models.newMeeting.end_date = n;
                        $("#dateDurTo").focus();
                    });
                }
                else if (n <= $scope.models.newMeeting.end_date) {
                    $timeout(function () {
                        return;
                    });
                }
                else {
                    $timeout(function () {
                        $scope.models.newMeeting.end_date = n;
                    });
                }
            }

        });

        $scope.$watch("models.newMeeting.end_date", function (n, o) {
            if (n != o) {
                if (n < $scope.models.newMeeting.start_date) {
                    $timeout(function () {
                        $scope.models.newMeeting.end_date = $scope.models.newMeeting.start_date;
                    });
                }
            }
        });

        $scope.templates = {
            toolbar: angular.element("#toolbartemp").html(),
            temp: kendo.template(angular.element("#createTemp").html()),
            createToolbar: kendo.template($("#createToolbar").html())
        }

        $scope.kendo = {
            kendogrid: {
                pageable: {
                    refresh: true,
                    pageSizes: ["all", 20, 50, 100]
                },
                dataBound: function (e) {
                    if ($scope.kendo.kendogrid.dataSource != undefined && $scope.kendo.kendogrid.elem != undefined) {
                        var dropdown = $scope.kendo.kendogrid.elem.pager.element.find(".k-pager-sizes [data-role=dropdownlist]");
                        if ($scope.kendo.kendogrid.dataSource.pageSize() == 0) {
                            if ($scope.kendo.kendogrid.dataSource.total() != $scope.kendo.kendogrid.dataSource.pageSize()) {
                                $scope.kendo.kendogrid.elem.dataSource.pageSize($scope.kendo.kendogrid.dataSource.total());
                            }
                        }
                        dropdown.unbind("change");
                        dropdown.on("change", function (e) {
                            var a = $(e.target).data("kendoDropDownList").value();
                            eMacFactory.LocalStorage.Save("eMac_MainGridItems", { count: a != "all" ? parseInt(a) : 0 });
                        });
                    }
                }
            }
        }

        $scope.models = {
            unitFilterOptions: [{
                description: "All meetings",
                value: "all"
            },
            {
                description: "My division's meetings",
                value: "mydivision"
            },
            {
                description: "My unit's meetings",
                value: "myunit"
            }],
            unitFilter: eMacFactory.LocalStorage.Get("eMac_MainGridParams").meetingList
        },

        $scope.events = {
            create: function () {
                $scope.models.newMeeting = {};
                $scope.models.newMeeting.mtg_no = "NEW";
                $scope.models.newMeeting.status = meetingStatus.draft;
                var elem = angular.element("#newMtgForm")
                elem.on("shown.bs.modal", function () {
                    $(this).find("input[name=title]").focus();
                });
                elem.modal("show");
            },
            save: function (record) {
                $scope.$broadcast('show-errors-check-validity');

                if ($scope.kendo.kendogrid.dataSource.data().filter(function (data) {
                    return data.mtg_title == record.mtg_title;
                }).length > 0) {
                    toastr.warning("The meeting with this title already exists", "Duplicate");
                    return;
                }
                function DateFormat(a) {
                    return kendo.toString(new Date(a.value), a.format);
                }
                record.start_date.toJSON = kendo.toString(new Date(record.start_date), "DD MMM YYYY");//function () { return moment(this).format('DD MMM YYYY'); }
                record.end_date.toJSON = kendo.toString(new Date(record.end_date), "DD MMM YYYY");

                record.office_code = $scope.models.units.filter(function (data) {
                    return data.org_unit == record.unit;
                })[0].office_code;

                record.curr_user = eMacFactory.User("data").user_name;

                if ($scope.formEntry.$valid) {
                    eMacFactory.Save({
                        url: "api/Meeting/Save",
                        data: JSON.stringify(record)
                    }).then(function (done) {
                        if (done && done.mtg_id) {
                            $scope.events.reset();
                            toastr.success("Saving Success!", "Saved");
                            logActionUpdate(done.mtg_id);
                            grid.data("kendoGrid").dataSource.read();
                            grid.data("kendoGrid").refresh();
                        }
                        else {
                            toastr.error("An error occurred while saving your data.", "Failed.");
                        }
                    });
                }
                else {
                    toastr.error("There are invalid fields", "Failed.");
                }
            },
            reset: function () {
                $scope.$broadcast("show-errors-reset");
                $scope.models.newMeeting = {};
                $(".modal").modal("hide");
            },
            close: function (form, update) {
                $scope.models.newMeeting = angular.copy(update);
                $scope.form = form;
                if (form.$dirty) {
                    $scope.models.modal = $modal.open({
                        animation: true,
                        templateUrl: "close.html",
                        windowClass: "confirmClass",
                        scope: $scope
                    });
                }
                else {
                    $(".modal").modal("hide");
                }
            },
            viewGrid: function (e) {
                eMacFactory.LocalStorage.Save("eMac_MainGridParams", { year: new Date(e.dataItem.start_date).getFullYear() });
                eMacFactory.Loader.show();
                $scope.prepareObject = {};
                $location.path(base + "meetings/newedit/" + e.dataItem.mtg_id);
            },
            dblClick: function (e) {
                var data = grid.data("kendoGrid").dataSource.getByUid(angular.element(e.currentTarget).find("tr.k-state-selected").data("uid"));
                if (Object.keys(data).length > 0) {
                    eMacFactory.Loader.show();
                    eMacFactory.LocalStorage.Save("eMac_MainGridParams", { year: new Date(data.start_date).getFullYear() });
                    $location.url(base + "meetings/newedit/" + data.mtg_id);
                }
            },
            yes: function () {
                $scope.models.modal.dismiss("cancel");
                $(".modal").modal("hide");
            },
            no: function () {
                $scope.models.modal.dismiss("cancel");
            }
        }

        //$scope.selYear = {};
        //$scope.modal = {};
        //$scope.newStatus = meetingStatus.draft;
        //$scope.dataSource = mtgDataSource.dataSourceEmtpy;
        //var timeout = ($scope.currUserOrgUnit == undefined) ? 1250 : 0;


        ////----------------------------------------- TEMPLATES--------------------------------------
        //// grid toolbar
        //$scope.toolbarTemplate = $("#toolbartemp").html();
        //// modal template
        //$scope.tempTemplate = kendo.template($("#createTemp").html());
        //// modal form

        //$scope.kendoPageSizes = ["all", 20, 50, 100];
        //$scope.createtoolbarTemplate = kendo.template($("#createToolbar").html());
        //$scope.kendoPageable = { refresh: true, pageSizes: $scope.kendoPageSizes };

        //mtgFactory.showLoader(($scope.currUserOrgUnit == undefined));
        //$timeout(function () {
        //    mtgDataSource.gridParam({
        //        year: mtgFactory.iLocalStorage("eMac_MainGridParams").year == "undefined" ? new Date().getFullYear() : mtgFactory.iLocalStorage("eMac_MainGridParams").year,
        //        divisionCode: mtgFactory.iLocalStorage("eMac_MainGridParams").meetingList == "myunit" ? "" : $scope.currUserOrgUnit != undefined ? $scope.currUserOrgUnit.substr(0, 3) : "",
        //        unitCode: mtgFactory.iLocalStorage("eMac_MainGridParams").meetingList != "myunit" ? "" : $scope.currUserOrgUnit != undefined ? $scope.currUserOrgUnit : ""
        //    });
        //    $timeout(function () {
        //        $scope.dataSource = mtgDataSource.dataSource
        //        if (timeout == 0) {
        //            doRefreshGrid({
        //                year: gridParams.year,
        //                divisionCode: mtgFactory.iLocalStorage("eMac_MainGridParams").meetingList == "myunit" ? "" : $scope.currUserOrgUnit != undefined ? $scope.currUserOrgUnit.substr(0, 3) : "",
        //                unitCode: mtgFactory.iLocalStorage("eMac_MainGridParams").meetingList != "myunit" ? "" : $scope.currUserOrgUnit != undefined ? $scope.currUserOrgUnit : ""
        //            })
        //        }

        //    }, 250);

        //    $scope.myUnit = [
        //            {
        //                description: "All meetings",
        //                value: "all"
        //            },
        //            {
        //                description: "My division's meetings",
        //                value: "mydivision"
        //            },
        //            {
        //                description: "My unit's meetings",
        //                value: "myunit"
        //            }
        //    ];

        //    $scope.myUnits = mtgFactory.iLocalStorage("eMac_MainGridParams").meetingList;
        //    //--------------------------------------- CRUD functions---------------
        //    $scope.create = function (e) {
        //        // clear form here...
        //        $scope.newMtg = {};

        //        $scope.newMtg.mtg_no = "NEW";
        //        $scope.newMtg.status = meetingStatus.draft;
        //        $('#newMtgForm').on('shown.bs.modal', function () {
        //            $(this).find("input[name='title']").focus();
        //        });
        //        $('#newMtgForm').modal('show');

        //    }

        //    $scope.close = function (form, update) {
        //        $scope.newMtg = angular.copy(update);
        //        $scope.form = form;
        //        if (form.$dirty) {
        //            $scope.modal = $modal.open({
        //                animation: true,
        //                templateUrl: 'close.html',
        //                windowClass: 'confirmClass',
        //                scope: $scope
        //            });
        //        }
        //        else {
        //            $('.modal').modal('hide');
        //        }
        //    }

        //    // edit details
        //    $scope.details = function (e) {
        //        onClick(e, function (grid, row, dataItem) {
        //            $location.path('/meetings/edit/' + dataItem.shi_register_id);
        //        });
        //    }

        //    $scope.submit = function () {
        //        $scope.newMtg.status = "Submitted";
        //        $scope.save($scope.newMtg);
        //    }

        //    $scope.save = function (meeting) {
        //        $scope.$broadcast('show-errors-check-validity');

        //        var data = $("#hgrid").data("kendoGrid").dataSource.data();

        //        var duplicateRecord = data.filter(function (el) {
        //            return el.mtg_title == meeting.mtg_title;
        //        });

        //        if (duplicateRecord.length > 0) {
        //            toastr.warning('The meeting with this title already exists', 'Duplicate');

        //            return;
        //        }

        //        // parse elements
        //        //meeting.start_date = new Date(meeting.start_date);
        //        meeting.start_date.toJSON = function () { return moment(this).format('DD MMM YYYY'); }
        //        //var testdate = moment(meeting.start_date).format('DD MMM YYYY');
        //        meeting.end_date.toJSON = function () { return moment(this).format('DD MMM YYYY'); }

        //        //meeting ofc code
        //        meeting.office_code = $scope.units.filter(function (el) {
        //            return el.org_unit == meeting.unit;
        //        })[0].office_code;

        //        // meeting div code
        //        // meeting.div_code = meeting.unit.substr(0, 3);

        //        meeting.curr_user = $('#curr_user').text();
        //        if ($scope.formEntry.$valid) {
        //            // call to api save
        //            mtgFactory.save(meeting)
        //            .then(function (result) {
        //                if (result && result.mtg_id) {
        //                    $('#newMtgForm').modal('hide');

        //                    //alert('User saved');
        //                    $scope.reset();

        //                    toastr.success("Saving Success!", "Saved");

        //                    $('#hgrid').data('kendoGrid').refresh();
        //                    $('#hgrid').data('kendoGrid').dataSource.read();

        //                    // log action
        //                    saveLogAction(result.mtg_id);
        //                }
        //                else {
        //                    toastr.error("An error occurred while saving your data.", "Failed.");
        //                }
        //            });
        //        } else {
        //            alert("There are invalid fields");
        //        }
        //    }


        //    $scope.onDataBinding = function () {
        //        var dropdown = $("#hgrid").data("kendoGrid").pager.element.find(".k-pager-sizes [data-role=dropdownlist]");
        //        dropdown.on("change", function (e) {
        //            var a = $(e.target).data("kendoDropDownList").value();
        //            mtgDataSource.PageSizeAll($(e.target).data("kendoDropDownList").value() == "all");
        //            mtgFactory.iLocalStorageUpdate("eMac_MainGridItems", { count: a != "all" ? parseInt(a) : 0 });
        //        });

        //    }

        //    // save log action
        //    var saveLogAction = function (mtgId) {
        //        var jsonData = {
        //            mtgUpdateStatusObj: {
        //                mtg_id: mtgId,
        //                action: "Draft",
        //                user_name: $("#curr_user").text(),
        //                remarks: "Meeting created by " + $("#curr_user").text(),
        //                status: "Draft"
        //            }
        //        };
        //        // call to update
        //        mtgFactory.update(mtgId, jsonData)
        //            .then(function () {

        //                //toastr.success("Saving Success!", "Saved");

        //                // redirect back to home page
        //                setTimeout(function () {
        //                    mtgFactory.showLoader(false);
        //                    //removeOverlay();
        //                }, 2000);
        //            });
        //    }



        //    $scope.reset = function () {
        //        $scope.$broadcast('show-errors-reset');
        //        $scope.newMtg = { mtg_title: '', email: '', start_date: '', end_date: '' };
        //    }

        //    $scope.cancel = function () {
        //        $scope.modal.dismiss();
        //    }

        //    $scope.hide = function () {
        //        $scope.newMtg = {};
        //        $scope.reset();
        //        $scope.form.$setPristine();
        //        $scope.modal.dismiss();
        //        $('.modal').modal('hide');

        //    }
        //    $scope.resetForm = function () {
        //        $scope.save($scope.newMtg);
        //        $scope.form.$setPristine();
        //        $scope.reset();
        //        $scope.modal.dismiss();
        //        $('.modal').modal('hide');
        //    }

        //    $scope.showDetails = function (e) {
        //        //e.preventDefault();     

        //        mtgFactory.iLocalStorageUpdate("eMac_MainGridParams", { year: e.dataItem.start_date.getFullYear() });
        //        mtgFactory.showLoader(true);
        //        $scope.prepareObject = {};
        //        $location.path(base + 'meetings/newedit/' + e.dataItem.mtg_id);
        //    }

            //----------------------------- CONFIG DATA-----------------------------
            // get
            //$scope.states = [];
            //$scope.divisions = [];
            //$scope.units = [];
            //$scope.yearFilters = [];
            //$scope.officers = [];

            //libFactory.getData()
            //    .then(function (result) {
            //        if (typeof result == "string")
            //            result = JSON.parse(result);


            //        if (result !== null) {
            //            $scope.states = JSON.parse(result.ctryList);
            //            $scope.units = JSON.parse(result.orgUnitList);
            //            $scope.officers = JSON.parse(result.officerList);
            //            $scope.yearFilters = JSON.parse(result.yearFilter);
            //            $scope.selYear = findYear();
            //        }
            //    });

            //------------------------------ GRID EVENTS--------------


            
            //$scope.$watch("yearFilters", function (n, o) {
            //    if (n.length == 0) {
            //        if (n.length == o.length && o.length == 0) {
            //            $scope.yearFilters = [{ year_created: new Date().getFullYear() }];
            //        }
            //    }
            //});

            //$timeout(function () {

                

                
            //});

            //var doRefreshGrid = function (param) {
            //    var hGrid = $("#hgrid").data("kendoGrid");
            //    mtgDataSource.gridParam(param);
            //    mtgDataSource.PageSizeAll(hGrid.pager.element.find(".k-pager-sizes [data-role=dropdownlist]").data("kendoDropDownList").value() == "all");
            //    $('#hgrid').data('kendoGrid').dataSource.read({ all: mtgDataSource.PageSizeAll(), grid: "#hgrid" });
            //    $('#hgrid').data('kendoGrid').refresh();
            //}

            ////--------------------- WATCH ----------------------------
            //$scope.$watch('selYear', function (newValue, oldValue) {
            //    if (newValue != oldValue) {
            //        //$scope.dataHasChanged = angular.equals($scope.meeting, $scope.originalMtg);
            //        //mtgObjectChanged = !angular.equals(newValue, $scope.originalMtg);
            //        //mtgDataSource.dataSource.read();

            //        mtgFactory.iLocalStorageUpdate("eMac_MainGridParams", { year: newValue.year_created });

            //        var unitFilter = $scope.myUnits,
            //            gridParams = mtgFactory.iLocalStorage("eMac_MainGridParams");
            //        if (unitFilter != undefined || unitFilter != "") {
            //            var filter = unitFilter != "all" ? $scope.currUserOrgUnit == undefined ? "" : $scope.currUserOrgUnit : "";

            //            if (filter == "" || filter == undefined) {
            //                doRefreshGrid({ year: gridParams.year, divisionCode: "", unitCode: "" })

            //            }
            //            else {
            //                doRefreshGrid({ year: gridParams.year, divisionCode: newValue == "myunit" ? "" : filter.substr(0, 3), unitCode: newValue != "myunit" ? "" : filter });
            //            }
            //        }
            //    }
            //});

            //$scope.$watch("myUnits", function (newValue, oldValue) {
            //    if (newValue != undefined || newValue != "") {
            //        var filter = newValue != "all" ? $scope.currUserOrgUnit == undefined ? "" : $scope.currUserOrgUnit : "",

            //        gridParams = mtgFactory.iLocalStorage("eMac_MainGridParams");
            //        if (filter == "" || filter == undefined) {
            //            doRefreshGrid({ year: gridParams.year, divisionCode: "", unitCode: "" })
            //        }
            //        else {
            //            doRefreshGrid({ year: gridParams.year, divisionCode: newValue == "myunit" ? "" : filter.substr(0, 3), unitCode: newValue != "myunit" ? "" : filter });
            //        }
            //    }

            //});



            ///* My unit change */
            //$scope.myunitchange = function (e) {
            //    $scope.myUnits = e;

            //    mtgFactory.iLocalStorageUpdate("eMac_MainGridParams", { meetingList: e });

            //}



        //function findYear() {
        //    var currentYear = new Date().getFullYear();
        //    var currSelection = parseInt(mtgFactory.iLocalStorage("eMac_MainGridParams").year);

        //    if ($scope.yearFilters.length > 1) {
        //        for (i = 0; i < $scope.yearFilters.length; i++) {
        //            if (currSelection != null && typeof currSelection == 'number' && !isNaN(currSelection)) {
        //                if ($scope.yearFilters[i].year_created == currSelection)
        //                    return $scope.yearFilters[i];
        //            }
        //            else if ($scope.yearFilters[i].year_created == currentYear)
        //                return $scope.yearFilters[i];
        //        }
        //    }
        //    else { return $scope.yearFilters.length == 0 ? new Date().getFullYear() : $scope.yearFilters[0]; }
        //}


    }]);


//$("#hgrid").resizeGrid({
//    offset: 140,
//    minHeight: 480,
//    marginBottom: 20
//});


//$(window).resize(function () {
//    $("#hgrid").resizeGrid({
//        offset: 140,
//        minHeight: 480,
//        marginBottom: 20
//    });
//});

//var ModalInstanceCtrl = function ($scope, $modalInstance, key) {

//    alert("The key is " + key)

//    $scope.ok = function () {
//        $modalInstance.close($scope.selected.item);
//    };

//    $scope.cancel = function () {
//        $modalInstance.dismiss('cancel');
//    };

//};