sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.app.interviewschedule.controller.View1", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        this._initialSetup();
        oRouter.attachRoutePatternMatched(this.loadPage, this);
      },

      _initialSetup: function () {
        this.iSkip = 0;
        this.iTop = 10;
        //Set the json model view level
        this.getView().setModel(
          new JSONModel({
            JOBREQ: [],
          }),
          "local"
        );
      },

      loadPage: async function () {
        //Created an empty array
        let AppInterview = [],
          valueIndex = 0,
          aApplicationIds = [];
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
          aApplicationIds = [
            ...aApplicationIds,
            ...aApplications.map((application) => application.applicationId),
          ];
        });

        const aJobApplicationfilters = aApplicationIds.map(
          (applicationId) =>
            new Filter("applicationId", FilterOperator.EQ, applicationId)
        );
        // Getting The Job Application interview Data
        const { results: aJobInterviewData } = await this.getData(
          oModel,
          "/JobApplicationInterview",
          aJobApplicationfilters,
          [],
          null,
          null
        );

        // Setting up the Array For Job Application interview
        aData.forEach((jobReq) => {
          jobReq.jobApplications.forEach((applications) => {
            const applicationId = applications.applicationId;
            const aFilteredInterview = aJobInterviewData.filter(
              (interViewData) => interViewData.applicationId === applicationId
            );
            applications.jonApplicationInterview = aFilteredInterview;
            applications.InterviewCount = aFilteredInterview.length;
          });
        });

        // Setting up the Application Data
        this.getView().getModel("local").getData().JOBREQ = aData;
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
    });
  }
);
