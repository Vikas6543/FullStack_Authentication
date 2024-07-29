const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/connectDB');
const passport = require('passport');
require('./config/passport');

dotenv.config();

// middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(passport.initialize());

// database connection
connectDB();

// routes
app.use('/user', require('./routes/userRoute'));

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
