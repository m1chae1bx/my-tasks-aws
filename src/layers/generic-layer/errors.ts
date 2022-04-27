export interface CustomError extends Error {
  errorCode: string;
}

export class UsernameUnavailableError implements CustomError {
  name = "UsernameUnavailableError";
  message = "Username is already taken";
  errorCode = "usernameUnavailable";
}

export class EmailUnavailableError implements CustomError {
  name = "EmailUnavailableError";
  message = "Email address is already registered";
  errorCode = "emailUnavailable";
}
