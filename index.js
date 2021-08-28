const AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-2",
});

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "hiringcoders-2021-24-corebiz";
const baseUrl = "https://i6328uam31.execute-api.us-east-2.amazonaws.com/prod";
const leadsPath = "/leads";
const clientsPath = "/clients";
const prospectsPath = "/prospects";

exports.handler = async (event, context, callback) => {
    const response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...event }),
    };

    switch (true) {
        case event.httpMethod === "GET" && event.path === leadsPath:
            await getLeads()
                .then((data) => {
                    responseBody = data.Items;
                })
                .catch((err) => {
                    console.error(err);
                });

            callback(null, makeResponse(200, responseBody));
            break;
        default:
            break;
    }
};

function makeResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    };
}

function getLeads() {
    const params = {
        TableName: tableName,
    };

    return dynamo.scan(params).promise();
}

function getLeadByEmail(email) {
    const params = {
        TableName: tableName,
        Item: {
            email: email,
        },
    };

    return dynamo.get(params).promise();
}

// =============================

const AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-2",
});

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "hiringcoders-2021-24-corebiz";
const baseUrl = "https://i6328uam31.execute-api.us-east-2.amazonaws.com/prod";
const leadsPath = "/leads";
const clientsPath = "/clients";
const prospectsPath = "/prospects";

exports.handler = async (event, context, callback) => {
    let response;

    console.log(event);

    switch (true) {
        case event.path === "/leads":
            await getLeads()
                .then((data) => {
                    response = data.Items;
                })
                .catch((err) => {
                    console.error(err);
                });

            response = {
                statusCode: 200,
                body: JSON.stringify(response),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            };

            break;
        default:
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({ message: "ok" }),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            });
    }

    return callback(null, response);
};

const makeResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    };
};

function getLeads() {
    const params = {
        TableName: tableName,
    };

    return dynamo.scan(params).promise();
}
