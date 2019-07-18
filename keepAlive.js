var AWS = require ('aws-sdk');
AWS.config.update({ region : process.env.AWS_REGION});

const TAG = '[KEEP_ALIVE]';

const VERSION = 3;

exports.default = async (event) => {

    // キープアライブは、デバッグ版のみAPI GW → Lambdaとのやり取りを許容する。
    // 本番環境には基本的には実装しない。

    console.log(TAG + ' event =' + JSON.stringify(event));

    var response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};