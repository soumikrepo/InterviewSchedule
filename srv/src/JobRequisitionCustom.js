const { getService } = require("./util/serviceOperation");
const getJobRequistion = async (req) => {
  const oSrv = await getService("sf_api_service");
  return oSrv.tx(req).run(req.query);
};

module.exports = {getJobRequistion}