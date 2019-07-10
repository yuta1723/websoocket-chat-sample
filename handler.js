var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

// require('aws-sdk/client/apigatewaymanagementapi');

var DDB = new AWS.DynamoDB({ apiVersion : "2012-10-08"});
var docClient = new AWS.DynamoDB.DocumentClient();

const ROOM_TABLE_NAME = 'websocket-room-table';
const CONNECTION_ID_TABLE_NAME = 'websocket-connection-table';


exports.connect = async (event) => {
    console.log('connect : ' + JSON.stringify(event));

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

exports.startRequest = async (event, context) => {

    let roomId = event.roomId;
    let accountId = event.accountId;
    let subRoomId = '0';

    console.log('roomId = ' + roomId + 'accountId = ' + accountId);

    let uniqueRoomId = accountId + '_' + roomId + '_' + subRoomId;

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
            businessId : accountId,
            subRoomId: subRoomId
        }
    };

    var roomData = await docClient.get(getParams).promise();

    // Room テーブルにルームがすでに追加されているかを確認。
    console.log('roomData = ' + JSON.stringify(roomData, null, 2));
    if (isEmptyJson(roomData)) {
        console.log('EMPTY');
        // 追加されてなかったら追加
        var data = await docClient.put(putParams).promise();
        console.log('data = ' + JSON.stringify(data, null, 2));
    }

    let connectionId = event.requestContext.connectionId;
    console.log('connectionId = ' + connectionId);

    // Connection テーブルにConnectionを追加。
    let connectionParam = {
        TableName : CONNECTION_ID_TABLE_NAME,
        Item:{
          connectionId : connectionId,
          uniqueRoomId : uniqueRoomId
        }
    };

    var connectionData = await docClient.put(connectionParam);
    console.log('connectionData = ' + JSON.stringify(connectionData, null, 2));
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
