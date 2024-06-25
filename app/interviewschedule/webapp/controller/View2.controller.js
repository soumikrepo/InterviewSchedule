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
  ],
  function (BaseController, formatter, JSONModel, UI5Date, unifiedLibrary, Fragment, DateFormat, Filter, FilterOperator) {
    "use strict";

    //Selecting the calendar type 
    let CalendarDayType = unifiedLibrary.CalendarDayType;

    return BaseController.extend("com.app.interviewschedule.controller.View2", {

      //Setting the formatter
      formatter : formatter,
      // +++++++++++++++++++++++++++++++ Defined the onInit function +++++++++++++++++++++++++++++++++++++
      onInit: function () {

        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter.getRoute("RouteView2").attachMatched(this.loadPage, this);


      },

      loadPage: async function (oEvent) {

        //Create Empty array
        let aApplicationIds = []

        //Getting the ApplicationId 
        this.AppId = oEvent.getParameter("arguments").variable

        //Application Ids Array 
        aApplicationIds = [...aApplicationIds, this.AppId]

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
          StartingDate: UI5Date.getInstance("2021", "10", "26"),
          AppoinmentDetails:
          {
            "start_date" : this.formatter.StartDateHardCodedTime(this.getView().byId("SPC1").getStartDate()),
            "end_date" : this.formatter.EndDateHardCodedTime(this.getView().byId("SPC1").getStartDate()),
            "app_id": this.AppId,
          }
        });


        //Set the Json Model to the View level
        this.getView().setModel(oModel, "local");

        

      },

      //++++++++++This event will be trigger when we will click on any event+++++++++++++++

      handleAppointmentSelect: function (oEvent) {


        var oAppointment = oEvent.getParameter("appointment"),
          oView = this.getView();
        const AppoinmentData = oEvent.getParameter("appointment").getBindingContext("local").getObject()
        this.getView().getModel("local").setProperty("/currentAppoinments", AppoinmentData);


        if (oAppointment === undefined) {
          return;
        }



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


      //++++++++++++++++++++++Create appoinment dialog+++++++++++++++++++++++++++++++++++

      oCreateAppoinmentPopup: null,
      handleAppointmentCreate: function (oEvent) {
        this.AppId
        var that = this;

        if (!this.oCreateAppoinmentPopup) {
          Fragment.load({

            name: "com.app.interviewschedule.fragments.CreateAppointment",
            controller: this,
            id: "create"
          }).then(function (oFragment) {
            that.oCreateAppoinmentPopup = oFragment;
            that.getView().addDependent(that.oCreateAppoinmentPopup)
            that.oCreateAppoinmentPopup.setTitle("Create new appoinment")
            that.oCreateAppoinmentPopup.open();
          })
        }

        else {
          this.oCreateAppoinmentPopup.open();
        }
      },


      // ++++++++++++++++ Close Popup +++++++++++++++++++++
      closeDialog: function (oEvent) {
        oEvent.getSource().getParent().getParent().close()
      },



      // ++++++++++++++++++ getData function implementation ++++++++++++++++++++++++++++
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

