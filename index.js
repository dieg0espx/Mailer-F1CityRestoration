const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));



function generateRandomId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
}

const data = [
    {
        name: 'Diego',
        lastName: 'Espinosa',
        id: generateRandomId(),
        email: 'diego@f1cityrestoration.com'
    },
    // {
    //     name: 'Maria',
    //     lastName: 'Garcia',
    //     id: generateRandomId(),
    //     email: 'diego@f1cityrestoration.com'
    // },
    // {
    //     name: 'John',
    //     lastName: 'Doe',
    //     id: generateRandomId(),
    //     email: 'diego@f1cityrestoration.com'
    // },
    // {
    //     name: 'Emma',
    //     lastName: 'Johnson',
    //     id: generateRandomId(),
    //     email: 'diego@f1cityrestoration.com'
    // },
    // {
    //     name: 'Michael',
    //     lastName: 'Brown',
    //     id: generateRandomId(),
    //     email: 'diego@f1cityrestoration.com'
    // }
];


// Route to handle tracking requests
app.get('/track/:emailId', (req, res) => {
    const emailId = req.params.emailId;
    console.log(`Email with ID ${emailId} has been opened.`);
    // Respond with the tracking pixel (a transparent 1x1 gif)
    res.send('https://f1cityrestoration.com/wp-content/uploads/2024/04/Group-150.png');
});




app.post('/sendEmail', async (req, res) => {
    

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'diego@ttfscaffolding.com',
          pass: 'rxrrntgbzhqigqso' // Ensure this is secured
        }
      });
      const handlebarOptions = {
        viewEngine: {
          extName: ".handlebars",
          partialsDir: path.resolve('./views'),
          defaultLayout: false,
        },
        viewPath: path.resolve('./views'),
        extName: ".handlebars",
      };
      transporter.use('compile', hbs(handlebarOptions));
      
      

      for (let i = 0; i < data.length; i++) {
        const customerMailOptions = {
          from: 'TTF SCAFFOLDING',
          to:data[i].email,
          subject: 'Email Attempt ',
          template: 'inventoryNotification',
          context: {
            name: data[i].name, 
            lastName:data[i].lastName, 
            id:data[i].id, 
            imgURL: 'https://mailer-f1-city-restoration.vercel.app/track/' + data[i].id
          }
        };
  
        try {
          await transporter.sendMail(customerMailOptions);
          console.log('Email sent to: ' + data[i].email);
        } catch (error) {
          console.error('Error sending email to:', data[i].email, error);
        }
      }
  
      res.status(200).send('Emails sent successfully');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error sending emails');
    }

})









const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

