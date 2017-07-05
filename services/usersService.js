const crypto = require('crypto');

var getUserRequest = function (request) {
    var hash = crypto.createHash('sha256');
    var password = request.pass;
    var hashedPass = hash.update(password).digest("base64");
    return {
        name: request.name,
        surname: request.surname,
        alias: request.alias,
        pass: hashedPass,
        mail: request.mail,
        phone: request.phone, idDiner: request.idDiner, role: request.role,
        docNumber: request.docNumber, bornDate: request.bornDate, state: request.state
    };
};


module.exports = {
    getUserRequest: getUserRequest
};