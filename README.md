# PruebaNodeJs

This is the result for examn JS Developer

Is a contact list app, each user can manage his own contact list, can add new contact, edit or delete existing contacts
can edit his user information, can restore his password

This project use

- Node Js
- Handlerbars for Views engine
- Bootstrap

## Project setup
```
npm install
```
## DB Setup

The db folder have a file 'contactlist.sql'
Must create a database with the name contactlist and import this file
in keys.js must be change the access to mysql

## Email Setup
```
For send email is necesary a sendgrid account and get an api key and setup in /routes/index.js on transporter definition of nodemailer edit this lines
    auth: {
      user: 'apikey', // generated sengrid user
      pass: '', // generated sengrid password
    },
```

### For Local test
```
npm run dev
```

### For Production
```
npm start
```

# Examn Responsive

The result for the second task is in the 'examn' folder