eMacApp.controller('mtgsController',
    function (
        $scope,
        $modal,
        $rootScope,
        $window,
        $location,
        $timeout,
        UserRole,
        mtgDataSource,
        mtgFactory,
        libFactory,
        rootUrl,
        meetingStatus) {

        mtgFactory.showLoader(false);
        var base = rootUrl;
        //waitingDialog.hide();
        var grid = $("#hgrid");

        $scope.selYear = {};
        $scope.modal = {};
        $scope.newStatus = meetingStatus.draft;
        //$scope.addButtonEnable = true;
        //$scope.userRole = UserRole.getRole();

        ////init
        //if ($scope.userRole == "Admin") {
        //    $scope.addButtonEnable = true;     
        //}
        //else if ($scope.userRole == "Approver") {
        //    $scope.addButtonEnable = true;

        //}
        //else if ($scope.userRole == "Viewer") {
        //    $scope.addButtonEnable = false;
        //    //$scope.submitView = false;
        //    //$scope.approveRejectView = false;
        //    //$scope.populateShow = false;
        //}

        //mtgDataSource.filter({}); // reset filter on dataSource everytime view is loaded

        // main grid datasource
        $scope.dataSource = mtgDataSource;

        //----------------------------------------- TEMPLATES--------------------------------------

        // grid toolbar
        //$scope.toolbarTemplate = '<div><button kendo-button ng-click="showDetails(this)"><span class="k-icon k-i-tick"></span>Edit Details</button></div><div><button kendo-button ng-click="showDetails(this)"><span class="k-icon k-i-tick"></span>Edit Details</button></div>';
        //alert(kendo.template($("#toolbar").html().toString()));
        $scope.toolbarTemplate = $("#toolbartemp").html();
        // modal template
        $scope.tempTemplate = kendo.template($("#createTemp").html());
        // modal form
        $scope.createtoolbarTemplate = kendo.template($("#createToolbar").html());

        //--------------------------------------- CRUD functions---------------
        $scope.create = function (e) {
            // clear form here...
            $scope.newMtg = {};

            // get next available number
            //mtgFactory.getNextNumber()
            //    .then(function (result) {
            //        if (typeof result == "string")
            //            result = JSON.parse(result);


            //        $scope.newMtg.mtg_no = result[0].new_mtg_no;
            //        //meetingObjects = result;
            //        //$scope.updates = result;
            //        //grid.empty();
            //        //createGrid(result);
            //        //waitingDialog.hide();

            //    });

            $scope.newMtg.mtg_no = "NEW";
            $scope.newMtg.status = meetingStatus.draft;

            $('#newMtgForm').modal('show');

        }
        $scope.close = function (form, update) {
            $scope.newMtg = angular.copy(update);
            $scope.form = form;
            if (form.$dirty) {
                $scope.modal = $modal.open({
                    animation: true,
                    templateUrl: 'close.html',
                    windowClass: 'confirmClass',
                    scope: $scope
                });
            }
            else {
                $('.modal').modal('hide');
            }
        }

        $scope.editFunction = function (e) {
            if (!e.model.Id) {
                var popupWindow = e.container.getKendoWindow();
                popupWindow.setOptions({
                    width: 1000
                });
                popupWindow.center();

                $(".k-window .k-window-title").text("Add new meeting");
                $(".k-window .k-grid-update").html("<span class=\"k-icon k-update\"></span>Create");
                $(".k-edit-form-container").css("width", "100%");
                $(".k-popup-edit-form.k-window-content").css("overflow", "hidden");
            }
        }

        // edit details
        $scope.details = function (e) {
            onClick(e, function (grid, row, dataItem) {
                $location.url('/meetings/edit/' + dataItem.shi_register_id);
            });
        }

        $scope.submit = function () {
            $scope.newMtg.status = "Submitted";
            $scope.save($scope.newMtg);
        }

        //$scope.save = function (e) {
        //    onClick(e, function (grid) {
        //        grid.saveRow();
        //        //$(".toolbar").toggle();
        //    });
        //};
        $scope.save = function (meeting) {

            $scope.$broadcast('show-errors-check-validity');

            // parse elements
            //meeting.start_date = new Date(meeting.start_date);
            meeting.start_date.toJSON = function () { return moment(this).format('DD MMM YYYY'); }
            //var testdate = moment(meeting.start_date).format('DD MMM YYYY');
            meeting.end_date.toJSON = function () { return moment(this).format('DD MMM YYYY'); }

            meeting.curr_user = $('#curr_user').text();
            if ($scope.formEntry.$valid) {
                // call to api save
                mtgFactory.save(meeting)
                .then(function (result) {
                    toastr.success("Saving Success!", "Saved");
                    //if (typeof result == "string")
                    //    result = JSON.parse(result);
                    $('#hgrid').data('kendoGrid').refresh();
                    $('#hgrid').data('kendoGrid').dataSource.read();
                    //grid.empty();

                    //$scope.dataSource = mtgDataSource;

                    // log action
                    if (result && result.mtg_id) {
                        saveLogAction(result.mtg_id);
                    }

                });

                $('#newMtgForm').modal('hide');

                //alert('User saved');
                $scope.reset();
            } else {
                alert("There are invalid fields");
            }
        }

        // save log action
        var saveLogAction = function (mtgId) {
            var actionObject = {};
            var jsonData = {};

            actionObject.mtg_id = mtgId;            
            actionObject.action = "Draft";
            actionObject.action_by = $('#curr_user').text();           
            actionObject.remarks = "Meeting created by " + $('#curr_user').text();
            actionObject.status = "Draft";

            jsonData['mtgActionObj'] = actionObject;

            // call to update
            mtgFactory.update(mtgId, jsonData)
                .then(function () {

                    //toastr.success("Saving Success!", "Saved");

                    // redirect back to home page
                    $timeout(function () {
                        mtgFactory.showLoader(false);
                    });
                });
        }

        $scope.reset = function () {
            $scope.$broadcast('show-errors-reset');
            $scope.newMtg = { mtg_title: '', email: '', start_date: '', end_date: '' };
        }

        $scope.cancel = function () {
            $scope.modal.dismiss();
        }
        $scope.hide = function () {
            $scope.newMtg = {};
            $scope.reset();
            $scope.form.$setPristine();
            $scope.modal.dismiss();
            $('.modal').modal('hide');

        }
        $scope.resetForm = function () {
            $scope.save($scope.newMtg);
            $scope.form.$setPristine();
            $scope.reset();
            $scope.modal.dismiss();
            $('.modal').modal('hide');
        }

        $scope.showDetails = function (e) {
            //e.preventDefault();     

            mtgFactory.iLocalStorageUpdate("eMac_MainGridParams", { year: e.dataItem.start_date.getFullYear() });

            //var dataItem = this.grid.dataItem($($event.srcElement).closest("tr"));
            //waitingDialog.show();
            //$location.url(base + 'meetings/newedit/' + e.dataItem.mtg_id);
            mtgFactory.showLoader(true); 
            setTimeout(function () {
                $location.url(base + 'meetings/newedit/' + e.dataItem.mtg_id);
                $scope.$apply();
            }, 2000);



        }

        $scope.showDetails2 = function (e) {
            //e.preventDefault();

            //var grid = $("#hgrid").data("kendoGrid");

            //alert('hi');
            //var currentDataItem = grid.dataItem($(this));

            //var dataItem = this.grid.dataItem($(e.srcElement).closest("tr"));
            //waitingDialog.show();
            //$location.url(base + 'meetings/newedit/' + e.dataItem.mtg_id);
            mtgFactory.showLoader(true); 
            //setTimeout(function () {
            //    $location.url(base + 'meetings/newedit/' + e.dataItem.mtg_id);
            //    $scope.$apply();
            //}, 2000);



        }

        //----------------------------- CONFIG DATA-----------------------------
        // get
        $scope.states = [];
        $scope.divisions = [];
        $scope.units = [];
        $scope.yearFilters = [];
        $scope.officers = [];

        libFactory.getData()
            .then(function (result) {
                if (typeof result == "string")
                    result = JSON.parse(result);


                if (result !== null) {
                    $scope.states = JSON.parse(result.ctryList);
                    $scope.units = JSON.parse(result.orgUnitList);
                    $scope.officers = JSON.parse(result.officerList);
                    $scope.yearFilters = JSON.parse(result.yearFilter);
                    $scope.selYear = findYear();
                    //$scope.classifications = JSON.parse(result.mtgClassList);
                    //$scope.types = JSON.parse(result.mtgTypeList);
                }
            });


        //------------------------------ GRID EVENTS--------------

        // grid events
        $("#hgrid").on("dblclick", "tr.k-state-selected", function () {
            mtgFactory.showLoader(true); 
            var grid = $("#hgrid").data("kendoGrid");

            //alert('hi');
            var currentDataItem = grid.dataItem($(this));

            localStorage["yearSelected"] = currentDataItem.start_date.getFullYear();

            $location.url(base + 'meetings/newedit/' + currentDataItem.mtg_id);
            $scope.$apply();

            //setTimeout(function () {
            //    $location.url(base + 'meetings/newedit/' + currentDataItem.mtg_id);
            //    $scope.$apply();
            //}, 1000);
        });

        var x = $("<div id='contextMenu'>");
        var elem = $("#hgrid");

        x.appendTo("body");
        $(x).gridContext({
            width: "120px",
            target: "#hgrid",
            event: {
                select: function (e) {
                    var grid = $("#hgrid"),
                    contextMethodSelected = $(e.item).find("span[data-method]").data("method");
                    if (contextMethodSelected == "Export") {
                        Alert({
                            caption: "Export grid",
                            message: "Exporting grid to excel.",
                            callback: function () {
                                grid.data("kendoGrid").saveAsExcel();
                            },
                            type: "info"
                        });
                    }
                    if (contextMethodSelected == "Print") {
                        var gridElement = $(elem),
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
                        var grid = $(elem),
                            targetGrid = grid.data("target"),
                            targetGridOptions = grid.data("kendoGrid").getOptions();

                        localStorage[targetGrid] = JSON.stringify({
                            columns: targetGridOptions.columns,
                            dataSource: {
                                pageSize: targetGridOptions.dataSource.pageSize,
                                page: targetGridOptions.dataSource.page,
                                filter: targetGridOptions.dataSource.filter,
                                transport: {
                                    read: {
                                        data: targetGridOptions.dataSource.transport != undefined ? targetGridOptions.dataSource.transport.read.data : undefined
                                    }
                                }

                            }
                        });
                        Alert({
                            caption: "Save grid",
                            message: "Grid state saved.",
                            callback: function () {
                                grid.data("kendoGrid").setOptions(targetGridOptions);
                                grid.data("kendoGrid").refresh();
                            },
                            type: "info"
                        });
                    }
                    if (contextMethodSelected == "ResetGrid") {
                        var grid = $(elem),
                        targetGrid = grid.data("target");
                        localStorage.removeItem(targetGrid);
                        Alert({
                            caption: "Grid reset.",
                            message: "Grid state reset.",
                            callback: function () {
                                grid.data("kendoGrid").setOptions(JSON.parse(localStorage["LOCAL"]));
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


        $scope.onDataBound = function (e) {
            var gridOptions = $("#hgrid").data("kendoGrid").getOptions();
            // SAVE ONLY THE STANDARD SETTINGS
            localStorage["LOCAL"] = JSON.stringify({
                columns: gridOptions.columns,
                dataSource: {
                    pageSize: gridOptions.dataSource.pageSize,
                    page: gridOptions.dataSource.page,

                    //transport: {
                    //    read: {
                    //        data: gridOptions.dataSource.transport != undefined ? gridOptions.dataSource.transport.read.data : undefined
                    //    }
                    //}

                }
            });
        };

        //------------------------------OTHER FX-----------------------------------------

        // other function
        function findYear() {
            var currentYear = new Date().getFullYear();
            var currSelection = parseInt(localStorage["yearSelected"]);

            for (i = 0; i < $scope.yearFilters.length; i++) {
                if (currSelection != null && typeof currSelection == 'number' && !isNaN(currSelection)) {
                    if ($scope.yearFilters[i].year_created == currSelection)
                        return $scope.yearFilters[i];
                }
                else if ($scope.yearFilters[i].year_created == currentYear)
                    return $scope.yearFilters[i];
            }
        }

        // fix modal
        $('.modal').modal({
            show: false,
            backdrop: 'static',
            keyboard: false
        });

        /* center modal */
        function centerModals($element) {
            var $modals;
            if ($element.length) {
                $modals = $element;
            } else {
                $modals = $('.modal-vcenter:visible');
            }
            $modals.each(function (i) {
                var $clone = $(this).clone().css('display', 'block').appendTo('body');
                var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
                top = top > 0 ? top : 0;
                $clone.remove();
                $(this).find('.modal-content').css("margin-top", top);
            });
        }
        $('.modal-vcenter').on('show.bs.modal', function (e) {
            centerModals($(this));
        });
        $(window).on('resize', centerModals);

        var onClick = function (event, delegate) {
            var grid = event.grid;
            var selectedRow = grid.select();
            var dataItem = grid.dataItem(selectedRow);

            if (selectedRow.length > 0) {
                delegate(grid, selectedRow, dataItem);
            }
            else {
                alert("Please select a row.");
            }
        };

        function createGrid() {
            var grid = $("#hgrid").kendoGrid({
                dataSource: mtgDataSource
            }).data("kendoGrid");
            //grid.destroy();
            //$scope.dataSource = mtgDataSource;
        };

        //--------------------- WATCH ----------------------------
        $scope.$watch('selYear', function (newValue, oldValue) {
            if (newValue != oldValue) {
                //$scope.dataHasChanged = angular.equals($scope.meeting, $scope.originalMtg);
                //mtgObjectChanged = !angular.equals(newValue, $scope.originalMtg);
                //mtgDataSource.dataSource.read();

                localStorage["yearSelected"] = newValue.year_created;

                $('#hgrid').data('kendoGrid').refresh();
                $('#hgrid').data('kendoGrid').dataSource.read(newValue);

                //createGrid();
            }




            //function (e) {
            //$scope.hasSelected = false;
            //$scope.selected = {};
            //$scope.entry = {};
            //$scope.entry.status = "Approved";
            //var funcName = "SituationUpdList";
            //changeList(funcName, e.situation_year);
            //$('#hgrid').data('kendoGrid').refresh();
            //$('#hgrid').data('kendoGrid').dataSource.read();
        });

        $scope.$watch('newMtg.end_date', function (newValue, oldValue) {
            if (newValue != oldValue) {
                if (newValue < $scope.newMtg.start_date) {
                    //alert('end date should be not less than start date');

                    //$scope.newMtg.end_date = undefined;
                    //$scope.$digest();
                    //$scope.$apply(function () {
                    //    $scope.newMtg.end_date = undefined;
                    //});
                    $timeout(function () {
                        // Any code in here will automatically have an $scope.apply() run afterwards
                        $scope.newMtg.end_date = undefined;
                        // And it just works!
                    });
                }
            }
        });
    });

var ModalInstanceCtrl = function ($scope, $modalInstance, key) {

    alert("The key is " + key)

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};