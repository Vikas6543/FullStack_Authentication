// ********************* just for testing purpose
const jwt = require('jsonwebtoken');

const setAuthHeader = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return next();
    }

    const decoded = jwt.decode(accessToken);
    const currentTime = Date.now() / 1000;
    if (currentTime > decoded.exp) {
      return next();
    }

    req.headers['authorization'] = `Bearer ${accessToken}`;
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = setAuthHeader;
