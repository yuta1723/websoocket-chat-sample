var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

const CONNECTION_ID_TABLE_NAME = 'websocket-connection-table';

const TAG = '[DISCONNECT]';

exports.disconnect = async (event) => {
    console.log(TAG + ' event =' + JSON.stringify(event));

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

//メモ
// DynamoDBは、PK,SKを指定したDBの場合、更新、削除を行う際はPK,SK両方必要。
