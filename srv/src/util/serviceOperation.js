const cds = require("@sap/cds");

/**
 * This method will send back the service object based on the service name
 * send in the method.
 * @param {*} sServiceName  The service name which we will be connecting the Successfactor
 * @returns It will return the Service Object back
 */
const getService = async (sServiceName) => {
    const oService = await cds.connect.to(sServiceName); 
    return oService;
}


module.exports = {getService}