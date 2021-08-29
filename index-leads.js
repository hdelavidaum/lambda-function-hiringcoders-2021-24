const AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-2",
});

const ddb = new AWS.DynamoDB.DocumentClient();

const tableName = "hc2-24-corebiz";

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

const getLeadById = (uuid) => {
    const params = {
        TableName: tableName,
        Key: {
            id: uuid,
        },
    };

    return ddb.get(params).promise();
};

const putLead = (requestBody) => {
    const today = new Date();
    const isClient =
        requestBody.userType === "client" ? today.toISOString() : "";

    const params = {
        TableName: tableName,
        Item: {
            id: requestBody.id,
            userEmail: requestBody.userEmail,
            userType: requestBody.userType ?? "prospect",
            clientSince: isClient,
            lastModified: today.toISOString(),
            createdAt: today.toISOString(),
            phone: requestBody.phone,
            name: requestBody.name,
        },
    };

    return ddb.put(params).promise();
};

const updateLead = (uuid, requestBody) => {
    const today = new Date();
    const isClient =
        requestBody.userType === "client" ? today.toISOString() : "";

    const queryToUpdate = generateUpdateQuery({
        ...requestBody,
        lastModified: today.toISOString(),
        clientSince: isClient,
    });

    const params = {
        ...queryToUpdate,
        TableName: tableName,
        Key: {
            id: uuid,
        },
        ReturnValues: "ALL_NEW",
    };

    return ddb.update(params).promise();
};

const deleteLead = (uuid) => {
    const params = {
        TableName: tableName,
        Key: {
            id: uuid,
        },
        ReturnValues: "ALL_OLD",
    };

    return ddb.delete(params).promise();
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
    let reqBody = JSON.parse(event.body);
    let response;

    switch (event.httpMethod) {
        case "GET":
            if (!!event.pathParameters) {
                try {
                    const lead = await getLeadById(
                        event.pathParameters.id
                    ).then((data) => data.Item);
                    response = makeResponse(200, lead);
                    break;
                } catch (error) {
                    response = makeResponse(400, {
                        message: error.message,
                    });
                    break;
                }
            }
            try {
                const leads = await getLeads();
                response = makeResponse(200, leads);
                break;
            } catch (error) {
                response = makeResponse(400, {
                    message: error.message,
                });
                break;
            }

        case "POST":
            const { userEmail, phone, name } = reqBody;

            if (!userEmail || !phone || !name) {
                response = makeResponse(422, {
                    message: `Lead missing required properties for creation on database`,
                });
                break;
            }

            try {
                await putLead({
                    ...reqBody,
                    id: event.requestContext.requestId,
                });

                response = makeResponse(200, {
                    message: `Lead created with ID ${event.requestContext.requestId}`,
                    data: {
                        id: event.requestContext.requestId,
                    },
                });
                break;
            } catch (error) {
                response = makeResponse(400, {
                    message: error.message,
                });
                break;
            }

        case "PATCH":
            try {
                const updatedLead = await updateLead(
                    event.pathParameters.id,
                    reqBody
                ).then((data) => data.Attributes);

                response = makeResponse(200, {
                    message: `Lead ID ${
                        event.pathParameters.id
                    } has been updated this data: ${Object.values(reqBody)}`,
                    data: updatedLead,
                });
                break;
            } catch (error) {
                response = makeResponse(400, {
                    message: error.message,
                });
                break;
            }

        case "DELETE":
            try {
                const deletedUser = await deleteLead(
                    event.pathParameters.id
                ).then((data) => data.Attributes);

                response = makeResponse(200, {
                    message: `Lead ID ${event.pathParameters.id} has been permanently deleted from database.`,
                    data: deletedUser,
                });
                break;
            } catch (error) {
                response = makeResponse(400, {
                    message: error.message,
                });
                break;
            }

        default:
            response = makeResponse(400, {
                message:
                    "HTTP Method unavailable, please contact our support team if it persists.",
            });
            break;
    }

    return response;
};
