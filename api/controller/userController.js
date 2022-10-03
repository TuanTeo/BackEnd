const jwt = require("jsonwebtoken");

const UserModel = require("../model/userModel");
const nodemailer = require("nodemailer");
const tokenModel = require("../model/tokenModel");
const { SECRET_KET } = require("../../constant");

exports.regester = async (req, res) => {
  try {
    let { fisrtName, lastName, userName, password, mail, phone, address } =
      req.body;
    let role = "admin";
    const newUser = new UserModel({
      user: fisrtName + " " + lastName,
      userName,
      password,
      mail,
      role,
      phone,
      address,
    });
    let result = await newUser.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("🚀 ~ file: userController.js ~ line 32 ~ exports.login= ~ req.body", req.body)
    const { userName, password } = req.body;
    const user = await UserModel.findAccount(userName, password);
    const token = await user.generateToken();

    // res.send("Cookie have been saved successfully");

    res.cookie(`token`, token, {
      httpOnly: true,
      path: "",
    });
    res.json({ message: "login success", token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.setCookie = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;
    console.log(password, token);
    let data = jwt.verify(token, SECRET_KET);
    const user = await UserModel.findOne({ userName: data.userName });
    const tokenSave = await tokenModel.findOne({ token: token });
    if (!user) {
      throw new Error("user not exist");
    }
    if (!tokenSave) {
      throw new Error("invalid token");
    }
    if (tokenSave.isUsed) {
      throw new Error("token is used");
    }

    user.password = password;
    tokenSave.isUsed = true;
    await user.save();
    await tokenSave.save();

    res.status(201).json({ message: "Reset password success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setCookie = async (req, res) => {
  try {
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { mail } = req.body;
    let user = await UserModel.findOne({ mail });
    if (!user) {
      throw new Error("user not exist");
    }
    const token = await user.generateToken();

    const newToken = new tokenModel({
      token,
      userID: user._id,
      isUsed: false,
    });
    let result = await newToken.save();
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "testmmud@gmail.com",
        pass: "gkqwtllcabqnuqpo",
      },
    });
    if (result) {
      var mainOptions = {
        // thiết lập đối tượng, nội dung gửi mail
        from: "MTai",
        to: "truongtai10102k@gmail.com",
        subject: "Quên Mật Khẩu",
        text: "You recieved message from " + req.body.email,
        html:
          "<p>Vui Lòng nhấp theo đường </p>" +
          ` <a
              href="http://localhost:3000/reset-password?token=${token}"
              target={"_blank"}
              rel="noopener noreferrer"
              >
              Click here
              </a>`,
      };
      transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
          res.json({ message: err.message, error: true });
        } else {
          res.json({ message: "send mail success" });
        }
      });
    } else {
      throw new Error("error");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.termAdmin = async (req, res) => {
  let { userName } = req.body;
  try {
    let user = await UserModel.findOne({ userName: userName });
    if (!user) {
      return res.json({ message: "find account not found by user name" });
    }
    user.role = "admin";
    let newUser = await user.save();
    res.json({ message: "change role to admin success", newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    let listUser = await UserModel.find({}, { _id: 0, password: 0, __v: 0 });
    res.json({ user: listUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userName } = req.body;
    let user = await UserModel.find({ userName: userName });
    await user.delete();
    res.json({ message: "delete account success" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.putUser = async (req, res) => {
  try {
    const { phone, userName, password } = req.body;
    let user = await UserModel.find({ userName: userName });
    user.phone = phone;
    user.userName = userName;
    user.password = password;
    let newUser = await user.save();
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
