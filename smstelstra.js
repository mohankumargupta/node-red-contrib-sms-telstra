var httpsrequest = require('request-promise');

module.exports = function (RED) {

  function SmsTelstraNode(config) {
    RED.nodes.createNode(this, config);   
    var node = this;    
    

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
      

      
      httpsrequest(options).then(function(body){                 
        
        var access_token = JSON.parse(body).access_token;
        var authorization = "Bearer " + access_token;
                       
        var options2 = {
          url: 'https://api.telstra.com/v1/sms/messages',
          method: 'POST',
          headers: {
            Authorization: authorization  
          },
          body: {
            to: config.mobile,
            body: config.message
          },
          json: true
        };
        options2.headers['Content-Type'] = 'application/json';
        httpsrequest(options2).then(function(body2) {
         node.status({});
         msg.payload = 'SmsTelstra:Success';
         node.send(msg);
        }).catch( function(reason){
         node.status({fill: 'red', shape: 'dot', text: " "});
         setTimeout(function() {
         node.status({});
       }, 3000);
         node.error(reason);
       });



      }).catch(function(reason) {
       node.status({fill: 'red', shape: 'dot', text: " "});
       setTimeout(function() {
        node.status({}); 
       }, 3000);
       node.error(reason);
      });
    });

  }
  
  RED.nodes.registerType("smstelstra", SmsTelstraNode);

};
