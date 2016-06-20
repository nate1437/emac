eMacApp.controller('mtgsEditController',
    ["$scope", "$document", "$routeParams", "$window", "$location", "$filter", "$timeout", "UserRole", "UserData", "mtgDataSource", "mtgFactory", "libFactory", "configData", "rootUrl", "meetingStatus", "$modal", "$compile", "eMacFactory",
    function ($scope, $document, $routeParams, $window, $location, $filter, $timeout, UserRole, UserData, mtgDataSource, mtgFactory, libFactory, configData, rootUrl, meetingStatus, $modal, $compile, eMacFactory) {

        $scope.dirtyModels = [];
        eMacFactory.Get({
            url: "api/Meeting/MeetingDetails?mtg_id=" + $routeParams.id
        }).then(function(result){
            if (result != undefined) {
                if (result.op) {
                    angular.forEach(result.value, function (val, key) {
                        if (val.length > 1) {
                            $scope.models[key] = val;
                        }
                        else {
                            $scope.models[key] = val.length == 0 ? {} : val[0];
                        }
                    });
                }
                else {
                    console.log(result.value);
                }
            }
        });
        
        $scope.$watch("models.meeting", function (n, o) {
            if (n != undefined) {
                if (Object.keys(n).length > 0) {
                    $scope.models.meeting.date_updated = kendo.toString(new Date(n.date_updated), "dd MMM yyyy h:mm:ss tt");
                    $scope.models.meeting.start_date = kendo.toString(new Date(n.start_date), "dd MMM yyyy");
                    $scope.models.meeting.end_date = kendo.toString(new Date(n.end_date), "dd MMM yyyy");
                    $scope.models.meetingOld = angular.copy($scope.models.meeting);
                }
                if (n != o) {
                    if ($scope.dirtyModels.indexOf("meeting") == -1) {
                        $scope.dirtyModels.push("meeting");
                        $scope.models.isAccessible = ($filter("limitTo")($scope.models.meeting.org_unit, 3, 0) != $filter("limitTo")(eMacFactory.User("data").org_unit, 3, 0));
                    }
                }
            }
        }, true);
        
        $scope.kendo = {
            dataSources: {
                //participantGrid: 
            }
        }

        $scope.$watch(function () {
            return eMacFactory.Config();
        }, function (n, o) {
            if (Object.keys(n).length > 0) {
                $scope.models = angular.extend($scope.models, {
                    states: JSON.parse(n.ctryList),
                    units: JSON.parse(n.orgUnitList),
                    officers: JSON.parse(n.officerList),
                    classifications: JSON.parse(n.mtgClassList),
                    types: JSON.parse(n.mtgTypeList),
                    corefx: JSON.parse(n.coreFunctionList),
                    resolutionTypes: JSON.parse(n.resolutionTypeList),
                    participantFundSrcs: JSON.parse(n.participantFundSrcList),
                    pbCategoriesList: JSON.parse(n.pbCategoryList),
                    pbOutcomesList: JSON.parse(n.pbOutcomeList),
                    pbOutputList: JSON.parse(n.pbOutputList),
                    defaultEndNotes: JSON.parse(n.end_notes_default)
                });
            }
            else {
                eMacFactory.Get({
                    url: "api/Library/List"
                }).then(function (result) {
                    if (result != undefined) {
                        eMacFactory.Config(result);
                    }
                });
            }
        });

        $scope.events = {
            confirmDelete: {
                click: function () {
                    $scope.modal = $modal.open({
                        animation: true,
                        templateUrl: "delete-confirm.html",
                        windowClass: "confirmClass",
                        scope: $scope,
                    });
                },
                yes: function () {
                    eMacFactory.Loader.show();
                    eMacFactory.Save({
                        url: "api/Meeting/Delete",
                        data: JSON.stringify({ mtg_id: $scope.meeting.mtg_id })
                    }).then(function (result) {
                        if (result.op) {
                            toastr.success("Deleted successfully.", "Delete");
                            $timeout(function () {
                                eMacFactory.Loader.show();
                                $location.url(base);
                            }, 200);
                        }
                        else {
                            toastr.success(result.result, "Delete");
                            eMacFactory.Loader.hide();
                        }
                    });
                },
                no: function () {
                    $scope.modal.dismiss();
                }
            }

        }
        // constants
        var base = rootUrl;
        var mtgId = parseInt($routeParams.id);

        // instantiate variables
        $scope.mtgId = mtgId;
        $scope.meeting = {};
        var meetingObject = {};
        var meetingDetailObject = {};
        var ctryParticipantObject = [];
        var linkagesResolutionsObject = [];
        var relatedMeetingsObject = [];
        var meetingBudgetObject = [];
        var coreFunctionObject = [];
        var mtgPbCategoryObject = [];
        var mtgPbOutcomeObject = [];
        var mtgPbOutputObject = [];
        var mtgReportObject = [];
        var mtgCoreFxObject = [];

        var mtgObjectChanged = false;
        var mtgDetailObjectChanged = false;
        var logAction = false;
        var end_note_defaults = [];
        $scope.end_note_final = [];
        $scope.editorZoomValue = "";
        $scope.tabset = Object.keys(mtgFactory.iLocalStorage("eMac_TabSet")).length == 0 ? {} : mtgFactory.iLocalStorage("eMac_TabSet");
        $scope.editorClose = function () {
            $scope.editorZoomValue = "";
            $scope.modal.dismiss();
        }

        var parseEndNote = function (arrEndNote) {
            var endNote = "";
            if (arrEndNote.type == "final") {
                angular.forEach(arrEndNote.note, function (val, index) {
                    endNote += "sup=" + val.orderNo + ";param=" + val.parameter + ";value=" + val.value + "$";
                });
            }
            if (arrEndNote.type == "initial") {
                angular.forEach(arrEndNote.note, function (val, index) {
                    endNote += "<sup>" + val.orderNo + "</sup>" + val.value + "<br />";
                });
            }
            if (arrEndNote.type == "retrieve") {
                angular.forEach(arrEndNote.note.split("$"), function (val, index) {
                    try {
                        if (val != undefined && val != "") {
                            var s = val.split(";");
                            endNote += "<sup>" + s[0].toString().split("=")[1] + "</sup>" + s[2].toString().split("=")[1] + "<br />";
                        }
                    }
                    catch (e) {
                        endNote = arrEndNote.note;
                    }
                });
            }
            return endNote;
        }



        var findParamter = function (nValue) {
            var paramAddress = "";
            $.each(end_note_defaults, function (index, value) {
                if (value.value == nValue) {
                    paramAddress = value.parameter;
                }
            });
            return paramAddress;
        }

        var wordCounter = function (strArr) {
            var counter = 0;
            angular.forEach(strArr, function (value, index) {
                counter += (value.trim().length > 0) ? 1 : 0;
            });
            return counter;
        };

        $scope.states = [];
        $scope.divisions = [];
        $scope.units = [];
        $scope.officers = [];
        $scope.types = [];
        $scope.classifications = [];
        $scope.corefx = [];
        $scope.resolutionTypes = [];
        $scope.participantFundSrcs = [];
        $scope.pbCategoriesList = [];
        $scope.pbOutcomesList = [];
        $scope.pbOutputsList = [];

        // temp del records
        $scope.delParticipantRecords = [];
        $scope.delResolutionRecords = [];
        $scope.delRelatedMtgRecords = [];
        $scope.deletedMtgBudget = [];
        $scope.wordCountBackground = 0;
        $scope.wordCountSummary = 0;

        // get config data
        var configDataObj = configData.getData();
        if (configDataObj != null) {
            var result = JSON.parse(configDataObj);
            $scope.states = JSON.parse(result.ctryList);
            $scope.units = JSON.parse(result.orgUnitList);
            $scope.officers = JSON.parse(result.officerList);
            $scope.classifications = JSON.parse(result.mtgClassList);
            $scope.types = JSON.parse(result.mtgTypeList);
            $scope.corefx = JSON.parse(result.coreFunctionList);
            $scope.resolutionTypes = JSON.parse(result.resolutionTypeList);
            $scope.participantFundSrcs = JSON.parse(result.participantFundSrcList);
            $scope.pbCategoriesList = JSON.parse(result.pbCategoryList);
            $scope.pbOutcomesList = JSON.parse(result.pbOutcomeList);
            $scope.pbOutputsList = JSON.parse(result.pbOutputList);
            end_note_defaults = JSON.parse(result.end_notes_default);
        }
        else
            libFactory.getData()
            .then(function (result) {
                if (typeof result == "string") {
                    configData.setData(result);
                    result = JSON.parse(result);
                }
                if (result !== null) {
                    $scope.states = JSON.parse(result.ctryList);
                    $scope.units = JSON.parse(result.orgUnitList);
                    $scope.officers = JSON.parse(result.officerList);
                    $scope.classifications = JSON.parse(result.mtgClassList);
                    $scope.types = JSON.parse(result.mtgTypeList);
                    $scope.corefx = JSON.parse(result.coreFunctionList);
                    $scope.resolutionTypes = JSON.parse(result.resolutionTypeList);
                    $scope.participantFundSrcs = JSON.parse(result.participantFundSrcList);
                    $scope.pbCategoriesList = JSON.parse(result.pbCategoryList);
                    $scope.pbOutcomesList = JSON.parse(result.pbOutcomeList);
                    $scope.pbOutputsList = JSON.parse(result.pbOutputList);
                    end_note_defaults = JSON.parse(result.end_notes_default);
                }
            });

        displayOverlay()

        // get detail
        getMtgDetail(mtgId, true);

        // watch changes
        $scope.$watch('meeting', function (newValue, oldValue) {

            if (newValue != oldValue) {
                //$scope.dataHasChanged = angular.equals($scope.meeting, $scope.originalMtg);
                mtgObjectChanged = !angular.equals(newValue, $scope.originalMtg);
                if (newValue != undefined) {
                    $scope.isAccessible = ($filter("limitTo")($scope.meeting.org_unit, 3, 0) != $filter("limitTo")($scope.currUserOrgUnit, 3, 0));
                }

            }


        }, true);

        $scope.$watchCollection("tabset", function (n, o) {
            var isFinalized = function () {

                if ($scope.meeting.status != "Finalized" && n.mtg_report) {
                    n.mtg_report = false;
                    n.attachments = true;
                }
            }
            isFinalized();
            if (n != o) {
                mtgFactory.iLocalStorageUpdate("eMac_TabSet", n);
            }

        });

        angular.element("#mtgTitle").focus();

        $scope.$watch('meetingDetail', function (newValue, oldValue) {


            if (newValue != oldValue) {
                //$scope.dataHasChanged = angular.equals($scope.meeting, $scope.originalMtg);
                mtgDetailObjectChanged = !angular.equals(newValue, $scope.originalMtgDetail);
                /*
                
                var bgInfo = $("<div>").append(newValue.background_info).text().trim(),
                    summaryInfo = $("<div>").append(newValue.summary).text().trim();
                if (bgInfo.trim().length > 0) {
                    $scope.wordCountBackground = wordCounter(bgInfo.split(' '));
                }
                if (summaryInfo.trim().length > 0) {
                    $scope.wordCountSummary = wordCounter(summaryInfo.split(' '));
                }
                */
                if (newValue.end_notes != null && newValue.end_notes != undefined) {
                    if (!(newValue.end_notes.split("$").length > 1)) {
                        $scope.end_note_final = [];
                        $(newValue.end_notes).each(function (index, value) {
                            if (typeof (value) == "object") {
                                if (value.tagName == "SUP") {
                                    $scope.end_note_final.push({
                                        orderNo: value.textContent,
                                        value: $(newValue.end_notes)[index + 1].textContent.trim(),
                                        parameter: findParamter($(newValue.end_notes)[index + 1].textContent.trim())
                                    });
                                }
                            }
                        });
                    }
                }
            }
        }, true);

        $scope.$watch('meeting.mtg_classification', function (newValue, oldValue) {
            if (newValue != oldValue) {
                //$scope.dataHasChanged = angular.equals($scope.meeting, $scope.originalMtg);
                //mtgObjectChanged = !angular.equals(newValue, $scope.originalMtg);
                //alert(newValue);
                if (newValue == 6 || newValue == 8) {
                    $scope.meeting.needs_final_report = false;
                }
                else
                    $scope.meeting.needs_final_report = true;
            }
        }, true);




        $scope.$watch('meeting.start_date', function (newValue, oldValue) {

            if (newValue != oldValue) {
                if (new Date(newValue) != "Invalid Date") {
                    if (new Date(newValue) > new Date($scope.meeting.end_date)) {
                        //alert('end date should be not less than start date');

                        //$scope.newMtg.end_date = undefined;
                        //$scope.$digest();
                        //$scope.$apply(function () {
                        //    $scope.newMtg.end_date = undefined;
                        //});
                        $timeout(function () {
                            // Any code in here will automatically have an $scope.apply() run afterwards
                            $scope.meeting.end_date = newValue;
                            // And it just works!

                            $('#mtg-end-date').focus();
                        });
                    }
                }
            }
        });
        $scope.$watch('meeting.end_date', function (newValue, oldValue) {


            if (newValue != oldValue) {
                if (new Date(newValue) != "Invalid Date") {
                    if (new Date(newValue) > new Date($scope.meeting.start_date)) {
                        //alert('end date should be not less than start date');

                        //$scope.newMtg.end_date = undefined;
                        //$scope.$digest();
                        //$scope.$apply(function () {
                        //    $scope.newMtg.end_date = undefined;
                        //});
                        $timeout(function () {
                            // Any code in here will automatically have an $scope.apply() run afterwards
                            $scope.meeting.end_date = newValue;
                            // And it just works!
                        });
                    }
                }
            }
        });

        // print 
        $scope.print = function () {
            var path = '';
            if (window.location.host.indexOf('localhost') >= 0) {
                path = window.location.protocol + '//' + window.location.host;
            } else {
                path = window.location.protocol + '//' + window.location.host + window.location.pathname;
            }
            var url = path + "/Reports/PlanningDocument?emac_id=" + mtgId;


            $window.open(base + "Reports/PlanningDocument?emac_id=" + mtgId);

            //window.open(url, '_blank');
            return false;
        }

        // SAVE ALL CHANGES
        $scope.confirmSave = function () {
            $scope.modal = $modal.open({
                animation: true,
                templateUrl: "detail-save.html",
                windowClass: "confirmClass",
                scope: $scope,
            });
        }

        $scope.save = function () {
            debugger;
            mtgFactory.showLoader(true);
            //displayOverlay();
            //$('#newMtgForm').modal('show');
            var jsonData = {};

            // get current user
            var curr_user = $('#curr_user').text();
            jsonData['curr_user'] = curr_user;

            // check if object changed
            if (mtgObjectChanged) {
                // update mtgobject
                $scope.meeting.updated_by = curr_user;
                // dates
                if ($scope.meeting.start_date && $scope.meeting.start_date !== '') {
                    var newDate = kendo.parseDate($scope.meeting.start_date, 'dd/MM/yyyy');
                    if (newDate)
                        $scope.meeting.start_date = kendo.toString(kendo.parseDate($scope.meeting.start_date, 'dd/MM/yyyy'), 'dd MMM yyyy');
                }

                if ($scope.meeting.end_date !== null && $scope.meeting.end_date !== '') {
                    var newDate = kendo.parseDate($scope.meeting.end_date, 'dd/MM/yyyy');
                    if (newDate)
                        $scope.meeting.end_date = kendo.toString(kendo.parseDate($scope.meeting.end_date, 'dd/MM/yyyy'), 'dd MMM yyyy');
                }

                if ($scope.meeting.spmc_approval_date !== null && $scope.meeting.spmc_approval_date !== '') {
                    var newDate = kendo.parseDate($scope.meeting.end_date, 'dd/MM/yyyy');
                    if (newDate)
                        $scope.meeting.spmc_approval_date = kendo.toString(kendo.parseDate($scope.meeting.spmc_approval_date, 'dd/MM/yyyy'), 'dd MMM yyyy');
                }

                // check meeting classification
                if ($scope.meeting.mtg_classification == 6 || $scope.meeting.mtg_classification == 8)
                    $scope.meeting.needs_final_report = false;

                //meeting ofc code
                $scope.meeting.office_code = $scope.units.filter(function (el) {
                    return el.org_unit == $scope.meeting.org_unit;
                })[0].office_code;

                $scope.meeting.user_name = curr_user;

                jsonData['mtgObj'] = $scope.meeting;
            }
            if (mtgDetailObjectChanged) {
                // update mtgobject
                if ($scope.meetingDetail.planning_mtg_date !== null && $scope.meetingDetail.planning_mtg_date !== '') {
                    var newDate = kendo.parseDate($scope.meetingDetail.planning_mtg_date, 'dd/MM/yyyy');
                    if (newDate)
                        $scope.meetingDetail.planning_mtg_date = kendo.toString(kendo.parseDate($scope.meetingDetail.planning_mtg_date, 'dd/MM/yyyy'), 'dd MMM yyyy');
                }

                $scope.meetingDetail.updated_by = curr_user;
                $scope.meetingDetail.user_name = curr_user;
                $scope.meetingDetail.end_notes_final = parseEndNote({ note: $scope.end_note_final, type: "final" });

                jsonData['mtgDetailObj'] = $scope.meetingDetail;
            }

            // insert action
            if (logAction) {
                jsonData.mtgUpdateStatusObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: $scope.meeting.status,
                    user_name: curr_user,
                    remarks: "Status changed to " + "\'" + $scope.meeting.status + "\' by " + curr_user,
                    status: $scope.meeting.status
                }

                /*actionObject.mtg_id = $scope.meeting.mtg_id;
                actionObject.action = $scope.meeting.status;
                actionObject.action_by = curr_user;
                actionObject.remarks = "Status changed to " + "\'" + $scope.meeting.status + "\' by " + curr_user;
                actionObject.status = $scope.meeting.status;

                jsonData['mtgActionObj'] = actionObject;*/
            }
            else {
                if (mtgDetailObjectChanged || mtgObjectChanged) {
                    jsonData.mtgActionOnlyObj = {
                        mtg_id: $scope.meeting.mtg_id,
                        action: "Update Meeting",
                        action_by: curr_user,
                        remarks: "Meeting details updated by " + curr_user
                    };
                }
            }

            var data = $("#participant-ib2").data("kendoGrid").dataSource.data();
            var dirty = $.grep(data, function (item) {
                return item.dirty
            });
            var participantGridObject = dirty;

            // get new participant records
            var newPrecords = participantGridObject.filter(function (el) {
                return el.mtg_participant_ctry_id == "" && el.mtg_id === 0;
            });
            if (newPrecords.length > 0) {
                angular.forEach(newPrecords, function (value, index) {
                    if (value.ctry_code.trim().length > 0 && value.ctry_name.trim().length > 0) {

                        value.mtg_participant_ctry_id = 0;
                        value.user_name = curr_user;
                        newPrecords[index] = value;
                    }
                });
                //for (var i = 0; i < newPrecords.length; i++) {
                //    newPrecords[i].mtg_participant_ctry_id = 0;
                //    newPrecords[i].user_name = curr_user;
                //}

                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
                jsonData['newParticipants'] = newPrecords;
            }
            // get participant records
            var updatedPrecords = participantGridObject.filter(function (el) {
                return el.dirty == true && el.mtg_participant_ctry_id != '';
            });
            if (updatedPrecords.length > 0)
                jsonData['modParticipants'] = updatedPrecords;
            // get del participant records
            var delPrecords = $scope.delParticipantRecords.filter(function (el, i, a) {
                return (el.mtg_participant_ctry_id > 0) && (i == a.indexOf(el))
            });
            if (delPrecords.length > 0) {
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
                jsonData['delParticipants'] = delPrecords;
            }

            // linkages to resolutions
            // get resolutions list
            var linkagesGrid = $("#resgrid").data("kendoGrid");
            var currentLinkages = linkagesGrid.dataSource.data();

            // get new linkages records
            var newLinkRecords = currentLinkages.filter(function (el) {
                return el.id == 0;
            });
            if (newLinkRecords.length > 0) {
                jsonData['newLinkages'] = newLinkRecords;
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }
            // get modified linkages records
            var updatedLinkRecords = currentLinkages.filter(function (el) {
                return el.is_modified == true && el.mtg_linkages_resolution_id != 0;
            });
            if (updatedLinkRecords.length > 0) {
                jsonData['modLinkages'] = updatedLinkRecords;

                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }

            // get del linkages records
            var delLinkRecords = $scope.delResolutionRecords.filter(function (el, i, a) {
                return (el.mtg_resolution_linkage_id > 0) && (i == a.indexOf(el))
            });
            if (delLinkRecords.length > 0) {
                jsonData['delLinkages'] = delLinkRecords;
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }

            // related meetings
            // get related mtgs list
            var relMtgsGrid = $("#relmtgsgrid").data("kendoGrid");
            var currentRelatedMtgs = relMtgsGrid.dataSource.data();

            // get new related meeting records
            var newRelMtgRecords = currentRelatedMtgs.filter(function (el) {
                return el.id == 0;
            });
            if (newRelMtgRecords.length > 0) {
                jsonData['newRelatedMtgs'] = newRelMtgRecords;
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }
            // get modified related meeting records
            var updatedRelMtgRecords = currentRelatedMtgs.filter(function (el) {
                return el.is_modified == true && el.mtg_related_meeting_id != 0;
            });
            if (updatedRelMtgRecords.length > 0) {
                jsonData['modRelatedMtgs'] = updatedRelMtgRecords;

                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }

            // get del related meeting records
            var delRelMtgRecords = $scope.delRelatedMtgRecords.filter(function (el, i, a) {
                return (el.mtg_related_meeting_id > 0) && (i == a.indexOf(el))
            });
            if (delRelMtgRecords.length > 0) {
                jsonData['delRelatedMtgs'] = delRelMtgRecords;
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }

            // funding
            // get funding list
            var mtgBudgetGrid = $("#budgetsgrid").data("kendoGrid");
            var currentMtgBudget = mtgBudgetGrid.dataSource.data();

            // get new funding records
            var newMtgBudgetRecords = currentMtgBudget.filter(function (el) {
                return el.id == 0;
            });
            if (newMtgBudgetRecords.length > 0) {
                jsonData['newMtgFunds'] = newMtgBudgetRecords;
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }
            // get modified funding records
            var updatedMtgBudgetRecords = currentMtgBudget.filter(function (el) {
                return el.is_modified == true && el.mtg_budget_id != 0;
            });
            if (updatedMtgBudgetRecords.length > 0) {
                jsonData['modMtgFunds'] = updatedMtgBudgetRecords;
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }

            // get del funding records
            var delMtgBudgetRecords = $scope.deletedMtgBudget.filter(function (el, i, a) {
                return (el.mtg_budget_id > 0) && (i == a.indexOf(el))
            });
            if (delMtgBudgetRecords.length > 0) {
                jsonData['delMtgFunds'] = delMtgBudgetRecords;

                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
            }

            // core functions
            Object.keys($scope.selectedCoreFx).forEach(function (name, index) {
                var value = $scope.selectedCoreFx[name];

                if (value === false)
                    delete $scope.selectedCoreFx[name];

                //name // the property name
                //value // the value of that property
                //index // the counter
            });

            if (!angular.equals($scope.selectedCorefxCopy, $scope.selectedCoreFx)) {

                //jsonData['insCoreFunctions'] = $scope.selectedCoreFx;
                /*$scope.selectedCorefxCopy = angular.copy($scope.selectedCoreFx);*/
                var a = $scope.selectedCorefxCopy;
                $.each(a, function (key, value) {
                    $scope.selectedCorefxCopy[key] = false;
                });
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
                jsonData['insCoreFunctions'] = angular.extend({}, $scope.selectedCorefxCopy, $scope.selectedCoreFx);
            }

            if (!angular.equals($scope.selMtgCoreFxCopy, $scope.selMtgCoreFx)) {
                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
                jsonData['updCoreFunctions'] = $scope.selMtgCoreFx;
            }

            // pb categories
            Object.keys($scope.selectedPbCategory).forEach(function (name, index) {
                var value = $scope.selectedPbCategory[name];

                if (value === false)
                    delete $scope.selectedPbCategory[name];

                //name // the property name
                //value // the value of that property
                //index // the counter
            });

            if (!angular.equals($scope.selectedPbCatCopy, $scope.selectedPbCategory)) {
                var old = $scope.selectedPbCatCopy;
                $.each(old, function (key, value) {
                    $scope.selectedPbCatCopy[key] = false;
                });

                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
                jsonData['insPbCategories'] = angular.extend({}, $scope.selectedPbCatCopy, $scope.selectedPbCategory);

                /*
                deleted by rainier m. bacareza
                jsonData['delPbCategories'] = $scope.selectedPbCatCopy;
                jsonData['insPbCategories'] = $scope.selectedPbCategory;
                $scope.selectedPbCatCopy = angular.copy($scope.selectedPbCategory);*/
            }

            // pb outcomes
            Object.keys($scope.selectedPbOutcome).forEach(function (name, index) {
                var value = $scope.selectedPbOutcome[name];

                if (value === false)
                    delete $scope.selectedPbOutcome[name];

                //name // the property name
                //value // the value of that property
                //index // the counter
            });

            if (!angular.equals($scope.selectedPbOutcomeCopy, $scope.selectedPbOutcome)) {
                var old = $scope.selectedPbOutcomeCopy;
                $.each(old, function (key, value) {
                    $scope.selectedPbOutcomeCopy[key] = false;
                });

                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
                jsonData['insPbOutcomes'] = angular.extend({}, $scope.selectedPbOutcomeCopy, $scope.selectedPbOutcome);

                /*
                deleted by rainier m. bacareza
                jsonData['delPbOutcomes'] = $scope.selectedPbOutcomeCopy;
                jsonData['insPbOutcomes'] = $scope.selectedPbOutcome;
                $scope.selectedPbOutcomeCopy = angular.copy($scope.selectedPbOutcome);
                */
            }

            // pb outputs
            Object.keys($scope.selectedPbOutput).forEach(function (name, index) {
                var value = $scope.selectedPbOutput[name];

                if (value === false)
                    delete $scope.selectedPbOutput[name];

                //name // the property name
                //value // the value of that property
                //index // the counter
            });

            if (!angular.equals($scope.selectedPbOutputCopy, $scope.selectedPbOutput)) {
                var old = $scope.selectedPbOutputCopy;
                $.each(old, function (key, value) {
                    $scope.selectedPbOutputCopy[key] = false;
                });

                jsonData.mtgActionOnlyObj = {
                    mtg_id: $scope.meeting.mtg_id,
                    action: "Update Meeting",
                    action_by: curr_user,
                    remarks: "Meeting details updated by " + curr_user
                };
                jsonData['insPbOutputs'] = angular.extend({}, $scope.selectedPbOutputCopy, $scope.selectedPbOutput);

                /*
                deleted by rainier m. bacareza
                jsonData['delPbOutputs'] = $scope.selectedPbOutputCopy;
                jsonData['insPbOutputs'] = $scope.selectedPbOutput;
                $scope.selectedPbOutputCopy = angular.copy($scope.selectedPbOutput);
                */
            }

            //$scope.modal.dismiss();
            //$('.modal').modal('hide');
            // call to update
            mtgFactory.update(mtgId, jsonData)
                .then(function () {
                    // redirect back to home page
                    setTimeout(function () {
                        var actionObject = logAction ? jsonData.mtgUpdateStatusObj : jsonData.mtgActionOnlyObj;
                        mtgFactory.showLoader(false);
                        $("#actionhistorygrid").data("kendoGrid").refresh();
                        //removeOverlay();
                        toastr.success("Saving Success!", "Saved");

                        getMtgDetail(mtgId);

                        // send notification                        
                        if (actionObject.status == 'Submitted for SPMC'
                            || actionObject.status == 'Submitted for Finalization') {
                            // send 'submitted' notification
                            sendNotification(actionObject);
                        }

                    }, 2000);
                });
        };

        // save log action
        $scope.saveLogAction = function (remarks) {
            var jsonData = {
                mtgUpdateStatusObj: {
                    mtg_id: $scope.meeting.mtg_id,
                    action: $scope.meeting.status,
                    user_name: $('#curr_user').text(),
                    remarks: "",
                    status: $scope.meeting.status
                }
            };

            if (jsonData.mtgUpdateStatusObj.remarks === '')
                jsonData.mtgUpdateStatusObj.remarks = "Status changed to " + "\'" + $scope.meeting.status + "\' by " + $('#curr_user').text();
            else
                jsonData.mtgUpdateStatusObj.remarks = remarks;


            // call to update
            mtgFactory.update(mtgId, jsonData)
                .then(function () {
                    var actionObject = jsonData.mtgUpdateStatusObj;
                    toastr.success("Saving Success!", "Saved");

                    // redirect back to home page
                    setTimeout(function (actionObject) {

                        getMtgDetail(mtgId);

                        // send notification                        
                        if (actionObject.status == 'Submitted for SPMC'
                            || actionObject.status == 'Revise for SPMC'
                            || actionObject.status == 'Approved for SPMC'
                            || actionObject.status == 'Revise for Finalization'
                            || actionObject.status == 'Submitted for Finalization'
                            || actionObject.status == 'Finalized') {
                            // send 'submitted' notification
                            sendNotification(actionObject);
                        }
                        //if (actionObject.status == 'Revise for SPMC') {
                        //    // send 'submitted' notification
                        //    sendNotification(actionObject);
                        //}

                        mtgFactory.showLoader(false);
                        $("#actionhistorygrid").data("kendoGrid").refresh();
                        //removeOverlay();
                    }, 2000, actionObject);
                });
        }

        $scope.yes = function () {
            mtgFactory.showLoader(true);
            $scope.save();
        }

        $scope.no = function () {
            mtgFactory.showLoader(true);
            $location.url(base);
        }

        $scope.cancel = function () {
            mtgFactory.showLoader(true);
            //alert(base);
            //displayOverlay();
            //waitingDialog.show();
            $location.url(base);
            //$scope.$apply();

            //setTimeout(function () {
            //    $location.url(base);
            //    $scope.$apply();
            //}, 1000);

            //$location.url(base);

        }

        $scope.hide = function () {
            //$scope.newMtg = {};
            //$scope.reset();
            //$scope.form.$setPristine();
            $scope.modal.dismiss();
            $('.modal').modal('hide');

        }

        $scope.cancelSave = function () {
            $scope.modal.dismiss();
        }

        // CLOSE
        $scope.confirmClose = function () {
            if ((mtgObjectChanged || mtgDetailObjectChanged) && ($scope.submitDetailBtnEnable && $scope.meeting.status === 'Draft')) {
                $scope.modal = $modal.open({
                    animation: true,
                    templateUrl: 'detail-yes-no-cancel.html',
                    windowClass: 'confirmClass',
                    scope: $scope,
                });
            }
            else
                $scope.cancel();
        }

        // SUBMIT
        $scope.confirmSubmit = function () {

            if (isNaN($scope.meeting.mtg_type)) {

                toastr.warning("Please specify meeting type", "Failed");

                return;
            }

            if (isNaN($scope.meeting.mtg_classification)) {

                toastr.warning("Please specify meeting classification", "Failed");

                return;
            }

            $scope.modal = $modal.open({
                animation: true,
                templateUrl: 'detail-submit.html',
                windowClass: 'confirmClass',
                scope: $scope,
            });
        }

        $scope.submit = function () {
            switch (angular.lowercase($scope.meeting.status)) {
                case "draft":
                case "revise for spmc":
                    $scope.meeting.status = "Submitted for SPMC";
                    break;
                case "revise for finalization":
                    $scope.meeting.status = "Submitted for Finalization";
                    break;
                default:
                    console.log('There should not be a default failover at this thing.');
            }

            mtgObjectChanged = true;
            logAction = true;

            $scope.save();

            $scope.modal.dismiss();
            $('.modal').modal('hide');

            //$scope.meeting.status = "
        }

        $scope.cancelSubmit = function () {
            $scope.modal.dismiss();
        }

        // REJECT
        $scope.confirmReject = function () {
            $scope.modal = $modal.open({
                animation: true,
                templateUrl: 'detail-reject.html',
                windowClass: 'confirmClass',
                scope: $scope,
            });

            $scope.rejectRemarks = "";
        }

        $scope.reject = function (remarks) {

            $scope.rejectRemarks = remarks;

            switch (angular.lowercase($scope.meeting.status)) {
                case "submitted for spmc":
                case "revise for spmc":
                    $scope.meeting.status = "Revise for SPMC";
                    break;
                case "approved for spmc":
                case "submitted for finalization":
                    $scope.meeting.status = "Revise for Finalization";
                    break;
                default:
                    console.log('There should not be a default failover at this thing.');
            }

            $scope.saveLogAction(remarks);

            $scope.modal.dismiss();
            $('.modal').modal('hide');
        }

        // APPROVAL
        $scope.confirmApprove = function () {
            $scope.modal = $modal.open({
                animation: true,
                templateUrl: 'detail-approve.html',
                windowClass: 'confirmClass',
                scope: $scope,
            });
        }

        $scope.confirmFinalize = function () {
            if (!$scope.meeting.spmc_approval_date) {

                toastr.warning("Please specify spmc approval date", "Failed");

                return;
            }
            if (!$scope.meeting.venue) {

                toastr.warning("Please specify venue of the meeting", "Failed");

                return;
            }
            if (!$scope.meeting.ctry_code) {

                toastr.warning("Please specify country for the venue of the meeting", "Failed");

                return;
            }

            $scope.modal = $modal.open({
                animation: true,
                templateUrl: 'detail-finalize.html',
                windowClass: 'confirmClass',
                scope: $scope,
            });
        }

        $scope.approve = function () {
            switch (angular.lowercase($scope.meeting.status)) {
                case "submitted for spmc":
                    $scope.meeting.status = "Approved for SPMC";
                    break;
                case "submitted for finalization":
                case "approved for spmc":
                    $scope.meeting.status = "Finalized";
                    break;
                case "qux":
                    $scope.meeting.status = "qux";
                    break;
                default:
                    console.log('There should not be a default failover at this thing.');
            }


            $scope.saveLogAction('');

            $scope.modal.dismiss();
            $('.modal').modal('hide');
        }

        // CANCELLATION
        $scope.confirmCancel = function () {
            $scope.modal = $modal.open({
                animation: true,
                templateUrl: 'detail-cancel-mtg.html',
                windowClass: 'confirmClass',
                scope: $scope,
            });
        }

        $scope.cancelMtg = function () {
            $scope.meeting.status = "Cancelled";

            //mtgObjectChanged = true;
            //logAction = true;

            //$scope.save();

            $scope.saveLogAction('');

            $scope.modal.dismiss();
            $('.modal').modal('hide');
        }

        $scope.limit = 4;
        $scope.checked = 0;
        $scope.checkChanged = function (item) {
            if (item.winner) $scope.checked++;
            else $scope.checked--;
        }

        var option1Options = ["option1 - 1", "option1 - 2", "option1 - 3"];
        var option2Options = [["option2 - 1-1", "option2 - 1-2", "option2 - 1-3"],
                       ["option2 - 2-1", "option2 - 2-2", "option2 - 2-3"],
                       ["option2 - 3-1", "option2 - 3-2", "option2 - 3-3"]];

        $scope.options1 = option1Options;
        $scope.options2 = []; // we'll get these later
        $scope.getOptions2 = function () {
            // just some silly stuff to get the key of what was selected since we are using simple arrays.
            var key = $scope.options1.indexOf($scope.option1);
            // Here you could actually go out and fetch the options for a server.
            var myNewOptions = option2Options[key];
            // Now set the options.
            // If you got the results from a server, this would go in the callback
            $scope.options2 = myNewOptions;
        };

        // action history tab
        $scope.actionHistoryTab = function () {

        }

        // Prevent the backspace key from navigating back.
        $(document).unbind('keydown').bind('keydown', function (event) {
            var doPrevent = false;
            if (event.keyCode === 8) {
                var d = event.srcElement || event.target;
                if ((d.tagName.toUpperCase() === 'INPUT' &&
                     (
                         d.type.toUpperCase() === 'TEXT' ||
                         d.type.toUpperCase() === 'PASSWORD' ||
                         d.type.toUpperCase() === 'FILE' ||
                         d.type.toUpperCase() === 'SEARCH' ||
                         d.type.toUpperCase() === 'EMAIL' ||
                         d.type.toUpperCase() === 'NUMBER' ||
                         d.type.toUpperCase() === 'DATE')
                     ) ||
                     d.tagName.toUpperCase() === 'TEXTAREA') {
                    doPrevent = d.readOnly || d.disabled;
                }
                else {
                    doPrevent = true;
                }
            }

            if (doPrevent) {
                event.preventDefault();
            }
        });

        // remove find and remove property
        function findAndRemove(array, property, value) {
            array.forEach(function (result, index) {
                if (result[property] === value) {
                    //Remove from array
                    array.splice(index, 1);
                }
            });
        }

        $scope.isNumber = function (s) {
            var x = +s; // made cast obvious for demonstration
            return x.toString() === s;
        }

        // attachments
        $scope.loadAttachmentTemp = function () {
            var divupload = $('#thisupload');
            var fileuploadtemp = $('.fileuploadtemp').clone(true);
            fileuploadtemp.css('display', 'block');
            divupload.replaceWith(fileuploadtemp);
        }

        // function get detail
        function getMtgDetail(mtgId, initial) {
            mtgFactory.getDetail(mtgId)
            .then(function (result) {
                if (typeof result == "string")
                    result = JSON.parse(result);
                // meetingObject
                meetingObject = JSON.parse(result.meeting);

                $scope.mtg_no = meetingObject.filter(function (el) {
                    return el.mtg_id == mtgId;
                })[0].mtg_no;
                // meetingDetailObject
                meetingDetailObject = JSON.parse(result.meetingDetail);
                // participantCountryObject
                ctryParticipantObject = JSON.parse(result.countryParticipant);
                // core function
                //coreFunctionObject = JSON.parse(result.coreFunction);
                // mtgCoreFxObject
                mtgCoreFxObject = JSON.parse(result.mtgCoreFx);
                // linkagesResolutionsObject
                linkagesResolutionsObject = JSON.parse(result.linkagesResolution);
                // relatedMeetingsObject
                relatedMeetingsObject = JSON.parse(result.relatedMeeting);
                // meetingBudgetObject
                meetingBudgetObject = JSON.parse(result.meetingBudget);
                // mtgPbCategoryObject
                mtgPbCategoryObject = JSON.parse(result.mtgPbCategory);
                // mtgPbOutcomeObject
                mtgPbOutcomeObject = JSON.parse(result.mtgPbOutcome);
                //mtgPbOutputObject
                mtgPbOutputObject = JSON.parse(result.mtgPbOutput);
                // mtgReportObject
                mtgReportObject = JSON.parse(result.mtgReport);


                $timeout(function () {

                    //bind data
                    $scope.meeting = meetingObject.filter(function (el) {
                        return el.mtg_id == mtgId;
                    })[0];
                    // parse dates data
                    $scope.meeting.date_updated = moment($scope.meeting.date_updated).format('DD MMM YYYY h:mm:ss a');

                    $scope.meeting.start_date = kendo.toString(kendo.parseDate($scope.meeting.start_date, 'yyyy-MM-dd'), 'dd MMM yyyy');
                    $scope.meeting.end_date = kendo.toString(kendo.parseDate($scope.meeting.end_date, 'yyyy-MM-dd'), 'dd MMM yyyy');

                    $scope.meeting.spmc_approval_date = kendo.toString(kendo.parseDate($scope.meeting.spmc_approval_date, 'yyyy-MM-dd'), 'dd MMM yyyy');
                    $scope.originalMtg = angular.copy($scope.meeting);
                });
                //// mtg type
                //var thisMtgType = $scope.types.filter(function (el) {
                //    return el.ref_id == $scope.meeting.mtg_type;
                //})
                //$scope.meeting.mtg_type = thisMtgType[0].ref_name;

                $scope.meetingDetail = meetingDetailObject.filter(function (el) {
                    return el.mtg_id == mtgId;
                })[0];
                // country participants
                $scope.countryParticipant = ctryParticipantObject;
                //$('#participantsgrid').data('kendoGrid').refresh();
                //$('#participantsgrid').data('kendoGrid').dataSource.read('true');
                gridParticipants();

                // core functions              
                $scope.selectedCoreFx = {};
                for (var i = 0; i < coreFunctionObject.length; i++) {
                    $scope.selectedCoreFx[coreFunctionObject[i].core_function_id] = coreFunctionObject[i].is_selected;
                }
                $scope.selectedCorefxCopy = angular.copy($scope.selectedCoreFx);

                $scope.selMtgCoreFx = {};
                for (var i = 0; i < mtgCoreFxObject.length; i++) {
                    $scope.selMtgCoreFx[mtgCoreFxObject[i].mtg_core_function_id] = mtgCoreFxObject[i].is_selected;
                }

                $scope.selMtgCoreFxCopy = angular.copy($scope.selMtgCoreFx);
                $scope.mtgCoreFxObject = mtgCoreFxObject;

                // pb deliverables
                // pb category
                $scope.selectedPbCategories = mtgPbCategoryObject;
                $scope.selectedPbCategory = {};
                var pbCatItems = $scope.selectedPbCategories;
                for (var i = 0; i < pbCatItems.length; i++) {
                    $scope.selectedPbCategory[pbCatItems[i].pb_deliverable_cat_id] = pbCatItems[i].is_selected;
                }
                $scope.selectedPbCatCopy = angular.copy($scope.selectedPbCategory);

                // pb outcome
                $scope.selectedPbOutcomes = mtgPbOutcomeObject;
                $scope.selectedPbOutcome = {};
                var pbOutcomeItems = $scope.selectedPbOutcomes;
                for (var i = 0; i < pbOutcomeItems.length; i++) {
                    $scope.selectedPbOutcome[pbOutcomeItems[i].pb_deliverable_outcome_id] = pbOutcomeItems[i].is_selected;
                }
                $scope.selectedPbOutcomeCopy = angular.copy($scope.selectedPbOutcome);

                // pb output
                $scope.selectedPbOutputs = mtgPbOutputObject;
                $scope.selectedPbOutput = {};
                var pbOutputItems = $scope.selectedPbOutputs;
                for (var i = 0; i < pbOutputItems.length; i++) {
                    $scope.selectedPbOutput[pbOutputItems[i].pb_deliverable_output_id] = pbOutputItems[i].is_selected;
                }
                $scope.selectedPbOutputCopy = angular.copy($scope.selectedPbOutput);

                // linkages to resolutions
                $scope.linkagesToResolution = linkagesResolutionsObject;
                $('#resgrid').data('kendoGrid').refresh();
                $('#resgrid').data('kendoGrid').dataSource.read('true');

                // related meetings
                $scope.relatedMeetings = relatedMeetingsObject;
                $('#relmtgsgrid').data('kendoGrid').refresh();
                $('#relmtgsgrid').data('kendoGrid').dataSource.read('true');

                // funding
                $scope.meetingBudget = meetingBudgetObject;
                $('#budgetsgrid').data('kendoGrid').refresh();
                $('#budgetsgrid').data('kendoGrid').dataSource.read('true');

                // report data
                $scope.summaryReportDueDate = mtgReportObject.summary_report_due_date;
                $scope.finalReportDueDate = mtgReportObject.final_report_due_date;


                $scope.meetingDetail.planning_mtg_date = kendo.toString(kendo.parseDate($scope.meetingDetail.planning_mtg_date, 'yyyy-MM-dd'), 'dd MMM yyyy');

                $scope.wordCountSummary = wordCounter(angular.element("<div>").append($scope.meetingDetail.summary).text().trim().split(" "));
                $scope.wordCountBackground = wordCounter(angular.element("<div>").append($scope.meetingDetail.background_info).text().trim().split(" "));

                if (initial) {
                    // render kendo editors for meeting details
                    renderEditors();

                    renderKdatePicker("myPicker");

                }

                //$scope.mtgObj = $scope.meeting;
                // copy
                $scope.originalMtgDetail = angular.copy($scope.meetingDetail);
                // hide spinner

                //$timeout(function () {
                //    var filtered = $filter("filter")($scope.types, $scope.meeting.mtg_type);
                //    if (filtered.length > 0) {
                //        $scope.meeting.mtg_type = filtered[0].ref_code;
                //    }
                //}, 1000);

                mtgFactory.showLoader(false);

            });
        }
        // get detail
        function getMtgDetailSave(mtgId) {
            mtgFactory.getDetail(mtgId)
            .then(function (result) {
                if (typeof result == "string")
                    result = JSON.parse(result);

                // meetingObject
                meetingObject = JSON.parse(result.meeting);
                // meetingDetailObject
                meetingDetailObject = JSON.parse(result.meetingDetail);
                // participantCountryObject
                ctryParticipantObject = JSON.parse(result.countryParticipant);
                // core function
                coreFunctionObject = JSON.parse(result.coreFunction);
                // linkagesResolutionsObject
                linkagesResolutionsObject = JSON.parse(result.linkagesResolution);
                // relatedMeetingsObject
                relatedMeetingsObject = JSON.parse(result.relatedMeeting);
                // meetingBudgetObject
                meetingBudgetObject = JSON.parse(result.meetingBudget);
                // mtgPbCategoryObject
                mtgPbCategoryObject = JSON.parse(result.mtgPbCategory);
                // mtgPbOutcomeObject
                mtgPbOutcomeObject = JSON.parse(result.mtgPbOutcome);
                //mtgPbOutputObject
                mtgPbOutputObject = JSON.parse(result.mtgPbOutput);
                // mtgReportObject
                mtgReportObject = JSON.parse(result.mtgReport);

                //bind data
                $scope.meeting = meetingObject.filter(function (el) {
                    return el.mtg_id == mtgId;
                })[0];

                $scope.meetingDetail = meetingDetailObject.filter(function (el) {
                    return el.mtg_id == mtgId;
                })[0];

                //renderEditors();

                //// mtg type
                //var thisMtgType = $scope.types.filter(function (el) {
                //    return el.ref_id == $scope.meeting.mtg_type;
                //})
                //$scope.meeting.mtg_type = thisMtgType[0].ref_name;
                $scope.meeting.mtg_type = parseInt($scope.meeting.mtg_type);
                $scope.meeting.mtg_classification = parseInt($scope.meeting.mtg_classification);

                // country participants
                $scope.countryParticipant = ctryParticipantObject;
                //$('#participantsgrid').data('kendoGrid').refresh();
                //$('#participantsgrid').data('kendoGrid').dataSource.read('true');
                //gridParticipants();

                // refresh grid
                var grid = $("#participant-ib2").data("kendoGrid");
                grid.dataSource.read();
                grid.refresh();

                // core functions
                $scope.selectedCorefunction = coreFunctionObject;
                //$scope.selectedCorefxCopy = angular.copy(coreFunctionObject);
                $scope.selectedCoreFx = {};
                var items = $scope.selectedCorefunction;
                for (var i = 0; i < items.length; i++) {
                    $scope.selectedCoreFx[items[i].core_function_id] = items[i].is_selected;
                }
                $scope.selectedCorefxCopy = angular.copy($scope.selectedCoreFx);

                // pb deliverables
                // pb category
                $scope.selectedPbCategories = mtgPbCategoryObject;
                $scope.selectedPbCategory = {};
                var pbCatItems = $scope.selectedPbCategories;
                for (var i = 0; i < pbCatItems.length; i++) {
                    $scope.selectedPbCategory[pbCatItems[i].pb_deliverable_cat_id] = pbCatItems[i].is_selected;
                }
                $scope.selectedPbCatCopy = angular.copy($scope.selectedPbCategory);

                // pb outcome
                $scope.selectedPbOutcomes = mtgPbOutcomeObject;
                $scope.selectedPbOutcome = {};
                var pbOutcomeItems = $scope.selectedPbOutcomes;
                for (var i = 0; i < pbOutcomeItems.length; i++) {
                    $scope.selectedPbOutcome[pbOutcomeItems[i].pb_deliverable_outcome_id] = pbOutcomeItems[i].is_selected;
                }
                $scope.selectedPbOutcomeCopy = angular.copy($scope.selectedPbOutcome);

                // pb output
                $scope.selectedPbOutputs = mtgPbOutputObject;
                $scope.selectedPbOutput = {};
                var pbOutputItems = $scope.selectedPbOutputs;
                for (var i = 0; i < pbOutputItems.length; i++) {
                    $scope.selectedPbOutput[pbOutputItems[i].pb_deliverable_output_id] = pbOutputItems[i].is_selected;
                }
                $scope.selectedPbOutputCopy = angular.copy($scope.selectedPbOutput);

                // linkages to resolutions
                $scope.linkagesToResolution = linkagesResolutionsObject;
                $('#resgrid').data('kendoGrid').refresh();
                $('#resgrid').data('kendoGrid').dataSource.read('true');

                // related meetings
                $scope.relatedMeetings = relatedMeetingsObject;
                $('#relmtgsgrid').data('kendoGrid').refresh();
                $('#relmtgsgrid').data('kendoGrid').dataSource.read('true');

                // funding
                $scope.meetingBudget = meetingBudgetObject;
                $('#budgetsgrid').data('kendoGrid').refresh();
                $('#budgetsgrid').data('kendoGrid').dataSource.read('true');

                // report data
                $scope.summaryReportDueDate = mtgReportObject.summary_report_due_date;
                $scope.finalReportDueDate = mtgReportObject.final_report_due_date;

                // parse dates data
                $scope.meeting.date_updated = moment($scope.meeting.date_updated).format('DD MMM YYYY h:mm:ss a');

                // jumbo object
                //$scope.meeting.meetingDetail = {};
                //$scope.meeting.meetingDetail = $scope.meetingDetail;

                //$scope.mtgObj = $scope.meeting;
                // copy
                $scope.originalMtg = angular.copy($scope.meeting);
                $scope.originalMtgDetail = angular.copy($scope.meetingDetail);
                //$scope.initialComparison = angular.equals($scope.meeting, $scope.originalMtg);

                $scope.meeting.start_date = kendo.toString(kendo.parseDate($scope.meeting.start_date, 'yyyy-MM-dd'), 'dd MMM yyyy');
                $scope.meeting.end_date = kendo.toString(kendo.parseDate($scope.meeting.end_date, 'yyyy-MM-dd'), 'dd MMM yyyy');
                $scope.meetingDetail.planning_mtg_date = kendo.toString(kendo.parseDate($scope.meetingDetail.planning_mtg_date, 'yyyy-MM-dd'), 'dd MMM yyyy');
                //renderKdatePicker("myPicker");

                // hide spinner
                mtgFactory.showLoader(false);
                //removeOverlay();
                //waitingDialog.hide();
            });
        }
        // render participants grid
        function gridParticipants() {


            // grid
            if ($("#participant-ib2").data("kendoGrid") != undefined) {
                $("#participant-ib2").data("kendoGrid").destroy();
            }
            $("#participant-ib2").css("margin-bottom", "5px");
            $("#participant-ib2").kendoGrid({
                columns: [
                        {
                            field: "ctry_name",
                            title: "Country",
                            width: 200,
                            editor: function (container, options) {
                                var input = $("<input />");
                                input.attr("name", options.field);
                                input.appendTo(container);
                                input.kendoAutoComplete({
                                    dataSource: $scope.states,
                                    dataTextField: "ctry_name",
                                    filter: "contains",
                                    select: function (e) {
                                        var dataItem = this.dataItem(e.item.index());
                                        var participantsGrid = $('#participant-ib2').data("kendoGrid");
                                        model = participantsGrid.dataItem(this.element.closest("tr"));
                                        model.set("ctry_code", dataItem.ctry_code);
                                    }
                                })
                            }
                        },
                        {
                            field: "no_of_participants",
                            title: "No. of participants",
                            width: 100,
                            footerTemplate: "Total: #: sum #"
                        },
                        {
                            field: "fund_source",
                            title: "Funding source",
                            width: 75,
                            editor: function (container, options) {
                                var input = $("<input maxlength='20'/>");
                                input.attr("name", options.field);
                                input.appendTo(container);
                                input.kendoAutoComplete({
                                    dataSource: $scope.participantFundSrcs,
                                    dataTextField: "fund_source_name",
                                    filter: "contains",
                                    select: function (e) {
                                        var dataItem = this.dataItem(e.item.index());
                                        var participantsGrid = $('#participant-ib2').data("kendoGrid");
                                        model = participantsGrid.dataItem(this.element.closest("tr"));
                                        model.set("fund_source", dataItem.fund_source);
                                    },
                                    value: "WPRO"
                                })
                            }
                        },
                        { command: "destroy", width: 100 }
                ],
                toolbar: kendo.template($('#addPartTemplate').html()),
                editable: {
                    createAt: "bottom"
                },
                navigatable: true,
                columnMenu: true,
                resizable: true,
                height: 325,
                sortable: true,
                scrollable: true,
                filterable: true,
                change: function (e) {
                    var selectedRows = this.select();
                    var selectedDataItems = [];
                    for (var i = 0; i < selectedRows.length; i++) {
                        var dataItem = this.dataItem(selectedRows[i]);
                        selectedDataItems.push(dataItem);
                    }
                },
                remove: function (e) {
                    e.sender.refresh();
                    $scope.$apply(function () {
                        $scope.delParticipantRecords.push(e.model);
                    });

                    //grid.dataSource.remove(dataItem);
                },
                dataSource: {
                    aggregate: [
                        { field: "no_of_participants", aggregate: "sum" }
                    ],
                    transport: {
                        read:
                            function (options) {
                                if (options.data[0] != undefined) {
                                    //var result = JSON.parse(options.data)
                                    options.success($scope.countryParticipant);
                                }

                                options.success($scope.countryParticipant);
                            },
                    },
                    schema: {
                        data: function (data) { return data; },
                        model: {
                            id: "mtg_participant_ctry_id",
                            fields: {
                                mtg_participant_ctry_id: { type: "number" },
                                mtg_id: { type: "number" },
                                ctry_code: {
                                    type: "string", validation: {
                                        required: true, custom: function (input) {
                                            // set the custom message
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
                    pageSize: 20,
                    sort: {
                        field: "ctry_name",
                        dir: "asc"
                    }
                }
            });

            $timeout(function () {
                $("#participant-ib2").find(".k-grid-content").height("245px")
            }, 1000);


            // end grid

            $('#btnAddParticipant').kendoButton({
                icon: "plus",
                click: function () {
                    var authorGrid = $("#participant-ib2").data("kendoGrid");
                    authorGrid.addRow();
                }
            });
            $('#participant-ib2').on('click', '#btnDeleteAuthor', function (e) {
                e.preventDefault();
                var grid = $("#participant-ib2").data("kendoGrid");
                deleteAuthor.call(grid, e);
            });
            function deleteAuthor(e) {
                e.preventDefault();

                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                var grid = $("#participant-ib2").data("kendoGrid");

                $scope.delParticipantRecords.push(dataItem);

                grid.dataSource.remove(dataItem);
            }

            $("#show").on("click", function () {
                var data = $("#participant-ib2").data("kendoGrid").dataSource.data();
                var dirty = $.grep(data, function (item) {
                    return item.dirty
                });
                //$("#logger").html(JSON.stringify(dirty, null, 2));
            });
        }

        // render kendo editors
        function renderEditors() {
            var setEditorTools = function (target) {
                var defaults = [
                    'formatting',
                    'bold',
                    'italic',
                    'underline',
                    'justifyLeft',
                    'justifyCenter',
                    'justifyRight',
                    'justifyFull',
                    'insertUnorderedList',
                    'insertOrderedList',
                    'indent',
                    'outdent',
                    'superscript'

                ];
                var template = $("#zoomTemplate")
                template.find("button").attr("data-target", target);

                defaults.push({
                    name: "zoom", template: template.html()
                });
                return defaults;
            }
            var editorTools = [
                    'formatting',
                    'bold',
                    'italic',
                    'underline',
                    'justifyLeft',
                    'justifyCenter',
                    'justifyRight',
                    'justifyFull',
                    'insertUnorderedList',
                    'insertOrderedList',
                    'indent',
                    'outdent',
                    'superscript',
                    {
                        name: "zoom", template: $("#zoomTemplate").html()
                    }
            ];

            // internal planning
            $("#ta-present").kendoEditor({
                stylesheets: [
                 base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //var out = CleanWordHTML(e.html);
                    //e.html = $(e.html).text();
                    //e.html = CleanWordHTML(e.html);
                    //e.html = $(e.html).text();
                    e.html = $(e.html).text();

                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.present = this.value();
                    $scope.$apply();
                },
                tools: setEditorTools("ta-present"),
                value: $scope.meetingDetail.present
            });
            // absent
            $("#ta-absent").kendoEditor({
                stylesheets: [
                base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.absent = this.value();
                    $scope.$apply();
                },
                tools: setEditorTools("ta-absent"),
                value: $scope.meetingDetail.absent
            });
            // background info
            $("#ta-bg").kendoEditor({
                stylesheets: [
                base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.background_info = this.value();
                    $scope.$apply();
                },
                keyup: function () {
                    var text = $("<div>").append(this.value()).text().trim();
                    if (text.trim().length > 0) {
                        $scope.wordCountBackground = wordCounter(text.split(' '));
                        $scope.$apply();
                    }
                },
                tools: setEditorTools("ta-bg"),
                value: $scope.meetingDetail.background_info
            });
            //summary
            $("#ta-summ").kendoEditor({
                stylesheets: [
                base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.summary = this.value();
                    $scope.$apply();
                },
                keyup: function () {
                    var text = $("<div>").append(this.value()).text().trim();
                    if (text.trim().length > 0) {
                        $scope.wordCountSummary = wordCounter(text.split(' '));
                        $scope.$apply();
                    }

                },
                tools: editorTools,
                value: $scope.meetingDetail.summary
            });
            // ta-obj
            $("#ta-obj").kendoEditor({
                stylesheets: [
                base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.objectives = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.objectives
            });
            // ta-obj
            $("#criteria-p").kendoEditor({
                stylesheets: [
                base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.criteria_for_invited_participants = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.criteria_for_invited_participants
            });
            // ta-temp
            $("#ta-temp").kendoEditor({
                stylesheets: [
                base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function (e) {
                    if (IsIE()) {
                        var val = $(e.sender.element).data("kendoEditor").document.body.innerHTML;
                        var htmlParser = $("<div>").append(val);
                        htmlParser.find(".k-br").removeClass("k-br");
                        $(e.sender.element).data("kendoEditor").value(htmlParser.html());
                    }
                    $scope.meetingDetail.temporary_advisers = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.temporary_advisers
            });
            // ta-rep
            $("#ta-rep").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.representatives_observers = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.representatives_observers
            });
            // sec-a
            $("#sec-a").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.secretariat_wpro = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.secretariat_wpro
            });
            // sec-b
            $("#sec-b").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.secretariat_co = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.secretariat_co
            });
            // sec-c
            $("#sec-c").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.secretariat_hq = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.secretariat_hq
            });
            // sec-d
            $("#sec-d").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.secretariat_other_regions = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.secretariat_other_regions
            });
            // sec-e
            $("#sec-e").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.secretariat_other_un_agencies = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.secretariat_other_un_agencies
            });
            // sec-asst
            $("#sec-asst").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.secretarial_assistance = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.secretarial_assistance
            });
            // end-notes
            $timeout(function () {
                $("#end-notes").kendoEditor({
                    stylesheets: [
                   base + "Content/kendo-editor.css"
                    ],
                    paste: function (e) {

                        //("#txtActions").val(CleanWordHTML(e.html));
                        //e.html = CleanWordHTML(e.html);
                        e.html = $(e.html).text();
                    },
                    change: function () {
                        if (IsIE()) {
                            $("iframe").each(function () {
                                debugger;
                            });
                        }
                        // GO HERE
                        var readableFormat = [];
                        var newValue = this.value();
                        $(newValue).each(function (index, value) {
                            if (typeof (value) == "object") {
                                if (value.tagName == "SUP") {
                                    readableFormat.push({
                                        orderNo: value.textContent,
                                        value: $(newValue)[index + 1].textContent.trim(),
                                        parameter: findParamter($(newValue)[index + 1].textContent.trim())
                                    });
                                }
                            }
                        });
                        if (readableFormat.length >= 3) {
                            $scope.meetingDetail.end_notes = this.value();
                            $scope.$apply();
                        }
                        else {
                            this.value(parseEndNote({ note: end_note_defaults, type: "initial" }));

                        }
                    },
                    tools: editorTools,
                    value: $scope.meetingDetail.end_notes == undefined || $scope.meetingDetail.end_notes == "" ? parseEndNote({ note: end_note_defaults, type: "initial" }) : parseEndNote({ note: $scope.meetingDetail.end_notes, type: "retrieve" })
                });
                $(".k-button.k-group-start").on("click", function (e) {
                    if ($(this).data("role") == "editorZoom") {
                        var editor = {};
                        if ($(this).data("target") == undefined) {
                            var id = $(this).parent().parent().parent().parent().parent().find("textarea").prop("id");
                            editor = $("#" + id);
                        }
                        else {
                            editor = $("#" + $(this).data("target"));
                        }
                        $scope.editorZoomValue = $("<div>").append(editor.data("kendoEditor").value()).html()
                        $scope.$apply();

                        $scope.modal = $modal.open({
                            animation: true,
                            size: "lg",
                            windowClass: "modal-zoom",
                            templateUrl: "editor-zoom.html",
                            scope: $scope,
                        });
                    }
                });
            });
            // spmc-notes
            $("#spmc-notes").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {
                    if ($scope.isApprover) {
                        //("#txtActions").val(CleanWordHTML(e.html));
                        //e.html = CleanWordHTML(e.html);
                        e.html = $(e.html).text();
                    }
                    else { e.preventDefault(); }
                },
                change: function (e) {

                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    if ($scope.isApprover) {
                        $scope.meetingDetail.spmc_notes = this.value();
                        $scope.$apply();
                    }
                    else { e.preventDefault(); }

                },
                keydown: function (e) {

                    if ($scope.isApprover != true && e.which != 9) {
                        e.preventDefault();
                    }
                },
                tools: editorTools,
                value: $scope.meetingDetail.spmc_notes
            });
            // sites and languages a ta-sla
            $("#ta-sla").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.comment_on_dates = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.comment_on_dates
            });

            // sites and languages a ta-slc
            $("#ta-slc").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.offsite_reason = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.offsite_reason
            });
            // sites and languages a ta-sld
            $("#ta-sld").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.other_facilities_reason = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.other_facilities_reason
            });
            // courtesy expense ta-courtesy
            $("#ta-courtesy").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    //e.html = $(e.html).text();
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.courtesy_expense = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.courtesy_expense
            });
            // daily allowance
            $("#ta-allow").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    //e.html = $(e.html).text();
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.daily_allowance = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.daily_allowance
            });
            // supplies and equipment supplies
            $("#ta-supplies").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.supplies_and_equipment = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.supplies_and_equipment
            });
            // co-sponsorship cosponsor
            $("#ta-cosponsor").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.cosponsorship = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.cosponsorship
            });
            // who logo whologo
            $("#ta-whologo").kendoEditor({
                stylesheets: [
               base + "Content/kendo-editor.css"
                ],
                paste: function (e) {

                    //("#txtActions").val(CleanWordHTML(e.html));
                    //e.html = CleanWordHTML(e.html);
                    e.html = $(e.html).text();
                },
                change: function () {
                    if (IsIE()) {
                        $("iframe").each(function () {
                            debugger;
                        });
                    }
                    $scope.meetingDetail.logo_request = this.value();
                    $scope.$apply();
                },
                tools: editorTools,
                value: $scope.meetingDetail.logo_request
            });


        }

        // function route notifications
        function sendNotification(data) {
            var jsonData = {};

            jsonData['mtgActionObj'] = data;

            mtgFactory.sendNotif(mtgId, jsonData)
                .then(function () {
                    // sent notif
                });
        }

        function CleanWordHTML(str) {
            str = str.replace(/<o:p>\s*<\/o:p>/g, "");
            str = str.replace(/<o:p>.*?<\/o:p>/g, "&nbsp;");
            str = str.replace(/\s*mso-[^:]+:[^;"]+;?/gi, "");
            str = str.replace(/\s*MARGIN: 0cm 0cm 0pt\s*;/gi, "");
            str = str.replace(/\s*MARGIN: 0cm 0cm 0pt\s*"/gi, "\"");
            str = str.replace(/\s*TEXT-INDENT: 0cm\s*;/gi, "");
            str = str.replace(/\s*TEXT-INDENT: 0cm\s*"/gi, "\"");
            str = str.replace(/\s*TEXT-ALIGN: [^\s;]+;?"/gi, "\"");
            str = str.replace(/\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"");
            str = str.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"");
            str = str.replace(/\s*tab-stops:[^;"]*;?/gi, "");
            str = str.replace(/\s*tab-stops:[^"]*/gi, "");
            str = str.replace(/\s*face="[^"]*"/gi, "");
            str = str.replace(/\s*face=[^ >]*/gi, "");
            str = str.replace(/\s*FONT-FAMILY:[^;"]*;?/gi, "");
            str = str.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3");
            str = str.replace(/<(\w[^>]*) style="([^\"]*)"([^>]*)/gi, "<$1$3");
            str = str.replace(/\s*style="\s*"/gi, '');
            str = str.replace(/<SPAN\s*[^>]*>\s*&nbsp;\s*<\/SPAN>/gi, '&nbsp;');
            str = str.replace(/<SPAN\s*[^>]*><\/SPAN>/gi, '');
            str = str.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3");
            str = str.replace(/<SPAN\s*>(.*?)<\/SPAN>/gi, '$1');
            str = str.replace(/<FONT\s*>(.*?)<\/FONT>/gi, '$1');
            str = str.replace(/<\\?\?xml[^>]*>/gi, "");
            str = str.replace(/<\/?\w+:[^>]*>/gi, "");
            str = str.replace(/<H\d>\s*<\/H\d>/gi, '');
            str = str.replace(/<H1([^>]*)>/gi, '');
            str = str.replace(/<H2([^>]*)>/gi, '');
            str = str.replace(/<H3([^>]*)>/gi, '');
            str = str.replace(/<H4([^>]*)>/gi, '');
            str = str.replace(/<H5([^>]*)>/gi, '');
            str = str.replace(/<H6([^>]*)>/gi, '');
            str = str.replace(/<\/H\d>/gi, '<br>'); //remove this to take out breaks where Heading tags were 
            str = str.replace(/<(U|I|STRIKE)>&nbsp;<\/\1>/g, '&nbsp;');
            str = str.replace(/<(B|b)>&nbsp;<\/\b|B>/g, '');
            str = str.replace(/<([^\s>]+)[^>]*>\s*<\/\1>/g, '');
            str = str.replace(/<([^\s>]+)[^>]*>\s*<\/\1>/g, '');
            str = str.replace(/<([^\s>]+)[^>]*>\s*<\/\1>/g, '');
            //some RegEx code for the picky browsers
            var re = new RegExp("(<P)([^>]*>.*?)(<\/P>)", "gi");
            str = str.replace(re, "<div$2</div>");
            var re2 = new RegExp("(<font|<FONT)([^*>]*>.*?)(<\/FONT>|<\/font>)", "gi");
            str = str.replace(re2, "<div$2</div>");
            str = str.replace(/size|SIZE = ([\d]{1})/g, '');
            //str = str.replace(/<\/?[^>]+(>|$)/g, function (match) {
            //    return !/br|b/i.test(match) ? "" : match
            //});
            return str;
        }

        $scope.meetingTimeValidate = function (e) {
            if ((e.which >= 48 && e.which <= 57) || e.which <= 8 || (e.which == 186 && e.shiftKey) || e.which == 9) {

            }
            else { e.preventDefault(); }
        }

        $scope.meetingTimeOptions = {
            change: function (e) {

            },
            parseFormats: ["HH:mm"],
            format: "HH:mm"
        };

        $scope.kOptionsLinkage = { height: 275 };

        $timeout(function () {
            angular.element("#relmtgsgrid").height("374").find(".k-grid-content").height("318");
        }, 1000);

    }]);


eMacApp.controller('lnkgsController', function ($scope, $rootScope, $location, rootUrl) {
    $scope.milestone_data = { index: 0 };

    // corefx checkbox control
    $scope.maxSelected = function () {
        var count = 0;
        for (x in $scope.selectedCoreFx) {
            if ($scope.selectedCoreFx[x]) count++;
        }
        return (count === 6) ? true : false;
    };

    // check selected core fx for this mtg
    $scope.isChecked = function (corefx) {
        if ($scope.selectedCorefunction == undefined)
            return;

        var items = $scope.selectedCorefunction;
        for (var i = 0; i < items.length; i++) {
            if (corefx.ref_id == items[i].core_function_id) {
                return true;
            }
        }

        return false;
    };

    // reset cb model
    $scope.resetCheckedModel = function (cbModel) {
        alert(cbModel);

        return cbModel;
    };

    $scope.deliverableCats = [
            { "id": 1, text: "None", "value": true },
            { "id": 2, text: "Country office deliverables", "value": true },
            { "id": 3, text: "Regional office deliverables" }
    ];
    $scope.delcatselected = $scope.deliverableCats[0];

    $scope.delselected2 = {};

    //$scope.corefx = [
    //        { "id": 1, "name": "Providing leadership on matters critical to health and engaging in partnerships where joint action is needed." },
    //        { "id": 2, "name": "Shaping the research agenda, and stimulating the generation, dissemination and application of valuable knowledge." },
    //        { "id": 3, "name": "Setting norms and standards, and promoting and monitoring their implementation." },
    //        { "id": 4, "name": "Articulating ethical and evidence-based policy options." },
    //        { "id": 5, "name": "Providing technical support, catalyzing change and building sustainable institutional capacity." },
    //        { "id": 6, "name": "Monitoring the health and assessing health trends." }
    //];

    $scope.logIt = function () {

        $scope.myType = $scope.rescatselected;
    }

    // pb deliverables tab
    $scope.pbDeliverablesTab = function () {

        retrieveData();

        //pb deliverables
        //$scope.selectedPbCategory = {};
        //$scope.selectedPbOutcome = {};
        //$scope.selectedPbOutput = {};
        //$scope.selectedPbResolution = {};

        // category
        $scope.pbCatStateChanged = function (event, obj) {
            if (!event.target.checked) {
                var allPbOutcomeByCat = $scope.pbOutcomes.filter(function (o) {
                    return obj.pbCategory.id == o.pbcategoryid;
                });

                var allPbOutputByCat = $scope.pbOutputs.filter(function (o) {
                    return obj.pbCategory.id == o.pbcategoryid;
                });

                // reset all outcome on this category
                angular.forEach(allPbOutcomeByCat, function (o) {
                    angular.forEach($scope.selectedPbOutcome, function (value, key) {
                        //this.push(key + ': ' + value);
                        if (o.id == key) {
                            $scope.selectedPbOutcome[o.id] = false;
                        }

                    });
                });
                // reset all output on this category
                angular.forEach(allPbOutputByCat, function (o) {
                    angular.forEach($scope.selectedPbOutput, function (value, key) {
                        //this.push(key + ': ' + value);
                        if (o.id == key) {
                            $scope.selectedPbOutput[o.id] = false;
                        }

                    });
                });

                //angular.forEach($scope.selectedPbOutcome, function (value, key) {
                //    this.push(key + ': ' + value);
                //});

            }
        }

        // outcome
        $scope.pbOutcomeStateChanged = function (event, obj) {
            if (!event.target.checked) {
                var allPbOutputByOutcome = $scope.pbOutputs.filter(function (o) {
                    return obj.pbOutcome.id == o.pboutcomeid;
                });


                // reset all output on this category
                angular.forEach(allPbOutputByOutcome, function (o) {
                    angular.forEach($scope.selectedPbOutput, function (value, key) {
                        //this.push(key + ': ' + value);
                        if (o.id == key) {
                            $scope.selectedPbOutput[o.id] = false;
                        }

                    });
                });

                //angular.forEach($scope.selectedPbOutcome, function (value, key) {
                //    this.push(key + ': ' + value);
                //});

            }
        }

        var currPbCategory = {};
        var currPbOutcome = {};
        var currPbOutput = {};
        $scope.editPbdeliverables = function () {
            currPbCategory = angular.copy($scope.selectedPbCategory);
            currPbOutcome = angular.copy($scope.selectedPbOutcome);
            currPbOutput = angular.copy($scope.selectedPbOutput);

            $('#pb_select').modal('show');
        }

        $scope.close = function (form, update) {
            currPbCategory = {};
            currPbOutcome = {};
            currPbOutput = {};

            $('.modal').modal('hide');
        }


        $scope.cancelPbModal = function () {
            $scope.selectedPbCategory = currPbCategory;
            $scope.selectedPbOutcome = currPbOutcome;
            $scope.selectedPbOutput = currPbOutput;

            currPbCategory = {};
            currPbOutcome = {};
            currPbOutput = {};

            $('.modal').modal('hide');
        }

        // Can replace this with: ng-init="selectedResolution = '1'".
        //$scope.rescatselected = '1';

        // Can use parseInt(x, 10) on $scope.selectedResolution or index.toString() if you want to remove the single quotes you see in isCheckboxSelected('1').
        $scope.isResolutionSelected = function (index) {
            return index === $scope.selectedResolution;
        };
    }

    $scope.testthis = function (e) {
        var currentTabHref = $(e.target).attr('href');
        $($(e.target).attr('href')).find('.k-grid:not([data-recalculated])').each(function () {
            recalculateGridSize(this);
            $(this).attr('data-recalculated', 'true');
        });

    }


    function recalculateGridSize(gridElement) {
        gridElement = $(gridElement);
        var contentHeight = $('.k-grid-content').height();
        var headerHeight = gridElement.find('.k-grid-header').height(),
            pagerHeight = gridElement.find('.k-grid-pager').height();
        contentHeight = contentHeight - (pagerHeight + headerHeight);
        gridElement.find('.k-grid-content').css('height', contentHeight);
    };

    // get pb deliverables data
    function retrieveData() {

        $scope.pbCategories = $scope.pbCategoriesList;
        $scope.pbOutcomes = $scope.pbOutcomesList;
        $scope.pbOutputs = $scope.pbOutputsList;

        // the following are sample data for reference (not used)
        $scope.pbOutcomes1 = [
            { "id": 1, "pbcategoryid": 1, "desc": "Outcome 1.1. Increased access to key interventions for people living with HIV" },
            { "id": 2, "pbcategoryid": 1, "desc": "Outcome 1.2. Universal access to quality tuberculosis care in line with the post-2015 global tuberculosis strategy and targets" },
            { "id": 3, "pbcategoryid": 1, "desc": "Outcome 1.3. Increased access of populations at risk to preventive interventions and first-line antimalarial treatment for confirmed malaria cases" },
            { "id": 4, "pbcategoryid": 1, "desc": "Outcome 1.4. Increased and sustained access to neglected tropical disease control interventions" },
            { "id": 5, "pbcategoryid": 1, "desc": "Outcome 1.5. Increased vaccination coverage for hard-to-reach populations and communities" },
            { "id": 6, "pbcategoryid": 2, "desc": "Outcome 2.1. Increased access to interventions to prevent and manage noncommunicable diseases and their risk factors" },
            { "id": 7, "pbcategoryid": 2, "desc": "Outcome 2.2. Increased access to services for mental health and substance use disorders" },
            { "id": 8, "pbcategoryid": 2, "desc": "Outcome 2.3. Reduced risk factors and improved coverage with interventions to prevent and manage unintentional injuries and violence" },
            { "id": 9, "pbcategoryid": 2, "desc": "Outcome 2.4. Increased access to services for people with disabilities" },
            { "id": 10, "pbcategoryid": 2, "desc": "Outcome 2.5. Reduced nutritional risk factors" }
        ];

        $scope.pbOutputs1 = [
            { "id": 1, "pbcategoryid": 1, "pboutcomeid": 1, "pboutcomereso": 1, "desc": "Output 1.1.1. Increased capacity of countries to deliver key HIV interventions through active engagement in policy dialogue, development of normative guidance and tools, dissemination of strategic information, and provision of technical support" },
            { "id": 2, "pbcategoryid": 1, "pboutcomeid": 1, "pboutcomereso": 2, "desc": "Output 1.1.2. Increased capacity of countries to deliver key hepatitis interventions through active engagement in policy dialogue, development of normative guidance and tools, dissemination of strategic information, and provision of technical support" },
            { "id": 3, "pbcategoryid": 1, "pboutcomeid": 2, "pboutcomereso": 1, "desc": "Output 1.2.1. Worldwide adaptation and implementation of the global strategy and targets for tuberculosis prevention, care and control after 2015, as adopted in resolution WHA67.1" },
            { "id": 4, "pbcategoryid": 1, "pboutcomeid": 2, "pboutcomereso": 1, "desc": "Output 1.2.2. Updated policy guidelines and technical tools to support the adoption and implementation of the global strategy and targets for tuberculosis prevention, care and control after 2015, covering the three pillars: (1) integrated, patient-centred care and prevention; (2) bold policies and supportive systems; and (3) intensified research and innovation" },
            { "id": 5, "pbcategoryid": 1, "pboutcomeid": 3, "pboutcomereso": 1, "desc": "Output 1.3.1. Countries enabled to implement evidence-based malaria strategic plans, with focus on effective coverage of vector control interventions and diagnostic testing and treatment, therapeutic efficacy and insecticide resistance monitoring and surveillance through capacity strengthening for enhanced malaria reduction" },
            { "id": 6, "pbcategoryid": 1, "pboutcomeid": 3, "pboutcomereso": 2, "desc": "Output 1.3.2. Updated policy recommendations, strategic and technical guidelines on vector control, diagnostic testing, antimalarial treatment, integrated management of febrile illness, surveillance, epidemic detection and response for accelerated malaria reduction and elimination" },
            { "id": 7, "pbcategoryid": 1, "pboutcomeid": 4, "pboutcomereso": 2, "desc": "Output 1.4.1. Implementation and monitoring of the WHO road map for neglected tropical diseases facilitated" },
            { "id": 8, "pbcategoryid": 1, "pboutcomeid": 4, "pboutcomereso": 2, "desc": "Output 1.4.2. Implementation and monitoring of neglected tropical disease control interventions facilitated by evidence-based technical guidelines and technical support" },
            { "id": 9, "pbcategoryid": 1, "pboutcomeid": 4, "pboutcomereso": 1, "desc": "Output 1.4.3. New knowledge, solutions and implementation strategies that respond to the health needs of disease-endemic countries developed." },
            { "id": 10, "pbcategoryid": 1, "pboutcomeid": 5, "pboutcomereso": 1, "desc": "Output 1.5.1. Implementation and monitoring of the global vaccine action plan, with emphasis on strengthening service delivery and immunization monitoring in order to achieve the goals for the Decade of Vaccines" },
            { "id": 11, "pbcategoryid": 1, "pboutcomeid": 5, "pboutcomereso": 1, "desc": "Output 1.5.2. Intensified implementation and monitoring of measles and rubella elimination strategies facilitated" },
            { "id": 12, "pbcategoryid": 1, "pboutcomeid": 5, "pboutcomereso": 1, "desc": "Output 1.5.3. Target product profiles for new vaccines and other immunization-related technologies, as well as research priorities, defined and agreed, in order to develop vaccines of public health importance and overcome barriers to immunization" }
        ];

        $scope.pbDeliverables = [
            { "id": 1, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 1, "desc": "Facilitate updating of national strategies, guidelines and tools in line with global and regional consolidated guidance for HIV prevention, care and treatment" },
            { "id": 2, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 1, "desc": "Strengthen country capacity to generate and systematically use strategic information through national information systems and routine programme monitoring, in line with global norms and standards" },
            { "id": 3, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 1, "desc": "Strengthen country capacity to provide key HIV interventions through training, mentorship and supervision using adapted manuals, tools and curricula" },
            { "id": 4, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 1, "desc": "Support countries in mapping national HIV technical assistance needs and facilitate provision of adequate, high-quality technical assistance for programme management, governance, implementation and domestic and foreign resource mobilization" },
            { "id": 5, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 2, "desc": "Facilitate the development and implementation of regional HIV/AIDS strategies and action plans aligned with the global health sector strategy on HIV/AIDS, 2016–2021" },
            { "id": 6, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 2, "desc": "Track progress in implementation of regional strategies through regular reviews and reports" },
            { "id": 7, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 2, "desc": "Support the dissemination, adaptation and implementation of global guidelines on HIV prevention, diagnosis, care and treatment" },
            { "id": 8, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 2, "desc": "Develop and promote regional policies, practices and integrated service delivery approaches in order to promote equitable access to HIV prevention, diagnosis, care and treatment, including prevention of mother-to-child transmission with the goal of elimination of mother-to-child transmission" },
            { "id": 9, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 2, "desc": "Establish regional expert networks of quality assured technical assistance providers to support countries in implementing WHO guidelines" },
            { "id": 10, "pbcategoryid": 1, "pboutputid": 1, "pbDelCategory": 2, "desc": "Support country offices in policy dialogue, technical assistance and capacity building for national HIV programmes" }
        ];

        $scope.delselected = $scope.pbDeliverables[0];
    }
});

// objectives
eMacApp.controller('objectivesController', function ($scope, $rootScope, $location, rootUrl) {
    var objectives = [
       { "objective": 1, "assessment": "Assessment 1", "status": "Status", "ffupDate": "12/22/2000", "ffupAction": "The Shawshank Redemption" },
       { "objective": 2, "assessment": "Assessment 2", "status": "Status", "ffupDate": "12/22/2000", "ffupAction": "The Shawshank Redemption" },
       { "objective": 3, "assessment": "Assessment 3", "status": "Status", "ffupDate": "12/22/2000", "ffupAction": "The Shawshank Redemption" },
       { "objective": 4, "assessment": "Assessment 4", "status": "Status", "ffupDate": "12/22/2000", "ffupAction": "The Shawshank Redemption" },
       { "objective": 5, "assessment": "Assessment 5", "status": "Status", "ffupDate": "12/22/2000", "ffupAction": "The Shawshank Redemption" },
    ];


    $scope.objectivesDataSource = new kendo.data.DataSource({
        data: objectives,
        schema: {

            data: function (data) { return data; },
            model: {
                id: "id",
                fields: {
                    objective: { type: "string", validation: { required: true } },
                    number: { assessment: "string" },
                    status: { type: "string" },
                    ffupDate: { type: "date" },
                    ffupAction: { type: "date" }
                }
            }
        },
        pageSize: 20
    });

    $scope.onDataBound = function (e) {
        $('#objectivesgrid .k-grid-content').height(205);
    };

    //$scope.objDataSrc = objDataSource;

    $("#objectivesgrid").on("dblclick", "tr.k-state-selected", function () {
        var grid = $("#objectivesgrid").data("kendoGrid");

        var currentDataItem = grid.dataItem($(this));
        $scope.edit(currentDataItem);


        //$location.url(base + 'meetings/edittest/' + currentDataItem.meetingID);

        //waitingDialog.show();
    });

    $scope.createtoolbarTemplate = kendo.template($("#addobjtemp").html());
    $scope.create = function (e) {
        // clear form here...
        $scope.newobj = {};

        $('#newobjfm').modal('show');
    }
    $scope.close = function (form, update) {
        $scope.newobj = angular.copy(update);
        $scope.form = form;

        $('.modal').modal('hide');
        //if (form.$dirty) {
        //    $scope.modal = $modal.open({
        //        animation: true,
        //        templateUrl: 'close.html',
        //        windowClass: 'confirmClass',
        //        scope: $scope
        //    });
        //}
        //else {
        //    $('.modal').modal('hide');
        //}
    }
    $scope.cancel = function () {
        $scope.modal.dismiss();
    }
    $scope.hide = function () {
        $scope.newobj = {};
        $scope.form.$setPristine();
        $scope.modal.dismiss();
        $('.modal').modal('hide');

    }
    $scope.edit = function (update) {
        $scope.$apply(function () {
            $scope.newobj = update;
            $('#newobjfm').modal('show');
        });

    }
    $scope.save = function (update) {

        debugger;
        $scope.objectivesDataSource.add(update);
        //$('#hgrid').data('kendoGrid').dataSource.read();
        //$('#hgrid').data('kendoGrid').refresh();

        $('.modal').modal('hide');
    }
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

});

eMacApp.controller('participantsController', function ($scope, $rootScope, $location, rootUrl) {
    var participantGridChanged = {};
    //var participantsTemp = {};
    var isUpdate = false;
    var selPartObj = {};

    var participants = [
            //{ "id": 1, "country": "Brunei Darussalam", "number" : 2, "funded": "SEARO", "selffunded":""},
            //{ "id": 2, "country": "Cambodia", "number": 2, "funded": "SEARO", "selffunded": "" },
            //{ "id": 3, "country": "Marshall Islands", "number": 2, "funded": "SEARO", "selffunded": "" },
            //{ "id": 4, "country": "Philippines", "number": 2, "funded": "SEARO", "selffunded": "" },
            //{ "id": 5, "country": "Samoa", "number": 2, "funded": "SEARO", "selffunded": "" },
            //{ "id": 6, "country": "Viet Nam", "number": 2, "funded": "SEARO", "selffunded": "" }
    ];

    var participantsCountry = [
            { "id": 1, "country": "Brunei Darussalam", "number": 2, "funded": "SEARO", "selffunded": "" },
            { "id": 2, "country": "Cambodia", "number": 2, "funded": "SEARO", "selffunded": "" },
            { "id": 3, "country": "Marshall Islands", "number": 2, "funded": "SEARO", "selffunded": "" },
            { "id": 4, "country": "Philippines", "number": 2, "funded": "SEARO", "selffunded": "" },
            { "id": 5, "country": "Samoa", "number": 2, "funded": "SEARO", "selffunded": "" },
            { "id": 6, "country": "Viet Nam", "number": 2, "funded": "SEARO", "selffunded": "" }
    ];

    //$scope.countryParticipant = {};
    $scope.participantsDataSource = new kendo.data.DataSource({
        //data: $scope.countryParticipant,
        transport: {
            read:
                function (options) {
                    if (options.data[0] != undefined) {
                        //var result = JSON.parse(options.data)
                        options.success($scope.countryParticipant);
                    }
                    else
                        options.success(participants);
                },
            destroy: function (options) {
                console.log(options.data);
                $scope.delParticipantRecords.push(options.data);
            }
        },
        schema: {
            data: function (data) { return data; },
            model: {
                id: "mtg_participant_ctry_id",
                fields: {
                    mtg_id: { type: "number" },
                    ctry_code: { type: "string", validation: { required: true } },
                    ctry_name: { type: "string" },
                    no_of_participants: { type: "number", validation: { required: true, min: 1 } },
                    fund_source: { type: "string" },
                    is_modified: { type: "bool" },
                    created_by: { type: "string" },
                    updated_by: { type: "string" }
                }
            }
        },
        pageSize: 20,
        sort: {
            field: "ctry_name",
            dir: "asc"
        }
    });

    //$scope.objDataSrc = objDataSource;
    $scope.onDataBound = function (e) {
        $('#participantsgrid .k-grid-content').height(150);
    };

    //$scope.objDataSrc = objDataSource;
    $("#participantsgrid").on("dblclick", "tr.k-state-selected", function () {
        isUpdate = true;

        var grid = $("#participantsgrid").data("kendoGrid");

        //alert('hi');
        var currentDataItem = grid.dataItem($(this));
        selPartObj = angular.copy(currentDataItem);

        $scope.edit(currentDataItem);
        //$location.url(base + 'meetings/edittest/' + currentDataItem.meetingID);

        //waitingDialog.show();
    });

    $scope.createtoolbarTemplate = kendo.template($("#addparticipanttemp").html());

    $scope.create = function (e) {
        isUpdate = false;

        // clear form here...
        $scope.newparticipant = {};
        //set default to participant
        $scope.newparticipant.fund_source = $scope.participantFundSrcs[0].ref_name;

        $('#newparticipantfm').modal('show');
    }
    $scope.close = function (form, update) {
        $scope.newparticipant = angular.copy(update);
        $scope.form = form;

        if (update.id != undefined) {
            $scope.participantsDataSource.remove(update);
            $scope.participantsDataSource.add(selPartObj);
        }

        $('.modal').modal('hide');
    }
    $scope.cancel = function () {
        $scope.modal.dismiss();
    }
    $scope.hide = function () {
        $scope.newparticipant = {};
        $scope.form.$setPristine();
        $scope.modal.dismiss();
        $('.modal').modal('hide');
    }
    $scope.edit = function (update) {
        $scope.$apply(function () {
            $scope.newparticipant = update;
            $('#newparticipantfm').modal('show');
        });

    }
    $scope.save = function (update) {
        debugger;
        update.ctry_name = $scope.states.filter(function (el) {
            return el.ctry_code == update.ctry_code;
        })[0].ctry_name;

        if (!isUpdate) {
            // set new record ids to 0
            update.id = 0;
            update.mtg_id = $scope.mtgId;
            update.mtg_participant_ctry_id = 0;
            update.user_name = $('#curr_user').text();

            $scope.countryParticipant.push(update);
            $scope.participantsDataSource.add(update);
            //$('#hgrid').data('kendoGrid').dataSource.read();
            //$('#hgrid').data('kendoGrid').refresh();
        }
        else {
            // flag record modified
            update.is_modified = true;
            update.user_name = $('#curr_user').text();
        }

        $('.modal').modal('hide');
    }

    $scope.$watchCollection('participantsDataSource', function (newValue, oldValue) {
        if (newValue != oldValue) {
            //$scope.dataHasChanged = angular.equals($scope.meeting, $scope.originalMtg);
            participantGridChanged = !angular.equals(newValue, $scope.originalMtgDetail);
        }
    }, true);


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
});

// resolutions
eMacApp.controller("resolutionsController", function ($scope, $rootScope, $modal, $location, rootUrl) {
    var isUpdate = false;
    var selResolnObj = {};

    var pbResolutions = [
          //{ "id": 1, "resolutiontitle": "WHA51.28 Environmental matters: Strategy on sanitation for high-risk communities, 16 May 1998", "resolutiontype": "Global" },
          //{ "id": 1, "resolutiontitle": "WHA56.22 Strategic approach to international chemicals management: participation of global health partners, 28 May 2003", "resolutiontype": "Global" },
          //{ "id": 1, "resolutiontitle": "WHA61.19 Climate change and health, 24 May 2008", "resolutiontype": "Global" },
          //{ "id": 1, "resolutiontitle": "WPR/RC56.R7 Environmental Health, 23 September 2005", "resolutiontype": "Regional" },
          //{ "id": 1, "resolutiontitle": "WPR/RC59.R7 Protecting Health from Climate Change, 26 September 2008  ", "resolutiontype": "Regional" }

    ];

    $scope.resolutionsDataSource = new kendo.data.DataSource({
        //data: pbResolutions,
        transport: {
            read:
                function (options) {
                    if (options.data[0] != undefined) {
                        //var result = JSON.parse(options.data)
                        options.success($scope.linkagesToResolution);
                    }
                    else
                        options.success(pbResolutions);
                },
            destroy: function (options) {
                console.log(options.data);
                $scope.delResolutionRecords.push(options.data);
            }
        },
        schema: {
            data: function (data) { return data; },
            model: {
                id: "mtg_resolution_linkage_id",
                fields: {
                    mtg_id: { type: "number" },
                    resolution_title: { type: "string" },
                    type: { type: "string" },
                    is_modified: { type: "bool" },
                    created_by: { type: "string" },
                    updated_by: { type: "string" }
                }
            }
        },
        pageSize: 20
    });

    //$scope.objDataSrc = objDataSource;
    $scope.onDataBound = function (e) {
        $('#resgrid .k-grid-content').height(219);
    };

    $("#resgrid").on("dblclick", "tr.k-state-selected", function () {

        isUpdate = true;

        var grid = $("#resgrid").data("kendoGrid");

        //alert('hi');
        var currentDataItem = grid.dataItem($(this));
        selResolnObj = angular.copy(currentDataItem);

        $scope.edit(currentDataItem);

        //$location.url(base + 'meetings/edittest/' + currentDataItem.meetingID);

        //waitingDialog.show();
    });

    // modal
    $scope.createtoolbarTemplate = kendo.template($("#addlnkgsresoln").html());
    $scope.create = function (e) {

        isUpdate = false;
        // clear form here...
        $scope.newres = {};
        //set default to resln
        $scope.newres.type = $scope.resolutionTypes[0].ref_name;

        $("#newresofm").modal("show");
    }
    $scope.close = function (form, update) {
        //$scope.newres = angular.copy(update);
        $scope.form = form;

        if (update.id != undefined) {
            $scope.resolutionsDataSource.remove(update);
            $scope.resolutionsDataSource.add(selResolnObj);
        }

        $('#newresofm').modal('hide');
    }
    $scope.cancel = function () {
        $scope.modal.dismiss();
    }
    $scope.hide = function () {
        $scope.newres = {};
        $scope.form.$setPristine();
        $scope.modal.dismiss();
        $("#newresofm").modal('hide');

    }
    $scope.edit = function (update) {
        $scope.$apply(function () {
            $scope.newres = update;
            $('#newresofm').modal('show');
        });

    }
    $scope.save = function (update) {

        if (!isUpdate) {
            // set new record ids to 0
            update.id = 0;
            update.mtg_id = $scope.mtgId;
            update.mtg_linkages_resolution_id = 0;
            update.user_name = $('#curr_user').text();

            $scope.linkagesToResolution.push(update);
            $scope.resolutionsDataSource.add(update);
            //$('#hgrid').data('kendoGrid').dataSource.read();
            //$('#hgrid').data('kendoGrid').refresh();
        }
        else {
            // flag record modified
            update.is_modified = true;
            update.user_name = $('#curr_user').text();
        }

        $('.modal').modal('hide');
    }

    // fix modal
    $('#newresofm').modal({
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

});

// related meetings
eMacApp.controller('relmtgsController', function ($scope, $rootScope, $location, rootUrl) {
    var isUpdate = false;
    var selRelMtgObj = {};

    var relatedmtgs = [
           //{ "id": 1, "title": "Test data 1", "date": "2015-08-31T16:00:00.000Z", "recommendations": "test recommendations" },
           //{ "id": 1, "title": "Test data 2", "date": "2015-08-31T16:00:00.000Z", "recommendations": "test recommendations" },
           //{ "id": 1, "title": "Test data 3", "date": "2015-08-31T16:00:00.000Z", "recommendations": "test recommendations" },
           //{ "id": 1, "title": "Test data 4", "date": "2015-08-31T16:00:00.000Z", "recommendations": "test recommendations" },
           //{ "id": 1, "title": "Test data 5", "date": "2015-08-31T16:00:00.000Z", "recommendations": "test recommendations" }
    ];


    $scope.relmtgsDataSource = new kendo.data.DataSource({
        transport: {
            read:
                function (options) {
                    if (options.data[0] != undefined) {
                        //var result = JSON.parse(options.data)

                        options.success($scope.relatedMeetings);
                    }
                    else
                        options.success(relatedmtgs);
                },
            destroy: function (options) {
                console.log(options.data);
                $scope.delRelatedMtgRecords.push(options.data);
            }
        },
        schema: {
            data: function (data) { return data; },
            model: {
                id: "mtg_related_meeting_id",
                fields: {
                    mtg_id: { type: "number" },
                    related_meeting_title: { type: "string" },
                    recommendation_comment: { type: "string" },
                    completion_date: { type: "date" },
                    is_modified: { type: "bool" },
                    created_by: { type: "string" },
                    updated_by: { type: "string" }
                }
            }
        },
        pageSize: 20
    });


    $scope.onDataBound = function (e) {
        //$('#relmtgsgrid .k-grid-content').height(207);
    };

    //$scope.objDataSrc = objDataSource;

    $("#relmtgsgrid").on("dblclick", "tr.k-state-selected", function () {

        isUpdate = true;

        var grid = $("#relmtgsgrid").data("kendoGrid");

        //alert('hi');
        var currentDataItem = grid.dataItem($(this));
        selRelMtgObj = angular.copy(currentDataItem);

        if (currentDataItem.completion_date !== null && currentDataItem.completion_date !== '') {
            var newDate = kendo.parseDate(currentDataItem.completion_date, 'yyyy-MM-dd');
            if (newDate)
                currentDataItem.completion_date = kendo.toString(kendo.parseDate(currentDataItem.completion_date, 'yyyy-MM-dd'), 'dd MMM yyyy');
        }

        //$location.url(base + 'meetings/edittest/' + currentDataItem.meetingID);

        //waitingDialog.show();
        $scope.edit(currentDataItem);

    });


    $scope.createtoolbarTemplate = $("#addrelmtgstemp").html();
    $scope.create = function (e) {
        isUpdate = false;
        // clear form here...
        $scope.newrelmtg = {};

        $('#newrelmtgfm').modal('show');
    }
    $scope.close = function (form, update) {
        //$scope.newrelmtg = angular.copy(update);
        $scope.form = form;

        // refresh grid
        //var grid = $("#relmtgsgrid").data("kendoGrid");
        //grid.dataSource.data() = oldRelMtgDataSrcObj;
        //$scope.relatedMeetings = oldRelMtgDataSrcObj;

        if (update.id != undefined) {
            $scope.relmtgsDataSource.remove(update);
            $scope.relmtgsDataSource.add(selRelMtgObj);
        }

        //$('#relmtgsgrid').data('kendoGrid').dataSource.data();
        //$('#relmtgsgrid').data('kendoGrid').dataSource.read('true');

        // close dialog
        $('.modal').modal('hide');
        //if (form.$dirty) {
        //    $scope.modal = $modal.open({
        //        animation: true,
        //        templateUrl: 'close.html',
        //        windowClass: 'confirmClass',
        //        scope: $scope
        //    });
        //}
        //else {
        //    $('.modal').modal('hide');
        //}
    }
    $scope.cancel = function () {
        $scope.modal.dismiss();
    }
    $scope.hide = function () {
        $scope.newrelmtg = {};
        $scope.form.$setPristine();
        $scope.modal.dismiss();
        $('.modal').modal('hide');

    }
    $scope.edit = function (update) {
        $scope.$apply(function () {

            $scope.newrelmtg = update;
            $('#newrelmtgfm').modal('show');
        });

    }
    $scope.save = function (update) {
        debugger;
        //$scope.relmtgsDataSource.add(update);
        //$('#hgrid').data('kendoGrid').dataSource.read();
        //$('#hgrid').data('kendoGrid').refresh();

        if (!isUpdate) {
            // set new record ids to 0
            update.id = 0;
            update.mtg_id = $scope.mtgId;
            update.mtg_related_meeting_id = 0;
            update.user_name = $('#curr_user').text();

            if (update.completion_date !== null && update.completion_date !== '') {
                var newDate = kendo.parseDate(update.completion_date, 'dd/MM/yyyy');
                if (newDate)
                    update.completion_date = kendo.toString(kendo.parseDate(update.completion_date, 'dd/MM/yyyy'), 'dd MMM yyyy');
            }

            //if (update.completion_date !== "")
            //    update.completion_date.toJSON = function () { return moment(this).format('DD MMM YYYY'); }

            $scope.relatedMeetings.push(update);
            $scope.relmtgsDataSource.add(update);
            //$('#hgrid').data('kendoGrid').dataSource.read();
            //$('#hgrid').data('kendoGrid').refresh();
        }
        else {
            //if (update.completion_date !== "")
            //    update.completion_date.toJSON = function () { return moment(this).format('DD MMM YYYY'); }
            // flag record modified
            $scope.relmtgsDataSource.remove(update);

            update.is_modified = true;
            update.user_name = $('#curr_user').text();

            if (update.completion_date !== null && update.completion_date !== '') {
                var newDate = kendo.parseDate(update.completion_date, 'dd/MM/yyyy');
                if (newDate)
                    update.completion_date = kendo.toString(kendo.parseDate(update.completion_date, 'dd/MM/yyyy'), 'dd MMM yyyy');
            }

            $scope.relmtgsDataSource.add(update);
        }

        $('.modal').modal('hide');
    }
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

    $('#newrelmtgfm').modal({
        show: false,
        backdrop: 'static',
        keyboard: false
    });

    //// test
    //$("#testGrid").kendoGrid({
    //    columnMenu: true,
    //    columns: [
    //       {
    //           field: "title",
    //           title: "Meeting tile"
    //       },
    //       {
    //           field: "date",
    //           title: "Date of report completion",
    //           format: "{0:yyyy-MM-dd}"
    //       },
    //       {
    //           field: "recommendations",
    //           title: "Recommendations"
    //       }
    //    ],
    //    pageable: {
    //        pageSize: 20
    //    },
    //    editable: "popup",
    //    height: 300,
    //    filterable: true,
    //    sortable: true,
    //    dataSource: {
    //        data: relatedmtgs,
    //        schema: {
    //            model: {
    //                id: "id",
    //                fields: {
    //                    title: { type: "string", validation: { required: true } },
    //                    date: { type: "date" },
    //                    recommendations: { type: "string" }
    //                }
    //            }
    //        }
    //    }
    //});



});

// temp advisers
eMacApp.controller('tempadviserController', function ($scope, $rootScope, $location, rootUrl) {
    var tempAdvisers = [
           { "id": 1, "name": "test name 1", "position": "test position", "institution": "test institution", "address": "test address", "telno": "123456", "email": "test@email.com", "comment": "test comment" },
           { "id": 2, "name": "test name 2", "position": "test position", "institution": "test institution", "address": "test address", "telno": "123456", "email": "test@email.com", "comment": "test comment" },
           { "id": 3, "name": "test name 3", "position": "test position", "institution": "test institution", "address": "test address", "telno": "123456", "email": "test@email.com", "comment": "test comment" },
           { "id": 4, "name": "test name 4", "position": "test position", "institution": "test institution", "address": "test address", "telno": "123456", "email": "test@email.com", "comment": "test comment" },
           { "id": 5, "name": "test name 5", "position": "test position", "institution": "test institution", "address": "test address", "telno": "123456", "email": "test@email.com", "comment": "test comment" }
    ];


    $scope.tempAdviserDataSource = new kendo.data.DataSource({
        data: tempAdvisers,
        schema: {
            //parse: function (response) {
            //    $.each(response, function (idx, elem) {
            //        if (elem.startDate && typeof elem.startDate === "string") {
            //            elem.startDate = kendo.parseDate(elem.startDate, "yyyy-MM-ddTHH:mm:ss.fffZ");
            //        }
            //        if (elem.endDate && typeof elem.endDate === "string") {
            //            elem.endDate = kendo.parseDate(elem.endDate, "yyyy-MM-ddTHH:mm:ss.fffZ");
            //        }
            //    });
            //    return response;
            //},
            data: function (data) { return data; },
            model: {
                id: "id",
                fields: {
                    name: { type: "string", validation: { required: true } },
                    position: { type: "string" },
                    institution: { type: "string" },
                    address: { type: "string" },
                    telno: { type: "string" },
                    email: { type: "string" },
                    comment: { type: "string" }
                }
            }
        },
        pageSize: 20
    });

    $scope.onDataBound = function (e) {
        $('#tempadvisergrid .k-grid-content').height(207);
    };

    //$scope.objDataSrc = objDataSource;
    $("#tempadvisergrid").on("dblclick", "tr.k-state-selected", function () {
        var grid = $("#tempadvisergrid").data("kendoGrid");

        //alert('hi');
        var currentDataItem = grid.dataItem($(this));

        $scope.edit(currentDataItem);
        //$location.url(base + 'meetings/edittest/' + currentDataItem.meetingID);

        //waitingDialog.show();
    });

    $scope.createtoolbarTemplate = kendo.template($("#addtempadvtemp").html());

    $scope.create = function (e) {
        // clear form here...
        $scope.newtempadv = {};

        $('#newtempadvfm').modal('show');
    }
    $scope.close = function (form, update) {
        $scope.newtempadv = angular.copy(update);
        $scope.form = form;

        $('.modal').modal('hide');
        //if (form.$dirty) {
        //    $scope.modal = $modal.open({
        //        animation: true,
        //        templateUrl: 'close.html',
        //        windowClass: 'confirmClass',
        //        scope: $scope
        //    });
        //}
        //else {
        //    $('.modal').modal('hide');
        //}
    }
    $scope.cancel = function () {
        $scope.modal.dismiss();
    }
    $scope.hide = function () {
        $scope.newtempadv = {};
        $scope.form.$setPristine();
        $scope.modal.dismiss();
        $('.modal').modal('hide');

    }
    $scope.edit = function (update) {
        $scope.$apply(function () {
            $scope.newtempadv = update;
            $('#newtempadvfm').modal('show');
        });

    }
    $scope.save = function (update) {

        debugger;
        $scope.tempAdviserDataSource.add(update);
        //$('#hgrid').data('kendoGrid').dataSource.read();
        //$('#hgrid').data('kendoGrid').refresh();

        $('.modal').modal('hide');
    }
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
});


//observersController
eMacApp.controller('observersController', function ($scope, $rootScope, $location, rootUrl) {
    var observers = [
           { "id": 1, "representative": "representative 1", "comment": "test comment" },
           { "id": 2, "representative": "representative 2", "comment": "test comment" },
           { "id": 3, "representative": "representative 3", "comment": "test comment" },
           { "id": 4, "representative": "representative 4", "comment": "test comment" },
           { "id": 5, "representative": "representative 5", "comment": "test comment" }
    ];


    //$scope.representativeDataSource = new kendo.data.DataSource({
    //    data: observers,
    //    schema: {
    //        //parse: function (response) {
    //        //    $.each(response, function (idx, elem) {
    //        //        if (elem.startDate && typeof elem.startDate === "string") {
    //        //            elem.startDate = kendo.parseDate(elem.startDate, "yyyy-MM-ddTHH:mm:ss.fffZ");
    //        //        }
    //        //        if (elem.endDate && typeof elem.endDate === "string") {
    //        //            elem.endDate = kendo.parseDate(elem.endDate, "yyyy-MM-ddTHH:mm:ss.fffZ");
    //        //        }
    //        //    });
    //        //    return response;
    //        //},
    //        data: function (data) { return data; },
    //        model: {
    //            id: "id",
    //            fields: {
    //                representative: { type: "string", validation: { required: true } },
    //                comment: { type: "string" }                  
    //            }
    //        }
    //    },
    //    pageSize: 20
    //});

    // custom logic start

    var sampleDataNextID = observers.length + 1;

    function getIndexById(id) {
        var idx,
            l = observers.length;

        for (var j; j < l; j++) {
            if (observers[j].id == id) {
                return j;
            }
        }
        return null;
    }

    // custom logic end

    $scope.representativeDataSource = new kendo.data.DataSource({
        transport: {
            read: function (e) {
                // on success
                e.success(observers);

                // on failure
                //e.error("XHR response", "status code", "error message");
            },
            create: function (e) {
                // assign an ID to the new item
                e.data.id = sampleDataNextID++;
                // save data item to the original datasource
                observers.push(e.data);
                // on success
                e.success(e.data);
                // on failure
                //e.error("XHR response", "status code", "error message");
            },
            update: function (e) {
                // locate item in original datasource and update it
                observers[getIndexById(e.data.id)] = e.data;
                // on success
                e.success();
                // on failure
                //e.error("XHR response", "status code", "error message");
            },
            destroy: function (e) {
                // locate item in original datasource and remove it
                observers.splice(getIndexById(e.data.id), 1);
                // on success
                e.success();
                // on failure
                //e.error("XHR response", "status code", "error message");
            }
        },
        error: function (e) {
            // handle data operation error
            alert("Status: " + e.status + "; Error message: " + e.errorThrown);
        },
        schema: {
            //parse: function (response) {
            //    $.each(response, function (idx, elem) {
            //        if (elem.startDate && typeof elem.startDate === "string") {
            //            elem.startDate = kendo.parseDate(elem.startDate, "yyyy-MM-ddTHH:mm:ss.fffZ");
            //        }
            //        if (elem.endDate && typeof elem.endDate === "string") {
            //            elem.endDate = kendo.parseDate(elem.endDate, "yyyy-MM-ddTHH:mm:ss.fffZ");
            //        }
            //    });
            //    return response;
            //},
            model: {
                id: "id",
                fields: {
                    representative: { type: "string", validation: { required: true } },
                    comment: { type: "string" }
                }
            }
        },
        pageSize: 20
    });

    //$scope.objDataSrc = objDataSource;
    $scope.onDataBound = function (e) {
        $('#observergrid .k-grid-content').height(207);
    };

    $("#observergrid").on("dblclick", "tr.k-state-selected", function () {
        var grid = $("#observergrid").data("kendoGrid");

        //alert('hi');
        var currentDataItem = grid.dataItem($(this));
        $scope.edit(currentDataItem);


        //$location.url(base + 'meetings/edittest/' + currentDataItem.meetingID);

        //waitingDialog.show();
    });

    $scope.createtoolbarTemplate = kendo.template($("#addobjtemp").html());

    $scope.create = function (e) {
        // clear form here...
        $scope.newrep = {};

        $('#newrepfm').modal('show');
    }
    $scope.close = function (form, update) {
        $scope.newrep = angular.copy(update);
        $scope.form = form;

        $('.modal').modal('hide');
        //if (form.$dirty) {
        //    $scope.modal = $modal.open({
        //        animation: true,
        //        templateUrl: 'close.html',
        //        windowClass: 'confirmClass',
        //        scope: $scope
        //    });
        //}
        //else {
        //    $('.modal').modal('hide');
        //}
    }
    $scope.cancel = function () {
        $scope.modal.dismiss();
    }
    $scope.hide = function () {
        $scope.newrep = {};
        $scope.form.$setPristine();
        $scope.modal.dismiss();
        $('.modal').modal('hide');

    }
    $scope.edit = function (update) {
        $scope.$apply(function () {
            $scope.newrep = update;
            $('#newrepfm').modal('show');
        });

    }
    $scope.save = function (update) {

        debugger;
        $scope.representativeDataSource.add(update);
        //$('#hgrid').data('kendoGrid').dataSource.read();
        //$('#hgrid').data('kendoGrid').refresh();

        $('.modal').modal('hide');
    }
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
});

//budgetsController
eMacApp.controller('budgetsController', function ($scope, $rootScope, $timeout, $location, rootUrl) {
    var isUpdate = false;
    var selFundObj = {};

    var budgets = [
           //{ "id": 1, "ptaeo": "WPDHS1408885/15.1", "srcoffund": "CVC", "fundsavailable": "80000", "estcost": "46466" }
    ];


    $scope.budgetsDataSource = new kendo.data.DataSource({
        transport: {
            read:
                function (options) {
                    if (options.data[0] != undefined) {
                        //var result = JSON.parse(options.data)
                        options.success($scope.meetingBudget);
                    }
                    else
                        options.success(budgets);
                },
            destroy: function (options) {
                console.log(options.data);
                $scope.deletedMtgBudget.push(options.data);
            }
        },
        schema: {
            data: function (data) { return data; },
            model: {
                id: "mtg_budget_id",
                fields: {
                    mtg_id: { type: "number" },
                    ptaeo: { type: "string" },
                    src_of_fund: { type: "string" },
                    funds_available: { type: "number" },
                    estimated_cost: { type: "number" },
                    is_modified: { type: "bool" },
                    created_by: { type: "string" },
                    updated_by: { type: "string" }
                }
            }
        },
        pageSize: 20
    });


    $scope.onDataBound = function (e) {
    };

    //$scope.objDataSrc = objDataSource;
    $("#budgetsgrid").on("dblclick", "tr.k-state-selected", function () {

        isUpdate = true;

        var grid = $("#budgetsgrid").data("kendoGrid");

        //alert('hi');
        var currentDataItem = grid.dataItem($(this));
        selFundObj = angular.copy(currentDataItem);

        $scope.edit(currentDataItem);

        //$location.url(base + 'meetings/edittest/' + currentDataItem.meetingID);

        //waitingDialog.show();
    });

    $scope.createfundtoolbarTemplate = kendo.template($("#addfundingtemp").html());

    $scope.create = function (e) {
        isUpdate = false;
        // clear form here...
        $scope.newbudget = {};

        $('#newbudgetfm').modal('show');
    }
    $scope.close = function (form, update) {
        $scope.newbudget = angular.copy(update);
        $scope.form = form;

        if (update.id != undefined) {
            $scope.budgetsDataSource.remove(update);
            $scope.budgetsDataSource.add(selFundObj);
        }

        $('.modal').modal('hide');
        //if (form.$dirty) {
        //    $scope.modal = $modal.open({
        //        animation: true,
        //        templateUrl: 'close.html',
        //        windowClass: 'confirmClass',
        //        scope: $scope
        //    });
        //}
        //else {
        //    $('.modal').modal('hide');
        //}
    }
    $scope.cancel = function () {
        $scope.modal.dismiss();
    }
    $scope.hide = function () {
        $scope.newbudget = {};
        $scope.form.$setPristine();
        $scope.modal.dismiss();
        $('.modal').modal('hide');

    }
    $scope.edit = function (update) {
        $scope.$apply(function () {
            $scope.newbudget = update;
            $('#newbudgetfm').modal('show');
        });

    }
    $scope.save = function (update) {

        debugger;
        if (!isUpdate) {
            // set new record ids to 0
            update.id = 0;
            update.mtg_id = $scope.mtgId;
            update.mtg_budget_id = 0;
            update.user_name = $('#curr_user').text();

            // validate ptaeo format
            var isPtaeoValid = validatePtaeo(update);
            if (!isPtaeoValid)
                return;

            $scope.meetingBudget.push(update);
            $scope.budgetsDataSource.add(update);
        }
        else {
            // validate ptaeo format
            var isPtaeoValid = validatePtaeo(update);
            if (!isPtaeoValid)
                return;


            // flag record modified
            update.is_modified = true;
            update.user_name = $('#curr_user').text();
        }

        $('.modal').modal('hide');
    }

    $(".num-txt").keydown(function (event) {
        if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) // 0-9 or numpad 0-9
        {
            // check textbox value now and tab over if necessary
        }
        else if (event.keyCode != 8 && event.keyCode != 46 && event.keyCode != 37 && event.keyCode != 39) // not esc, del, left or right
        {
            event.preventDefault();
        }
        // else the key should be handled normally
    });

    // check ptaeo format
    function validatePtaeo(update) {
        // validate ptaeo format
        var pFormat = update.ptaeo.split('/');
        if (pFormat.length < 2) {
            toastr.warning('PTAEO format invalid', 'Invalid format');

            return false;
        }
        else {
            if (pFormat[0] && pFormat[0].length != 12) {
                toastr.warning('PTAEO format is ex: WPDPM0801814/8.1/53426/503/WP_TRA', 'Invalid project');
                return false;
            }
            else if (pFormat[1].length < 3 || pFormat[1].indexOf('.') === -1) {
                toastr.warning('PTAEO format is ex: WPDPM0801814/8.1/53426/503/WP_TRA', 'Invalid task');
                return false;
            }
            else if (pFormat[2].length != 5 || !$.isNumeric(pFormat[2])) {
                toastr.warning('PTAEO format is ex: WPDPM0801814/8.1/53426/503/WP_TRA', 'Invalid award');
                return false;
            }
            else if (pFormat[3] && (pFormat[3].length != 3 || !$.isNumeric(pFormat[3]))) {
                toastr.warning('PTAEO format is ex: WPDPM0801814/8.1/53426/503/WP_TRA', 'Invalid expenditure');
                return false;
            }
            else if (pFormat[4] && pFormat[4].length == 0) {
                toastr.warning('PTAEO format is ex: WPDPM0801814/8.1/53426/503/WP_TRA', 'Invalid organization');
                return false;
            }
            else
                return true;
        }
    }

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

    $scope.convertToMoney = function (string) {
        var val = string;
        var nonDecimal = val.split(".")[0] == "" ? "0" : val.split(".")[0].replace(/\,/g, "");
        var decimal = val.split(".")[1] == undefined ? ".00" : "." + val.split(".")[1];
        var currLen = 0;

        for (var i = 0; i <= nonDecimal.length - 1; i++) {
            if (currLen != 3) {
                decimal = nonDecimal.substr((nonDecimal.length - i) - 1, 1) + decimal;
                currLen += 1;
            }
            else {
                decimal = nonDecimal.substr((nonDecimal.length - i) - 1, 1) + "," + decimal;
                currLen = 1;
            }
        }
        return decimal;
    }


    $timeout(function () {
        $("#budgetsgrid").find(".k-grid-content").height("200");
    }, 1000);
});

// test
eMacApp.controller('TestCtrl', function ($scope) {
    var tabClasses;

    function initTabs() {
        tabClasses = ["", "", "", ""];
    }

    $scope.getTabClass = function (tabNum) {
        return tabClasses[tabNum];
    };

    $scope.getTabPaneClass = function (tabNum) {
        return "tab-pane " + tabClasses[tabNum];
    }

    $scope.setActiveTab = function (tabNum) {
        initTabs();
        tabClasses[tabNum] = "active";
    };

    $scope.tab1 = "This is first section";
    $scope.tab2 = "This is SECOND section";
    $scope.tab3 = "This is THIRD section";
    $scope.tab4 = "This is FOUTRH section";

    //Initialize 
    initTabs();
    $scope.setActiveTab(1);

    // dropdown menu
    $scope.label = 'Section';
    $scope.items = [
      {
          title: 'Mastering Web Application Development with AngularJS',
          author: 'Peter Bacon Darwin, Pawel Kozlowski',
          released: 'August 2013',
          link: 'http://www.packtpub.com/angularjs-web-application-development/book'
      }, {
          title: 'AngularJS Directives',
          author: 'Alex Vanston',
          released: 'September 2013',
          link: 'http://www.packtpub.com/angularjs-directives/book'
      }, {
          title: 'Instant AngularJS Starter',
          author: 'Dan Menard',
          released: 'February 2013',
          link: 'http://www.packtpub.com/angularjs-to-build-dynamic-web-applications/book'
      }
    ];


    $scope.sections = [
        {
            id: 1,
            title: "Background information"
        }, {
            id: 2,
            title: "Contribution to WHO's work"
        }, {
            id: 3,
            title: "Related meetings"
        }, {
            id: 4,
            title: "Title"
        }, {
            id: 5,
            title: "Objectives"
        }, {
            id: 6,
            title: "Dates and site"
        }, {
            id: 7,
            title: "Working language"
        }, {
            id: 8,
            title: "Participants"
        }, {
            id: 9,
            title: "Temporary advisers"
        }, {
            id: 10,
            title: "Representative/observers"
        }, {
            id: 11,
            title: "Secretariat roles"
        }, {
            id: 12,
            title: "Secretarial assistance"
        }, {
            id: 13,
            title: "Courtesy expense"
        }, {
            id: 14,
            title: "Daily allowance"
        }, {
            id: 15,
            title: "Supplies & equipment"
        }, {
            id: 16,
            title: "Co-sponsorship & WHO logo"
        }, {
            id: 17,
            title: "Meeting report"
        }, {
            id: 18,
            title: "Monitoring"
        }, {
            id: 19,
            title: "Communication activities"
        }, {
            id: 20,
            title: "Conflict of interest"
        }, {
            id: 21,
            title: "Budgetary information"
        }, {
            id: 22,
            title: "APW"
        }, {
            id: 23,
            title: "Certificates"
        }
    ];
    $scope.choosen = $scope.sections[0];

    $scope.idx = 0;
    $scope.select = function (i) {
        if (angular.isDefined(i))
            $scope.choosen = $scope.sections[i];
        $scope.idx = i;
    }; // end select
});


