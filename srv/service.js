const cds = require("@sap/cds"); // Importing the cds module.
const { getJobRequisition } = require("./src/JobRequisition");
const { getUsersDetails } = require("./src/user");
const { getJobApplication } = require("./src/jobApplication"); // Import the handler
const { getJobApplicationInterview } = require("./src/jobApplicationInterview"); // Import the handler
const { getPositionsDetails } = require("./src/Position"); // Import the handler

module.exports = cds.service.impl(async (srv) => {
  srv.on("READ", "User", getUsersDetails);
  srv.on("READ", "JobRequisition", getJobRequisition);
  srv.on("READ", "JobApplication", getJobApplication);
  srv.on("READ", "JobApplicationInterview", getJobApplicationInterview);
  srv.on("READ", "Position", getPositionsDetails);
  srv.on(
    ["CREATE", "UPDATE"],
    "jobApplicationInterview",
    getJobApplicationInterview
  );


  
});


