(function () {
    'use strict';

    angular
        .module('participants.ib2')
        .controller('participantsIb2', participantsIb2);

    participantsIb2.$inject = ['$scope', '$timeout', 'participantsIb2Manager'];

    function participantsIb2($scope, $timeout, participantsIb2Manager) {

        var mtgId = $scope.mtgId;
        var vm = this;
        vm.title = 'Participants (IB2)';
        vm.participantsDataSource = participantsIb2Manager.participants_list;
        vm.uploading = false;

        function activate() {
            participantsIb2Manager.loadParticipants();
        }


        $timeout(function () {
            participantsIb2Manager.mtgId = mtgId;
            participantsIb2Manager.mtgNumber = $scope.mtg_no; //$scope.meeting.mtg_no;
    

            activate();
        });

        
        // grid
        $("#actualparticipantsgrid").kendoGrid({
            dataSource: {
                data: vm.participantsDataSource,
                schema: {
                    model: {
                        id: "mtg_participant_id",
                        fields: {
                            "mtg_id": { type: "number" },
                            "participant_name": { type: "string" },
                            "institution": { type: "string" },
                            "position": { type: "string" },
                            "ctry_name": { type: "string" }                           
                        }
                    }
                },
                pageSize: 20
            },            
            columnMenu: true,
            filterable: true,
            sortable: true,
            resizable: true,
            reorderable: true,
            scrollable: true,
            pageable: {
                pageSizes: [20, 50, 100, 150],
                refresh: true // temporary remove
            },
            height: 380,
            columns: [
                /*{ field: "mr_id", title: " ", locked: false, lockable: true, width: 35 },*/
                //{ field: "mr_no", title: "MR no", locked: false, lockable: true, width: 70, template: "<div style='text-decoration:underline; cursor:pointer; color:blue;'>#=mr_no#</div>" },
                { field: "participant_name", title: "Participant", locked: false, lockable: true, width: 150 },
                { field: "ctry_name", title: "Country", locked: false, lockable: true, width: 150 },
                { field: "institution", title: "Institution", locked: false, lockable: true, width: 150 },
                { field: "position", title: "Position", locked: false, lockable: true, width: 150 },
                { field: "tr_status", title: "TR status", locked: false, lockable: true, width: 80 }
               
            ]
        });

        // end grid
        $timeout(function () {
            $("#actualparticipantsgrid").find(".k-grid-content").height("320").append("<div class='k-grid-content-expander' style='width: 1154px;'></div>")
        }, 1000);
        $('#actualparticipantsgrid .k-pager-refresh.k-link').on('click', function () {
            participantsIb2Manager.loadParticipants();
        });
    }
})();