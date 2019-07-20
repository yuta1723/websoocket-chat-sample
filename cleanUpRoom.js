var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

const TAG = '[CREANUP_ROOM]';

const VERSION = 3;

exports.default = async function (event) {
    // var connectionId = event.requestContext.connectionId;
    // console.log(TAG + 'connectionID = ' + connectionId);

    // 1. 全ルームの取得
    // 2. unixTimeの取得
    // 3.それぞれのRoomごとに 有効期限の判定
    // 4. 有効期限が過ぎているRoomに現在存在しているconnectionId一覧取得
    // 5. 終了イベント送信
    // 6. connectionId削除
    // 7. roomテーブルからroom削除

    var pushData = {
        commandType: 'closeChat'
    };

    var apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: process.env.API_GATEWAY_ENDPOINT_URL
    });


    // 1. 全ルームの取得
    const params = {
        TableName : process.env.ROOM_TABLE,
    };
    const rooms = await docClient.scan(params).promise();
    console.log(TAG + 'Rooms = '+ JSON.stringify(rooms.Items));

    // 2. unixTimeの取得
    const time = Date.now();
    await Promise.all(rooms.Items.map(async (room) => {
        console.log(TAG + 'room = '+ JSON.stringify(room));
        let roomExistedTime = room.roomStartTime + room.roomExpiredTime;
        console.log(TAG + 'time=' + time + 'expiredTime=' + roomExistedTime);
        // 3.それぞれのRoomごとに 有効期限の判定
        if (roomExistedTime > time) {
            console.log(TAG + 'Not Expired');
            return;
        }

        // 4. 有効期限が過ぎているRoomに現在存在しているconnectionId一覧取得
        let uniqueRoomId = room.uniqueRoomId;

        let scanParam = {
            TableName : process.env.CONNECTION_TABLE,
            FilterExpression: 'uniqueRoomId = :roomId',
            ExpressionAttributeValues:{
                ':roomId': uniqueRoomId
            }
        };
        let connections = await docClient.scan(scanParam).promise();
        console.log(TAG + 'uniqueRoomId= ' + uniqueRoomId + 'connections = ' + JSON.stringify(connections.Items));

        // 5. 終了イベント送信
        await Promise.all(connections.Items.map(async ({ connectionId }) => {
            let params = {
                Data: JSON.stringify(pushData),
                ConnectionId : connectionId
            };
            try {
                console.log('SEND MESSAGE params= ' + JSON.stringify(params));
                await apigwManagementApi.postToConnection(params).promise();
            } catch (e) {
                console.log(TAG + 'error');
            }
        }));

        // 6. connectionId削除
    }));


    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};