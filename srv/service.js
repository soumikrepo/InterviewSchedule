const cds = require("@sap/cds"); // Importing the cds module.
const { getJobRequisition } = require("./src/JobRequisition");
const { getUsersDetails } = require("./src/user");
const { getJobApplication } = require("./src/jobApplication"); // Import the handler
const { getJobApplicationInterview } = require("./src/jobApplicationInterview"); // Import the handler
const { getPositionsDetails } = require("./src/position"); // Import the handler

module.exports = cds.service.impl(async (srv) => {
  // Getting the entities from the services.
  const {
    User,
    JobRequisition,
    JobApplication,
    jobApplicationInterview,
    Position,
  } = srv.entities;
  srv.on("READ", User, getUsersDetails);
  srv.on("READ", JobRequisition, getJobRequisition);
  srv.on("READ", JobApplication, getJobApplication);
  srv.on("READ", jobApplicationInterview, getJobApplicationInterview);
  srv.on("READ", Position, getPositionsDetails);
  srv.on(
    ["CREATE", "UPDATE"],
    jobApplicationInterview,
    getJobApplicationInterview
  );
});
