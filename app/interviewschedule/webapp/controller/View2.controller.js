sap.ui.define(
  [
    "sap/ui/core/mvc/Controller"
  ],
  function (BaseController) {
    "use strict";

    return BaseController.extend("com.app.interviewschedule.controller.View2", {
      onInit: function () {

        this.oRouter = this.getOwnerComponent().getRouter();
        this.oRouter.getRoute("RouteView2").attachMatched(this.herculis, this);
      },

      herculis: function (oEvent) {
        var sIndex = oEvent.getParameter("arguments").Data
        var sPath = '/fruits/' + sIndex

        //Bind the element to the View2
        this.getView().bindElement(sPath)
      },
    });
  }
);
