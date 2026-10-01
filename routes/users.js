const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// Joi Validation Schemas
const registerSchema = Joi.object({
name: Joi.object({
    first: Joi.string().required(),
    middle: Joi.string().allow(''),
    last: Joi.string().required()
}).required(),
isBusiness: Joi.boolean().required(),
phone: Joi.string().required(),
email: Joi.string().email().required(),
password: Joi.string().min(8).required(),
address: Joi.object({
    state: Joi.string().allow(''),
    country: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    houseNumber: Joi.number().required(),
    zip: Joi.number().allow('', 0)
}).required(),
image: Joi.object({
    url: Joi.string().allow(''),
    alt: Joi.string().allow('')
})
});

const loginSchema = Joi.object({
email: Joi.string().email().required(),
password: Joi.string().min(8).required()
});

// POST /users - Register a new user
router.post('/', async (req, res) => {
try {
    // 1. Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // 2. Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    // 3. Create new user object
    user = new User(req.body);

    // 4. Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    
    // Return user (usually best practice to omit the password from the response)
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).send(userWithoutPassword);
} catch (err) {
    res.status(500).send('Server error');
}
});

// POST /users/login - Login and get token
router.post('/login', async (req, res) => {
try {
    // 1. Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // 2. Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');

    // 3. Compare passwords
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    // 4. Generate JWT containing _id, isBusiness, and isAdmin
    const token = jwt.sign(
    { _id: user._id, isBusiness: user.isBusiness, isAdmin: user.isAdmin },
    process.env.JWT_SECRET
    );

    res.send({ token });
} catch (err) {
    res.status(500).send('Server error');
}
});

module.exports = router;