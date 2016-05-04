(function () {
    'use strict';

    angular
        .module('app.file', ["kendo.directives"])
        .controller('files', files); 
    
    files.$inject = ['$scope', '$compile', 'fileManager'];

    function files($scope, $compile, fileManager) {
        
        var mtgId = $scope.mtgId;
        var mtgNumber = $scope.meeting.mtg_no;
        var butonTemplates = {
            deleteAttachment: $("<button type='button'>")
                .addClass("k-button k-button-icontext k-grid-delete")
                .append("<span class='k-icon k-delete'></span>Delete"),
            
            downloadAttachment: $("<button type='button'>")
                .addClass("k-button k-button-icontext k-grid-delete")
                .append("<span class='k-icon k-i-pencil'></span>Download")
        };
        
        var attr = { style: "" };
        fileManager.mtgId = mtgId;
        fileManager.mtgNumber = mtgNumber;
        
        $scope.delete = function (e) {
            console.log(e);
        };

        /* jshint validthis:true */
        var vm = this;
        vm.uploadObj = {};
        vm.title = 'Attachments';
        vm.files = fileManager.files
        vm.uploading = false;
        vm.previewPhoto;
        vm.removeAttachment = removeItemGrid;

        vm.downloadAttachment = getItemGrid;
        vm.saveLink = fileManager.uploadLink;
        vm.remove = fileManager.remove;
        vm.download = fileManager.download;
        vm.setPreviewPhoto = setPreviewPhoto;
        vm.openUploadModal = openUploadModal;
        vm.saveCheck = false;
        vm.sayHi = sayHi;
        vm.uploadTypes = [{ "ref_code": "link", "ref_name": "Link" }, { "ref_code": "file", "ref_name": "File" }, { "ref_code": "unc", "ref_name": "Shared folder" }];
        vm.uploadObj.doc_type = vm.uploadTypes[1].ref_code;
        vm.uploadObj.upload_type = vm.uploadTypes[1].ref_code;
        vm.uploadObj.mtg_id = mtgId;
        vm.uploadObj.doc_title = "";

        //vm.uploadLink = "";
        fileManager.uploadObj = vm.uploadObj;
        
        $scope.$watchCollection("vm.files", function (n, o) {
            
            var overrideTemplate = $("#attachmentActions")
                .append($(butonTemplates.downloadAttachment)
                        .attr("ng-click", "vm.downloadAttachment('#= mtg_id #', '#= file_name #', '#= upload_type #', '#= meeting_document_id #' )"))
                .append($(butonTemplates.deleteAttachment)
                        .attr("eg-confirm-click", "Remove attachment ?")
                        .attr("confirmed-click", "vm.removeAttachment('#= meeting_document_id #', '#= file_name #')")
                        .attr("ng-disabled", "mtgReportDelBtn || unAuthorized || (isUser && currUserOrgUnit !== meeting.org_unit)")),
                command = { command: "", template: overrideTemplate.html(), display: "none", width: "150px" },
                setupGrid = function (jdata) {
                    $("#attachmentGrid").kendoGrid({
                        height: 380,
                        sortable: true,
                        scrollable: true,
                        filterable: {
                            mode: "menu"
                        },
                        dataBound: function () {
                            $compile($("#attachmentGrid"))($scope);
                        },
                        columnReorder: function (e) {
                            console.log(e);
                        },
                        columns: [
                        { field: "file_name", title: "Name", width: "250px", attributes: attr },
                        { field: "doc_type", title: "Type", width: "60px", attributes: attr },
                        { field: "updated_by", title: "Uploaded by", width: "60px", attributes: attr },
                        { field: "date_updated", title: "Date uploaded", width: "80px", attributes: attr, template: "#= DateFormat({ value: date_updated, format: 'dd MMM yyyy'}) #" },
                        command],
                        dataSource: {
                            schema: {
                                meeting_document_id: { type: "number" },
                                mtg_id: { type: "number" },
                                file_name: { type: "string" },
                                upload_type: { type: "string" },
                                doc_title: { type: "string" },
                                doc_type: { type: "string" },
                                updated_by: { type: "string" },
                                date_updated: { type: "date" }
                            },
                            data: jdata,
                        },
                        columnMenu: true,
                        resizable: true,
                        reorderable: true,
                        selectable: "row"
                    });
                },
                attachmentGrid = $("#attachmentGrid").data("kendoGrid");

            if (n.length != o.length) {
                
                if (attachmentGrid != undefined) {
                    attachmentGrid.setOptions({
                        dataSource: {
                            schema: {
                                meeting_document_id: { type: "number" },
                                mtg_id: { type: "number" },
                                file_name: { type: "string" },
                                upload_type: { type: "string" },
                                doc_title: { type: "string" },
                                doc_type: { type: "string" },
                                updated_by: { type: "string" },
                                date_updated: { type: "date" }
                            },
                            data: n
                        }
                    });
                    attachmentGrid.refresh();
                }
                else { setupGrid(n); }
            }
            else {
                if (attachmentGrid != undefined) {
                    attachmentGrid.setOptions({
                        dataSource: {
                            schema: {
                                meeting_document_id: { type: "number" },
                                mtg_id: { type: "number" },
                                file_name: { type: "string" },
                                upload_type: { type: "string" },
                                doc_title: { type: "string" },
                                doc_type: { type: "string" },
                                updated_by: { type: "string" },
                                date_updated: { type: "date" }
                            },
                            data: n
                        }
                    });
                    attachmentGrid.refresh();
                }
                else {
                    setupGrid(n);
                }
            }
            $("#attachmentGrid").find(".k-grid-content").height("351");
            //$compile($("#attachmentGrid"))($scope);
        });

        activate();
        
        function activate() {
            fileManager.load();
            
        }

        function removeItemGrid(docId, item) {
            fileManager.remove(docId, item);
        }

        function getItemGrid(id, item, type, e) {
            
            fileManager.download({
                mtgId: id,
                file_name: item,
                upload_type: type,
                meeting_document_id: e
            });
        }

        function setPreviewPhoto(photo) {         
            vm.previewPhoto = photo         
        }

        function remove(photo) {
            fileManager.remove(photo).then(function () {
                setPreviewPhoto();
            });
        }

        // open attachment form
        function openUploadModal() {
            $('#newdocfm').modal('show');

            vm.uploadObj = {};
            vm.uploadObj.upload_type = vm.uploadTypes[0].ref_code;

            if (vm.uploadObj.file_name == undefined || vm.uploadObj.file_name == undefined)
                vm.saveCheck = false;
            //fileManager.status = false;
        }

        //close 
        $scope.cancel = function (form, update) {
            //$scope.newres = angular.copy(update);
            $scope.form = form;

            $('.modal').modal('hide');
        }

        function sayHi(s) {
            alert(s);
        }

        // fix modal
        $('#newdocfm').modal({
            show: false,
            backdrop: 'static',
            keyboard: false
        });
    }
})();
