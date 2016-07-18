//imap  https://github.com/emailjs/emailjs-imap-client

var ImapClient = require('emailjs-imap-client');
var _ = require('underscore');
var MailParser = require('mailparser').MailParser;
var fs = require('fs');
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

var client = undefined;

var ClientPromise = new Promise((resolve, reject) => {
  prompt.start();
  //prompt.get(schema, (err, result) => {
  //  if (err) reject(err);
  //  else resolve(result.password);
  //})
  resolve("");
}).then((password) => {
   client = new ImapClient('imap.gmail.com', 993, {
    userSecureTransport: true,
    auth: {
      user: '',
      pass: password
    },
    enableCompression: true
  });

  client.onerror = function(err) {
    console.log(err);
  };
  return client.connect();
}).then(()=>{
  console.log('**** START ****');
  return client.listMailboxes();
}).then((boxes)=>{
  var names = _.pluck(boxes.children, 'name');
  console.log(names);
  if (_.contains(names, 'SO')) {
    return client.listMessages('SO', '3:3', ['uid', 'flags', 'body[]' ,'bodystructure'])
  }else {
    throw 'No INBOX Found';
  }
}).then((messages) => {
  var promiseScope = [];
  _.pluck(messages, 'body[]').forEach((msg) => {
    var mailParser = new MailParser();

    var promise = new Promise((resolve, reject) => {
      mailParser.on('end', mail => resolve(mail));
      mailParser.write(msg);
      mailParser.end();
    });
    promiseScope.push(promise);
  });

  return new Promise.all(promiseScope);
}).then((mails) => {
  var attach = mails[0].attachments[0];
  fs.writeFile(attach.fileName, attach.content, 'binary', function(err){
    if(err) throw err;
    console.log(attach.fileName, 'File saved');
  });
  console.log(mails);
}).then(()=>{
  return client.close();
});

