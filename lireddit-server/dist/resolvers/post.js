"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("../entities/Post");
const Upvote_1 = require("../entities/Upvote");
const User_1 = require("../entities/User");
const isAuth_1 = require("../middleware/isAuth");
const Post_2 = require("../types/Post");
let PostResolver = class PostResolver {
    textSnippet(post) {
        const slicedText = post.text.slice(0, 200);
        return slicedText.length < post.text.length
            ? slicedText + "..."
            : slicedText;
    }
    creator(post, { userLoader }) {
        return userLoader.load(post.creatorId);
    }
    voteStatus(post, { upvoteLoader, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const upvote = yield upvoteLoader.load({
                postId: post.id,
                userId: req.session.userId,
            });
            return (upvote === null || upvote === void 0 ? void 0 : upvote.value) || null;
        });
    }
    posts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedLimit = Math.min(50, limit);
            const normalizedLimitPlusOne = normalizedLimit + 1;
            const qb = typeorm_1.getConnection()
                .getRepository(Post_1.Post)
                .createQueryBuilder("p")
                .select("p.*")
                .orderBy("p.createdAt", "DESC")
                .limit(normalizedLimitPlusOne);
            if (cursor) {
                qb.where("p.createdAt < :cursor", {
                    cursor: new Date(parseInt(cursor)),
                });
            }
            const posts = yield qb.getRawMany();
            return {
                items: posts.slice(0, normalizedLimit),
                hasMore: posts.length === normalizedLimitPlusOne,
            };
        });
    }
    post(id) {
        return Post_1.Post.findOne(id, { relations: ["creator"] });
    }
    vote(postId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.session;
            const normalizedValue = value > 0 ? 1 : -1;
            const upvote = yield Upvote_1.Upvote.findOne({
                postId,
                userId,
            });
            return typeorm_1.getConnection().transaction((transactionalEM) => __awaiter(this, void 0, void 0, function* () {
                if (upvote && upvote.value === normalizedValue) {
                    yield transactionalEM.delete(Upvote_1.Upvote, {
                        userId,
                        postId,
                    });
                    yield transactionalEM.update(Post_1.Post, { id: postId }, { points: () => `points - ${normalizedValue}` });
                }
                else if (upvote && upvote.value !== normalizedValue) {
                    yield transactionalEM.update(Upvote_1.Upvote, {
                        userId,
                        postId,
                    }, {
                        value: normalizedValue,
                    });
                    yield transactionalEM.update(Post_1.Post, { id: postId }, { points: () => `points + ${2 * normalizedValue}` });
                }
                else {
                    yield transactionalEM.insert(Upvote_1.Upvote, {
                        userId,
                        postId,
                        value: normalizedValue,
                    });
                    yield transactionalEM.update(Post_1.Post, { id: postId }, { points: () => `points + ${normalizedValue}` });
                }
                return true;
            }));
        });
    }
    createPost(data, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return Post_1.Post.create(Object.assign(Object.assign({}, data), { creatorId: req.session.userId })).save();
        });
    }
    updatePost(id, title, text, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(Post_1.Post)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
                .returning("*")
                .execute();
            return result.raw[0];
        });
    }
    deletePost(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield Post_1.Post.findOne(id);
            if (!post) {
                return false;
            }
            if (post.creatorId !== req.session.userId) {
                throw new Error("Not authorized");
            }
            yield Upvote_1.Upvote.delete({ postId: id });
            yield Post_1.Post.delete(id);
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", String)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    type_graphql_1.FieldResolver(() => User_1.User),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.FieldResolver(() => type_graphql_1.Int, { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteStatus", null);
__decorate([
    type_graphql_1.Query(() => Post_2.PaginatedPostResponse),
    __param(0, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    type_graphql_1.Query(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("postId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("value", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("data")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_2.PostData, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("title")),
    __param(2, type_graphql_1.Arg("text")),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    type_graphql_1.Resolver(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map