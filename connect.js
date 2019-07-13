var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

const ROOM_TABLE_NAME = 'websocket-room-table';
const CONNECTION_ID_TABLE_NAME = 'websocket-connection-table';

const TAG = '[CONNECT]';

var apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29"
});

var callBackFunc = function(err, data) {
    if (err) {
        console.error(TAG + "Unable to Send Message. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log(TAG + "sendMessage succeeded:", JSON.stringify(data, null, 2));
    }
}

exports.connect = async (event) => {
    console.log(TAG + ' event =' + JSON.stringify(event));

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

    // ルームが存在するかのチェック
    let getParams = {
        TableName : ROOM_TABLE_NAME,
        Key : {
            uniqueRoomId : uniqueRoomId
        }
    };
    var roomData = await docClient.get(getParams).promise();

    // ルームテーブルにルーム追加
    let putParams = {
        TableName : ROOM_TABLE_NAME,
        Item: {
            uniqueRoomId : uniqueRoomId,
            roomId : roomId,
            businessId : businessId,
            subRoomId: subRoomId
        }
    };
    console.log('roomData = ' + JSON.stringify(roomData, null, 2));
    if (isEmptyJson(roomData)) {
        console.log('EMPTY');
        var data = await docClient.put(putParams).promise();
        console.log('data = ' + JSON.stringify(data, null, 2));
    }

    // コネクションテーブルにconnectionID追加
    var connectionId = event.requestContext.connectionId;
    var putConnectionTableData = {
        TableName : CONNECTION_ID_TABLE_NAME,
        Item: {
            roomId : uniqueRoomId,
            connectionId : connectionId
        }
    };
    var data2 = await docClient.put(putConnectionTableData).promise();

    // var pushData = {};
    // pushData['commandType'] = 'readyChat';
    // pushData['uniqueRoomId'] = uniqueRoomId;
    //
    // // 接続元にuniqueRoomIdを返却
    // apigwManagementApi.endpoint = event.requestContext.domainName + '/' + event.requestContext.stage;
    //
    // var postParams = {
    //     Data: JSON.stringify(pushData),
    //     ConnectionId : connectionId
    // };
    // console.log(TAG + 'postParams = ' + JSON.stringify(postParams));
    // try {
    //     await apigwManagementApi.postToConnection(postParams,callBackFunc).promise();
    // } catch (e) {
    //     console.log(TAG + 'POST MESSAGE error : ' + e);
    //     if (e.statusCode === 410) {
    //         // await docClient.delete({ TableName: CONNECTION_ID_TABLE_NAME, Key: { connectionId: connectionId }}).promise();
    //     } else {
    //         throw e;
    //     }
    // }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

function isEmptyJson(obj){
    return !Object.keys(obj).length;
}


//メモ
// DynamoDBは、PK,SKを指定したDBの場合、更新、削除を行う際はPK,SK両方必要。
