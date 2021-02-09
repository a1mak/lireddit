"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dataloader_1 = __importDefault(require("dataloader"));
const Upvote_1 = require("../entities/Upvote");
const createUpvoteLoader = () => {
    return new dataloader_1.default((keys) => __awaiter(void 0, void 0, void 0, function* () {
        const ids = keys.map((x) => x);
        const upvotes = yield Upvote_1.Upvote.findByIds(ids);
        return ids.map(({ postId, userId }) => upvotes.find((upvote) => upvote.postId === postId && upvote.userId === userId));
    }));
};
exports.default = createUpvoteLoader;
//# sourceMappingURL=createUpvoteLoader.js.map