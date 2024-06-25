sap.ui.define([
    'require',
    'dependency'
], function (require, factory) {
    'use strict';

    return ({


        formatDate: function (oDate) {
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
    })
});