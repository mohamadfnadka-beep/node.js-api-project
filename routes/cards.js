    const express = require('express');
    const router = express.Router();
    const Card = require('../models/Card');
    const auth = require('../middleware/auth');
    const { z } = require('zod');


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

    // Helper function to generate a unique bizNumber
    const generateBizNumber = async () => {
    while (true) {
        let random = Math.floor(Math.random() * 9000000) + 1000000;
        let card = await Card.findOne({ bizNumber: random });
        if (!card) return random;
    }
    };

    // 1. GET /cards - Get all cards
    router.get('/', async (req, res) => {
    try {
        const cards = await Card.find();
        res.send(cards);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 2. GET /cards/my-cards - Get user cards
    router.get('/my-cards', auth, async (req, res) => {
    try {
        const cards = await Card.find({ user_id: req.user._id });
        res.send(cards);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 3. GET /cards/:id - Get specific card
    router.get('/:id', async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) return res.status(404).send('Card not found.');
        res.send(card);
    } catch (err) {
        res.status(500).send('Server Error');
    }
    });

    // 4. POST /cards - Create new card
    router.post('/', auth, async (req, res) => {
    try {
        if (!req.user.isBusiness) return res.status(403).send('Only business users can create cards.');

    const validation = cardSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).send(validation.error.errors[0].message);

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

    // 5. PUT /cards/:id - Edit card 
    router.put('/:id', auth, async (req, res) => {
        try {
    const validation = cardSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).send(validation.error.errors[0].message);

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

    // 6. PATCH /cards/:id - Like card
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

    // 7. DELETE /cards/:id -
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