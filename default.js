var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

const TAG = '[DEFAULT]';

const VERSION = 2;

exports.default = async (event) => {
    console.log(TAG + ' event =' + JSON.stringify(event));

    // レスポンス返さないとエラーになる。
    var response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};