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
        this.oRouter = this.getOwnerComponent().getRouter();
        this._initialSetup();
        this.oRouter.attachRoutePatternMatched(this.loadPage, this);
      },

      _initialSetup: function () {
        this.iSkip = 0;
        this.iTop = 10;

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

      loadPage: async function (oEvent) {
        // If the JOBREQ property is empty then go to the reuseable function
        if (
          this.getView().getModel("local").getProperty("/JOBREQ").length == 0
        ) {
          //Calling the Reuseable load page .
          this.reuseLoadPageFirstView();
        }
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

      StartScheduleBtn: function () {
        this.oRouter.navTo("RouteView2", {
          variable: this.getView()
            .getModel("local")
            .getProperty("/ApplicantId"),
        });
      },

      cancelDialog: function (oEvent) {
        oEvent.getSource().getParent().getParent().close();
      },

      oCandidateToSchedulePopup: null,
      onCandidateToSchedule: function (oEvent) {
        // Reset the ApplicantId property in the local model
        this.getView()
          .getModel("local") // Get the "local" model from the view
          .setProperty("/ApplicantId", ""); // Set the "ApplicantsId" property to an empty string

        const { jobApplications } = oEvent

          .getSource()
          .getBindingContext("local")
          .getObject();
        this.getView()
          .getModel("local")
          .setProperty("/currentApplications", jobApplications);
        this.getView().getModel("local").refresh(true);

        // TODO Fragment to be loaded and Opened
        var that = this;
        if (!this.oCandidateToSchedulePopup) {
          Fragment.load({
            name: "com.app.interviewschedule.fragments.CandidateDialog",
            controller: this,
            id: "AppInterview",
          }).then(function (oFragment) {
            that.oCandidateToSchedulePopup = oFragment;
            that.getView().addDependent(that.oCandidateToSchedulePopup);
            that.oCandidateToSchedulePopup.setTitle("Select Candiates");
            that.oCandidateToSchedulePopup.open();
          });
        } else {
          this.oCandidateToSchedulePopup.open();
        }
      },

      onPressCard: function (oEvent) {
        const { applicationId } = oEvent

          .getSource()
          .getBindingContext("local")
          .getObject();
        this.getView()
          .getModel("local")
          .setProperty("/ApplicantId", applicationId);
        this.getView().getModel("local").refresh(true);
      },

      LoadTop: async function () {
        debugger;

        //Increase the Skip value
        this.iSkip = this.iTop + this.iSkip;

        this.reuseLoadPageFirstView();
      },

      // Implementation for the loadPage function
      reuseLoadPageFirstView: async function () {
        //Created an empty array
        let aApplicationIds = [];
        let aPositionNumbers = [];

        //model object
        const oModel = this.getOwnerComponent().getModel();

        //Getting the count of Total Job Requisition
        const JobReqCount = await this.getData(
          oModel,
          "/JobRequisition/$count",
          [],
          []
        );

        //Assign Count to Local model
        this.getView()
          .getModel("local")
          .setProperty("/JobReqCount", JobReqCount);

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
          (application_Id) =>
            new Filter("applicationId", FilterOperator.EQ, application_Id)
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
        this.getView()
          .getModel("local")
          .getData()
          .JOBREQ.push(...aData);
        // let jobApplicationsData = aData.map(obj => obj.jobApplications);
        // this.getView().getModel("local").getData().JobApplicationsData = aData[0].jobApplications;
        this.getView().getModel("local").refresh(true);

        //Getting the Count of Current Number of Job Requisition
        this.getView()
          .getModel("local")
          .setProperty(
            "/currentJobReqCount",
            this.getView().getModel("local").getProperty("/JOBREQ").length
          );
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
