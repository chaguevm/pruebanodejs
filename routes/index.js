const express = require('express');
const router = express.Router();
const pool = require('../database');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const nodemailer = require('nodemailer');
const Pagination = require('../lib/pagination');

// create reusable transporter object using the sengrid SMTP transport
let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'apikey', // generated sengrid user
      pass: '', // generated sengrid password
    },
  });

//Home view, if the user is not logged redirect to login form
router.get('/', isLoggedIn, async (req, res) => {    
    
    // Get current page from url (request parameter)
    var page_id = parseInt(req.query.page) || 1;
    var currentPage = page_id > 0 ? page_id : currentPage;
    
    //Change pageUri to your page url without the 'page' query string 
    pageUri = '/';
    
    const total = await pool.query(`SELECT COUNT(id) as totalCount FROM contacts WHERE user_id = ${req.user.id}`);
    const perPage = 10;
    const totalCount = total[0].totalCount;
    const Paginate = new Pagination(totalCount,currentPage,pageUri,perPage);
    
    //Get all the contact for the user logged
    const query = `SELECT * FROM contacts WHERE user_id = ${req.user.id} LIMIT ${Paginate.perPage} OFFSET ${Paginate.offset}`;

    const contacts = await pool.query(query);
    
    const data = {
        contacts,
        pages: Paginate.links() 
    };
    
    res.render('home.hbs', data);
});

//Add contact view
router.get('/newcontact', isLoggedIn, (req, res) =>{
    res.render('newcontact.hbs');
});

//Add contact process
router.post('/newcontact', isLoggedIn, async (req, res) => {
    //Prepare the query for insertion
    const query = `INSERT INTO contacts (user_id, first_name, last_name, email, number)
        VALUES (${req.user.id}, '${req.body.first_name}', '${req.body.last_name}','${req.body.email}','${req.body.number}')`;
    
    //Try and catch for handle the error for duplicate entry 'email'
    try {
        //If no err exist, redirect to home view
        const newcontact = await pool.query(query);

        //Build mailOptions for send the notification email
        const mailOptions = {
            from: 'info@dardoseotec.com',
            to: req.body.email,
            subject: 'Contact List App',
            text: 'We added you in our contact list. Thank you.'
        };
        //Use the method sendMail with the mailOptions objet to send the email to the new contact
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        }); 

        //Message for success
        req.flash('success','Contact added')
        res.redirect('/');
    } catch (error) {
        //if error exist, with code 'ER_DUP_ENTRY' redirecto to newcontact view and send the error message
        if (error.code == 'ER_DUP_ENTRY') {
            req.flash('message', 'Email already Exist');
            res.redirect('/newcontact');
        }
    }  

});

//Edit contact view
router.get('/edit/:contactId', isLoggedIn, async (req, res) => {
    const { contactId } = req.params; //get the param send by url
    const query = `SELECT * FROM contacts WHERE id = ${contactId}`; //prepare the query
    const contact = await pool.query(query); //exec the query
    res.render('editcontact', {contact: contact[0]}); //render the view and send the contact information
});

//Edit contact process
router.post('/edit', isLoggedIn, async (req, res) => {
    const contactId  = req.body.id; //get the id send by the form
    //prepare the query for update
    const query = `UPDATE contacts SET
        first_name = '${req.body.first_name}',
        last_name = '${req.body.last_name}',
        email = '${req.body.email}',
        number = '${req.body.number}'
        WHERE id = ${contactId}
    `;
    //Try and catch for handle the error, if the user change the email and that email already exist, dont make the change and send the error message
    try {
        //if not error the user is edited and the success message is send and is redirect to home view
        const contact = await pool.query(query);
        req.flash('success','Contact edited');
        res.redirect('/');
    } catch (error) {
        //if exist an error and that error is 'ER_DUP_ENTRY' send the error message and return to the edit view
        if (error.code == 'ER_DUP_ENTRY') {
            req.flash('message', 'The Email can`t be change because is already in use');
            res.redirect('/edit/'+contactId);
        }
    }
});

//Delete a contact by id
router.get('/delete/:contactId', async (req, res) => {
    const {contactId} = req.params;
    const query = `DELETE FROM contacts WHERE id = ${contactId}`;
    const deleted = await pool.query(query);
    req.flash('success', 'Contact deleted')
    res.redirect('/');
})


//Search a contact
router.post('/search', isLoggedIn, async (req, res) => {
    const search = req.body.search;
    
    //Get all the contact with the search keyword
    const query = `SELECT * FROM contacts WHERE 
        first_name LIKE '%${search}%' OR 
        last_name LIKE '%${search}%' OR
        email LIKE '%${search}%' OR
        number LIKE '%${search}%'`;

    const contacts = await pool.query(query);
    
    const data = {
        contacts
    };
    
    res.render('home.hbs', data);
});

module.exports = router;