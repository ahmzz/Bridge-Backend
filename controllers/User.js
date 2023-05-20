import {User} from '../models/userModel.js';
import {sendMail} from '../utils/sendMail.js';
import {sendToken} from '../utils/sendToken.js';
export const register = async (req, res) => {
  try {
    const {firstName, lastName, email, password} = req.body;
    // const {avatar} = req.files;

    let user = await User.findOne({email});

    if (user) {
      return res
        .status(400)
        .json({success: false, message: 'User already exists'});
    }
    const otp = Math.floor(Math.random() * 1000000);

    user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      avatar: {
        public_id: ' ',
        url: ' ',
      },
      password: password,
      otp: otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
    });
    await sendMail(email, 'Verify your account', `Your OTP is ${otp}`);
    sendToken(
      res,
      user,
      201,
      'OTP sent to your email, please verify your account',
    );
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);

    const user = await User.findById(req.user._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res
        .status(400)
        .json({success: false, message: 'Invalid OTP or has been Expired'});
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    sendToken(res, user, 200, 'Account Verified');

    await user.save();
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const login = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({success: false, message: 'Please enter all fields'});
    }

    const user = await User.findOne({email}).select('+password');

    if (!user) {
      return res
        .status(400)
        .json({success: false, message: 'Invalid Email or Password'});
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({success: false, message: 'Invalid Email or Password'});
    }

    sendToken(res, user, 200, 'Login Successful');
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie('token', null, {
        expires: new Date(Date.now()),
      })
      .json({success: true, message: 'Logged out successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    sendToken(res, user, 201, `Welcome back ${user.firstName}`);
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const {firstName, lastName} = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    await user.save();

    res
      .status(200)
      .json({success: true, message: 'Profile Updated successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    const {oldPassword, newPassword} = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({success: false, message: 'Please enter all fields'});
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({success: false, message: 'Invalid Old Password'});
    }

    user.password = newPassword;

    await user.save();

    res
      .status(200)
      .json({success: true, message: 'Password Updated successfully'});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const {email} = req.body;

    const user = await User.findOne({email});

    if (!user) {
      return res.status(400).json({success: false, message: 'Invalid Email'});
    }

    const otp = Math.floor(Math.random() * 1000000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const message = `Your OTP for reseting the password ${otp}. If you did not request for this, please ignore this email.`;

    await sendMail(email, 'Request for Reseting Password', message);

    res.status(200).json({success: true, message: `OTP sent to ${email}`});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};

export const resetPassword = async (req, res) => {
  try {
    const {otp,newPassword} = req.body;

    const user = await User.findOne({
      resetPasswordOtp: otp,
      resetPasswordOtpExpiry: {$gt: Date.now()},
    }).select("+password")
    

    if (!user) {
      return res.status(400).json({success: false, message: 'OTP Expired'});
    } else {
      user.password=newPassword
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpiry = null;
      
    }
    await user.save()
    res.status(200).json({success: true, message: `Password changed`});
  } catch (error) {
    res.status(500).json({success: false, message: error.message});
  }
};
