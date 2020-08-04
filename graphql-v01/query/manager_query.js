
const { Managers } = require('../../database/mogodb_connection');
const { validateLogin } = require('../../joi_schema/joi_schema');
const { compare } = require('../miscellaneous/bcryptHash');
const { errorMessageToken, signManager } = require('../miscellaneous/jwtModels');

const privateKey = 'manager_PrivateKey';

module.exports.get = (id) => {
    return Managers.findOne({ id: id })
        .then((result) => {
            if (result) {
                return result;
            } else {
                throw `Not found in db -> ${result} `;
            }
        })
        .catch((e) => {
            console.error(e);
        });
};

// login
module.exports.login = async (manager) => {
    try {
        let local_manager = {
            username: manager.username.toString(),
            password: manager.password.toString()
        };
        const check = validateLogin(local_manager);
        if (check.error) {
            throw `Joi validation failed ${check.error}`;
        } else {
            const payload = await Managers.findOne({ username: local_manager.username });
            if (!payload) {
                throw 'Manager does not exist';
            } else {
                if (await compare(local_manager.password, payload.password)) {
                    return signManager(payload, privateKey);
                } else {
                    throw errorMessageToken.invalid;
                }
            }

        }
    } catch (exception) {
        console.error(exception);
        return exception
    }
};