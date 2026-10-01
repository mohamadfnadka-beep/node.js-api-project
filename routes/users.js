const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');

const cardSchema = z.object({
title: z.string().min(1, "Title is required"),
subtitle: z.string().min(1, "Subtitle is required"),
description: z.string().min(1, "Description is required"),
phone: z.string().min(1, "Phone is required"),
email: z.string().email("Invalid email format"),
web: z.string().optional(),
image: z.object({
    url: z.string().optional(),
    alt: z.string().optional()
}).optional(),
address: z.object({
    state: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    street: z.string().min(1, "Street is required"),
    houseNumber: z.number(),
    zip: z.number().optional()
})
});

// POST /users - Register a new user
router.post('/', async (req, res) => {
try {

const validation = RegisterSchema.safeParse(req.body);
if (!validation.success) return res.status(400).send(validation.error.errors[0].message);

    // 2. Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    // 3. Create new user object
    user = new User(req.body);

    // 4. Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    
    // Return user
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(201).send(userWithoutPassword);
} catch (err) {
    res.status(500).send('Server error');
}
});

// POST /users/login - Login and get token
router.post('/login', async (req, res) => {
try {

const validation = loginSchema.safeParse(req.body);
if (!validation.success) return res.status(400).send(validation.error.errors[0].message);

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