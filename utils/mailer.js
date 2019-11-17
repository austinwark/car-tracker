const nodemailer = require("nodemailer");
const express = require('express');
const Email = require('email-templates');

module.exports = function() {
    this.sendToMail = async function(results, userEmail) {
        let testAccount = await nodemailer.createTestAccount();
    
        // let transporter = nodemailer.createTransport({
        //     host: 'smtp.googlemail.com',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //         user: "austinwark96",
        //         pass: "lo4.gato123"
        //     }
        // });

        let transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "ace0e744e5363e",
              pass: "42b900f066ab1e"
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

