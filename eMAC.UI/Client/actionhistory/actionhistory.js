(function () {
    'use strict';

    angular
        .module('action.history')
        .controller('actionHistory', actionHistory);

    actionHistory.$inject = ['$scope', '$timeout', 'actionHistoryManager'];

    function actionHistory($scope, $timeout, actionHistoryManager) {

        var mtgId = $scope.mtgId;
        actionHistoryManager.mtgId = mtgId;
       
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'Action history';
        vm.actionsDataSrc = actionHistoryManager.actions_list;

        activate();

        function activate() {
            actionHistoryManager.loadActionItems();
        }

        // grid
        $("#actionhistorygrid").kendoGrid({
            dataSource: {
                data: vm.actionsDataSrc,
                schema: {
                    model: {
                        id: "action_history_id",
                    }
                },
                pageSize: 20
            },
            dataBound: function (e) {
                var text = $("#actionhistorygrid").find(".k-dropdown-wrap.k-state-default").find(".k-input").text();

                if ($.inArray(parseInt(text), ["all", 20, 50, 100, 150]) == -1) {
                    $("#actionhistorygrid")
                        .data("kendoGrid")
                        .pager
                        .element
                        .find(".k-pager-sizes [data-role=dropdownlist]").data("kendoDropDownList").value("all");

                }
                
            },
            columnMenu: true,
            filterable: true,
            sortable: true,
            resizable: true,
            reorderable: true,
            pageable: {
                pageSizes: ["all", 20, 50, 100, 150],
                refresh: true // temporary remove
            },
            height: 408,
            columns: [
                /*{ field: "mr_id", title: " ", locked: false, lockable: true, width: 35 },*/
                //{ field: "mr_no", title: "MR no", locked: false, lockable: true, width: 70, template: "<div style='text-decoration:underline; cursor:pointer; color:blue;'>#=mr_no#</div>" },
                { field: "action", title: "Action", locked: false, lockable: true, width: 150 },
                { field: "action_by", title: "By", locked: false, lockable: true, width: 50 },
                {
                    field: "action_date",
                    title: "Date",
                    template: '#= moment(action_date).format("DD MMM YYYY h:mm:ss a") #',
                    locked: false, lockable: true, width: 70
                },
                { field: "remarks", title: "Remarks", locked: false, lockable: true, width: 200 }
            ]
        });
        // end grid

        $timeout(function () {
            $("#actionhistorygrid").find(".k-grid-content").height("348").append("<div class='k-grid-content-expander' style='width: 1154px;'></div>")
        }, 1000);
        $('#actionhistorygrid .k-icon.k-i-refresh').on('click', function () {
            actionHistoryManager.loadActionItems();
        });
    }    
})();