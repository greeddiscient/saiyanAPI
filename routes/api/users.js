const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const keys = require('../../config/keys');
const User = require('../../models/User');

const router = express.Router();

// @route POST api/users/login
// @desc Login user
// @access public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  const user = await User.findOne({ email });

  if (user) {
    const passMatched = await bcrypt.compare(password, user.password);

    if (passMatched) {
      const payload = { id: user.id, name: user.name, email: user.email };
      return jwt.sign(payload, keys.secretKey, { expiresIn: 36000 }, (err, token) => {
        return res.json({
          success: true,
          token: `Bearer ${token}`
        });
      });
    }
  }
  errors.user = 'Invalid email/password';
  return res.status(400).json({
    success: false,
    errors
  });
});

// @route POST api/users/register
// @desc Register a new user
// @access public
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  const errors = {};

  User.findOne({ email }).then(user => {
    if (user) {
      errors.users = 'User is already registered';
      return res.status(400).json({
        success: false
      });
    }

    const newUser = new User({
      name,
      email,
      password
    });

    return bcrypt.genSalt(10, (err, salt) => {
      return bcrypt.hash(password, salt, (error, hash) => {
        if (error) throw error;
        newUser.password = hash;
        return newUser
          .save()
          .then(userCreated =>
            res.json({
              success: true,
              userCreated
            })
          )
          .catch(dbErr => {
            errors.db = dbErr;
            res.status(400).json({
              success: false,
              errors
            });
          });
      });
    });
  });
});

module.exports = router;
