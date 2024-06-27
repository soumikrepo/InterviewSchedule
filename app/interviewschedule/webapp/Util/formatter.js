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
    },

    removeTimePart: function (dateTimeString) {
      // Parse the input date-time string to a Date object
      const date = new Date(dateTimeString);

      // Define a custom date format with the desired pattern
      const oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
        pattern: "dd MMM yyyy"
      });

      // Format the date object to the desired date string format
      return oDateFormat.format(date);
    }
  })
});