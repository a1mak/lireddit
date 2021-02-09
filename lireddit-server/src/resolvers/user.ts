import argon2 from "argon2";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { v4 } from "uuid";
import { COOKIE_SESSION_KEY, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types/MyContext";
import {
  ForgotPasswordResponse,
  UserCredentials,
  UserResponse,
} from "../types/User";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext): string {
    return req.session.userId === user.id ? user.email : "";
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    if (!req.session.userId) {
      return;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length should be greater then 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token has expired",
          },
        ],
      };
    }

    const userIdInt = parseInt(userId);

    const user = await User.findOne(userIdInt);
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await User.update(userIdInt, { password: await argon2.hash(newPassword) });
    await redis.del(key);

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => ForgotPasswordResponse)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<ForgotPasswordResponse> {
    if (!email) {
      return {
        errors: [
          {
            field: "email",
            message: "email field should not be empty",
          },
        ],
      };
    }
    if (!email.includes("@")) {
      return {
        errors: [
          {
            field: "email",
            message: "email is not valid",
          },
        ],
      };
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { complete: true };
    }

    const token = v4();

    redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(
      email,
      "Reset password",
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return { complete: true };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserCredentials,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    let user = User.create({
      username: options.username,
      email: options.email,
      password: await argon2.hash(options.password),
    });

    try {
      user = await user.save();
    } catch (err) {
      if ((err.code = "23505")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const key = usernameOrEmail.includes("@") ? "email" : "username";
    const user = await User.findOne({ where: { [key]: usernameOrEmail } });
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_SESSION_KEY);

        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
