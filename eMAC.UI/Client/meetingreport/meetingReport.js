(function () {
    'use strict';

    angular
        .module('emacApp.mtgReport')
        .controller('mtgReport', mtgReport);
    
    mtgReport.$inject = ['$scope', '$timeout', 'mtgReportManager', 'configData', 'mtgFactory'];

    function mtgReport($scope, $timeout, mtgReportManager, configData, mtgFactory) {
        var mtgId = $scope.mtgId;
        var respOfficer = $scope.meeting.resp_officer;
        var mtgNumber = $scope.mtg_no;
        mtgReportManager.mtgId = mtgId;
        mtgReportManager.mtgNumber = mtgNumber;
        mtgReportManager.mtgObj = $scope.meeting;
        mtgReportManager.scope = $scope;
        
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Report production';
        vm.summRepFiles = mtgReportManager.summRepFiles;
        vm.summRepCsFiles = mtgReportManager.summRepCsFiles;
        vm.finRepFiles = mtgReportManager.finRepFiles;
        vm.finalRepCsFiles = mtgReportManager.finalRepCsFiles;
        vm.reportObjects = mtgReportManager.mtgReportObjects;
        vm.respOfficer = mtgReportManager.respOfficer;
        vm.mtgNumber = mtgNumber;
        //vm.finalRepFiles = 
        vm.uploading = false; 
        vm.remove = mtgReportManager.remove;
        vm.removeSummaryCs = mtgReportManager.removeSummaryCs;
        vm.removeFinalCs = mtgReportManager.removeFinalCs;
        vm.download = mtgReportManager.download;
        vm.downloadSummCs = mtgReportManager.downloadSummCs;
        vm.downloadFinalCs = mtgReportManager.downloadFinalCs;
        vm.removeFinalRep = mtgReportManager.removeFinalRep;
        vm.downloadFinalRep = mtgReportManager.downloadFinalRep;
        vm.onOfcrChange = onOfcrChange;
        

        //$scope.respOfficer = mtgReportManager.respOfficer;
        
        var configDataObj = configData.getData();
        if (configDataObj != null) {
            var result = JSON.parse(configDataObj);
            vm.officers = JSON.parse(result.officerList);
        }

        activate();

        function activate() {
            mtgReportManager.loadSummRepFiles();
            mtgReportManager.loadSummRepCsFiles();
            mtgReportManager.loadFinRepFiles();
            mtgReportManager.loadFinRepCsFiles();
        }

        function remove(file) {
            //fileManager.remove(photo).then(function () {
            //    setPreviewPhoto();
            //});
        }


        function onOfcrChange(ofcr) {

            mtgReportManager.saveRespOfficer(ofcr[0]);
        }
    }
})();