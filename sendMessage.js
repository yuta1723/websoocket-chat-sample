var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

const TAG = '[SEND_MESSAGE]';

const VERSION = 2;

exports.default = async (event) => {
    console.log(TAG + ' event =' + JSON.stringify(event));

    var apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
    });

    var connectionId = event.requestContext.connectionId;
    var uniqueRoomId = JSON.parse(event.body).uniqueRoomId;
    console.log(TAG + ' connectionID = ' + connectionId + ' uniqueRoomId = ' + uniqueRoomId);


    // ルームにいるユーザーを取得
    var scanParam = {
        TableName : process.env.CONNECTION_TABLE,
        FilterExpression: 'uniqueRoomId = :roomId',
        ExpressionAttributeValues:{
            ':roomId': uniqueRoomId
        }
    };
    let connections = await docClient.scan(scanParam).promise();
    console.log(TAG + 'connections = '+ JSON.stringify(connections.Items));

    var pushData = {
        commandType: 'deliverMessage',
        message: JSON.parse(event.body).message
    };
    await Promise.all(connections.Items.map(async ({ connectionId }) => {
        try {
            var params = {
                Data: JSON.stringify(pushData),
                ConnectionId : connectionId

            };
            console.log('SEND MESSAGE params= ' + JSON.stringify(params));
            await apigwManagementApi.postToConnection(params).promise();
        } catch (e) {
            console.log('ERROR');
            if (e.statusCode === 410) {
                // await dynamodb.delete({ TableName: process.env.CONNECTIONS_TABLE, Key: { ConnectionId: ConnectionId }}).promise();
            } else {
                throw e;
            }
        }
    }));

    // レスポンス返さないとエラーになる。
    var response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};