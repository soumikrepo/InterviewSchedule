sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Fragment,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("com.app.interviewschedule.controller.View1", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        this._initialSetup();
        oRouter.attachRoutePatternMatched(this.loadPage, this);
      },

      _initialSetup: function () {
        this.iSkip = 0;
        this.iTop = 15;
        //Set the json model view level
        this.getView().setModel(
          new JSONModel({
            JOBREQ: [],
            PATH: "",
            interviewData: {
              applicationInterviewId: "",
              notes: "",
              endDate: "",
              candSlotMapId: "",
              recruitEventStaffId: 1,
              isTimeSet: "",
              source: "",
              applicationId: "",
              startDate: "",
              status: "",
            },
          }),
          "local"
        );
      },

      loadPage: async function () {
        //Created an empty array
        let aApplicationIds = [];
        let aPositionNumbers = [];

        //model object
        const oModel = this.getOwnerComponent().getModel();

        // Getting Job Req and Job Application
        const { results: aData } = await this.getData(
          oModel,
          "/JobRequisition",
          [],
          ["jobApplications"],
          this.iTop,
          this.iSkip
        );
        // Getting all the application Ids
        aData.forEach((applications) => {
          const aApplications = applications.jobApplications;

          const aCurrentApplicationId = aApplications.map(
            (application) => application.applicationId
          );
          aApplicationIds = [...aApplicationIds, ...aCurrentApplicationId];
        });

        //Getting all the position number
        const aPositionNumber = aData.map((app) => app.positionNumber);
        aPositionNumbers = [...aPositionNumbers, ...aPositionNumber];

        // Job applications filter (1)
        const aJobApplicationfilters = aApplicationIds.map(
          (applicationId) =>
            new Filter("applicationId", FilterOperator.EQ, applicationId)
        );

        // Position number filter (2)
        const aPositionNumberFilters = aPositionNumbers.map(
          (PositionNumber) =>
            new Filter("code", FilterOperator.EQ, PositionNumber)
        );

        // Getting The Job Application interview Data with passing the JobApplication Filter (1)
        const { results: aJobInterviewData } = await this.getData(
          oModel,
          "/JobApplicationInterview",
          aJobApplicationfilters,
          [],
          null,
          null
        );

        // Gettig the Position Details with passing the PositionNumber Filter(2)
        const { results: aPosition } = await this.getData(
          oModel,
          "/Position",
          aPositionNumberFilters,
          [],
          null,
          null
        );

        // Setting up the Array For Job Application interview And Position number

        aData.forEach((jobReq) => {
          jobReq.JobApplicationCount = jobReq.jobApplications.length;
          jobReq.JobInterviewCount = 0;

          jobReq.jobApplications.forEach((applications) => {
            const applicationId = applications.applicationId;
            const aFilteredInterview = aJobInterviewData.filter(
              (interViewData) => interViewData.applicationId === applicationId
            );
            applications.jonApplicationInterview = aFilteredInterview;
            jobReq.JobInterviewCount =
              jobReq.JobInterviewCount + aFilteredInterview.length;
          });

          const positionNumber = jobReq.positionNumber;
          const aFilteredPosition = aPosition.filter(
            (positionData) => positionData.code === positionNumber
          );

          if (aFilteredPosition.length > 0) {
            jobReq.positionCode = aFilteredPosition[0].code;
            jobReq.TitlePosition = aFilteredPosition[0].positionTitle;
          } else {
            jobReq.positionCode = ""; // or handle the case when aFilteredPosition is empty
            jobReq.TitlePosition = ""; // or handle the case when aFilteredPosition is empty
          }
        });

        // Setting up the Application Data
        this.getView().getModel("local").getData().JOBREQ = aData;
        // let jobApplicationsData = aData.map(obj => obj.jobApplications);
        // this.getView().getModel("local").getData().JobApplicationsData = aData[0].jobApplications;
        this.getView().getModel("local").refresh(true);
      },

      oAppInterviewPopup: null,
      onPressAppInterview: function (oEvent) {
        var Path =
          oEvent.oSource.mBindingInfos.text.binding.aBindings[0].oContext.sPath;
        Path += "/jobApplications";
        console.log(Path);
        this.getView().getModel("local").getData().PATH = Path;
        var that = this;

        if (!this.oAppInterviewPopup) {
          Fragment.load({
            name: "com.app.interviewschedule.fragments.CandidateDialog",
            controller: this,
            id: "AppInterview",
          }).then(function (oFragment) {
            that.oAppInterviewPopup = oFragment;
            that.getView().addDependent(that.oAppInterviewPopup);
            that.oAppInterviewPopup.setTitle("Creating new Interview");
            that.oAppInterviewPopup.open();
          });
        } else {
          this.oAppInterviewPopup.open();
        }
      },

      saveDialog: function () {
        //step-1 get the payload
        var payload = this.getView()
          .getModel("local")
          .getProperty("/interviewData");

        //Modifying the payload
        payload.startDate = this.DateConvertion(payload.startDate);
        payload.endDate = this.DateConvertion(payload.endDate);

        // step-2 check if it is valid
        if (!payload.applicationId) {
          MessageBox.error("Please enter valid Application Id");
        }

        //step-3 get the odata model object
        var oDataModel = this.getView().getModel();

        //step-4 fire the post call
        oDataModel.create("/JobApplicationInterview", payload, {
          //step-5 success - callback if post was fine
          success: function (data) {
            MessageToast.show("Interview was created successfully");
          },
          //step-6 error - callback if post was having issue
          error: function (oErr) {
            MessageBox.error(
              "Opps! something went wrong : " +
                JSON.parse(oErr.responseText).error.message.value
            );
          },
        });
      },

      closeDialog: function (oEvent) {
        oEvent.getSource().getParent().getParent().close();
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

        const oUrlParameters = {
          $expand: aExpand,
        };

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

      //Date function
      DateConvertion: function (timestamp) {
        let date = new Date(timestamp);
        // Get the individual components of the date
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-indexed
        let day = ("0" + date.getDate()).slice(-2);
        let hours = ("0" + date.getHours()).slice(-2);
        let minutes = ("0" + date.getMinutes()).slice(-2);
        let seconds = ("0" + date.getSeconds()).slice(-2);
        let milliseconds = ("00" + date.getMilliseconds()).slice(-3);

        // Format the date in the desired format
        let formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

        return formattedDate;
      },
      onCandidateToSchedule: function (oEvent) {
        const { jobApplications } = oEvent
          .getSource()
          .getBindingContext("local")
          .getObject();
        this.getView()
          .getModel("local")
          .setProperty("/currentApplications", jobApplications);
        this.getView().getModel("local").refresh(true);

        // TODO Fragment to be loaded using Fragment.load
        // TODO Fragment To be opened using open method
      },
    });
  }
);
