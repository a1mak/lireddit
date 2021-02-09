import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import { FieldError } from "./FieldError";

@InputType()
export class UserCredentials {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class ForgotPasswordResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { nullable: true })
  complete?: true;
}
