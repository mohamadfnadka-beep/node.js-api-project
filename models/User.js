const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
name: {
    first: { type: String, required: true },
    middle: { type: String, default: "" },
    last: { type: String, required: true }
},
isBusiness: { type: Boolean, required: true },
phone: { type: String, required: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
address: {
    state: { type: String, default: "not defined" },
    country: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    houseNumber: { type: Number, required: true },
    zip: { type: Number, default: 0 }
},
image: {
    url: { type: String, default: "" },
    alt: { type: String, default: "" }
},
isAdmin: { type: Boolean, default: false },
createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);