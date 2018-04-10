var httpsrequest = require('request-promise');
var errors = require('request-promise/errors');

module.exports = function (RED) {

  function SmsTelstraNode(config) {
    RED.nodes.createNode(this, config);   
    var node = this;    
    var messagepayload = "";

    this.on('input', function(msg) {
      node.status({fill: 'green', shape: 'dot', text: " "});      
      var options = {
        url: 'https://api.telstra.com/v1/oauth/token',
        method: 'POST',
        form: {
         client_id: config.consumerkey, 
         client_secret: config.consumersecret,
         grant_type: 'client_credentials',
         scope: 'SMS'
        }
      };
      

      var msgpayload = msg.payload;

      httpsrequest(options).then(function(body){                 
        
        var access_token = JSON.parse(body).access_token;
        var authorization = "Bearer " + access_token;

        var message = config.message.trim();
        if (msgpayload !== "") {
           message = msgpayload;
        }          
          
        var mobilenumbers = config.mobile.replace(/\s+/g, '').split(",");             
 
        mobilenumbers.forEach(function(mobile) {
          setTimeout(function() {
            sendSMS(mobile,message, authorization, node, msg);
          },5000);
        });



        setTimeout(function() {
          node.status({});
          msg.payload = "SMSTelstra: Success";
          node.send(msg);
        }, 5000);
      }).catch(errors.StatusCodeError, function(reason) {
       node.status({fill: 'red', shape: 'dot', text: " "});
       setTimeout(function() {
        node.status({}); 
       }, 3000);
       node.error(reason);
      }).catch(errors.RequestError, function(reason){
         node.status({fill: 'red', shape: 'dot', text: " "});
         setTimeout(function() {
         node.status({});
       }, 3000);
         node.error(reason);

        });
     
   });
  }   

  function sendSMS(mobilenumber, message, authorization, node, msg) {
       node.status({fill: 'green', shape: 'dot', text: " "});
       var options2 = {
          url: 'https://api.telstra.com/v1/sms/messages',
          method: 'POST',
          headers: {
            Authorization: authorization  
          },
          body: {
            to: mobilenumber,
            body: message
          },
          json: true
        };
        options2.headers['Content-Type'] = 'application/json';
        httpsrequest(options2).then(function(body2) {
         
        
        }).catch( errors.StatusCodeError, function(reason){
         node.status({fill: 'red', shape: 'dot', text: " "});
         setTimeout(function() {
         node.status({});
         }, 3000);
         node.error(reason);
       }).catch( errors.RequestError, function(reason){
         node.status({fill: 'red', shape: 'dot', text: " "});
         setTimeout(function() {
         node.status({});
       }, 3000);
         node.error(reason);
       });
  }

  RED.nodes.registerType("smstelstra", SmsTelstraNode);

};

