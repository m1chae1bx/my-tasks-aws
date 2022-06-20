export interface CustomError extends Error {
  errorCode: ErrorCode;
}

export enum ErrorCode {
  USERNAME_UNAVAILABLE = "usernameUnavailable",
  USER_NOT_FOUND = "userNotFound",
  EMAIL_UNAVAILABLE = "emailUnavailable",
  REQUIRED_PROPERTY_MISSING = "requiredPropertyMissing",
  ENVIRONMENT_CONFIG_ERROR = "environmentConfigError",
}

export class UsernameUnavailableError implements CustomError {
  name = "UsernameUnavailableError";
  message = "Username is already taken";
  errorCode = ErrorCode.USERNAME_UNAVAILABLE;
}

export class EmailUnavailableError implements CustomError {
  name = "EmailUnavailableError";
  message = "Email address is already registered";
  errorCode = ErrorCode.EMAIL_UNAVAILABLE;
}

export class UserNotFoundError implements CustomError {
  name = "UserNotFoundError";
  message = "User not found";
  errorCode = ErrorCode.USER_NOT_FOUND;
}

export class EnvironmentConfigError implements CustomError {
  name = "EnvironmentConfigError";
  message;
  errorCode = ErrorCode.ENVIRONMENT_CONFIG_ERROR;

  constructor(name: string) {
    this.message = `Environment variable ${name} is not set`;
  }
}

export class RequiredPropertyMissingError implements CustomError {
  name = "RequiredPropertyMissingError";
  message;
  errorCode = ErrorCode.REQUIRED_PROPERTY_MISSING;

  constructor(name: string) {
    this.message = `Property ${name} is required`;
  }
}
