const express = require ('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const { database } = require('./keys');
const passport = require('passport');

//Init
const app = express();
require('./lib/passport');

//Handlebars helpers for increment in 1 the index for {{#each}} method
Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

//Config
app.set('port', process.env.PORT || 3000); //Port definition
app.set('views',path.join(__dirname, 'views')); //Set the view route

//Config template engine
app.engine('.hbs',exphbs({
    defaultLayout: 'main', //main file
    layoutsDir: path.join(app.get('views'), 'layaouts'), //path for layaouts
    partialsDir: path.join(app.get('views'), 'partials'), //path for partials
    extname: '.hbs', //extension
})); 
app.set('view engine', '.hbs');

//Middleware
app.use(session({
    secret: 'contactlistapp',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));

app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Globals
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
});

//routes
app.use(require('./routes/'));
app.use(require('./routes/authentication'));

//Public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log('Server On Port: '+app.get('port'));
});

