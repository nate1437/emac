(function () {
    'use strict';

    angular
        .module('app.file')
        .factory('fileManager', fileManager);

    fileManager.$inject = ['$q','$window', 'mtgFactory', 'fileManagerClient'];

    function fileManager($q, $window, mtgFactory, fileManagerClient) {
        
        var service = {
            files: [],
            load: load,
            upload: upload,
            remove: remove,
            download: download,
            uploadLink:uploadLink,
            fileExists: fileExists,
            meeting: {},
            uploadObj:{},
            status: {
                uploading: false
            }
        };

        return service;

        function load() {
           // appInfo.setInfo({ busy: true, message: "loading photos" })
            
            if (service.files.length == 0) {

                return fileManagerClient.query({
                    mtgId: service.meeting.mtg_id,
                    mtgNo: service.meeting.mtg_no
                }).then(function (result) {
                    if (result && result.mtg_docs) {

                        debugger;
                        JSON.parse(result.mtg_docs).forEach(function (mtg_doc) {
                            if (!fileExists(mtg_doc.file_name)) {
                                service.files.push(mtg_doc);
                            }
                        });
                    }
                    return result.$promise;
                },
                function (result) {
                    return $q.reject(result);
                })
                ['finally'](
                function () {

                });
            }
            return;
        }

        function download(request) {
            debugger;
            var base = $("#linkRoot").attr("href");
            if (request.upload_type == 'file')
                $window.open(base + "api/Attachment/Download?mtgId=" + service.meeting.mtg_id + "&mtgNo=" + service.meeting.mtg_no + "&fileName=" + request.file_name, "_self");
            else if (request.upload_type == "link")
                $window.open(request.file_name, "_blank");
            else if (request.upload_type == "unc") {
                var fileName = "";
                angular.forEach(service.files, function (o) {
                    if (o.meeting_document_id == request.meeting_document_id) {
                        fileName = o.file_name;
                    }
                });
                                                
                $window.open("file:///" + fileName.replace(/\\/g, "/"), "Browse");
            }

        }

        function upload(files) {
            var jsonData = {};

            mtgFactory.showLoader(true); 
            service.status.uploading = true;
            var formData = new FormData();

            angular.forEach(files, function (file) {
                formData.append(file.name, file);
                service.uploadObj.file_name = file.name;
            });

            service.uploadObj.user_name = $('#curr_user').text();

            //jsonData['upload_object'] = service.uploadObj;

            return fileManagerClient.save({
                fileName: service.uploadObj.file_name, mtgId: service.meeting.mtg_id, mtgNo: service.meeting.mtg_no, value: service.uploadObj
            }, formData)
                .then(function (result) {
                    if (result && result.mtg_docs) {
                        angular.forEach(result.mtg_docs, function (mtg_doc) {
                            if (!fileExists(mtg_doc.file_name)) {
                                service.files.push(mtg_doc);
                            }
                        });
                    }

                    $('.modal').modal('hide');
                    mtgFactory.showLoader(false);
                    toastr.success("File Uploaded!", "Saved");
                    return result.$promise;
                },
                function (result) {
                    mtgFactory.showLoader(false);
                    toastr.error("File Upload Failed");
                    return $q.reject(result);
                })
                ['finally'](
                function () {
                    service.status.uploading = false;

                });
        }

        function uploadLink(file) {
            var jsonData = {};

            file.doc_type = file.upload_type;

            mtgFactory.showLoader(true); 
            service.status.uploading = true;
            //appInfo.setInfo({ busy: true, message: "uploading photos" });

            var formData = new FormData();            

            //if (service.uploadObj.upload_type == 'link')
            //    service.uploadObj.file_name = service.uploadObj.doc_title;

            // fill up upload object
            file.user_name = $('#curr_user').text();

            //jsonData['upload_object'] = service.uploadObj;

            return fileManagerClient.save({ fileName: file.file_name, mtgId: service.meeting.mtg_id, mtgNo: service.meeting.mtg_no, value: file }, formData)
                                        .then(function (result) {
                                            if (result && result.mtg_docs) {

                                                angular.forEach(result.mtg_docs, function (mtg_doc) {
                                                    if (!fileExists(mtg_doc.file_name)) {
                                                        service.files.push(mtg_doc);
                                                    }
                                                });
                                            }

                                            $('.modal').modal('hide');
                                            // hide spinner
                                            mtgFactory.showLoader(false);
                                            // toast
                                            toastr.success("File Uploaded!", "Saved");

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

                                        });
        }

        function remove(mtgDocId, fileName) { //file) {
            mtgFactory.showLoader(true); 

            return fileManagerClient.remove({ mtgDocId: mtgDocId, mtgId: service.mtgId, fileName: fileName })//{ mtgId: service.mtgId, fileName: file.file_name, fileObj: file })
                                        .then(function (result) {
                                            /*//if the photo was deleted successfully remove it from the photos array
                                            var i = service.files.indexOf(file);
                                            service.files.splice(i, 1);

                                            //appInfo.setInfo({ message: "photos deleted" });

                                            // toast
                                            */
                                            mtgFactory.showLoader(false);
                                            if (result.doclist != undefined) {
                                                if (result.doclist.length > 0) {
                                                    service.files.splice(0, service.files.length);

                                                    angular.forEach(result.doclist, function (nval, nindex) {
                                                        service.files.push(nval);
                                                    });
                                                }
                                                else {
                                                    angular.forEach(service.files, function (val, index) {
                                                        service.files.splice(index, 1);
                                                    });
                                                }
                                            }
                                            toastr.success("File Removed!", "Saved");

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
                                            
                                        });
        }

        function fileExists(fileName) {
            var res = false
            service.files.forEach(function (file) {
                if (file.file_name === fileName) {
                    res = true;
                }
            });

            return res;
        }
    }
})();