const AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-2",
});

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "hiringcoders-2021-24-corebiz";
const leadsPath = "/leads";
// const clientsPath = "/clients";
// const prospectsPath = "/prospects";

function getLeads() {
    const params = {
        TableName: tableName,
    };

    return dynamo.scan(params).promise();
}

function makeResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(body),
    };
}

function getLeadByEmail(email) {
    const params = {
        TableName: tableName,
        Key: {
            userEmail: email,
        },
    };

    return dynamo.get(params).promise();
}

exports.handler = async function (event, context, callback) {
    let response;

    switch (true) {
        case event.httpMethod === "GET" &&
            event.resource === "/leads/{id}" &&
            !!event.pathParameters.id:
            const lead = await getLeadByEmail(event.pathParameters.id).then(
                (data) => data.Item
            );
            response = makeResponse(200, lead);
            break;

        case event.httpMethod === "GET" && event.path === leadsPath:
            const leads = await getLeads();
            response = makeResponse(200, leads);
            break;

        default:
            response = makeResponse(
                400,
                "não deu bom no leads nem com o email de ID"
            );
    }

    return response;
};
