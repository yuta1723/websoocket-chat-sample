var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

// require('aws-sdk/client/apigatewaymanagementapi');

var DDB = new AWS.DynamoDB({ apiVersion : "2012-10-08"});
var docClient = new AWS.DynamoDB.DocumentClient();

const ROOM_TABLE_NAME = 'websocket-room-table';
const CONNECTION_ID_TABLE_NAME = 'websocket-connection-table';

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

    let getParams = {
        TableName : ROOM_TABLE_NAME,
        Key : {
            uniqueRoomId : uniqueRoomId
        }
    };

    let putParams = {
        TableName : ROOM_TABLE_NAME,
        Item: {
            uniqueRoomId : uniqueRoomId,
            roomId : roomId,
            businessId : businessId,
            subRoomId: subRoomId
        }
    };

    var roomData = await docClient.get(getParams).promise();

    console.log('roomData = ' + JSON.stringify(roomData, null, 2));
    if (isEmptyJson(roomData)) {
        console.log('EMPTY');
        var data = await docClient.put(putParams).promise();
        console.log('data = ' + JSON.stringify(data, null, 2));
    }


    var connectionId = event.requestContext.connectionId;
    var putConnectionTableData = {
        TableName : CONNECTION_ID_TABLE_NAME,
        Item: {
            roomId : uniqueRoomId,
            connectionId : connectionId
        }
    };

    var data2 = await docClient.put(putConnectionTableData).promise();


    // // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

function isEmptyJson(obj){
  return !Object.keys(obj).length;
}

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
