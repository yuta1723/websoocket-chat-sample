var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

// const ROOM_TABLE_NAME = 'websocket-room-table';
// const CONNECTION_ID_TABLE_NAME = 'websocket-connection-table';

const TAG = '[CONNECT]';
const DELIMITER_UNIQUE_ROOM_ID = '#_#';

const roomExpiredTime = 43200000; // 12 hour

// TODO RENAME
const ROOM_STATE_BEFORE_START = 0; // チャット開始前
const ROOM_STATE_OPEN = 1; // チャット中
const ROOM_STATE_END = 2; // ルーム削除待ち

exports.connect = async (event) => {
    console.log(TAG + ' event =' + JSON.stringify(event));

    if (event.queryStringParameters === undefined || event.queryStringParameters.roomId === undefined ) {
        console.error("RoomId is empty");
        return { statusCode: 400, body: JSON.stringify('Bad Request')};
    }

    if (event.queryStringParameters === undefined || event.queryStringParameters.accountId === undefined ) {
        console.error("accountId is empty");
        return { statusCode: 400, body: JSON.stringify('Bad Request')};
    }

    let roomId = event.queryStringParameters.roomId;
    let accountId = event.queryStringParameters.accountId;
    let subRoomId = '0';

    console.log('roomId = ' + roomId + 'accountId = ' + accountId);

    let uniqueRoomId = accountId + DELIMITER_UNIQUE_ROOM_ID + roomId + DELIMITER_UNIQUE_ROOM_ID + subRoomId;

    // ルームが存在するかのチェック
    let getParams = {
        TableName : process.env.ROOM_TABLE, // lambdaに指定した環境変数が実行される
        Key : {
            uniqueRoomId : uniqueRoomId
        }
    };
    var roomData = await docClient.get(getParams).promise();

    const requestTimeMs = event.requestContext.requestTimeEpock;

    // ルームテーブルにルーム追加
    let putParams = {
        TableName : process.env.ROOM_TABLE,
        Item: {
            uniqueRoomId : uniqueRoomId,
            roomId : roomId,
            accountId : accountId,
            subRoomId: subRoomId,
            roomStartTime:requestTimeMs,
            roomExpiredTime:roomExpiredTime,
            roomState:ROOM_STATE_OPEN
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
        TableName : process.env.CONNECTION_TABLE,
        Item: {
            uniqueRoomId : uniqueRoomId,
            connectionId : connectionId
        }
    };

    await docClient.put(putConnectionTableData).promise();

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
