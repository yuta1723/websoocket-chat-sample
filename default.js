var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

const TAG = '[DEFAULT]';

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
        FilterExpression: 'roomId = :roomId',
        ExpressionAttributeValues:{
            ':roomId': uniqueRoomId
        }
    };
    var connections = [];
    await docClient.scan(scanParam,function (err, data) {
        if (err) {
            console.error(TAG + "Failed to SCAN " + process.env.CONNECTION_TABLE,
                JSON.stringify(err, null, 2));
        } else {
            console.log(TAG + "Successed to SCAN " + process.env.CONNECTION_TABLE);
            data.Items.forEach(function(item) {
                // console.log(" - roomId = ", item.roomId + ": connectionId =" + item.connectionId);
                connections.push(item.connectionId);
            });
        }
    }).promise();


    // console.log('connections = ' + JSON.stringify(connections));

    connections.forEach(function sendMessage(cid) {
        // console.log('connectionId = ' + cid);
        var pushData = {
            commandType: 'deliverMessage',
            message: JSON.parse(event.body).message
        };
        var postParams = {
            Data: JSON.stringify(pushData),
            ConnectionId : cid
        };
        console.log('default : postParams = ' + JSON.stringify(postParams));

        apigwManagementApi.postToConnection(postParams,function (err, data) {
            if (err) {
                console.error(TAG + "Unable to Send Message. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log(TAG + "sendMessage succeeded:", JSON.stringify(data, null, 2));
            }
        }).promise();
    });

    // 接続先にのみメッセージを返却
    // var pushData = {};
    // pushData['commandType'] = 'deliverMessage';
    // pushData['message'] = JSON.parse(event.body).message;
    // console.log('default : postParams = ' + JSON.stringify(pushData));

    // var postParams = {
    //     Data: JSON.stringify(pushData),
    //     ConnectionId : connectionId
    // };
    // postParams.ConnectionId = connectionId;
    // apigwManagementApi.postToConnection(postParams,function (err, data) {
    //   if (err) {
    //     console.error("Unable to Send Message. Error JSON:", JSON.stringify(err, null, 2));
    //   } else {
    //     console.log("sendMessage succeeded:", JSON.stringify(data, null, 2));
    //   }
    // }).promise();

    // const response = {
    //       statusCode: 200,s
    //       body: JSON.stringify('Hello from Lambda!'),
    // };
    // return response;

};

function isEmptyJson(obj){
    return !Object.keys(obj).length;
}


//メモ
// DynamoDBは、PK,SKを指定したDBの場合、更新、削除を行う際はPK,SK両方必要。