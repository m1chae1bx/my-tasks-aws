import { Task } from "./task.model";
import { dynamoClient, TABLE_NAME } from "/opt/nodejs/dynamo.config";
import { uuid } from "/opt/nodejs/util";

export const create = async (task: Task): Promise<string> => {
  if (!TABLE_NAME) throw { message: "Invalid DynamoDB table name" };
  if (!task) throw { message: "Invalid task object" };
  if (!task.name) throw { message: "Name is required" };
  if (!task.listId) throw { message: "List ID is required" };

  const id = uuid();
  const item: {
    PK: string;
    SK: string;
    id: string;
    name: string;
    nameSearch: string;
    isCompleted?: boolean;
    dueDate?: Date;
    desc?: string;
  } = {
    PK: `LIST#${task.listId}`,
    SK: `TASK#active#${id}`,
    id: id,
    name: task.name,
    nameSearch: task.name.toLowerCase(),
  };

  if (task.isCompleted) item.isCompleted = task.isCompleted;
  if (task.dueDate) item.dueDate = task.dueDate;
  if (task.desc) item.desc = task.desc;

  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ConditionExpression: "attribute_not_exists(PK)",
  };

  return dynamoClient
    .put(params)
    .promise()
    .then(() => id)
    .catch((err) => {
      if (err.code === "ConditionalCheckFailedException") {
        err.message = `Task ${id} is already existing`;
      }
      throw err;
    });
};

// exports.getAllByList = (listId, query) => {
//   if (!listId) throw { message: "List ID is required" };
//   if (!query.dueDate && query.today || query.dueDate && !query.today) {
//     throw { message: "Due date and Today are required together" };
//   }

//   let filterExpression = "";
//   const expressionAttributeNames = {
//     "#SK": "SK",
//     "#name": "name",
//     "#desc": "desc"
//   };
//   const expressionAttributeValues = {
//     ":PK": `LIST#${listId}`,
//     ":SK": query.includeCompleted ? `TASK#` : `TASK#active#`
//   };
//   if (query.name) {
//     filterExpression = "contains(nameSearch, :name)";
//     expressionAttributeValues[":name"] = query.name.toLowerCase();
//   }
//   if (query.dueDate) {
//     var date = new Date(query.today);
//     const dueDate = query.dueDate;
//     if (filterExpression) filterExpression += " and ";
//     if (dueDate === 'today') {
//       filterExpression += "dueDate = :dueDate";
//       expressionAttributeValues[":dueDate"] = date.toISOString();
//     } else if (dueDate === 'tomorrow') {
//       date.setDate(date.getDate() + 1);
//       filterExpression += "dueDate = :dueDate";
//       expressionAttributeValues[":dueDate"] = date.toISOString();
//     } else if (dueDate === 'upcoming') {
//       date.setDate(date.getDate() + 1);
//       filterExpression += "dueDate > :dueDate";
//       expressionAttributeValues[":dueDate"] = date.toISOString();
//     } else if (dueDate === 'overdue') {
//       filterExpression += "dueDate < :dueDate";
//       expressionAttributeValues[":dueDate"] = date.toISOString();
//     } else if (dueDate === 'unplanned') {
//       filterExpression += "attribute_not_exists(dueDate)";
//     }
//   }

//   const params = {
//     TableName: TABLE_NAME,
//     KeyConditionExpression: "PK = :PK and begins_with(#SK, :SK)",
//     ProjectionExpression: "id, #name, #desc, isCompleted, dueDate",
//     ExpressionAttributeNames: expressionAttributeNames,
//     ExpressionAttributeValues: expressionAttributeValues
//   };

//   if (filterExpression) params.FilterExpression = filterExpression;

//   return dynamoClient.query(params).promise().then(data => data.Items.map(item => {
//     item.listId = listId;
//     return item;
//   }));
// }

// exports.update = async task => {
//   if (!task) throw { message: "Invalid task object" };
//   if (!task.name) throw { message: "Name is required" };

//   const id = task.id;
//   const listId = task.listId;
//   delete task.listId;
//   task.nameSearch = task.name.toLowerCase();

//   if (task.isCompleted) {
//     const params = {
//       TransactItems: [
//         {
//           Delete: {
//             TableName: TABLE_NAME,
//             Key: {
//               PK: `LIST#${listId}`,
//               SK: `TASK#active#${id}`
//             }
//           }
//         },
//         {
//           Put: {
//             TableName: TABLE_NAME,
//             Item: {
//               PK: `LIST#${listId}`,
//               SK: `TASK#${id}`,
//               ...task
//             }
//           }
//         }
//       ]
//     };

//     return dynamoClient.transactWrite(params).promise();
//   } else {
//     const params = {
//       TableName: TABLE_NAME,
//       Item: {
//         PK: `LIST#${listId}`,
//         SK: `TASK#active#${id}`,
//         ...task
//       },
//       ConditionExpression: "attribute_exists(PK)"
//     };

//     try {
//       return await dynamoClient.put(params).promise();
//     } catch(err) {
//       if (err.code === "ConditionalCheckFailedException") {
//         const params = {
//           TransactItems: [
//             {
//               Delete: {
//                 TableName: TABLE_NAME,
//                 Key: {
//                   PK: `LIST#${listId}`,
//                   SK: `TASK#${id}`
//                 }
//               }
//             },
//             {
//               Put: {
//                 TableName: TABLE_NAME,
//                 Item: {
//                   PK: `LIST#${listId}`,
//                   SK: `TASK#active#${id}`,
//                   ...task
//                 }
//               }
//             }
//           ]
//         };
//         return dynamoClient.transactWrite(params)
//           .promise()
//           .catch(err => {
//             if (err.code === "ConditionalCheckFailedException") {
//               err.message = `Task ${id} of list ${listId} was not found`;
//             }
//             throw err;
//           });
//       }
//       throw err;
//     }
//   }
// };

// exports.delete = async (id, listId) => {
//   if (!id) throw { message: "Task ID is required" };
//   if (!listId) throw { message: "List ID is required" };

//   const params = {
//     TableName: TABLE_NAME,
//     Key: {
//       PK: `LIST#${listId}`,
//       SK: `TASK#active#${id}`
//     },
//     ConditionExpression: "attribute_exists(PK)"
//   };

//   try {
//     return await dynamoClient.delete(params).promise();
//   } catch (err) {
//     if (err.code === "ConditionalCheckFailedException") {
//       params.Key.SK = `TASK#${id}`;
//       return dynamoClient.delete(params).promise()
//         .catch(err => {
//           if (err.code === "ConditionalCheckFailedException") {
//             err.message = `Task ${id} of list ${listId} was not found`;
//           }
//           throw err;
//         });
//     }
//   }
// };
