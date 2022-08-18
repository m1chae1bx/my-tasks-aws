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
│     └─ pipeline.yaml
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

File/Directory                    | Description
----------------------------------|-------------
`.github/workflows/pipeline.yaml` | Github CI/CD pipeline configuration
`src/libs/`                       | Shared code used by various functions
`src/test-utils/`                 | Shared utility code for unit tests
`src/functions/.../index.ts`      | Lambda function entry point
`src/functions/.../__tests__/`    | Function related unit tests
`src/functions/.../test-data/`    | Mock data for unit tests
`template.yml `                   | Template file used to define resources AWS SAM resources
`package.json`                    | NPM project manifest file
`tsconfig.json`                   | TypeScript configuration
`jest.config.json`                | Jest unit test framework configuration
`.gitignore`                      | List of files/directories ignored by Git
`.prettierrc.json`                | Prettier configuration
`.eslintignore`                   | List of files/directories ignored by TS/JS linter
`README.md`                       | Readme file


More details to come soon.
