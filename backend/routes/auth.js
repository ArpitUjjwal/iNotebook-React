const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = 'Arpitisagoodb$oy';

// Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [ 
    body('name', 'Enter a valid name').isLength({ min: 5 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Weak password, must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    // if there are errors, return bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // check whether the user with this email exists already
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "User with same email already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass= await bcrypt.hash(req.body.password, salt);
        // create new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })

        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        
        res.json({authtoken})

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occurred");
    }
})

module.exports = router