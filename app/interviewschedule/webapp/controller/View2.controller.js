sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/date/UI5Date",
    "sap/ui/unified/library",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, JSONModel, UI5Date, unifiedLibrary, Fragment, DateFormat, Filter, FilterOperator) {
    "use strict";

    //Selecting the calendar type 
    let CalendarDayType = unifiedLibrary.CalendarDayType;

    return BaseController.extend("com.app.interviewschedule.controller.View2", {

      // +++++++++++++++++++++++++++++++ Defined the onInit function +++++++++++++++++++++++++++++++++++++
      onInit: function () {

        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter.getRoute("RouteView2").attachMatched(this.loadPage, this);


      },

      loadPage: async function (oEvent) {

        //Create Empty array
        let aApplicationIds = []

        //Getting the ApplicationId 
        var AppId = oEvent.getParameter("arguments").variable

        //Application Ids Array 
        aApplicationIds = [...aApplicationIds, AppId]

        // Job applications filter 
        const aJobApplicationfilters = aApplicationIds.map(
          (applicationId) =>
            new Filter("applicationId", FilterOperator.EQ, applicationId)
        );

        // oData model object
        const oDataModel = this.getOwnerComponent().getModel();

        // Fetching the Particular Job Interview.
        const { results: aData } = await this.getData(
          oDataModel,
          "/JobApplicationInterview",
          aJobApplicationfilters,
          [],
          this.iTop,
          this.iSkip
        );

        //Creating the Json model
        var oModel = new JSONModel({
          appointments: aData,
          StartingDate: UI5Date.getInstance("2022", "0", "22"),
        });


        //Set the Json Model to the View level
        this.getView().setModel(oModel, "local");

      },

      handleAppointmentSelect: function (oEvent) {


        var oAppointment = oEvent.getParameter("appointment"),
          oView = this.getView();
        const AppoinmentData = oEvent.getParameter("appointment").getBindingContext("local").getObject()
        this.getView().getModel("local").setProperty("/currentAppoinments", AppoinmentData);


        if (oAppointment === undefined) {
          return;
        }
        // bAllDate = false;



        if (!oAppointment.getSelected() && this.AppoinmentPopup) {
          this.AppoinmentPopup.then(function (oFragment) {
            oFragment.close();
          });
          return;
        }


        if (!this.AppoinmentPopup) {
          this.AppoinmentPopup = Fragment.load({
            id: oView.getId(),
            name: "com.app.interviewschedule.fragments.Details",
            controller: this
          }).then(function (oFragment) {
            oView.addDependent(oFragment);
            return oFragment;
          });
        }
        this.AppoinmentPopup.then(function (oFragment) {
          oFragment.setBindingContext(oAppointment.getBindingContext("local"));
          oFragment.openBy(oAppointment);
        });

      },
      
      oCreateAppoinmentPopup : null,
      handleAppointmentCreate : function(oEvent)
      {   
          var that = this;
          
          if(!this.oCreateAppoinmentPopup)
          {
              Fragment.load({
                  
                  name : "com.app.interviewschedule.fragments.CreateAppointment",
                  controller : this,
                  id : "create"
              }).then(function(oFragment){
                  that.oCreateAppoinmentPopup = oFragment;
                  that.getView().addDependent(that.oCreateAppoinmentPopup)
                  that.oCreateAppoinmentPopup.setTitle("Create new appoinment")
                  that.oCreateAppoinmentPopup.open();
              })
          }

          else
          {
              this.oCreateAppoinmentPopup.open();
          }
      },

      closeDialog : function(oEvent)
      {
        oEvent.getSource().getParent().getParent().close()
      },


      formatDate: function (oDate) {
        if (oDate) {
            var iHours = oDate.getHours(),
                iMinutes = oDate.getMinutes(),
                iSeconds = oDate.getSeconds();
    
            // Define a custom date format with desired pattern
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "dd MMM yyyy, HH:mm:ss"
            });
    
            return oDateFormat.format(oDate);
        }
    },
    
      // Get Data function implementation
      getData: async function (
        oDataModel,
        sPath,
        aFilters = [],
        aExpand = [],
        top,
        skip
      ) {
        sap.ui.core.BusyIndicator.show();
        this.oDataModel = oDataModel;
        this.sPath = sPath;
        this.aFilters = aFilters;
        this.aExpand = aExpand;
        top ? (this.top = top) : "";
        skip ? (this.skip = skip) : "";

        const oUrlParameters = {
          $expand: aExpand,
        };

        top ? (oUrlParameters.$top = top) : "";
        skip ? (oUrlParameters.$skip = skip) : "";

        return new Promise((resolve, reject) => {
          oDataModel.read(sPath, {
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

    })

  })

