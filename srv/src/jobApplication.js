const { getService } = require("./util/serviceOperation");
const getJobApplication = async (req) => {
  const oSrv = await getService("sf_api_service");
  return oSrv.tx(req).run(req.query);
};

module.exports = {getJobApplication}