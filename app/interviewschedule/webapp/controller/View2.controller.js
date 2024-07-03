sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "com/app/interviewschedule/Util/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/date/UI5Date",
    "sap/ui/unified/library",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    BaseController,
    formatter,
    JSONModel,
    UI5Date,
    unifiedLibrary,
    Fragment,
    DateFormat,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    return BaseController.extend("com.app.interviewschedule.controller.View2", {


      // +++++++++++++++++++++++++++++++ Defined the onInit function +++++++++++++++++++++++++++++++++++++
      onInit: function () {

        this.oRouter = this.getOwnerComponent().getRouter();
        this._initialSetup();
        this.oRouter.getRoute("RouteView2").attachMatched(this.loadPage, this);

        //Get the Date Object
        this.currentDate = new Date();
      },

      _initialSetup: function () {
        this.iTop = 10
        this.iSkip = 0

        //set the json model view level
        this.getView().setModel(
          new JSONModel({

            Interviewer: [],
            selectedInterviewer:[]
          }), "local"
        );
      },

      loadPage: async function (oEvent) {

        //model object
        const oModel = this.getOwnerComponent().getModel();

        //Getting the all interviewer
        const { results: aData } = await this.getData(
          oModel,
          "/User",
          [],
          [],
          this.iTop,
          this.iSkip
        );

        //Assign the interviewer data to the local model
        this.getView().getModel("local").setProperty("/Interviewer", aData)
        this.getView().getModel("local").refresh(true);

      },

      oaddNewInterviewerPopup: null,
      addNewInterviewer: function (oEvent) {

         //  Fragment to be loaded and Opened
         var that = this;
         if (!this.oaddNewInterviewerPopup) {
           Fragment.load({
             name: "com.app.interviewschedule.fragments.selectInterviewer",
             controller: this,
             id: this.getView().getId(),
           }).then(function (oFragment) {
             that.oaddNewInterviewerPopup = oFragment;
             that.getView().addDependent(that.oaddNewInterviewerPopup);
             that.oaddNewInterviewerPopup.open();
           });
         } else {
           this.oaddNewInterviewerPopup.open();
         }

      },

      onDialogSelect : function(oEvent)
      {

          //get all the selected item
          var oSeletecItems = oEvent.getParameter("selectedItems")

          //loop through the selected items
          oSeletecItems.forEach((item)=>{

          // Get the binding context for each selected item
          var oBindingContext = item.getBindingContext("local");

           // Retrieve the data object bound to the selected item
           var oDataObject = oBindingContext.getObject();

           this.getView().getModel("local").getData().selectedInterviewer.push(oDataObject)
          
          })

          // Refresh the model to reflect the changes
          this.getView().getModel("local").refresh(true);

          //Clear the selection in the dialog
          oSeletecItems.forEach((item)=>{
            item.setSelected(false)
          })

        
      },

      onDialogClose : function()
      {
        alert("Bye")
      },


      // Get Data function implementation
      getData: async function (
        oModel,
        sPath,
        aFilters = [],
        aExpand = [],
        top,
        skip
      ) {
        sap.ui.core.BusyIndicator.show();
        this.oModel = oModel;
        this.sPath = sPath;
        this.aFilters = aFilters;
        this.aExpand = aExpand;
        top ? (this.top = top) : "";
        skip ? (this.skip = skip) : "";

        const oUrlParameters = {};
        aExpand.length > 0 ? (oUrlParameters.$expand = aExpand) : "";
        top ? (oUrlParameters.$top = top) : "";
        skip ? (oUrlParameters.$skip = skip) : "";

        return new Promise((resolve, reject) => {
          oModel.read(sPath, {
            urlParameters: oUrlParameters,
            filters: [...aFilters],
            success: function (oSuccessData) {
              sap.ui.core.BusyIndicator.hide();
              resolve(oSuccessData);
            },
            error: function (oErrorData) {
              sap.ui.core.BusyIndicator.hide();
              reject(oErrorData);
            },
          });
        });
      },

    });
  }
);
