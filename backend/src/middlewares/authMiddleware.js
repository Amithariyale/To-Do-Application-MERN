const isAuth = (req, res, next) => {
  if (req.session.isAuth) next();
  else {
    return res.status(401).send({
      message: "Session sxpired, please login again",
    });
  }
};

module.exports = { isAuth };
