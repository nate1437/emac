eMacApp.factory('mtgDataSource', function (mtgDataModel, mtgFactory) {
    var crudServiceBaseUrl = "//demos.telerik.com/kendo-ui/service";
    var _gridParam = { year: "", divisionCode: "", unitCode: "" };
    var meetingObjects = {};
    var pageSizesAll = function (val) {

        if (val != undefined) {
            mtgFactory.iLocalStorageUpdate("eMac_MainGridItems", { getAllData: val });
        }
        else {
            return Object.keys(mtgFactory.iLocalStorage("eMac_MainGridItems")).length > 0 ? mtgFactory.iLocalStorage("eMac_MainGridItems").getAllData : false;
        }

    };
    var isDataReady = true;
    return {
        dataSourceEmtpy:
            new kendo.data.DataSource({
            //data: meetingObjects,
            pageSize: 20,
            transport: {
                read: []
            },
            schema: {
                model: mtgDataModel
            }
            }),
        IsDataReady: function () {
            return isDataReady;
        },
        dataSource:
            new kendo.data.DataSource({
                //data: meetingObjects,
                pageSize: pageSizesAll() ? 0 : Object.keys(mtgFactory.iLocalStorage("eMac_MainGridItems")).length > 0 ? mtgFactory.iLocalStorage("eMac_MainGridItems").count : 20,
                type: "application/json",
                //change: function(e){
                //    if (pageSizesAll()) {
                //        if (e.sender.total() != mtgFactory.iLocalStorage("eMac_MainGridItems").count) {

                //        }
                //    }
                //},
                transport: {
                    read: function (options) {
                        if (_gridParam != undefined) {
                            mtgFactory.getData(_gridParam)
                                .then(function (result) {
                                    if (typeof result == "string") {
                                        result = JSON.parse(result);
                                    }

                                    options.success(result);
                                    if (options.data.all) {
                                        var ddl = $(options.data.grid).data("kendoGrid").pager.element.find(".k-pager-sizes [data-role=dropdownlist]");
                                        $(options.data.grid).data("kendoGrid").dataSource.pageSize(result.length);
                                        pageSizesAll(true);
                                    }
                                });
                        }
                    }
                },
                schema: {
                    model: mtgDataModel
                },
                requestStart: function (e) {
                    mtgFactory.showLoader(true);
                },
                requestEnd: function (e) {

                    mtgFactory.showLoader(false);
                }
            }),
        gridParam: function (param) {
            _gridParam = param;
            
        },
        PageSizeAll: function (val) {
            return pageSizesAll(val);
        }
    };
});