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

// async function getContacts(){
//     await fetch(apiURL + '/getBrokers.php')
//     .then(result => result.json())
//     .then(result => data = result)
// }


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
    // await getContacts()
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

        const DELAY_BETWEEN_BATCHES = 60000; // 1 minute in milliseconds
        const BATCH_SIZE = 10;

        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            for (let j = 0; j < batch.length; j++) {
                const customerMailOptions = {
                    from: 'info@f1cityrestoration.com',
                    to: batch[j].email,
                    subject: 'Collaborative Opportunity: Enhancing Service Offerings with F1 City Restoration',
                    template: 'brokers1',
                    context: { 
                        // name: batch[j].name,
                        // lastName: batch[j].lastName,
                        // company: batch[j].company,
                        imgURL: `https://mailer-f1-city-restoration.vercel.app/image/${batch[j].email}?campaign=Brokers1`
                    }
                };
                try {
                    await transporter.sendMail(customerMailOptions);
                    console.log(i + j + ' / ' + data.length + '-  Email sent to:', batch[j].email);
                } catch (error) {
                    console.error('Error sending email to:', batch[j].email, error);
                }
            }
            // Pause for 1 minute after sending each batch
            if (i + BATCH_SIZE < data.length) {
                console.log('Pausing for 1 minute...');
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }

        res.status(200).send('Emails sent successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error sending emails');
    }
});


app.post('/sendTest', async (req, res) => {
    // await getContacts()
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
        const customerMailOptions = {
            from: 'info@f1cityrestoration.com',
            to: ['diego@f1cityrestoration.com', 'vanja@f1cityrestoration.com'], 
            // to: 'diego@f1cityrestoration.com',
            subject: 'ADVICI -  The Ultimate Property Damage Navigator app',
            template: 'adviciIntroduction',
            context: { 
                name: 'Diego',
                lastName: 'Espinosa',
                company: "Company Name", 
                imgURL: `https://mailer-f1-city-restoration.vercel.app/image/diego@f1cityrestoration.com?campaign=GoogleContacts`, 
            }
        };
        try {
            await transporter.sendMail(customerMailOptions);
            res.status(200).send('TEST EMAIL SENT ');
        } catch (error) {
            console.error('ERROR SENDIN MAIL: ', error);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error sending emails');
    }
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
