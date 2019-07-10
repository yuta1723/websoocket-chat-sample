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

    var connectionId = event.requestContext.connectionId;
    console.log('connectionId = ' + connectionId);
    var deleteParam = {
        TableName : CONNECTION_ID_TABLE_NAME,
        Key : {
            connectionId : connectionId
        }
    };

    await docClient.delete(deleteParam).promise();

    // await docClient.delete(deleteParam, function(err, data) {
    //   if (err) {
    //     console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    //   } else {
    //     console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    //   }
    // }).promise();

    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

// 07/1
// sendMessage アクションを受け取れないため、一旦defaultに実装する。
exports.default = async (event) => {
    console.log('default : ' + JSON.stringify(event));

    var apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
    });

    var connectionId = event.requestContext.connectionId;
    console.log('connectionID = ' + connectionId);

    var postParams = {
        Data: JSON.parse(event.body).data
    };

    postParams.ConnectionId = connectionId;
    apigwManagementApi.postToConnection(postParams).promise();

    // const response = {
    //       statusCode: 200,
    //       body: JSON.stringify('Hello from Lambda!'),
    // };
    // return response;



};

exports.sendMessage = async (event) => {
    console.log('sendMessage : ' + JSON.stringify(event));

    let uniqueRoomId = event.uniqueRoomId;
    console.log('uniqueRoomId = ' + uniqueRoomId);

    var scanParams = {
        TableName : CONNECTION_ID_TABLE_NAME,
        FilterExpression: 'RoomId = :roomid',
    };

    // var connection = docClient.scan({
    //
    // })

};

//メモ
// DynamoDBは、PK,SKを指定したDBの場合、更新、削除を行う際はPK,SK両方必要。
