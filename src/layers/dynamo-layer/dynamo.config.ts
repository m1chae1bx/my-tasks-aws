import * as AWS from "aws-sdk";

AWS.config.update({ region: "ap-southeast-1" });

const dynamoClient = new AWS.DynamoDB.DocumentClient({
  convertEmptyValues: true,
});

const TABLE_NAME = process.env.MY_TASKS_TABLE;
const EMAIL_INDEX = "user-email-index";

export { dynamoClient, TABLE_NAME, EMAIL_INDEX };
