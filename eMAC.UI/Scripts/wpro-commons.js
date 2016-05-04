
function stringConcat(arr) {
    return arr.join(" ");
}

function DateFormat(a) {
    return kendo.toString(new Date(a.value), a.format);
}

function getValidation(options) {
    var _options = {
        jobject: $(),
        suffix: "is required.",
        msg: "Field is required."
    };

    $.extend(_options, options);

    if (options != undefined) {
        var _e = $("label[for='" + _options.jobject.prop("id") + "']");
        return (_e.length > 0) ? stringConcat([_e.text().replace(/[*]/g, ""), _options.suffix]) : _options.msg;
    }
    return "";
}

function Alert(a) {
    var options = $.extend({}, a);

    if (typeof (toastr) != "undefined") {
        toastr.options = {
            closeButton: true,
            debug: false,
            newestOnTop: true,
            progressBar: false,
            positionClass: "toast-top-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: 300,
            hideDuration: 800,
            timeOut: 1000,
            extendedTimeOut: 500,
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut",
            onHidden: function () {
                if (!options.async) {
                    if (typeof (options.callback) == "function") {
                        options.callback();
                    }
                }
            }
        };
        toastr[options.type](options.message, options.caption);

        if (options.async) { options.callback(); }
    }
    else {
        if (options.async) {
            if (typeof (options.callback) == "function") {
                options.callback(); alert(options.message);
            }
        }
        else { alert(options.message); options.callback(); }


    }
}

function displayLoading(bool, target) {

    var element = target == undefined ? $("body") : $(target);
    if (bool) { $(element).loader().open(); }
    else { $(element).loader().close(); }
}

function SetupDropdowns(a) {
    if (a != undefined) {
        if (typeof (a) == "object") {
            $.each(a, function (index, value) {
                $(value.id).createKendoDropDowns(value);
            });
        }
    }
}

function SetupListViews(a) {
    if (a != undefined) {
        if (typeof (a) == "object") {
            $.each(a, function (index, value) {
                $(value.id).createKendoListView(value);
            });
        }
    }
}

function SetKendoDataSource(a) {
    _a = {};
    defaults = {
        pageSize: 20
    };
    _a = $.extend({}, defaults, a);
    return new kendo.data.DataSource(_a);
}

function SetupGrid(param, target) {
    var gridDefaults = {},
        settings = {
            ds: {
                //dataTransport: null,                              /* transport settings of Kendo Data Source */
                bindingType: "transport"                            /* json or transport */
            },
            grid: {                                                 /* KENDO GRID OPTIONS (please refer to telerik Kendo Grid UI API document */
                columns: null,
                excel: {
                    fileName: target + ".xlsx",
                    allPages: true
                },
                dataBound: function () { },
                dataBinding: function () { },
                custom: {                                           /* CUSTOM PARAMETERS USED BY THE LIBRARY */
                    dblClick: function (e) {                        /* double click function for kendo grid */

                    },
                    computedHeight: 480,                            /* computed height of the grid, set a value of the grid height */
                    offset: 0,                                      /* compute the space rendered by your footer, navbar, menu etc. this will be computed to be reduced on grid total height */
                    marginBottom: 0,                                /* grid margin from the bottom */
                    gridState: function () { },                     /* if you want to load some other state (grid options) that is not being handle by the grid commons */
                    target: "div"                                   /* element id # is a must */

                }
            },
            context: {
                kendocommon: "../Content/kendo/kendo.common.css",   /* location of your kendo.common.css */
                width: "120px"                                      /* total context width */
            }
        },
        kendoSource = {};

    if (param != undefined && typeof (param) == "object") {
        gridDefaults = $.extend(settings, param);
    }

    if (gridDefaults.ds.bindingType == "transport" || gridDefaults.ds.bindingType == undefined) {
        kendoSource = SetKendoDataSource({
            pageSize: 20,
            schema: {
                model: {
                    fields: gridDefaults.ds.schema
                }
            },
            transport: {
                read: gridDefaults.ds.dataTransport.read
            }
        });
    }

    if (gridDefaults.ds.bindingType == "json") {
        kendoSource = SetKendoDataSource({
            pageSize: 20,
            schema: {
                model: {
                    fields: gridDefaults.ds.schema
                }
            },
            data: gridDefaults.ds.data
        });
    }


    if (gridDefaults.grid.columns != null) {
        displayLoading(true);
        var mergedOption = {},
            newGrid = $.extend({}, newGrid, gridDefaults.grid),
            _target = gridDefaults.grid.custom.target,
            newCustom = $.extend({}, newGrid.custom, { target: target });

        newGrid = $.extend({}, newGrid, { custom: newCustom });
        mergedOption = $.extend({}, newGrid, {
            context: $.extend({}, gridDefaults.context, { bindingType: gridDefaults.ds.bindingType }),
            dataSource: kendoSource
        });

        return $(_target).createKendoGrid(mergedOption);
    }
}

var wpro = (function () {
    var loadingTemplate = function () {
        var container = $("<div>"),
            loading = $("<div>"),
            modal = $("<div>");

        loading.addClass("wpro-loading").appendTo(modal);
        modal.addClass("wpro-loading-modal").appendTo(container);
        $("<div id='loadingBall_1'>").addClass("loading-ball").append($("<div>").addClass("loading-ball-inner")).appendTo(loading);
        $("<div id='loadingBall_2'>").addClass("loading-ball").append($("<div>").addClass("loading-ball-inner")).appendTo(loading);
        $("<div id='loadingBall_3'>").addClass("loading-ball").append($("<div>").addClass("loading-ball-inner")).appendTo(loading);
        $("<div id='loadingBall_4'>").addClass("loading-ball").append($("<div>").addClass("loading-ball-inner")).appendTo(loading);
        $("<div id='loadingBall_5'>").addClass("loading-ball").append($("<div>").addClass("loading-ball-inner")).appendTo(loading);
        $("<div id='loadingBall_6'>").addClass("loading-ball").append($("<div>").addClass("loading-ball-inner")).appendTo(loading);

        return container;
    }

    return {
        commons: {
            templates: {
                WproLoading: loadingTemplate().html()
            }
        }
    };
})();

(function ($) {

    $.fn.loader = function () {
        var target = this;
        var open = function () {
            var template = wpro.commons.templates.WproLoading;
            if ($(".wpro-loading").length == 0) {
                $(target).append(template);
                $("body").addClass("wpro-loading-open");
            }
        },
        close = function () {
            $(".wpro-loading-modal").remove();
            $(".wpro-loading").remove();
            $("body").removeClass("wpro-loading-open");
        };
        return {
            open: open,
            close: close
        }
    }


    //$(window).on("hashchange", function (e) {
    //    history.replaceState("", document.title, e.originalEvent.oldURL);
    //});
    /* START OF RESIZE GRID */

    var resizekendoGrid = function (grid, offset, minHeight, marginBottom, windowHeight) {
        var winH = typeof (offset) == "function" ? offset() : offset;
        if (windowHeight > minHeight) {
            $("body").css("overflow-y", "hidden");
            $(grid).data("kendoGrid").setOptions({ height: windowHeight - winH });
        }
        else {
            $("body").css("overflow-y", "scroll");
            $(grid).data("kendoGrid").setOptions({ height: minHeight - winH });
            $(grid).css("margin-bottom", marginBottom);
        }
    }

    $.fn.resizeGrid = function (options) {
        var $settings = $.extend({}, $.fn.resizeGrid.settings, options);
        resizekendoGrid(this, $settings.offset, $settings.minHeight, $settings.marginBottom, $(window).height());
    }

    $.fn.resizeGrid.settings = {
        offset: 130,
        minHeight: 480
    };

    /* END OF RESIZE GRID */

    /* START OF DEFAULT GRID CONTEXT */

    $.fn.gridContext = function (options) {
        var $settings = $.extend({}, $.fn.gridContext.settings),
            $contextItem = $.extend({}, $.fn.gridContext.contextItems);

        if (typeof (options) == "object" && options != undefined) {
            $settings = $.extend({}, $settings, options);
        }
        var context = $("<ul>");

        $.each($settings.items, function (index, value) {
            var item = $contextItem[value];
            var li = $("<li>");
            var span = $("<span data-method='" + item.method + "'>");
            span.addClass("glyphicon").addClass("glyphicon-" + item.icon);
            span.css("margin-right", "10px");
            span.appendTo(li);
            li.append(item.text)
            li.css("color", $settings.fontColor);
            li.appendTo(context);
        });

        context.prop("class", "k-custom-context");
        context.css("width", $settings.width);
        context.css("display", "none");
        context.appendTo(this);
        context.kendoContextMenu({
            orientation: "vertical",
            target: $settings.target,
            animation: {
                open: { effects: "fadeIn" },
                duration: 800
            },
            select: $settings.event.select
        });
        return context;
    }

    $.fn.gridContext.settings = {
        width: "120px",
        target: "#gridContainer",
        event: {
            select: function (e) { }
        },
        fontColor: "#1E7FB8 !important",
        kendocommon: "../Content/kendo/kendo.common.css" // BLUE THEME,
    };

    $.fn.gridContext.contextItems = {
        "export": { method: "Export", text: "Export", icon: "export" },
        print: { method: "Print", text: "Print", icon: "print" },
        savegrid: { method: "SaveGrid", text: "Save Grid", icon: "floppy-saved" },
        resetgrid: { method: "ResetGrid", text: "Reset Grid", icon: "floppy-remove" }
    };

    /* END OF DEFAULT GRID CONTEXT */

    $.fn.createKendoGrid = function (option) {

        var $settings = $.extend({}, $.fn.createKendoGrid.settings, option);
        return initializeGrid(this, $settings);
    };

    $.fn.createKendoGrid.settings = {
        height: 480,
        columns: null,
        sortable: true,
        scrollable: true,
        filterable: {
            mode: "menu"
        },
        autoBind: true,
        columnMenu: true,
        resizable: true,
        reorderable: true,
        selectable: "row",
        pageable: {
            refresh: true,
            pageSizes: [20, 50, 100],
            buttonCount: 5,
        },
        context: {
            kendocommon: "../Content/kendo/kendo.common.css",
            width: "120px"
        }
    };


    var initializeGrid = function (elem, param) {
        var $grid = $(elem),
            $gridSettings = {},
            $otherGridSettings = {},
            doFinal = function () {
                $(elem).on("dblclick", "tr.k-state-selected", $(elem).data("kendoGrid"), function (e) {
                    param.custom.dblClick(e);
                });

                //$(elem).on("click", "button", function (e) {
                //    var e = $(this).parent().parent().parent(),
                //        data = $(elem).data("kendoGrid").dataSource.getByUid(e.data("uid")),
                //        modalWidth = GetModalWidth(),
                //        left = GetModalLeftOffset();


                //    $("#DetailedDialog").kendoWindow({
                //        title: data.entity_name,
                //        animation: {
                //            close: {
                //                effects: "fade:out",
                //                duration: 200
                //            },
                //            open: {
                //                effects: "fade:in",
                //                duration: 200
                //            }
                //        },
                //        modal: true,
                //        position: {
                //            top: 120,
                //            left: left
                //        },
                //        minWidth: 600,
                //        content: {
                //            url: domain() + "admin/GetEntityDetails",
                //            dataType: "html",
                //            iframe: false,
                //            data: { gcm_id: data.gcm_id }
                //        },
                //        width: modalWidth,
                //        draggable: true,
                //        actions: ["Close"],
                //        scrollable: true,
                //        deactivate: function () {
                //            $("#DetailedDialog").data("kendoWindow").destroy();
                //            $("body").append($("<div id='DetailedDialog'>"));
                //            $("#gridContainer").data("kendoGrid").dataSource.read();
                //            $("#gridContainer").data("kendoGrid").refresh();
                //            SetCounter();
                //        },
                //        visible: false,
                //        refresh: GetEntityDetails,
                //        activate: function (e) {
                //            sessionStorage["MAX_WINDOW_HEIGHT"] = $("#DetailedDialog").height() + 13.92;
                //            ResizeModalDialog();
                //            displayLoading(false);
                //            $(window).on("resize", function () {
                //                ResizeModalDialog();
                //            });
                //        }
                //    });
                //    $("#DetailedDialog").data("kendoWindow").open();
                //});

                $(window).resize(function () {
                    $(elem).resizeGrid({
                        offset: param.custom.offset,
                        minHeight: param.minHeight,
                        marginBottom: param.custom.marginBottom
                    });
                });
                $(window).trigger("resize");
                displayLoading(false);
            };
        DEFAULTS = "DEFAULTS_GRID_OPTIONS";
        if ($grid.data("kendoGrid") != undefined) {
            $grid.data("kendoGrid").destroy();
            $(elem).unbind("dblclick");
        }

        if ($(".k-custom-context").data("kendoContextMenu") != undefined) {
            $(".k-custom-context").data("kendoContextMenu").destroy();
            $(".k-custom-context").remove();
        }

        if (param.custom.computedHeight != undefined) {
            param.height = typeof (param.custom.computedHeight) == "function" ? param.custom.computedHeight() : param.custom.computedHeight;
        }

        if (param != undefined) {
            if (typeof (param) == "object") {
                var otherSettings = typeof (param.custom.gridState) == "function" ? param.custom.gridState() : param.custom.gridState;
                $otherGridSettings = $.extend({}, otherSettings);
                $gridSettings = $.extend({}, $otherGridSettings, param);
            }
        }

        if (param.custom.target != undefined) {
            $grid.data("target", param.custom.target);

            var loadedGridSavedState = localStorage[param.custom.target]

            if (loadedGridSavedState) {

                if (typeof (toastr) != "undefined") {
                    Alert({
                        async: true,
                        caption: "Grid State loaded",
                        message: "Successfully loaded grid state.",
                        type: "info",
                        callback: function () {
                            var jsonGridState = JSON.parse(loadedGridSavedState);
                            $grid.kendoGrid($gridSettings);
                            $grid.data("kendoGrid").setOptions(jsonGridState);
                            doFinal();
                        }

                    });
                }
            }
            else {
                if (typeof (toastr) != "undefined") {
                    Alert({
                        async: true,
                        caption: "Grid State loaded",
                        message: "Successfully loaded default grid state.",
                        type: "info",
                        callback: function () {
                            $grid.kendoGrid($gridSettings);

                            var $gridKendo = $grid.data("kendoGrid"),
                                gridOptions = $gridKendo.getOptions();

                            localStorage[DEFAULTS] = JSON.stringify({
                                columns: gridOptions.columns,
                                dataSource: {
                                    pageSize: gridOptions.dataSource.pageSize,
                                    page: gridOptions.dataSource.page,

                                    transport: {
                                        read: {
                                            data: gridOptions.dataSource.transport != undefined ? gridOptions.dataSource.transport.read.data : undefined
                                        }
                                    }
                                }
                            });
                            doFinal();
                        }
                    });
                }
            }
            initializeGridContext(elem, $.extend({}, { target: "#" + elem.prop("id") }, param.context));
        }

    };

    var initializeGridContext = function (elem, param) {
        DEFAULTS = "DEFAULTS_GRID_OPTIONS";
        if (param.items != undefined) {
            if (param.items.length > 0) {
                if ($(".k-custom-context").data("kendoContextMenu") == undefined) {
                    var selectEvent = function (e) {
                        var grid = $(elem),
                            contextMethodSelected = $(e.item).find("span[data-method]").data("method");
                        if (contextMethodSelected == "Export") {
                            Alert({
                                caption: "Export grid",
                                message: "Exporting grid to excel.",
                                callback: function () {
                                    grid.data("kendoGrid").saveAsExcel();
                                },
                                type: "info"
                            });
                        }
                        if (contextMethodSelected == "Print") {
                            var gridElement = $(elem),
                                    printableContent = "",
                                    win = window.open("", "", "width=800, height=500"),
                                    doc = win.document.open();

                            var htmlStart =
                                    "<!DOCTYPE html>" +
                                    "<html>" +
                                    "<head>" +
                                    "<meta charset='utf-8' />" +
                                    "<title>Kendo UI Grid</title>" +
                                    "<link href='" + param.kendocommon + "' rel='stylesheet' /> " +
                                    "<style>" +
                                    "html { font: 11pt sans-serif; }" +
                                    ".k-grid { border-top-width: 0; }" +
                                    ".k-grid, .k-grid-content { height: auto !important; }" +
                                    ".k-grid-content { overflow: visible !important; }" +
                                    "div.k-grid table { table-layout: auto; width: 100% !important; }" +
                                    ".k-grid .k-grid-header th { border-top: 1px solid; }" +
                                    ".k-grid-toolbar, .k-grid-pager > .k-link { display: none; }" +
                                    "</style>" +
                                    "</head>" +
                                    "<body>";

                            var htmlEnd =
                                    "</body>" +
                                    "</html>";

                            var gridHeader = gridElement.children(".k-grid-header");
                            if (gridHeader[0]) {
                                var thead = gridHeader.find("thead").clone().addClass("k-grid-header");
                                printableContent = gridElement
                                    .clone()
                                        .children(".k-grid-header").remove()
                                    .end()
                                        .children(".k-grid-content")
                                            .find("table")
                                                .first()
                                                    .children("tbody").before(thead)
                                                .end()
                                            .end()
                                        .end()
                                    .end()[0].outerHTML;
                            } else {
                                printableContent = gridElement.clone()[0].outerHTML;
                            }

                            doc.write(htmlStart + printableContent + htmlEnd);
                            doc.close();
                            win.print();
                        }
                        if (contextMethodSelected == "SaveGrid") {
                            var grid = $(elem),
                                targetGrid = grid.data("target"),
                                targetGridOptions = grid.data("kendoGrid").getOptions();

                            localStorage[targetGrid] = JSON.stringify({
                                columns: targetGridOptions.columns,
                                dataSource: {
                                    pageSize: targetGridOptions.dataSource.pageSize,
                                    page: targetGridOptions.dataSource.page,
                                    filter: targetGridOptions.dataSource.filter,
                                    transport: {
                                        read: {
                                            data: targetGridOptions.dataSource.transport != undefined ? targetGridOptions.dataSource.transport.read.data : undefined
                                        }
                                    }
                                }
                            });
                            Alert({
                                caption: "Save grid",
                                message: "Grid state saved.",
                                callback: function () {
                                    grid.data("kendoGrid").setOptions(targetGridOptions);
                                    grid.data("kendoGrid").dataSource.read();
                                    grid.data("kendoGrid").refresh();
                                },
                                type: "info"
                            });
                        }
                        if (contextMethodSelected == "ResetGrid") {
                            var grid = $(elem),
                                targetGrid = grid.data("target");
                            localStorage.removeItem(targetGrid);
                            Alert({
                                caption: "Grid reset.",
                                message: "Grid state reset.",
                                callback: function () {
                                    var option = JSON.parse(localStorage[DEFAULTS]);
                                    if (param.bindingType == "json") {
                                        option.dataSource = new SetKendoDataSource({
                                            pageSize: 20,
                                            data: typeof (param.custom.freshdata) == "function" ? param.custom.freshdata() : param.custom.freshdata,
                                            schema: option.dataSource.schema
                                        });
                                    }
                                    grid.data("kendoGrid").setOptions(option);
                                    grid.data("kendoGrid").dataSource.read();
                                    grid.data("kendoGrid").refresh();
                                },
                                type: "info"
                            });
                        }

                        $(".k-custom-context").data("kendoContextMenu").close(100, 100);
                    },
                        $contextSettings = {};
                    $contextSettings = $.extend({}, param, { event: { select: selectEvent } });
                    var context = $("body").gridContext($contextSettings);

                    context.data("kendoContextMenu").close(100, 100);
                }
            }
        }
    };

    $.fn.createKendoListView = function (option) {
        var a = $.extend({}, $.fn.createKendoListView.settings, option),
            ds = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: a.url,
                        dataType: "json",
                        data: {
                            xml: a.xml,
                            valuemember: a.valuemember,
                            textmember: a.textmember
                        }
                    }
                }
            }),
            b = $.extend({}, {
                autoBind: true,
                template: "<div class='list-view-item' data-value='#:value#'>#:text#</div>",
                selectable: "multiple"
            }, a);

        return $(this).kendoListView($.extend({}, b, { dataSource: ds }));
    };

    $.fn.createKendoListView.settings = {
        url: domain() + "service/GetDropdown",
        xml: "",
        valuemember: "value",
        textmember: "text"
    }

    $.fn.createKendoDropDowns = function (option) {
        var a = $.extend({}, $.fn.createKendoDropDowns.settings, option),
            ds = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: a.url,
                        dataType: "json",
                        data: {
                            xml: a.xml,
                            valuemember: a.valuemember,
                            textmember: a.textmember
                        }
                    }
                }
            }),
            b = $.extend({}, {

                dataTextField: "text",
                dataValueField: "value",
                autoBind: false
            }, a);

        return $(this).kendoDropDownList($.extend({}, b, { dataSource: ds }));
    }

    $.fn.createKendoDropDowns.settings = {
        url: domain() + "service/GetDropdown",
        xml: "",
        valuemember: "value",
        textmember: "text"
    };

    $.fn.ajaxUploader = function (option) {
        var uploadOptions = $.extend({}, $.fn.ajaxUploader.settings, option);
        if (uploadOptions.url != "" && uploadOptions.url != undefined) {
            uploader(this, uploadOptions);
        }
    };

    var uploader = function (elem, options) {
        var uFiles = $(elem).get(0).files,
            uData = new FormData();
        if (uFiles.length > 0) {
            uData.append("UploadedImage", uFiles[0]);
            $.ajax({
                url: options.url,
                type: "POST",
                data: uData,
                contentType: false,
                processData: false
            })
            .success(options.onSuccess)
            .error(options.onError);
        }
    }

    $.fn.ajaxUploader.settings = {
        url: "",
        onSuccess: function (e) { },
        onError: function (e) { }
    };

})(jQuery);

(function () {
    if (typeof (angular) != "undefined") {
        var commons = angular.module("wpro.commons", ["ngAnimate"]);
        // FACTORIES
        commons.factory("WproCommonsFactory", ["$http", "$q", function (http, q) {

            var site = $(".site-domain").prop("href");
            var _toastr = function (options) {
                if (options != undefined) {
                    if (typeof (toastr) != "undefined") {
                        toastr.options = {
                            closeButton: true,
                            debug: false,
                            newestOnTop: true,
                            progressBar: false,
                            positionClass: "toast-top-right",
                            preventDuplicates: false,
                            onclick: null,
                            showDuration: 300,
                            hideDuration: 800,
                            timeOut: 1000,
                            extendedTimeOut: 500,
                            showEasing: "swing",
                            hideEasing: "linear",
                            showMethod: "fadeIn",
                            hideMethod: "fadeOut",
                            onHidden: function () {
                                if (options.async != true) {
                                    if (typeof (options.callback) == "function") {
                                        options.callback();
                                    }
                                }
                            }
                        };
                        toastr[options.type](options.message, options.caption);

                        if (typeof (options.callback) == "function") {
                            if (options.async == true) { options.callback(); }
                        }
                    }
                    else { console.log(options.message); }
                }
            },
                uploadFile = function (param) {
                    var uploadData = new FormData();
                    uploadData.append("UploadedImage", param.file);
                    _await = q.defer();

                    http.post(site + param.url, uploadData, {
                        transformRequest: angular.identity,
                        headers: { "Content-Type": undefined }
                    })
                        .success(function (data) {
                            _await.resolve(data);
                        }).error(function (data) {
                            _await.reject(data);
                        });
                    return _await.promise;
                },
                Crud = {
                    save: function (param) {
                        var _await = q.defer()
                        http.post(site + param.url, param.data)
                            .success(function (data) {
                                _await.resolve(data);
                            }).error(function (data) {
                                _await.reject(data);
                            });
                        return _await.promise;
                    },
                    get: function (param) {
                        var _await = q.defer()
                        http.get(site + param.url)
                            .success(function (data) {
                                _await.resolve(data);
                            }).error(function (data) {
                                _await.reject(data);
                            });
                        return _await.promise;
                    }
                },
                Xml = {
                    XmlObject: function (param) {
                        var _await = q.defer()
                        http.get(site + param.url)
                            .success(function (data) {
                                _await.resolve(data);
                            }).error(function (data) {
                                _await.reject(data);
                            });
                        return _await.promise;
                    }
                },
                showLoading = false;
            return {
                Notify: _toastr,
                UploadFile: uploadFile,
                Save: Crud.save,
                Get: Crud.get,
                ShowLoading: function (val) {
                    if (val != undefined) {
                        showLoading = val;
                    }
                    else {
                        return showLoading;
                    }
                },
                Xml: Xml,
                LocalStorage: function (get, val) {
                    if (get != undefined) {
                        if (val != undefined) {
                            localStorage[get] = JSON.stringify(val);
                        }
                        else {
                            return localStorage[get] != undefined ? JSON.parse(localStorage[get]) : {};
                        }
                    }
                },
                ValidateObject: function (a) {
                    if (a != undefined) {
                        return (angular.isObject(a) && Object.keys(a).length > 0)
                    }
                    return false;
                }
            };

        }]);

        // DIRECTIVES
        commons.directive("wproUploader", wproUploader);
        commons.directive("wproLoading", wproLoading);
        commons.directive("wproKendoGrid", wproKendoGrid);

        wproLoading.$inject = ["WproCommonsFactory"]
        wproUploader.$inject = ["WproCommonsFactory"];
        wproKendoGrid.$inject = ["WproCommonsFactory", "$timeout"];

        function wproUploader(factory) {
            var _link = function (scope, elem, attr) {
                if (scope.multiUpload) {
                    elem.prop("multiple", scope.multiUpload);
                }
                elem.on("change", function () {
                    scope.$apply(function () {
                        var fileCollection = angular.element(elem).get(0).files
                        if (fileCollection.length > 1 && !scope.multiUpload) {
                            factory.Notify({
                                message: "Not allowed to upload multiple files.",
                                caption: "Upload failed",
                                type: "warning"
                            });
                        }
                        else {
                            angular.forEach(fileCollection, function (val, index) {
                                if (val.size <= scope.maxSize) {
                                    if (scope.multiUpload) {
                                        if (scope.ngModel.indexOf(val) === -1) {
                                            scope.ngModel.push(val);
                                        }
                                    }
                                    else {
                                        scope.ngModel = val;
                                    }
                                }
                                else {

                                    factory.Notify({
                                        message: "Failed to upload " + val.name + ". Max file size is " + scope.maxSize + ".",
                                        caption: "Upload failed",
                                        type: "warning"
                                    });
                                }
                            });
                        }
                    });
                });
            }
            return {
                restrict: "A",
                link: _link,
                scope: {
                    maxSize: "=",
                    multiUpload: "=",
                    ngModel: "="
                }
            }
        }

        function wproLoading(factory) {
            var template = "<div ng-if='show'>" + wpro.commons.templates.WproLoading + "</div>";
            function _link(scope, elem, attr) {

                scope.$watch(function () { return factory.ShowLoading(); }, function (n) {
                    scope.show = n;
                    if (n) {
                        angular.element("body").addClass("wpro-loading-open");
                    }
                    else {
                        angular.element("body").removeClass("wpro-loading-open");
                    }
                });
            }

            return {
                restrict: "E",
                link: _link,
                replace: true,
                template: template
            }
        }

        function wproKendoGrid(factory, timeout) {
            var _template = wpro.commons.templates.WproGrid,
                _link = function (scope, elem, attr) {
                    var saveCurrentGridState = function () {
                        if (scope.innerGridOptions.custom.target != undefined && elem.data("kendoGrid") != undefined) {
                            var grid = elem.data("kendoGrid").getOptions();
                            var state = {
                                current: {
                                    columns: grid.columns,
                                    dataSource: {
                                        sort: grid.dataSource.sort,
                                        filter: grid.dataSource.filter,
                                        page: grid.dataSource.page,
                                        transport: {
                                            read: {
                                                data: grid.dataSource.transport != undefined ? grid.dataSource.transport.read.data : {}
                                            }
                                        }
                                    }
                                },
                                "default": factory.LocalStorage(scope.innerGridOptions.custom.target).default
                            }
                            factory.LocalStorage(scope.innerGridOptions.custom.target, state);
                        }
                    },
                    saveDefaultGridState = function () {
                        if (scope.innerGridOptions.custom.target != undefined && elem.data("kendoGrid") != undefined) {
                            var grid = elem.data("kendoGrid").getOptions();
                            var state = {
                                current: factory.LocalStorage(scope.innerGridOptions.custom.target).current,
                                "default": {
                                    columns: grid.columns,
                                    dataSource: {
                                        sort: grid.dataSource.sort,
                                        filter: grid.dataSource.filter,
                                        page: grid.dataSource.page,
                                        transport: {
                                            read: {
                                                data: grid.dataSource.transport != undefined ? grid.dataSource.transport.read.data : {}
                                            }
                                        }
                                    }
                                }
                            }
                            factory.LocalStorage(scope.innerGridOptions.custom.target, state);
                        }
                    },
                    loadDefaultGridState = function () {
                        if (scope.innerGridOptions.custom.target != undefined && elem.data("kendoGrid") != undefined) {
                            scope.defaultGridState = factory.LocalStorage(scope.innerGridOptions.custom.target).default;
                            factory.LocalStorage(scope.innerGridOptions.custom.target, {
                                current: {},
                                "default": factory.LocalStorage(scope.innerGridOptions.custom.target).default
                            });
                            elem.data("kendoGrid").setOptions(scope.defaultGridState);

                            if (elem.data("kendoGrid") != undefined) {
                                elem.data("kendoGrid").dataSource.read();
                                elem.data("kendoGrid").refresh();
                            }
                        }
                    },
                    loadCurrentGridState = function () {
                        if (scope.innerGridOptions.custom.target != undefined && elem.data("kendoGrid") != undefined) {
                            scope.currentGridState = factory.LocalStorage(scope.innerGridOptions.custom.target).current;
                            if (factory.ValidateObject(scope.currentGridState)) {
                                elem.data("kendoGrid").setOptions(scope.currentGridState);

                                if (elem.data("kendoGrid") != undefined) {
                                    elem.data("kendoGrid").dataSource.read();
                                    elem.data("kendoGrid").refresh();
                                }
                            }
                        }
                    },
                    refreshGrid = function () {
                        if (scope.innerGridOptions.dataBound == undefined) {
                            scope.innerGridOptions.dataBound = pageSizeChange;
                        }
                        if (elem.data("kendoGrid") != undefined) {
                            elem.data("kendoGrid").setOptions(scope.innerGridOptions);
                        }
                        else {
                            elem.kendoGrid(scope.innerGridOptions);
                        }
                        saveDefaultGridState();
                        loadCurrentGridState();
                        angular.element(window).trigger("resize");

                        factory.ShowLoading(false);
                    },
                    pageSizeChange = function (e, callback) {
                        if (elem.data("kendoGrid").pager != undefined) {
                            var dropdown = elem.data("kendoGrid")
                                .pager.element.find(".k-pager-sizes [data-role=dropdownlist]");

                            dropdown.unbind("change");
                            dropdown.on("change", function (e) {
                                var selectedValue = angular.element(e.currentTarget).val();
                                factory.LocalStorage(scope.innerGridOptions.custom.target + "Item", {
                                    count: selectedValue != "all" ? parseInt(selectedValue) : elem.data("kendoGrid").dataSource.total(),
                                    all: selectedValue == "all"
                                });
                            });

                            if (typeof (callback) == "function") { callback(); }
                        }

                    },
                    contextEvent = function (e) {

                        var grid = elem.data("kendoGrid"),
                            methodSelected = angular.element(e.item).find("span[data-method]").data("method");
                        if (methodSelected == "Export") {
                            factory.Notify({
                                caption: "Export grid",
                                message: "Exporting grid to excel.",
                                callback: function () {
                                    grid.saveAsExcel();
                                },
                                type: "info"
                            });
                        }
                        if (methodSelected == "Print") {
                            var printElement = angular.element(elem),
                                content = "",
                                printWindow = window.open("", "", "width=800, height=500"),
                                printWindowDoc = win.document.open();


                            var htmlStart =
                                    "<!DOCTYPE html>" +
                                    "<html>" +
                                    "<head>" +
                                    "<meta charset='utf-8' />" +
                                    "<title>Kendo UI Grid</title>" +
                                    "<link href='" + param.kendocommon + "' rel='stylesheet' /> " +
                                    "<style>" +
                                    "html { font: 11pt sans-serif; }" +
                                    ".k-grid { border-top-width: 0; }" +
                                    ".k-grid, .k-grid-content { height: auto !important; }" +
                                    ".k-grid-content { overflow: visible !important; }" +
                                    "div.k-grid table { table-layout: auto; width: 100% !important; }" +
                                    ".k-grid .k-grid-header th { border-top: 1px solid; }" +
                                    ".k-grid-toolbar, .k-grid-pager > .k-link { display: none; }" +
                                    "</style>" +
                                    "</head>" +
                                    "<body>";

                            var htmlEnd =
                                    "</body>" +
                                    "</html>";

                            var gridHeader = printElement.children(".k-grid-header");
                            if (gridHeader[0]) {
                                var thead = gridHeader.find("thead").clone().addClass("k-grid-header");
                                printableContent = printElement
                                    .clone()
                                        .children(".k-grid-header").remove()
                                    .end()
                                        .children(".k-grid-content")
                                            .find("table")
                                                .first()
                                                    .children("tbody").before(thead)
                                                .end()
                                            .end()
                                        .end()
                                    .end()[0].outerHTML;
                            } else {
                                printableContent = printElement.clone()[0].outerHTML;
                            }

                            doc.write(htmlStart + printableContent + htmlEnd);
                            doc.close();
                            win.print();
                        }
                        if (methodSelected == "SaveGrid") {

                            saveCurrentGridState();
                            Alert({
                                caption: "Save grid",
                                message: "Grid state saved.",
                                callback: function () {
                                    elem.data("kendoGrid").setOptions(factory.LocalStorage(scope.innerGridOptions.custom.target).current);
                                    //elem.data("kendoGrid").dataSource.read();
                                    //elem.data("kendoGrid").refresh();
                                },
                                type: "info"
                            });
                        }
                        if (methodSelected == "ResetGrid") {
                            loadDefaultGridState();
                            factory.Notify({
                                caption: "Grid reset.",
                                message: "Grid state reset.",
                                callback: function () {
                                    elem.data("kendoGrid").setOptions(factory.LocalStorage(scope.innerGridOptions.custom.target).default);
                                    //elem.data("kendoGrid").dataSource.read();
                                    //elem.data("kendoGrid").refresh();
                                },
                                type: "info"
                            });
                        }
                        $(".k-custom-context").data("kendoContextMenu").close(100, 100);
                    };
                    scope.kGrid = elem;

                    elem.on("click", "button", function (e) {
                        var method = $(this).data("method");
                        if (method != undefined) {
                            var methodEvent = scope.innerGridOptions.custom.gridButtons[method].event;
                            scope.$apply(function () {
                                methodEvent(e);
                            });
                        }
                    });
                    elem.on("dblclick", "tr.k-state-selected", elem, function (e) {
                        scope.$apply(function () {
                            scope.innerGridOptions.custom.dblClick(e);
                        });
                    });

                    scope.innerGridOptions = {
                        height: 480,
                        columns: null,
                        sortable: true,
                        scrollable: true,
                        filterable: {
                            mode: "menu"
                        },
                        autoBind: true,
                        columnMenu: true,
                        resizable: true,
                        reorderable: true,
                        selectable: "row",
                        pageable: {
                            refresh: true,
                            pageSizes: ["all", 20, 50, 100],
                            buttonCount: 5
                        },
                        context: {
                            kendocommon: "../Content/kendo/kendo.common.css",
                            width: "120px"
                        }
                    };

                    elem.kendoGrid(scope.optionsGrid);
                    scope.$watch("optionsGrid", function (n, o) {
                        angular.forEach(n, function (val, key) {
                            if (key == "dataBound") {
                                this[key] = function (e) { pageSizeChange(e, val()); }
                            }
                            else {
                                this[key] = val;
                            }
                        }, scope.innerGridOptions);
                        refreshGrid();

                    }, true);

                    scope.$watch("optionsContext", function (n, o) {
                        if (n != undefined) {
                            var context = angular.element("body").gridContext({
                                width: n.width,
                                target: "div[wpro-kendo-grid]",
                                items: n.items,
                                event: { select: contextEvent },
                                fontColor: "#1E7FB8 !important",
                                kendocommon: n.kendocommon // BLUE THEME,
                            });

                            context.data("kendoContextMenu").close(100, 100);
                        }

                    }, true);

                    scope.$watch("optionsSource", function (n, o) {
                        var _source = new kendo.data.DataSource({
                            pageSize: factory.LocalStorage(scope.optionsGrid.custom.target + "Item").count == undefined ? 20 : factory.LocalStorage(scope.optionsGrid.custom.target + "Item").count,
                            transport: n.transport,
                            schema: n.schema,
                        });
                        scope.innerGridOptions.dataSource = _source;
                        refreshGrid();
                    }, true);

                    angular.element(window).resize(function () {
                        elem.resizeGrid({
                            offset: scope.optionsGrid.custom.offset,
                            minHeight: scope.optionsGrid.minHeight,
                            marginBottom: scope.optionsGrid.custom.marginBottom
                        });
                    });
                };

            return {
                restrict: "A",
                link: _link,
                scope: {
                    optionsGrid: "=",
                    optionsContext: "=",
                    optionsSource: "=",
                    kGrid: "="
                }
            }
        }
    }
})();
