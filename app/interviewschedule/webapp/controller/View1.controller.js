sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
  ],
  function (Controller, JSONModel, Filter, FilterOperator, Fragment) {
    "use strict";

    return Controller.extend("com.app.interviewschedule.controller.View1", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        this._initialSetup();
        oRouter.attachRoutePatternMatched(this.loadPage, this);
      },

      _initialSetup: function () {
        this.iSkip = 0;
        this.iTop = 11;
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
        let aApplicationIds = [];
        let  aPositionNumbers = [];
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

         

          const aCurrentApplicationId = aApplications.map((application) => application.applicationId);
          aApplicationIds = [
            ...aApplicationIds,
            ...aCurrentApplicationId,
          ]
          const aPositionNumber = applications.positionNumber;
          aPositionNumbers = [
           aPositionNumber,
          ];       

        });

        // Job applications filter (1)
        const aJobApplicationfilters = aApplicationIds.map(
          (applicationId) =>
            new Filter("applicationId", FilterOperator.EQ, applicationId)
        );


        // Position number filter (2)
          const aPositionNumberFilters = aPositionNumbers.map(
            (PositionNumber)=>
            new Filter("code", FilterOperator.EQ, PositionNumber )
          )


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
        const {results: aPosition} = await this.getData(
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
            jobReq.JobInterviewCount = jobReq.JobInterviewCount + aFilteredInterview.length;
          });

          const positionNumber = jobReq.positionNumber
             const aFilteredPosition = aPosition.filter(
             (positionData) => positionData.code === positionNumber
          );

          if (aFilteredPosition.length > 0) {
            jobReq.positionCode = aFilteredPosition[0].code;
            jobReq.TitlePosition = aFilteredPosition[0].positionTitle;
          } 
          else {
            jobReq.positionCode = ''; // or handle the case when aFilteredPosition is empty
            jobReq.TitlePosition = '';// or handle the case when aFilteredPosition is empty
          }
        });

        // Setting up the Application Data
        this.getView().getModel("local").getData().JOBREQ = aData;
        this.getView().getModel("local").refresh(true);
      },

      oAppInterviewPopup : null,
      onPressAppInterview : function()
      {
        var that = this;

        if(!this.oAppInterviewPopup)
        {
          Fragment.load({

            name : "com.app.interviewschedule.fragments.CandidateDialog",
            controller : this,
            id : "AppInterview"
          }).then(function (oFragment){
            that.oAppInterviewPopup = oFragment;
            that.getView().addDependent(that.oAppInterviewPopup)
            that.oAppInterviewPopup.setTitle("The rounds below haven't started yet")
            that.oAppInterviewPopup.open()
          })
        }

        else
        {
          this.oAppInterviewPopup.open();
        }
      },

      closeDialog : function(oEvent)
      {
          
          oEvent.getSource().getParent().getParent().close()
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
