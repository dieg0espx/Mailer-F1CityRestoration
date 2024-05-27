const express = require('express');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const moment = require('moment-timezone');


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const apiURL = 'https://api.f1cityrestoration.com'


const data = [
    {
        name: 'Diego',
        lastName: 'Espinosa',
        email: 'diego@f1cityrestoration.com'
    }
];

app.get('/image/:email', async (req, res) => {
    const email = req.params.email;
    const campaign = req.query.campaign;
  
    console.log(`Email ${email} at campaign ${campaign} has been opened.`);

    try {
        const data = {
          email: email,
          timestamp: moment().tz('America/Vancouver'),
          campaign: campaign,
          action: 'opened'
        };
    
        await axios.post(apiURL + '/emailOpened.php', { data: data }, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
      
    
    } catch (error) {
        console.error('Error calling external API:', error);
        res.status(500).json({ status: 500, error: 'Failed to call the external endpoint' });
    }




    res.sendFile(path.join(__dirname, 'images/pixel.png'));
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
                extName: '.handlebars',
                partialsDir: path.resolve('./views'),
                defaultLayout: false,
            },
            viewPath: path.resolve('./views'),
            extName: '.handlebars',
        };
        transporter.use('compile', hbs(handlebarOptions));

        for (let i = 0; i < data.length; i++) {
            const customerMailOptions = {
                from: 'TTF SCAFFOLDING',
                to: data[i].email,
                subject: 'Email Attempt',
                template: 'inventoryNotification',
                context: { 
                    name: data[i].name,
                    lastName: data[i].lastName,
                    imgURL: `https://mailer-f1-city-restoration.vercel.app/image/${data[i].email}?campaign=Campaign1`
                }
            };

            try {
                await transporter.sendMail(customerMailOptions);
                console.log('Email sent to:', data[i].email);
            } catch (error) {
                console.error('Error sending email to:', data[i].email, error);
            }
        }

        res.status(200).send('Emails sent successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error sending emails');
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
