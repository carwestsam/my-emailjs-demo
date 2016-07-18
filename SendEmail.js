// emailjs https://github.com/eleith/emailjs
// emailjs image https://github.com/eleith/emailjs/issues/16
// embed image https://github.com/eleith/emailjs/blob/master/test/message.js

var Emailjs = require('emailjs');
var prompt = require('prompt');

var schema = {
  properties: {
    password:{
      message: 'password',
      hidden: true,
      required: true
    }
  }
};

var message = Emailjs.message.create({
  subject: "[SO-TESTING] this is TEXT + HTML + IMAGE message from emailjs",
  text: "Image try four, inline true, alter true",
  from: "",
  to: "",
  attachment: [
    {
      path: '',
      type: 'text/html',
      alternative: true,
      related: [
        {
          path: '',
          type: 'image/png',
          name: 'my-profile-image.png',
          headers: {'Content-ID': '<my-profile-image>'},
          inline: true
        }
      ]
    }
  ]
});

var server = undefined;

new Promise((resolve, reject) => {
  prompt.start();
  prompt.get(schema, (err, result) =>{
    if (err) reject(err);
    else resolve(result.password);
  })
}).then((password) => {
  server = Emailjs.server.connect({
    user: "",
    password: password,
    host: "smtp.gmail.com",
    ssl: true
  });
  server.send(message, (err, message) => console.log(err || message));
});
