import * as AWS from "aws-sdk";
import { EnvironmentConfigError } from "../generic-layer/errors";

AWS.config.update({ region: "ap-southeast-1" });

const dynamoClient = new AWS.DynamoDB.DocumentClient({
  convertEmptyValues: true,
});

const TABLE_NAME = process.env.MY_TASKS_TABLE;
const EMAIL_INDEX = "user-email-index";

const getTableName = (): string => {
  if (!process.env.MY_TASKS_TABLE) {
    throw new EnvironmentConfigError("TABLE_NAME");
  }
  return process.env.MY_TASKS_TABLE;
};
export { dynamoClient, TABLE_NAME, EMAIL_INDEX, getTableName };
