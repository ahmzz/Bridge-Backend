export const sendToken = (res, user, statusCode, message) => {

    const token=user.getJWTToken()
  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
  };

  const userData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatar: user.avatar,
    verified:user.verified
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({success: true, message, user: userData});
};
