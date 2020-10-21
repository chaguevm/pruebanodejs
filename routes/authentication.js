const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

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

module.exports = router; 