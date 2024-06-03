const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

// register user
module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // check if all fields are filled
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // check if user already exists
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    // save user
    const savedUser = await newUser.save();

    res
      .status(201)
      .json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
