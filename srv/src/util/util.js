const getEDMFormatedDateTime = (sDate) => {
    const splitted = sDate.split("-");
    const newDate = new Date(
      Date.UTC(splitted[0], (parseInt(splitted[1]) - 1).toString(), splitted[2])
    );
    return `/Date(${newDate.getTime()})/`;
  };
  
  const randomIdGenerator = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
  
  const getFutureOrPastDate = (oDate, iNumberofDays) => {
    const sMonth = oDate.getMonth() + 1;
    const sDate = oDate.getDate() + iNumberofDays;
    const sYear = oDate.getFullYear();
  
    return new Date(`${sYear}-${sMonth}-${sDate}`);
  };
  
  const getFutureOrPastDateString = (oDate, iNumberofDays) => {
    if (!oDate) {
      return null;
    }
    const sMonth = oDate.getMonth() + 1;
    const sDate = oDate.getDate() + iNumberofDays;
    const sYear = oDate.getFullYear();
  
    return `${sYear}-${sMonth}-${sDate}`;
  };
  
  const getWhereClausesFromReq = async (req, mProcessingAttributes) => {
    req.query.SELECT.columns.forEach(({ expand, ref, where }) => {
      const oExpandWhere = {
        expand: null,
        where: null,
      };
      if (ref) {
        if (where) {
          oExpandWhere.where = where;
        }
        if (expand) {
          oExpandWhere.expand = expand;
        }
        mProcessingAttributes.set(ref[0], oExpandWhere);
      }
    });
  }
  
  module.exports = {
    getEDMFormatedDateTime,
    randomIdGenerator,
    getFutureOrPastDate,
    getFutureOrPastDateString,
    getWhereClausesFromReq
  };