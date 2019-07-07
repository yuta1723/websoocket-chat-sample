var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

require('aws-sdk/client/apigatewaymanagementapi');

var DDB = new AWS.DynamoDB({ apiVersion : "2012-10-08"});


exports.connect = async (event) => {
    console.log('connect : ' + JSON.stringify(event));

    var putParams = {
      TableName : 'websocket-room-table',
      Item : {
        uniqueRoomId : 'aaa'
      }
    }

    DynamoDB.put(putParams, function(err, data){
      console.log("dynamo_err:", err);
    })

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

exports.disconnect = async (event) => {
    console.log('disconnect : ' + JSON.stringify(event));
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

exports.default = async (event) => {
    console.log('default : ' + JSON.stringify(event));
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
