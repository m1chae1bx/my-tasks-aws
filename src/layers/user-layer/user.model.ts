import crypto from "crypto";
import { AWSError } from "aws-sdk";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { PromiseResult } from "aws-sdk/lib/request";
import { create, get, getByEmail, deleteUser, patch } from "./user.dao";

import jwt from "jsonwebtoken";
export interface UserDetails {
  id: string;
  email: string;
  fullName: string;
  nickname: string;
  salt?: string;
  hash?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  defaultListId: string | null;
}

export class User implements UserDetails {
  id: string;
  email: string;
  fullName: string;
  nickname: string;
  salt?: string;
  hash?: string;
  preferences?: UserPreferences;

  constructor(
    id: string,
    email: string,
    fullName: string,
    nickname: string,
    salt?: string,
    hash?: string,
    preferences?: UserPreferences
  ) {
    this.id = id;
    this.email = email;
    this.fullName = fullName;
    this.nickname = nickname;
    this.salt = salt;
    this.hash = hash;
    this.preferences = preferences;
  }

  save(): Promise<string> {
    return create(this);
  }

  delete(): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> {
    return deleteUser(this.id);
  }

  setPassword(password: string): void {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex");
  }

  validatePassword(password: string): boolean {
    if (!this.hash) {
      throw new Error("User has no password hash");
    }
    if (!this.salt) {
      throw new Error("User has no password salt");
    }

    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex");
    return this.hash === hash;
  }

  generateJwt(): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(
        `JWT_SECRET environment variable is not set in Lambda function ${process.env.AWS_LAMBDA_FUNCTION_NAME}`
      );
    }
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
        exp: expiry.getTime() / 1000,
      },
      jwtSecret
    );
  }

  static patch = async (
    userPartial: Partial<User>
  ): Promise<PromiseResult<DocumentClient.UpdateItemOutput, AWSError>> => {
    return patch(userPartial);
  };

  static get = async (id: string): Promise<User | null> => {
    const result = await get(id);
    if (result) {
      return new User(
        result.id,
        result.email,
        result.fullName,
        result.nickname,
        result.salt,
        result.hash,
        result.preferences
      );
    }
    return null;
  };

  static getByEmail = async (email: string): Promise<User | null> => {
    const result = await getByEmail(email);
    if (result) {
      return new User(
        result.id,
        result.email,
        result.fullName,
        result.nickname,
        result.salt,
        result.hash,
        result.preferences
      );
    }
    return null;
  };
}

// User.prototype.update = function() {
//   const user = {
//     id: this.id,
//     username: this.username,
//     email: this.email,
//     fullName: this.fullName,
//     nickname: this.nickname,
//     salt: this.salt,
//     hash: this.hash,
//     preferences: this.preferences
//   };
//   return UserDao.update(user);
// };

// User.prototype.patch = function() {
//   const userPartial = {};
//   Object.entries(this).forEach(([key, item]) => {
//     if (this.hasOwnProperty(key) && item !== undefined) {
//       userPartial[key] = item;
//     }
//   });
//   return UserDao.patch(userPartial);
// };

// User.prototype.delete = function() {
//   return UserDao.delete(this.id);
// };

// User.prototype.setPassword = function(password) {
//   this.salt = crypto.randomBytes(16).toString("hex");
//   this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
// };

// User.prototype.validatePassword = function(password) {
//   const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex");
//   return this.hash === hash;
// };

// User.get = (id) => UserDao.get(id);
// User.getByUsername = (username) => UserDao.getByUsername(username);
// User.getByEmail = (email) => UserDao.getByEmail(email);

// module.exports = User;
