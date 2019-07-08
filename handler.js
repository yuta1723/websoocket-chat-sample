var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

// require('aws-sdk/client/apigatewaymanagementapi');

var DDB = new AWS.DynamoDB({ apiVersion : "2012-10-08"});
var docClient = new AWS.DynamoDB.DocumentClient();


exports.connect = async (event) => {
    console.log('connect : ' + JSON.stringify(event));

    if (event.queryStringParameters === undefined || event.queryStringParameters.roomId === undefined ) {
        console.error("RoomId is empty");
        return { statusCode: 400, body: JSON.stringify('Bad Request')};
    }

    if (event.queryStringParameters === undefined || event.queryStringParameters.businessId === undefined ) {
        console.error("businessId is empty");
        return { statusCode: 400, body: JSON.stringify('Bad Request')};
    }

    let roomId = event.queryStringParameters.roomId;
    let businessId = event.queryStringParameters.businessId;
    let subRoomId = '0';

    console.log('roomId = ' + roomId + 'businessId = ' + businessId);

    let uniqueRoomId = businessId + '_' + roomId + '_' + subRoomId;
    let params = {
        TableName : 'websocket-room-table',
        Item: {
          uniqueRoomId : uniqueRoomId,
          roomId : roomId,
          businessId : businessId,
          subRoomId: subRoomId
        }
    };


    docClient.put(params,function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });

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
