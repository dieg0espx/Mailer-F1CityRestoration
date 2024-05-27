const express = require('express');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const apiURL = 'https://api.f1cityrestoration.com'

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
    }
];

app.get('/image/:email', (req, res) => {
    const email = req.params.email;
    const campaign = req.query.campaign;
  
    console.log(`Email ${email} at campaign ${campaign} has been opened.`);

    try {
        const data = {
          email: email,
          timestamp: new Date(),
          campaign: campaign,
          action: 'opened'
        };
    
        fetch(apiURL + '/emailOpened.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ data: data })
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
                    id: data[i].id,
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



app.get('/newOpened', async (req, res) => {
    try {
      const data = {
        email: 'example@example.com',
        timestamp: '2024-05-30T12:00:00Z',
        campaign: 'sample_campaign',
        action: 'opened'
      };
  
      const response = await fetch(apiURL + '/emailOpened.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ data: data })
      });
  
      const jsonResponse = await response.json();
      console.log(jsonResponse);
  
      res.status(200).json({ status: 200, message: 'Successfully called the external endpoint' });
    } catch (error) {
      console.error('Error calling external API:', error);
      res.status(500).json({ status: 500, error: 'Failed to call the external endpoint' });
    }
  });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
