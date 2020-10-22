const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const helpers = require('../lib/helpers');

router.get('/signup' ,  isNotLoggedIn, (req, res) =>{
    res.render('auth/signup');
});

router.post('/signup' , isNotLoggedIn, passport.authenticate('local.signup',{
    successRedirect: '/',
    failureRedirect: '/signup'
}));

router.get('/login' , isNotLoggedIn, (req, res) => {
    res.render('auth/login');
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.login',{
        successRedirect: '/',
        failureRedirect: '/login'
    })(req, res, next);
});

router.get('/logout', isLoggedIn,(req, res) => {
    req.logOut();
    res.redirect('/login');
});

router.get('/forgotpassword', isNotLoggedIn, async (req, res) => {
    res.render('auth/forgotpassword', {step: true});
});

router.post('/forgotpassword', async (req, res) =>{
    const query = `SELECT * FROM users WHERE 
        username = '${req.body.username}' AND
        fullname = '${req.body.fullname}' `;

    const user = await pool.query(query);
    
    if(user.length == 0){
        //The user dont exist
        req.flash('message','The user dont exist');
        res.redirect('/forgotpassword');
    }else{
        //The user exist
        req.flash('success', 'Set the new password');
        //res.send({step: false});
        res.render('auth/forgotpassword', {step: false, success: req.flash('success'), user: user[0].id});
    } 
});

router.post('/newpassword', async (req, res) => {
    const newpass = await helpers.encryptPassword(req.body.password1);
    const query = `UPDATE users SET
        password = '${newpass}'
        WHERE id = ${req.body.id}
    `;
    const newUser = await pool.query(query);
    req.flash('success', 'The password had been changed');
    res.render('auth/login', {success: req.flash('success')});
});

module.exports = router; 