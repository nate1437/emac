(function () {
    'use strict';

    angular
        .module('participants.ib2')
        .factory('participantsIb2Manager', participantsIb2Manager);

    participantsIb2Manager.$inject = ['$q', '$window', 'participantsIb2Client', 'mtgFactory', 'rootUrl'];

    function participantsIb2Manager($q, $window, participantsIb2Client, mtgFactory, rootUrl) {

        var service = {
            files: [],
            participants_list: [],
            loadParticipants: loadParticipants,
            upload: upload,
            //remove: remove,
           // download: download,
            fileExists: fileExists,
            mtgNumber: {},
            mtgId: {},
            curr_user: $('#curr_user').text(),
            uploadObj: {},
            status: {
                uploading: false
            },
            printib2: getIb2Document
            
        };

        return service;
        
        function getIb2Document() {
            var base = $("#linkRoot").attr("href");
            $window.open(base + "api/Participants/GetIB2Document?mtg_id=" + service.mtgId, "_self");
        }
        // load summary report files
        function loadParticipants() {
            service.participants_list.length = 0;

            return participantsIb2Client.getData(service.mtgNumber, service.mtgId)
                                .then(function (result) {
                                    JSON.parse(result.participants_ib2)
                                        .forEach(function (participant_ib2) {
                                            service.participants_list.push(participant_ib2);
                                    });
                                    $('#actualparticipantsgrid').data('kendoGrid').refresh();
                                    $('#actualparticipantsgrid').data('kendoGrid').dataSource.read();

                                    //appInfo.setInfo({ message: "photos loaded successfully" });

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

        function upload(files) {
            mtgFactory.showLoader(true); 
            service.status.uploading = true;
            //appInfo.setInfo({ busy: true, message: "uploading photos" });

            var formData = new FormData();

            angular.forEach(files, function (file) {
                formData.append(file.name, file);
                service.uploadObj.file_name = file.name;
            });

            // fill up upload object
            service.uploadObj.created_by = $('#curr_user').text();

            return participantsIb2Client.save({ mtgNumber: service.mtgNumber,  fileName: service.uploadObj.file_name, mtgId: service.mtgId, userName: service.curr_user, value: JSON.stringify(service.uploadObj) }, formData)
                                        .then(function (result) {
                                            if (result && result.participants) {
                                                if (result.participants.length != 0) {
                                                    result.participants.forEach(function (participant) {
                                                        if (!fileExists(participant.Name)) {
                                                            service.files.push(participant);
                                                        }
                                                    });

                                                    service.loadParticipants();

                                                    $('#actualparticipantsgrid').data('kendoGrid').refresh();
                                                    $('#actualparticipantsgrid').data('kendoGrid').dataSource.read();

                                                    $('#actionhistorygrid').data('kendoGrid').refresh();
                                                    $('#actionhistorygrid').data('kendoGrid').dataSource.read();

                                                    //appInfo.setInfo({ message: "photos uploaded successfully" });
                                                    mtgFactory.showLoader(false);
                                                    // toast
                                                    toastr.success("Import successful!", "Saved");
                                                }
                                                else {
                                                    //appInfo.setInfo({ message: "photos uploaded successfully" });
                                                    mtgFactory.showLoader(false);
                                                    // toast
                                                    toastr.error("Import failed. Please check your file!", "Failed");

                                                }
                                            }

                                            return result.$promise;
                                        },
                                        function (result) {
                                            // hide spinner
                                            mtgFactory.showLoader(false);
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
                                            //toastr.success("File Uploaded!", "Saved");
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
    }
})();