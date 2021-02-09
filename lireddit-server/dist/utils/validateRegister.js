"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateRegister(options) {
    if (options.username.length < 1) {
        return [
            {
                field: "username",
                message: "length should be greater then 1",
            },
        ];
    }
    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "email should include an @",
            },
        ];
    }
    if (options.password.length <= 2) {
        return [
            {
                field: "password",
                message: "length should be greater then 2",
            },
        ];
    }
    return null;
}
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map