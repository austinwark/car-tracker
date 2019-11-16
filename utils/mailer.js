const nodemailer = require("nodemailer");
const express = require('express');
const Email = require('email-templates');

module.exports = function() {
    this.sendToMail = async function(results, userEmail) {
        let testAccount = await nodemailer.createTestAccount();
    
        let transporter = nodemailer.createTransport({
            host: 'smtp.googlemail.com',
            port: 465,
            secure: true,
            auth: {
                user: "austinwark96",
                pass: "lo4.gato123"
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

