var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

var docClient = new AWS.DynamoDB.DocumentClient();

const TAG = '[DISCONNECT]';

const VERSION = 2;

exports.disconnect = async (event) => {
    console.log(TAG + ' event =' + JSON.stringify(event));

    var connectionId = event.requestContext.connectionId;
    console.log(TAG + 'connectionId = ' + connectionId);
    var deleteParam = {
        TableName : process.env.CONNECTION_TABLE,
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
