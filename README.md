# My Tasks AWS

## Project Overview

This project contains source code and supporting files for a To Do List serverless application that you can deploy with the AWS Serverless Application Model (AWS SAM) command line interface (CLI). The application runs on Node.js runtime environment and makes use of AWS services like AWS Lambda, Amazon DynamoDB and Amazon API Gateway. Source code is written in TypeScript and unit tests are implemented using the Jest library. A GitHub pipeline configuration is also in place.

## Application Background

My Tasks AWS is a REST API backend application that supports creation, modification and deletion of To Do list items (called Tasks). Each task belongs to a List, and each List belongs to a User. The API supports registration and authentication of users, and managing of lists and tasks. 

## Project Structure

```txt
my-tasks-aws
├─ .github
│  └─ workflows/
├─ src/
│  ├─ libs/
│  ├─ test-utils/
│  └─ functions/
│     ├─ auth/
│     │  ├─ login/
│     │  │  ├─ __tests__/
│     │  │  ├─ test-data/
│     │  │  ├─ index.ts
│     │  │  └─ ...
│     │  └─ lambda-authorizer/
│     └─ ...
├─ template.yml
├─ package.json
├─ tsconfig.json
├─ jest.config.json
├─ .gitignore
├─ .prettierrc.json
├─ .eslintignore
└─ README.md
```

More details to come soon.
