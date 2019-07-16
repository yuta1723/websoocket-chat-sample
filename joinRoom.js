var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

const TAG = '[JOIN_ROOM]';


// カスタムルートが全然発火されなかったため一旦defaultに実装。
// → API GW側でデプロイを行ってないからでした。
exports.joinRoom = async function (event) {
    var connectionId = event.requestContext.connectionId;
    console.log('joinRoom : connectionID = ' + connectionId);

    // ルームが存在するかのチェック
    let getParams = {
        TableName : process.env.CONNECTION_TABLE,
        Key : {
            connectionId : connectionId
        }
    };
    var connectionData = await docClient.get(getParams).promise();
    console.log(TAG + 'connectionData = ' + JSON.stringify(connectionData));

    if (isEmptyJson(connectionData)) {
        // エラー処理を行う。
    }
    console.log('connectionData = ' + JSON.stringify(connectionData, null, 2));

    var uniqueRoomId = connectionData.Item.uniqueRoomId;

    var pushData = {
        commandType: 'readyChat',
        uniqueRoomId: uniqueRoomId
    };

    var apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
    });

    // 接続元にuniqueRoomIdを返却
    apigwManagementApi.endpoint = event.requestContext.domainName + '/' + event.requestContext.stage;

    var postParams = {
        Data: JSON.stringify(pushData),
        ConnectionId : connectionId
    };
    console.log(TAG + 'postParams = ' + JSON.stringify(postParams));
    try {

        //callbackFuncを指定すると、postToConnectionが二回実行されてしまう。
        // promise()と実装がかぶるから？
        await apigwManagementApi.postToConnection(postParams).promise();
    } catch (e) {
        console.log(TAG + 'POST MESSAGE error : ' + e);
        if (e.statusCode === 410) {
            // await docClient.delete({ TableName: CONNECTION_ID_TABLE_NAME, Key: { connectionId: connectionId }}).promise();
        } else {
            throw e;
        }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

function isEmptyJson(obj){
    return !Object.keys(obj).length;
};


//メモ
// DynamoDBは、PK,SKを指定したDBの場合、更新、削除を行う際はPK,SK両方必要。