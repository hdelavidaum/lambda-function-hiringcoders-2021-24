const AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-2",
});

const ddb = new AWS.DynamoDB.DocumentClient();

const tableName = "hiringcoders-2021-24-corebiz";

const leadsResource = "/leads";
const leadResource = "/leads/{id}";

// const clientsPath = "/clients";
// const prospectsPath = "/prospects";

const generateUpdateQuery = (fields) => {
    let exp = {
        UpdateExpression: "set",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
    };

    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item;
    });
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp;
};

const getLeads = () => {
    const params = {
        TableName: tableName,
    };

    return ddb.scan(params).promise();
};

const getLeadByEmail = (email) => {
    const params = {
        TableName: tableName,
        Key: {
            userEmail: email,
        },
    };

    return ddb.get(params).promise();
};

const putLead = (requestBody) => {
    const today = new Date();

    const params = {
        TableName: tableName,
        Item: {
            userEmail: requestBody.userEmail,
            userType: requestBody.userType,
            clientSince: requestBody.clientSince,
            lastModified: requestBody.lastModified,
            createdAt: today.toLocaleDateString("en-CA"),
            phone: requestBody.phone,
            name: requestBody.name,
        },
    };

    return ddb.put(params).promise();
};

const updateLead = (key, requestBody) => {
    const today = new Date();
    const queryToUpdate = generateUpdateQuery({
        ...requestBody,
        lastModified: today.toLocaleDateString("en-CA"),
    });

    const params = {
        ...queryToUpdate,
        TableName: tableName,
        Key: {
            userEmail: key,
        },
    };

    return ddb.update(params).promise();
};

const makeResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(body),
    };
};

exports.handler = async function (event, context, callback) {
    let reqBody;
    let response;

    switch (true) {
        // PATH /leads
        case event.httpMethod === "GET" && event.path === leadsResource:
            const leads = await getLeads();
            response = makeResponse(200, leads);
            break;

        case event.httpMethod === "POST" && event.path === leadsResource:
            reqBody = JSON.parse(event.body);
            await putLead(reqBody);

            response = makeResponse(200, {
                message: `Lead with e-mail ${reqBody.userEmail} created with success`,
            });
            break;

        case event.httpMethod === "GET" &&
            event.resource === leadResource &&
            !!event.pathParameters.id:
            const lead = await getLeadByEmail(event.pathParameters.id).then(
                (data) => data.Item
            );
            response = makeResponse(200, lead);
            break;

        case event.httpMethod === "PATCH" &&
            event.resource === leadResource &&
            !!event.pathParameters.id:
            reqBody = JSON.parse(event.body);
            await updateLead(event.pathParameters.id, reqBody);

            response = makeResponse(200, {
                message: `Lead "${
                    event.pathParameters.id
                }" has been updated this data: ${Object.values(reqBody)}`,
            });
            break;

        case event.httpMethod === "PATCH" &&
            event.resource === leadResource &&
            !!event.pathParameters.id:

        default:
            response = makeResponse(400, {
                message:
                    "HTTP Method unavailable, please contact our support team if it persists (:",
            });
            break;
    }

    return response;
};
