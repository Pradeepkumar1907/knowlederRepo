const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '30d' 
  });
};

// @desc Register a new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, username, password, role } = req.body;
  console.log('Register request received:', { name, email, username, role }); // Log incoming (password hidden)

  try {
    // Validate required fields
    const finalRole = role || 'customer';
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields (name, email, username, password) are required' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      const message = userExists.email === email ? 'User already exists with this email' : 'Username already taken';
      return res.status(400).json({ message });
    }

    const user = await User.create({
      name,
      email,
      username,
      password,
      role: finalRole
    });

    if (user) {
      console.log('User created successfully:', user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        followers: user.followers,
        following: user.following,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error Details:', {
      message: error.message,
      stack: error.stack,
      requestBody: { name, email, username, role: finalRole }
    });
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// @desc Authenticate a user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }

  const cleanIdentifier = identifier ? identifier.trim() : '';
  const idLength = cleanIdentifier.length;

  console.log('--- Deep Debug Login ---');
  console.log(`Identifier Received: "${identifier}"`);
  console.log(`Identifier Sanitized: "${cleanIdentifier}" (Length: ${idLength})`);
  console.log(`Connected Database: ${mongoose.connection.name}`);
  console.log(`Connection Host: ${mongoose.connection.host}`);
  console.log('------------------------');

  try {
    // 1. Try a direct string match
    let user = await User.findOne({ 
      $or: [
        { email: cleanIdentifier },
        { username: cleanIdentifier }
      ]
    }).select('+password');

    // 2. If no direct match, try case-insensitive regex (just in case)
    if (!user) {
      console.log('No direct match, attempting case-insensitive regex lookup...');
      user = await User.findOne({ 
        $or: [
          { email: new RegExp('^' + cleanIdentifier + '$', 'i') },
          { username: new RegExp('^' + cleanIdentifier + '$', 'i') }
        ]
      }).select('+password');
    }

    // Validate user exists
    if (!user) {
      console.log(`[FAILED] User Not Found for: "${cleanIdentifier}" in database "${mongoose.connection.name}"`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.password) {
      console.error(`[CRITICAL] User found but missing password field in database for identifier: "${cleanIdentifier}"`);
      return res.status(500).json({ message: 'Internal Server Error: Account data is corrupted' });
    }

    console.log(`[SUCCESS] User Found: ${user.username} (${user.role})`);

    // Validate password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      followers: user.followers,
      following: user.following,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
