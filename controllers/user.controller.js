const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2
const nodemailer = require("nodemailer");
const { renderTemplate } = require("../middleware/mail.sender");

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.CLOUD_KEY,
  api_secret:process.env.CLOUD_SECRET
})

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.APP_MAIL,
    pass: process.env.APP_PASS
  }
});

const register = async (req, res) => {
  const { firstName, lastName, email, password, profileImage } = req.body;
  try {
    const salt = 10;
    const saltRound = await bcrypt.genSalt(salt);

    const hashedPassword = await bcrypt.hash(password, saltRound);

    let image =profileImage&& await cloudinary.uploader.upload(profileImage)

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImage: profileImage? {
        public_id:image.public_id,
        secure_url:image.secure_url
      }:{}
    });

    const token = await jwt.sign({ id: user._id}, process.env.APP_SECRET, {
      expiresIn: "5h",
    });

    // if(!user){
    //     res.status(400).send({
    //         message:"Cannot create user"
    //     })
    // }else

    res.status(201).send({
      message: "user created successfully",
      data: {
        firstName,
        lastName,
        email,
        token,
        profileImage:user.profileImage
      },
    });

    let welcomeMailer = await renderTemplate('welcome.ejs', {name:firstName, companyName:"Himer ticks"})


    let mailOptions = {
      from: process.env.APP_MAIL,
      to: [email, 'adeoyesamuelolamidemails@gmail.com', "tobioyee@gmail.com", "cephastomisin@gmail.com", 'adefokunprecious92@gmail.com', "fabinuoluwadarasimi8@gmail.com"],
      subject: 'Welcome 🥳',
      html: welcomeMailer
    };


transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
  } catch (error) {
    console.log(error);

    if (error.code == 11000) {
      res.status(400).send({
        message: "user already exists",
      });
    } else {
      res.status(400).send({
        message: "cannot create user",
      });
    }
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const isUser = await UserModel.findOne({ email }).select("+password");
    console.log(isUser);
    

    if (!isUser) {
      res.status(400).send({
        message: "invalid credentialssssssssss",
      });

      return;
    }

    const isMatch = await bcrypt.compare(password, isUser.password);

    if (!isMatch) {
      res.status(400).send({
        message: "invalid credentials",
      });
      return;
    }

    const token = await jwt.sign({ id: isUser._id }, process.env.APP_SECRET, {
      expiresIn: "5h",
    });

    res.status(200).send({
      message: "user signed in successfully",
      data: isUser,
      token,
    });
  } catch (error) {
    res.status(400).send({
        message: "invalid credentials",
      });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).send({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "cannot fetch users",
    });
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, profileImage } = req.body;
  const { id } = req.params;

  if (!id) {
    res.status(400).send({
      message: "id was not provided",
    });
    return;
  }

  try {
    let image;
    if(profileImage){
      image = await cloudinary.uploader.upload(profileImage)
    }

    let update = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(profileImage&&{
        profileImage:{
          public_id:image.public_id,
          secure_url:image.secure_url
        }
      })
    };
    const user = await UserModel.findById(id);
    if (!user) {
      res.status(404).send({
        message: "user not found",
      });

      return;
    }
    let updatedUser = await UserModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    console.log(update);
    res.status(200).send({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "user cannot be updated",
    });
  }
};

const verifyUser = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]
    ? req.headers["authorization"]?.split(" ")[1]
    : req.headers["authorization"]?.split(" ")[0]
    // console.log(req.headers["authorization"].split(" "));
    
    // const header= req.headers["authorization"]?.split(" ")
    // const token = header[header?.length-1]
    try {
        console.log(token);
        const user = await jwt.verify(token, process.env.APP_SECRET, function(err,decoded){
            if(err){
                res.status(401).send({
                    message:"user unauthorized"
                })

                return
            }

            console.log(decoded);
            const issuedTime= new Date(decoded.iat*1000)
            req.user = decoded.id
            console.log(issuedTime);
            

            next()
            
        })
        
    } catch (error) {
        res.status(401).send({
            message:"user unauthorized"
        })
    }
};

module.exports = {
  register,
  getAllUsers,
  updateUser,
  login,
  verifyUser
};
