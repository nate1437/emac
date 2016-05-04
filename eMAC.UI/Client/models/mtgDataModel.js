eMacApp.factory('mtgDataModel', function () {
    //return kendo.data.Model.define({
    //    id: "ProductID",
    //    fields: {
    //        ProductID: { editable: false, nullable: true },
    //        ProductName: { validation: { required: true } },
    //        UnitPrice: { type: "number", validation: { required: true, min: 1 } },
    //        Discontinued: { type: "boolean" },
    //        UnitsInStock: { type: "number", validation: { min: 0, required: true } }
    //    }
    //})

    return kendo.data.Model.define({
        id: "mtg_id",
        fields: {
            mtg_no: { editable: false, nullable: true },
            mtg_title: { type: "string", validation: { required: true } },
            venue: { type: "string" },
            start_date: { type: "date" },
            end_date: { type: "date" },
            div_code: { type: "string" },
            unit_code: { type: "string" },
            status: { type: "string" },
            resp_officer: { type: "string" },
            resp_officer_name: { type: "string" },
        }
    })
});