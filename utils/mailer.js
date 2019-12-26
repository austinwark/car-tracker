const nodemailer = require("nodemailer");
const Email = require('email-templates');

/* Utility function used to send query results to user via email */
module.exports = function() {

    this.sendToMail = async function(results, userEmail) {
        
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: "trackerappr@gmail.com",
              pass: "g.gaw.DEV96m"
            }
        });
    
        const email = new Email({
            transport: transporter,
            send: true,
            preview: false
        });

        email.send({
            template: 'test',
            message: {
                from: 'Car Tracker <no-reply@car-tracker.com',
                to: userEmail
            },
            locals: {
                results: results
            }
        })

        return { success: true}
     }
}

