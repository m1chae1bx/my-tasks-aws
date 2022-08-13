import { testUserInit } from "../test-data/test-user-init";
import { User } from "../user.model";
import * as UserDao from "../user.dao";
import { ddbDeleteResult } from "@test-utils/base-objects";
import crypto from "crypto";
import jwt from "jsonwebtoken";

jest.mock("../user.dao", () => ({
  ...jest.requireActual("../user.dao"),
  create: jest.fn(),
  get: jest.fn(),
  getByEmail: jest.fn(),
  deleteUser: jest.fn(),
  patch: jest.fn(),
}));

jest.mock("crypto", () => ({
  ...jest.requireActual("crypto"),
  pbkdf2Sync: jest.fn(),
  randomBytes: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

jest.useFakeTimers().setSystemTime(new Date("2022-01-01"));

describe("User", () => {
  describe("constructor", () => {
    it("should initialize a user", () => {
      const { id, email, fullName, nickname, hash, salt, preferences } =
        testUserInit;
      const user = new User(
        id,
        email,
        fullName,
        nickname,
        salt,
        hash,
        preferences
      );
      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.fullName).toBe(fullName);
      expect(user.nickname).toBe(nickname);
      expect(user.salt).toBe(salt);
      expect(user.hash).toBe(hash);
      expect(user.preferences).toEqual(preferences);
    });
  });

  describe("object methods", () => {
    let user: User;

    beforeEach(() => {
      const { id, email, fullName, nickname } = testUserInit;
      user = new User(id, email, fullName, nickname);
    });

    describe("save", () => {
      it("should return user ID", async () => {
        (UserDao.create as jest.Mock).mockResolvedValueOnce("test-user-id");
        const result = await user.save();
        expect(result).toBe("test-user-id");
      });
    });

    describe("delete", () => {
      it("should call User DAO deleteUser", async () => {
        (UserDao.deleteUser as jest.Mock).mockResolvedValueOnce(null);
        await user.delete();
        expect((UserDao.deleteUser as jest.Mock).mock.calls).toMatchSnapshot();
      });
    });

    describe("setPassword", () => {
      it("should set hash and salt", () => {
        (crypto.randomBytes as jest.Mock).mockReturnValueOnce({
          toString: jest.fn().mockReturnValue("random-bytes"),
        });
        (crypto.pbkdf2Sync as jest.Mock).mockReturnValueOnce({
          toString: jest.fn().mockReturnValue("pbkdf2Sync"),
        });
        user.setPassword("test-password");
        expect(user.hash).toBeDefined();
        expect(user.salt).toBeDefined();
      });
    });

    describe("validatePassword - valid password", () => {
      it("should return true", () => {
        user.hash = "test-hash";
        user.salt = "test-salt";
        (crypto.pbkdf2Sync as jest.Mock).mockReturnValueOnce({
          toString: jest.fn().mockReturnValue("test-hash"),
        });
        const result = user.validatePassword("test-password");
        expect(result).toBeTruthy();
      });
    });

    describe("validatePassword - invalid password", () => {
      it("should return false", () => {
        user.hash = "test-incorrect-hash";
        user.salt = "test-salt";
        (crypto.pbkdf2Sync as jest.Mock).mockReturnValueOnce({
          toString: jest.fn().mockReturnValue("test-hash"),
        });
        const result = user.validatePassword("test-password");
        expect(result).toBeFalsy();
      });
    });

    describe("validatePassword - no hash", () => {
      it("should throw an error", () => {
        user.hash = undefined;
        user.salt = "test-salt";
        expect(() => user.validatePassword("test-password")).toThrow();
      });
    });

    describe("validatePassword - no salt", () => {
      it("should throw an error", () => {
        user.hash = "test-hash";
        user.salt = undefined;
        expect(() => user.validatePassword("test-password")).toThrow();
      });
    });

    describe("generateJwt - happy path", () => {
      let result: string;

      beforeAll(() => {
        process.env = {
          JWT_SECRET: "test-secret",
        };
        (jwt.sign as jest.Mock).mockReturnValueOnce("test-jwt");
        result = user.generateJwt();
      });

      it("should call jwt.sign", () => {
        expect((jwt.sign as jest.Mock).mock.calls).toMatchSnapshot();
      });

      it("should return a jwt", () => {
        expect(result).toBe("test-jwt");
      });
    });

    describe("generateJwt - no JWT secret", () => {
      it("should throw an error", () => {
        process.env = {
          JWT_SECRET: undefined,
          AWS_LAMBDA_FUNCTION_NAME: "test-lambda-name",
        };
        (jwt.sign as jest.Mock).mockReturnValueOnce("test-jwt");
        expect(() => user.generateJwt()).toThrow();
      });
    });
  });

  describe("static patch", () => {
    it("should call user DAO patch", async () => {
      await User.patch(testUserInit);
      expect((UserDao.patch as jest.Mock).mock.calls).toMatchSnapshot();
    });
  });

  describe("static get - happy path", () => {
    it("should return a user", async () => {
      (UserDao.get as jest.Mock).mockResolvedValueOnce(testUserInit);
      const result = await User.get("test-user-id");
      expect(result).toMatchSnapshot();
    });
  });

  describe("static get - user does not exist", () => {
    it("should return null", async () => {
      (UserDao.get as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await User.get("test-user-id");
      expect(result).toBe(null);
    });
  });

  describe("static getByEmail - happy path", () => {
    it("should return a user", async () => {
      (UserDao.getByEmail as jest.Mock).mockResolvedValueOnce(testUserInit);
      const result = await User.getByEmail("test-email");
      expect(result).toMatchSnapshot();
    });
  });

  describe("static getByEmail - user does not exist", () => {
    it("should return null", async () => {
      (UserDao.getByEmail as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await User.getByEmail("test-email");
      expect(result).toBe(null);
    });
  });
});
