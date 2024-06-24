sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/date/UI5Date",
    "sap/ui/unified/library",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat"
  ],
  function (BaseController, JSONModel, UI5Date, unifiedLibrary, Fragment, DateFormat) {
    "use strict";

    //Selecting the calendar type 
    let CalendarDayType = unifiedLibrary.CalendarDayType;

    return BaseController.extend("com.app.interviewschedule.controller.View2", {

      // +++++++++++++++++++++++++++++++ Defined the onInit function +++++++++++++++++++++++++++++++++++++
      onInit: function () {

        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter.getRoute("RouteView2").attachMatched(this.loadPage, this);
        this.initialSetup();

      },

      loadPage: async function (oEvent) {
        
        //Getting the ApplicationId 
        var AppId = oEvent.getParameter("arguments").variable
        // oData model object
        const oDataModel = this.getOwnerComponent().getModel();

        // Fetching the Particular Job Interview.
        const { results: aData } = await this.getData(
          oDataModel,
          "/JobApplicationInterview",
          AppId,
          [],
          this.iTop,
          this.iSkip
        );
        console.log(aData)

      },

      //+++++++++++++++++++++++++++++++ Implementing the initial setup +++++++++++++++++++++++++++++++
      initialSetup: function () {
        // Create a Json Model
        var oModel = new JSONModel();

        // Set Data to the json model

        oModel.setData({
          appointments: [
            {
              title: "L1",
              type: CalendarDayType.Type05,
              startDate: UI5Date.getInstance("2024", "5", "23", "0", "0"),
              endDate: UI5Date.getInstance("2024", "5", "23", "0", "0")
            },
            {
              title: "L2",
              type: CalendarDayType.Type05,
              startDate: UI5Date.getInstance("2024", "5", "24", "5", "10"),
              endDate: UI5Date.getInstance("2024", "5", "24", "6", "10")
            }]

        });

        //Set the Json Model to the View level
        this.getView().setModel(oModel);

        //Creating the json model object and Name of the model is allDay
        oModel = new JSONModel();
        oModel.setData({ allDay: false });
        this.getView().setModel(oModel, "allDay");

      },

      handleAppointmentSelect: function (oEvent) {
        debugger

        //Declaring the variables

        var oAppointment = oEvent.getParameter("appointment"),
          oStartDate,
          oEndDate,
          oTrimmedStartDate,
          oTrimmedEndDate,
          bAllDate,
          oModel,
          oView = this.getView();


        if (oAppointment === undefined) {
          return;
        }

        oStartDate = oAppointment.getStartDate();
        oEndDate = oAppointment.getEndDate();
        oTrimmedStartDate = UI5Date.getInstance(oStartDate);
        oTrimmedEndDate = UI5Date.getInstance(oEndDate);
        bAllDate = false;
        oModel = this.getView().getModel("allDay");


        if (!oAppointment.getSelected() && this.AppoinmentPopup) {
          this.AppoinmentPopup.then(function (oFragment) {
            oFragment.close();
          });
          return;
        }

        this.setHoursToZero(oTrimmedStartDate);
        this.setHoursToZero(oTrimmedEndDate);

        //This condition is basically check whether the Appoinment 
        // is for Whole day or particular time
        if (oStartDate.getTime() === oTrimmedStartDate.getTime() && oEndDate.getTime() === oTrimmedEndDate.getTime()) {
          bAllDate = true;
        }

        //Adding the bAllDate value to json model
        oModel.getData().allDay = bAllDate;
        oModel.updateBindings();
        //Opening the Popup when we click on the Appoinment
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
          oFragment.setBindingContext(oAppointment.getBindingContext());
          oFragment.openBy(oAppointment);
        });

      },
      //This function covert the hours part to zero.
      setHoursToZero: function (oDate) {
        oDate.setHours(0, 0, 0, 0);
      },

      formatDate: function (oDate) {
        if (oDate) {
          var iHours = oDate.getHours(),
            iMinutes = oDate.getMinutes(),
            iSeconds = oDate.getSeconds();

          if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
            return DateFormat.getDateTimeInstance({ style: "medium" }).format(oDate);
          } else {
            return DateFormat.getDateInstance({ style: "medium" }).format(oDate);
          }
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

