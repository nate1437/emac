(function () {
    'use strict';

    angular
        .module('action.history')
        .factory('actionHistoryManager', actionHistoryManager);

    actionHistoryManager.$inject = ['$q', '$window', 'actionHistoryClient'];

    function actionHistoryManager($q, $window, actionHistoryClient) {

        var service = {
            files: [],
            actions_list: [],
            loadActionItems: loadActionItems,
            //remove: remove,
           // download: download,
            mtgId: {},
            curr_user: $('#curr_user').text(),
            status: {
                uploading: false
            }
        };

        return service;

        // load summary report files
        function loadActionItems() {
            service.actions_list.length = 0;

            return actionHistoryClient.getData(service.mtgId)
                                .then(function (result) {
                                    JSON.parse(result.actions_list)
                                        .forEach(function (action) {
                                            service.actions_list.push(action);
                                    });

                                    $('#actionhistorygrid').data('kendoGrid').refresh();
                                    $('#actionhistorygrid').data('kendoGrid').dataSource.read();

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
    }
})();