var models = require('../models/');
var buildQuery = function (entityName, parameters) {
    var model = models[entityName];
    var sequelizeWhere = {
        //{key: { $like:value }}
    }

    for (var attr in model.attributes) {
        var parameterToSearch = parameters[attr];
        if (parameterToSearch != undefined) {
            sequelizeWhere[attr] = { $like: "%" + parameterToSearch + "%" }
        }
    }

    console.log(sequelizeWhere);
    return sequelizeWhere;
}

module.exports = {
    buildQuery: buildQuery
};