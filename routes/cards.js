    const express = require('express');
    const router = express.Router();
    const Card = require('../models/Card');
    const auth = require('../middleware/auth');
    const Joi = require('joi');

    // Joi Validation Schema for Cards
    const cardSchema = Joi.object({
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    description: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    web: Joi.string().allow(''),
    image: Joi.object({
        url: Joi.string().allow(''),
        alt: Joi.string().allow('')
    }),
    address: Joi.object({
        state: Joi.string().allow(''),
        country: Joi.string().required(),
        city: Joi.string().required(),
        street: Joi.string().required(),
        houseNumber: Joi.number().required(),
        zip: Joi.number().allow('', 0)
    }).required()
    });

    // Helper function to generate a unique bizNumber[cite: 4]
    const generateBizNumber = async () => {
    while (true) {
        let random = Math.floor(Math.random() * 9000000) + 1000000;
        let card = await Card.findOne({ bizNumber: random });
        if (!card) return random;
    }
    };

    // 1. GET /cards - Get all cards (auth: all)[cite: 2]
    router.get('/', async (req, res) => {
    try {
        const cards = await Card.find();
        res.send(cards);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 2. GET /cards/my-cards - Get user cards (auth: registered user)[cite: 2]
    router.get('/my-cards', auth, async (req, res) => {
    try {
        const cards = await Card.find({ user_id: req.user._id });
        res.send(cards);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 3. GET /cards/:id - Get specific card (auth: all)[cite: 2]
    router.get('/:id', async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send('Card not found.');
        res.send(card);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 4. POST /cards - Create new card (auth: Business user)[cite: 2]
    router.post('/', auth, async (req, res) => {
    try {
        if (!req.user.isBusiness) return res.status(403).send('Only business users can create cards.');

        const { error } = cardSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let card = new Card({
        ...req.body,
        user_id: req.user._id,
        bizNumber: await generateBizNumber()
        });

        await card.save();
        res.status(201).send(card);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 5. PUT /cards/:id - Edit card (auth: User who created the card)[cite: 2]
    router.put('/:id', auth, async (req, res) => {
    try {
        const { error } = cardSchema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send('Card not found.');

        if (card.user_id.toString() !== req.user._id) {
        return res.status(403).send('You can only edit your own cards.');
        }

        card = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(card);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 6. PATCH /cards/:id - Like card (auth: registered user)[cite: 2]
    router.patch('/:id', auth, async (req, res) => {
    try {
        let card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send('Card not found.');

        const userIndex = card.likes.indexOf(req.user._id);
        if (userIndex === -1) {
        card.likes.push(req.user._id); // Add like
        } else {
        card.likes.splice(userIndex, 1); // Remove like
        }

        await card.save();
        res.send(card);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 7. DELETE /cards/:id - Delete card (auth: Creator or Admin)[cite: 2]
    router.delete('/:id', auth, async (req, res) => {
    try {
        let card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send('Card not found.');

        if (card.user_id.toString() !== req.user._id && !req.user.isAdmin) {
        return res.status(403).send('You can only delete your own cards unless you are an admin.');
        }

        await Card.findByIdAndDelete(req.params.id);
        res.send(card);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    module.exports = router;