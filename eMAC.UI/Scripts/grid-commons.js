$(function () {

    $(".dropdown").hover(function (e) {
        if ($(this).find("a[data-toggle-type=hover]")) {
            if (!$(this).hasClass("open") && e.type == "mouseenter") {
                $(this).addClass("open");
            }
            else { $(this).removeClass("open"); }
        }
        //if ($(this).data("toggle-type") == "hover") {
        //    var $parent = $(this).parent("li");
        //    if (!$parent.hasClass("open") && e.type == "mouseenter") {
        //        $parent.addClass("open");
        //    }
        //}
    });

    //$(".dropdown-toggle").hover(function (e) {
    //    if ($(this).data("toggle-type") == "hover") {
    //        var $parent = $(this).parent("li");
    //        if (!$parent.hasClass("open") && e.type == "mouseenter") {
    //            $parent.addClass("open");
    //        }
    //    }
    //});
});

function DateFormat(a) {
    return kendo.toString(new Date(a.value), a.format);
}

function IsIE() {
    return window.navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
    
}

function Alert(a) {
    var options = $.extend({}, a);

    if (typeof (toastr) != "undefined") {
        toastr.options = {
            closeButton: true,
            debug: false,
            newestOnTop: true,
            progressBar: false,
            positionClass: "toast-bottom-right",
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
                if (typeof (options.callback) == "function") {
                    options.callback();
                }
            }
        };
        toastr[options.type](options.message, options.caption);

    }
    else {
        alert(options.message);
        if (typeof (options.callback) == "function") {
            options.callback();
        }
    }
}

function displayLoading(bool, target) {

    var element = target == undefined ? $("body") : $(target);
    kendo.ui.progress(element, bool);
}

function SetKendoDataSource(a) {
    _a = {};
    defaults = {
        pageSize: 20,
        requestEnd: function (e) {
            if (e.response != undefined) {
                if (e.response.length == 0 && e.type == "read") {
                    e.preventDefault();
                }
            }
        }
    };
    _a = $.extend({}, defaults, a);
    return new kendo.data.DataSource(_a);
}

function SetupGrid(param, target) {
    var gridDefaults = {},
        settings = {
            ds: {
                dataTransport: null,                                /* transport settings of Kendo Data Source */
                schema: null,                                       /* fields for the model of kendo datasource */
                data: null,                                         /* json data source */
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
                        /*
                        $(e.currentTarget)                          Selected row
                        e.data                                      target data("kendoGrid")
                        */

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
        var mergedOption = {},
            newGrid = $.extend({}, newGrid, gridDefaults.grid),
            _target = gridDefaults.grid.custom.target,
            newCustom = $.extend({}, newGrid.custom, { target: target });

        newGrid = $.extend({}, newGrid, { custom: newCustom });
        mergedOption = $.extend({}, newGrid, {
            context: gridDefaults.context,
            dataSource: kendoSource
        });

        return $(_target).createKendoGrid(mergedOption);
    }
}

(function ($) {

    /* START OF RESIZE GRID */

    var resizekendoGrid = function (grid, offset, minHeight, marginBottom, windowHeight) {
        var winH = typeof (offset) == "function" ? offset() : offset;
        if (windowHeight > minHeight) {
            $("html").css("overflow-y", "hidden");
            $(grid).data("kendoGrid").setOptions({ height: windowHeight - winH });
            $(grid).data("kendoGrid")
        }
        else {
            $("html").css("overflow-y", "scroll");
            $(grid).data("kendoGrid").setOptions({ height: minHeight - winH });
            $(grid).css("margin-bottom", marginBottom);
            $(grid).data("kendoGrid")
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
            $otherGridSettings = {};
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
            $grid.kendoGrid($gridSettings);
            $grid.data("target", param.custom.target);

            var $gridKendo = $grid.data("kendoGrid"),
                gridOptions = $gridKendo.getOptions(),
                loadedGridSavedState = localStorage[param.custom.target]

            // SAVE ONLY THE STANDARD SETTINGS
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

            if (loadedGridSavedState) {

                if (typeof (toastr) != "undefined") {
                    Alert({
                        caption: "Grid State loaded",
                        message: "Successfully loaded grid state.",
                        type: "info"
                    });
                }
                var jsonGridState = JSON.parse(loadedGridSavedState);
                gridOptions = $.extend(gridOptions, jsonGridState);

                $gridKendo.setOptions(gridOptions);
                $gridKendo.refresh();
            }
            else {

                if (typeof (toastr) != "undefined") {
                    Alert({
                        caption: "Grid State loaded",
                        message: "Successfully loaded default grid state.",
                        type: "info"
                    });
                }
            }
            
            initializeGridContext(elem, $.extend({}, { target: "#" + elem.prop("id") }, param.context));
            $(elem).on("dblclick", "tr.k-state-selected", $(elem).data("kendoGrid"), function (e) {
                param.custom.dblClick(e);
            });

            $(window).resize(function () {
                $(elem).resizeGrid({
                    offset: param.custom.offset,
                    minHeight: param.minHeight,
                    marginBottom: param.custom.marginBottom
                });
            });
            $(window).trigger("resize");
            return $(elem).data("kendoGrid");
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
                                    grid.data("kendoGrid").setOptions(JSON.parse(localStorage[DEFAULTS]));
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

    $.toProper = function (source) {
        var _properString = [];
        var _noCaps = ["of","a","the","and","an","am","or","nor","but","is","if","then", 
    "else","when","at","from","by","on","off","for","in","out","to","into","with"];
        $.each(source.split(" "), function (index, value) {
            var nValue = value;
            // CHECK IF ALL CAPS
            if (nValue.match(/[A-Z]*/) != nValue) {
                if (_noCaps.indexOf(nValue) == -1 && nValue.search(/^[A-Z](?=[a-z])/) == -1) {
                    _properString.push(nValue.replace(/^[a-z]/g, nValue.substr(0, 1).toUpperCase()));
                }
                else {
                    _properString.push(nValue);
                }
            }
            else {
                _properString.push(nValue);
            }
        });
        return _properString.join(" ");
    }

})(jQuery);