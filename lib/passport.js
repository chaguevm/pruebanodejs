const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const rows = await pool.query(query);
    if(rows.length > 0){
        let user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.password);
        if(validPassword){
            delete user.password;
            done(null, user, req.flash('success','Welcome '+username));
        }else{
            done(null, false, req.flash('message','Invalid Password'));
        }
    }else{
       return done(null, false,req.flash('message','Username does not exist'));
    }
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const { fullname } = req.body;
    const newUser = {
        username,
        password,
        fullname
    };
    newUser.password = await helpers.encryptPassword(password);

    const userexist = await pool.query(`SELECT * FROM users WHERE username = '${username}'`);

    //Si el usuario ya existe, retorna false
    if(userexist.length){
        return done(null, false, req.flash('message','User already Exist'));
    }
    else{
        //si el usuario no existe, se procede a registrarlo
        const result = await pool.query('INSERT INTO users SET ? ', [newUser]);
        newUser.id = result.insertId;
        return done(null, newUser,req.flash('success','User created successfully'));
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const query = `SELECT * FROM users WHERE id = ${id}`;
    const rows = await pool.query(query);
    let user = rows[0];
    delete user.password;
    done(null, user);
});