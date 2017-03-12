var httpsrequest = require('request-promise');

module.exports = function (RED) {

  function SmsTelstraNode(config) {
    RED.nodes.createNode(this, config);   
    var node = this;    
    this.on('input', function(msg) {
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
        //node.send(options2);
        httpsrequest(options2).then(function(body2) {});



      });
    });

  }
  
  RED.nodes.registerType("smstelstra", SmsTelstraNode);

};
