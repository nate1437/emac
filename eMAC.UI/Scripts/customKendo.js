function displayOverlay() {
    if (!$(".win8Overlay").length > 0) {
        var loader = $("<div>"),
            loaderOverlay = $("<div>");

        loader.append($("<div>").addClass("circle"))
            .append($("<div>").addClass("circle"))
            .append($("<div>").addClass("circle"))
            .append($("<div>").addClass("circle"))
            .addClass("loader win8Overlay")
            .appendTo(".body-content");

        loaderOverlay.addClass("win8Overlay")
            .css({
                position: "fixed",
                top: "0px",
                left: "0px",
                width: "100%",
                height: "100%",
                "background-color": "rgba(255,255,255,.9)",
                "z-index": "9999",
                "vertical-align": "middle",
                "text-align": "center",
                color: "#fff",
                "font-size": "40px",
                "font-weight": "bold",
                cursor: "wait"
            }).appendTo(".body-content");
    }
}

function removeOverlay() {
    $(".win8Overlay").length > 0 && $(".win8Overlay").remove()
}

function kConvertDate(e) {
    var i = e.split(/ +/);
    "Jan" === i[1] && (i[1] = 1), "Feb" === i[1] && (i[1] = 2), "Mar" === i[1] && (i[1] = 3), "Apr" === i[1] && (i[1] = 4), "May" === i[1] && (i[1] = 5), "Jun" === i[1] && (i[1] = 6), "Jul" === i[1] && (i[1] = 7), "Aug" === i[1] && (i[1] = 8), "Sep" === i[1] && (i[1] = 9), "Oct" === i[1] && (i[1] = 10), "Nov" === i[1] && (i[1] = 11), "Dec" === i[1] && (i[1] = 12);
    var d = "" + i[0] + "/" + i[1] + "/" + i[2],
        a = kendo.toString(kendo.parseDate(d, "dd/mm/yyyy"), "dd/mm/yyyy");
    return a
}

function renderKdatePicker(e) {
    $("." + e).kendoDatePicker({
        format: "dd MMM yyyy",
        close: function () {
            $(this.element.context).focus()
        }
    }),
    $("." + e).kendoMaskedTextBox({
        mask: "99/99/9999"
    }),
    $("." + e).removeClass("k-textbox"),
    $(".myPicker").blur(function () {
        dateReturnToFormat(this)
    }),
    $("." + e).focus(function (e) {
        var i = $(this).val(),
            d = kConvertDate(i);
        $(this).val(d)
    }),
    $(".myPicker").attr("placeholder", "dd/mm/yyyy")
}

function dateReturnToFormat(e) {
    var i, d, a = $(e).val(),
        r = /^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/;
    if ("" !== a || "__/__/____" !== a)
        if (r.test(a)) {
            d = kendo.toString(kendo.parseDate(a, "dd/mm/yyyy"), "mm/dd/yyyy"), i = new Date(d);
            var t = i.toString("dd MMM yyyy");
            $(e).val(t)
        } else $(e).val("")
}
