sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "com/app/interviewschedule/Util/formatter"
    ],
    function(BaseController, formatter) {
      "use strict";
  
      return BaseController.extend("com.app.interviewschedule.controller.App", {
        
        Formatter : formatter,
        onInit: function() {
        }
      });
    }
  );
  