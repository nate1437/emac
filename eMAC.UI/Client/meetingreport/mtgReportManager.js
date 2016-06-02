(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .factory('mtgReportManager', mtgReportManager);

    mtgReportManager.$inject = ['$q', '$window', '$timeout', 'mtgReportClient', 'mtgFactory'];

    function mtgReportManager($q, $window, $timeout, mtgReportClient, mtgFactory) {
        var service = {
            files: [],
            summRepFiles: [],
            summRepCsFiles: [],
            finRepFiles: [],
            finalRepCsFiles: [],
            mtgReportObjects: [],
            respOfficer: [],
            loadSummRepFiles: loadSummRepFiles,
            loadSummRepCsFiles: loadSummRepCsFiles,
            loadFinRepFiles: loadFinRepFiles,
            loadFinRepCsFiles: loadFinRepCsFiles,
            uploadSummaryRepFile: uploadSummaryRepFile,
            uploadSummaryRepCsFile: uploadSummaryRepCsFile,
            uploadFinalRepFile: uploadFinalRepFile,
            uploadFinalRepCsFile: uploadFinalRepCsFile,
            //upload: upload,
            remove: remove,
            removeSummaryCs: removeSummaryCs,
            removeFinalRep: removeFinalRep,
            removeFinalCs : removeFinalCs,
            download: download,
            downloadSummCs: downloadSummCs,
            downloadFinalRep: downloadFinalRep,
            downloadFinalCs: downloadFinalCs,
            saveRespOfficer: saveRespOfficer,
            fileExists: fileExists,
            mtgId: {},
            mtgNumber: {},
            mtgObj:{},
            status: {
                uploading: false
            },
            curr_user: $('#curr_user').text(),
            scope: {}
        };
        return service;
        
        // load summary report files
        function loadSummRepFiles() {
            //mtgFactory.showLoader(true);

            //$('body').addClass('loading'); 
            service.summRepFiles.length = 0;
            service.mtgReportObjects.length = 0;
            service.respOfficer.length = 0;

            return mtgReportClient.getSummRepData({ mtgId: service.mtgId, mtgNumber: service.mtgNumber })
                                .then(function (result) {
                                    JSON.parse(result.summ_reports)
                                        .forEach(function (summ_report) {
                                            service.summRepFiles.push(summ_report);
                                        });

                                    JSON.parse(result.mtg_rep_obj)
                                        .forEach(function (report_obj) {
                                            $timeout(function () {
                                                // Any code in here will automatically have an $scope.apply() run afterwards
                                                service.mtgReportObjects.push(report_obj);
                                                service.respOfficer.push(report_obj.resp_officer);
                                            });
                                           
                                    });
                                            
                                    // hide spinner
                                    mtgFactory.showLoader(false);
                                    //appInfo.setInfo({ message: "photos loaded successfully" });

                                    return result.$promise;
                                },
                                function (result) {
                                    //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                    return $q.reject(result);
                                })
                                ['finally'](
                                function () {
                                    mtgFactory.showLoader(false);
                                    //mtgFactory.showLoader(false);
                                    //appInfo.setInfo({ busy: false });
                                });
            
        }
        // load summart report cs files
        function loadSummRepCsFiles() {
            //mtgFactory.showLoader(true);
            //$('body').addClass('loading'); 
            service.summRepCsFiles.length = 0;           

            return mtgReportClient.getSummRepCsData({ mtgId: service.mtgId, mtgNumber: service.mtgNumber })
                                .then(function (result) {
                                    JSON.parse(result.summ_cs_reports)
                                        .forEach(function (summ_report_cs) {
                                            service.summRepCsFiles.push(summ_report_cs);
                                        });

                                    // hide spinner
                                    //appInfo.setInfo({ message: "photos loaded successfully" });

                                    return result.$promise;
                                },
                                function (result) {
                                    //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                    return $q.reject(result);
                                })
                                ['finally'](
                                function () {

                                    mtgFactory.showLoader(false);
                                    mtgFactory.showLoader(false);//appInfo.setInfo({ busy: false });
                                });

        }
        // load final report files
        function loadFinRepFiles() {
            service.finRepFiles.length = 0;

            return mtgReportClient.getFinalRepData({ mtgId: service.mtgId, mtgNumber: service.mtgNumber })
                                .then(function (result) {
                                    JSON.parse(result.final_reports)
                                            .forEach(function (final_report) {
                                                service.finRepFiles.push(final_report);
                                            });

                                    //appInfo.setInfo({ message: "photos loaded successfully" });

                                    return result.$promise;
                                },
                                function (result) {
                                    //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                    return $q.reject(result);
                                })
                                ['finally'](
                                function () {
                                    mtgFactory.showLoader(false);
                                    //appInfo.setInfo({ busy: false });
                                });

        }
        // load summart report cs files
        function loadFinRepCsFiles() {
            //mtgFactory.showLoader(true);
            service.finalRepCsFiles.length = 0;

            return mtgReportClient.getFinalRepCsData({ mtgId: service.mtgId, mtgNumber: service.mtgNumber })
                                .then(function (result) {
                                    JSON.parse(result.fin_cs_reports)
                                        .forEach(function (fin_cs_report) {
                                            service.finalRepCsFiles.push(fin_cs_report);
                                        });

                                    // hide spinner
                                    //appInfo.setInfo({ message: "photos loaded successfully" });

                                    return result.$promise;
                                },
                                function (result) {
                                    //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                    return $q.reject(result);
                                })
                                ['finally'](
                                function () {

                                    mtgFactory.showLoader(false);
                                    //appInfo.setInfo({ busy: false });
                                });
        }
        // download summary report file
        function download(file) {
            var base = $("#linkRoot").attr("href");
            // appInfo.setInfo({ busy: true, message: "loading photos" })

            //service.files.length = 0;

            $window.open(base + "api/MeetingReport/Download?mtgId=" + service.mtgId + "&mtgNumber=" + service.mtgNumber, "_self");
        }
        // download summary report cs
        function downloadSummCs(file) {
            var base = $("#linkRoot").attr("href");
            // appInfo.setInfo({ busy: true, message: "loading photos" })

            //service.files.length = 0;

            $window.open(base + "api/MeetingReport/DownloadCs?mtgId=" + service.mtgId + "&mtgNumber=" + service.mtgNumber, "_self");
        }
        // download summary report cs
        function downloadFinalCs(file) {
            var base = $("#linkRoot").attr("href");
            // appInfo.setInfo({ busy: true, message: "loading photos" })

            //service.files.length = 0;

            $window.open(base + "api/FinalReport/DownloadCs?mtgId=" + service.mtgId + "&mtgNumber=" + service.mtgNumber, "_self");
        }
        // download final report file
        function downloadFinalRep(file) {
            var base = $("#linkRoot").attr("href");
            // appInfo.setInfo({ busy: true, message: "loading photos" })

            //service.files.length = 0;

            $window.open(base + "api/FinalReport/Download?mtgId=" + service.mtgId + "&mtgNumber=" + service.mtgNumber, "_self");
        }
        // upload summary report
        function uploadSummaryRepFile(files) {

            mtgFactory.showLoader(true);

            //var curr_user = $('#curr_user').text();

            service.status.uploading = true;
            //appInfo.setInfo({ busy: true, message: "uploading photos" });

            var formData = new FormData(),
                meeting = service.scope.$parent.meeting,
                rtsparse = {
                    filename: meeting.mtg_no + "\\\\" + meeting.mtg_no + "_Summary_Report.pdf",
                    source: "eMAC",
                    ref_no: meeting.mtg_no,
                    city_name: meeting.venue,
                    ctry_code: meeting.ctry_code,
                    budget_centre: meeting.office_code == "" || meeting.office_code == undefined ? meeting.org_unit : meeting.office_code,
                    resp_unit_code: meeting.org_unit,
                    resp_officer_id: meeting.resp_officer_id,
                    start_date: kendo.toString(new Date(meeting.start_date), "yyyy-MM-dd"),
                    end_date: kendo.toString(new Date(meeting.end_date), "yyyy-MM-dd"),
                    user_name: service.curr_user,
                    resp_officer_name: meeting.resp_officer_name,
                    resp_officer_email: meeting.resp_officer_email
                };



            angular.forEach(files, function (file) {
                formData.append(file.name, file);
            });

            return mtgReportClient.saveSummRep({ userName: service.curr_user, mtgId: service.mtgId, mtgNumber: meeting.mtg_no, rtsparse: JSON.stringify(rtsparse) }, formData)
                                        .then(function (result) {
                                            if (result && result.summ_reports) {
                                                JSON.parse(result.summ_reports).forEach(function (summ_report) {
                                                    if (!fileExists(summ_report.summary_report_filename)) {
                                                        service.summRepFiles.push(summ_report);
                                                    }
                                                });

                                                if (angular.element("#RTSParser").data("enabled") == "ON") {
                                                    mtgReportClient.postToRTS(rtsparse);
                                                }

                                                //toastr.info(result.rts_response);
                                            }

                                            // send email notif
                                            saveLogAction('summary');
                                            return result.$promise;
                                        },
                                        function (result) {
                                            // toast
                                            toastr.error("File Upload Failed");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            //appInfo.setInfo({ busy: false });
                                            service.status.uploading = false;
                                            // hide spinner

                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Uploaded!", "Saved");
                                        });
        }
        // upload summary report cs
        function uploadSummaryRepCsFile(files) {

            mtgFactory.showLoader(true);

            //var curr_user = $('#curr_user').text();

            service.status.uploading = true;
            //appInfo.setInfo({ busy: true, message: "uploading photos" });

            var formData = new FormData();

            angular.forEach(files, function (file) {
                formData.append(file.name, file);
            });

            return mtgReportClient.saveSummRepCs({ userName: service.curr_user, mtgId: service.mtgId, mtgNumber: service.mtgNumber }, formData)
                                        .then(function (result) {
                                            if (result && result.summ_cs_reports) {
                                                JSON.parse(result.summ_cs_reports).forEach(function (summ_cs_report) {
                                                    if (!fileExists(summ_cs_report.summary_cs_report_filename)) {
                                                        service.summRepCsFiles.push(summ_cs_report);
                                                    }
                                                });
                                            }

                                            // send email notif
                                            // sendNotification(data);
                                            // saveLogAction('summary');

                                            return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            // toast
                                            toastr.error("File Upload Failed");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            mtgFactory.showLoader(false);
                                            //appInfo.setInfo({ busy: false });
                                            service.status.uploading = false;
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Uploaded!", "Saved");
                                        });
        }
        // upload final report
        function uploadFinalRepFile(files) {
            
            mtgFactory.showLoader(true);
            service.status.uploading = true;
            //appInfo.setInfo({ busy: true, message: "uploading photos" });

            var formData = new FormData();

            angular.forEach(files, function (file) {
                formData.append(file.name, file);
            });

            return mtgReportClient.saveFinalRep({ userName: service.curr_user, mtgId: service.mtgId, mtgNumber: service.mtgNumber }, formData)
                                        .then(function (result) {
                                            if (result && result.final_reports) {
                                                JSON.parse(result.final_reports).forEach(function (final_report) {
                                                    if (!fileExists(final_report.final_report_filename)) {
                                                        service.finRepFiles.push(final_report);
                                                    }
                                                });
                                            }


                                            saveLogAction('final');
                                            //return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            // toast
                                            toastr.error("File Upload Failed");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            //appInfo.setInfo({ busy: false });
                                            service.status.uploading = false;
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            mtgFactory.showLoader(false);
                                            toastr.success("File Uploaded!", "Saved");
                                        });
        }
        // upload final report cs
        function uploadFinalRepCsFile(files) {
            mtgFactory.showLoader(true);

            //var curr_user = $('#curr_user').text();

            service.status.uploading = true;
            //appInfo.setInfo({ busy: true, message: "uploading photos" });

            var formData = new FormData();

            angular.forEach(files, function (file) {
                formData.append(file.name, file);
            });

            return mtgReportClient.saveFinalRepCs({ userName: service.curr_user, mtgId: service.mtgId, mtgNumber: service.mtgNumber }, formData)
                                        .then(function (result) {
                                            if (result && result.final_cs_reports) {
                                                JSON.parse(result.final_cs_reports).forEach(function (final_cs_report) {
                                                    if (!fileExists(final_cs_report.final_cs_report_filename)) {
                                                        service.finalRepCsFiles.push(final_cs_report);
                                                    }
                                                });
                                            }

                                            // send email notif
                                            // sendNotification(data);
                                            // saveLogAction('summary');

                                            return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            // toast
                                            toastr.error("File Upload Failed");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            //appInfo.setInfo({ busy: false });
                                            service.status.uploading = false;
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Uploaded!", "Saved");
                                        });
        }
        // delete summary
        function remove(file) {
            mtgFactory.showLoader(true); 
            // appInfo.setInfo({ busy: true, message: "deleting photo " + photo.name });

            return mtgReportClient.removeSummRep({ mtgId: service.mtgId, mtgNumber: service.mtgNumber, type:'S' })
                                        .then(function (result) {
                                            //if the photo was deleted successfully remove it from the photos array
                                            var i = service.summRepFiles.indexOf(file);
                                            service.summRepFiles.splice(i, 1);

                                            //appInfo.setInfo({ message: "photos deleted" });

                                            return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            // toast
                                            toastr.error("Failed.");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            //appInfo.setInfo({ busy: false });
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Removed!", "Saved");
                                        });
        }
        // delete summary cs file
        function removeSummaryCs(file) {
            mtgFactory.showLoader(true); 
            // appInfo.setInfo({ busy: true, message: "deleting photo " + photo.name });
            var csFileName = service.mtgNumber + '_Summary_Report_Cs.pdf';

            return mtgReportClient.removeSummRep({ mtgId: service.mtgId, mtgNumber: service.mtgNumber, type: 'SCS' })
                                        .then(function (result) {
                                            //if the photo was deleted successfully remove it from the photos array
                                            var i = service.summRepCsFiles.indexOf(file);
                                            service.summRepCsFiles.splice(i, 1);
                                            
                                            return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            // toast
                                            toastr.error("Failed.");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            //appInfo.setInfo({ busy: false });
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Removed!", "Saved");
                                        });
        }
        // delete final
        function removeFinalRep(file) {
            mtgFactory.showLoader(true); 
            // appInfo.setInfo({ busy: true, message: "deleting photo " + photo.name });

            return mtgReportClient.removeFinalRep({ mtgId: service.mtgId, mtgNumber: service.mtgNumber, type: 'F' })
                                        .then(function (result) {
                                            //if the photo was deleted successfully remove it from the photos array
                                            var i = service.finRepFiles.indexOf(file);
                                            service.finRepFiles.splice(i, 1);

                                            //appInfo.setInfo({ message: "photos deleted" });

                                            return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            // toast
                                            toastr.error("Failed.");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            //appInfo.setInfo({ busy: false });
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Removed!", "Saved");
                                        });
        }
        // delete final cs file
        function removeFinalCs(file) {
            mtgFactory.showLoader(true); 
            // appInfo.setInfo({ busy: true, message: "deleting photo " + photo.name });
            var csFileName = service.mtgNumber + '_Final_Report_Cs.pdf';

            return mtgReportClient.removeFinalRep({ mtgId: service.mtgId, mtgNumber: service.mtgNumber, type: 'FCS' })
                                        .then(function (result) {
                                            //if the photo was deleted successfully remove it from the photos array
                                            var i = service.finalRepCsFiles.indexOf(file);
                                            service.finalRepCsFiles.splice(i, 1);

                                            return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.error("Failed.");
                                            //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                            return $q.reject(result);
                                        })
                                        ['finally'](
                                        function () {
                                            //appInfo.setInfo({ busy: false });
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Removed!", "Saved");
                                        });
        }
        // save report mtg responsible officer
        function saveRespOfficer(resp_officer) {
            return mtgReportClient.saveRepOfficer({ mtgId: service.mtgId, ofcrName: resp_officer, currUser: service.curr_user })
                               .then(function (result) {
                                   // toast
                                   toastr.success('Responsible officer saved.', 'Saved!');

                                   return result.$promise;
                               },
                               function (result) {
                                   //appInfo.setInfo({ message: "something went wrong: " + result.data.message });
                                   return $q.reject(result);
                               })
                               ['finally'](
                               function () {
                                   //appInfo.setInfo({ busy: false });
                               });
        }
        // function route notifications
        function saveLogAction(remarks) {
            var actionObject = {};
            var jsonData = {};

            actionObject.mtg_id = service.scope.meeting.mtg_id;
            //actionObject.action = "Status changed to " + "\'" + $scope.meeting.status + "\' by " + $('#curr_user').text();
            actionObject.action = service.scope.meeting.status;
            actionObject.action_by = $('#curr_user').text();
            actionObject.status = service.scope.meeting.status;

            if (remarks === 'summary')
                actionObject.remarks = "Summary report submitted by " + $('#curr_user').text();
            else
                actionObject.remarks = "Final report submitted by " + $('#curr_user').text();
            
            sendNotification(actionObject, remarks);            
        }

        // function route notifications
        function sendNotification(data, remarks) {
            var jsonData = {};

            if (remarks === 'summary')
                jsonData['mtgReportData'] = data;
            else
                jsonData['finMtgReportData'] = data;

            mtgFactory.sendNotif(service.mtgId, jsonData)
                .then(function () {
                    // sent notif
                });
        }

        function fileExists(fileName) {
            var res = false
            service.files.forEach(function (file) {
                if (file.Name === fileName) {
                    res = true;
                }
            });

            return res;
        }

        function fileExistsById(id) {
            var res = false
            service.files.forEach(function (file) {
                if (file.Name === fileName) {
                    res = true;
                }
            });

            return res;
        }
    }
})();