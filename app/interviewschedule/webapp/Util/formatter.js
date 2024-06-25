sap.ui.define([
    
], function () {
    'use strict';

    return ({


        FormatDate: function (oDate) {
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

          StartDateHardCodedTime: function (oDate) {
            if (oDate) {
                // Set the time part to 09:00:00
                oDate.setHours(9, 0, 0);
        
                // Define a custom date format with desired pattern
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "dd MMM yyyy, HH:mm:ss"
                });
        
                return oDateFormat.format(oDate);
            }
        },
        EndDateHardCodedTime: function (oDate) {
          if (oDate) {
              // Set the time part to 09:00:00
              oDate.setHours(10, 0, 0);
      
              // Define a custom date format with desired pattern
              var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                  pattern: "dd MMM yyyy, HH:mm:ss"
              });
      
              return oDateFormat.format(oDate);
          }
      }
        
    })
});