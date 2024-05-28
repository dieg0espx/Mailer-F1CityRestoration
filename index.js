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


let data;

async function getContacts(){
    await fetch(apiURL + '/getContacts.php')
    .then(result => result.json())
    .then(result => data = result)
}


app.get('/image/:email', async (req, res) => {
    const email = req.params.email;
    const campaign = req.query.campaign;
  
    console.log(`Email ${email} at campaign ${campaign} has been opened.`);
    const currentTime = new Date();
    const timeVancouver = new Date(currentTime.getTime() - (7 * 60 * 60 * 1000));
    if (timeVancouver.getDate() !== currentTime.getDate()) {
        timeVancouver.setDate(timeVancouver.getDate() - 1);
    }
    try {
        const data = {
          email: email,
          timestamp: timeVancouver,
          campaign: campaign,
          action: 'delivered'
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
    await getContacts()
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'info@f1cityrestoration.com',
                pass: 'fzbkndwuhxuhvvnu'
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
                from: 'F1 CITY RESTORATION',
                to: data[i].email,
                subject: 'Lifeline for Homeowners: Assistance for Uninsured Homeowners Affected by Property Damage',
                template: 'propertyManagers1',
                context: { 
                    name: data[i].name,
                    lastName: data[i].lastName,
                    imgURL: `https://mailer-f1-city-restoration.vercel.app/image/${data[i].email}?campaign=PropertyManagers1`
                }
            };

            try {
                await transporter.sendMail(customerMailOptions);
                console.log(i + ' / ' + data.length + '-  Email sent to:', data[i].email);
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



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
