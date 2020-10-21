const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/', isLoggedIn, async (req, res) => {
    const query = `SELECT * FROM contacts WHERE user_id = ${req.user.id}`;
    const contacts = await pool.query(query);
    res.render('home.hbs', {contacts});
});

router.get('/newcontact', isLoggedIn, (req, res) =>{
    res.render('newcontact.hbs');
});

router.post('/newcontact', isLoggedIn, async (req, res) => {
    const query = `INSERT INTO contacts (user_id, first_name, last_name, email, number)
        VALUES (${req.user.id}, '${req.body.first_name}', '${req.body.last_name}','${req.body.email}','${req.body.number}')`;
    const newcontact = await pool.query(query);
    req.flash('success','Contact added')
    res.redirect('/');
})
module.exports = router;