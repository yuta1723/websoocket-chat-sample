var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

const TAG = '[DEFAULT]';

const VERSION = 3;

exports.default = async (event) => {
    console.log(TAG + ' event =' + JSON.stringify(event));


    var connectionId = event.requestContext.connectionId;

    var apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
    });

    // event の body の内容次第で返却するメッセージを変える。
    // commandTypeが取得できたら、エラーメッセージを変更する。
    var pushData = {
        commandType: 'error',
        statusCode: '399999',
        message:'defaultラムダが発火されました。'
    };
    var params = {
        Data: JSON.stringify(pushData),
        ConnectionId : connectionId

    };
    console.log('SEND MESSAGE params= ' + JSON.stringify(params));
    await apigwManagementApi.postToConnection(params).promise();

    // レスポンス返さないとエラーになる。
    var response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};