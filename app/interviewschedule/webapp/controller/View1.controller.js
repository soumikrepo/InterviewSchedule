sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
],
  function (Controller, JSONModel, ODataModel) {
    "use strict";

    return Controller.extend("com.app.interviewschedule.controller.View1", {
      onInit: function () {
        //Created an empty array
        let AppInterview = []
        let valueIndex = 0;
        //model object
        var oModel = this.getOwnerComponent().getModel()
        var oModel1 = this.getOwnerComponent().getModel("v4");
        //creating the json model object
        var jsonModel = new JSONModel({
          JOBREQ: []
        })



        //Set the json model view level
        this.getView().setModel(jsonModel, "local")



        //+++++++calling the getData method for fetch the JobApplication, JobApplicationInterview+++++
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

          this.getData(oModel, "/JobApplication", [], ["jobApplicationInterview"],4,0)

          .then((data1)=>{
            let DATA1 = data1.results

            DATA1.forEach ((element)=>{

              AppInterview.push(element.jobApplicationInterview.results.length)

            })
          })

        //+++++++calling the getData method for fetch the JobApplication, JobApplicationInterview+++++
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

          this.getData(oModel, "/JobRequisition", [], ["jobApplications"],4,0)

          .then((data) => {
            let DATA = data.results

            DATA.forEach((element) => {
              let count = element.jobApplications.length
              element.Count = count
              
              // Check if valueIndex is within the bounds of the value array
              if (valueIndex < AppInterview.length) {
                 element.Count1 = AppInterview[valueIndex];
                 valueIndex++;
               } else {
                element.Count1 = null; // or any default value you prefer
            }
              
          })
          this.getView().getModel("local").getData().JOBREQ = DATA
          this.getView().getModel("local").refresh(true)
        })
      },




      // Get Data function implementation
      getData: async function (oModel, sPath, aFilters = [], aExpand = [], top, skip) {
        sap.ui.core.BusyIndicator.show();
        this.oModel = oModel;
        this.sPath = sPath;
        this.aFilters = aFilters;
        this.aExpand = aExpand;
        this.top = top
        this.skip = skip;

        return new Promise((resolve, reject) => {
          oModel.read(sPath, {
            urlParameters: {
              $expand: aExpand,
              $top: top,
              $skip: skip
            },
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
  });
