import { ClassType, Field, ObjectType } from "type-graphql";

export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    items: TItem[];

    @Field()
    hasMore: boolean;
  }

  return PaginatedResponseClass;
}
