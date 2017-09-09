var models = require('../models/');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var inputTypeService = require('./inputTypesService');
var async = require('async');
var dinerInputsModel = models.DinerInput;

models.DinerInput.hasOne(models.InputType, { as: 'inputType', foreignKey: 'idInputType' });

var getDinerInput = function (idDinerInput, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerInput: function (callback) {
            dinerInputsModel.find({ where: { idDinerInput: idDinerInput } }).then(function (dinerInput, err) {
                if (err) {
                    // dinerInput not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!dinerInput) {
                    // incorrect dinerInput
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, dinerInput);
            }).catch(error => {
                console.log(error);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el dinerInput " + idDinerInput, 'fields': error.fields }, 'status': 500 }, null);
            });
        },
        findInputType: ['findDinerInput', function (results, cb) {
            var dinerInput = results.findDinerInput;
            inputTypeService.getInputType(dinerInput.idInputType, function (err, result) {
                if (!err) {
                    cb(null, result.body);
                } else {
                    cb(err, null);
                }
            });
        }]
    }, function (err, results) {
        console.log(results);
        if (!err) {
            var findDinerInputResult = { dinerInput: results.findDinerInput, inputType: results.findInputType };
            responseCB(null, { 'body': findDinerInputResult, 'status': 200 });
        } else {
            responseCB(err, null);
        }
    });
}

var getAllDinerInputs = function (idDiner, req, responseCB) {
    var whereClosure = sequelize.and(queryHelper.buildQuery("DinerInput", req.query));
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        dinerInputsCount: function (callback) {
            dinerInputsModel.count({ where: whereClosure }).then(function (dinerInputsQty) {
                callback(null, dinerInputsQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['dinerInputsCount', function (results, cb) {
            var promises = [];
            dinerInputsModel.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure, include:[{model: models.InputType, as: 'inputType'}] }).then(function (dinerInputsCol) {
                var total_pages = Math.ceil(results.dinerInputsCount / page_size);
                var number_of_elements = dinerInputsCol.length;

                var result = {
                    dinerInputs: dinerInputsCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.dinerInputsCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })

            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los dinerInputs", 'fields': error.fields }, 'status': 500 }, null);
            });
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.paginate);
        } else {
            responseCB(err, null);
        }
    });
}

var createDinerInput = function (dinerInputRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDinerInput: function (cb) {
            var postDinerInput = getDinerInputRequest(dinerInputRequest);
            dinerInputsModel.create(postDinerInput).then(function (dinerInput) {
                cb(null, { 'body': dinerInput, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el dinerInput", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createDinerInput);
        } else {
            responseCB(err, null);
        }
    });
}

var updateDinerInput = function (idDinerInput, dinerInputRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateDinerInput: function (callback) {
            getDinerInput(idDinerInput, function (err, result) {
                if (!err) {
                    var dinerInput = result.body;
                    if (dinerInput) {
                        dinerInput.update(getDinerInputRequest(dinerInputRequest)).then(function (updatedDinerInput) {
                            callback(null, { 'body': updatedDinerInput, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el dinerInput', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el dinerInput' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateDinerInput);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteDinerInput = function (idDinerInput, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerInput: function (callback) {
            getDinerInput(idDinerInput, function (err, result) {
                if (!err) {
                    callback(null, result.body.dinerInput);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteDinerInput: ['findDinerInput', function (results, cb) {
            var dinerInput = results.findDinerInput;
            var dinerInputResponse = {};
            if (dinerInput) {
                dinerInput.destroy().then(function (result) {
                    if (result == 1) {
                        dinerInputResponse.status = 200;
                        dinerInputResponse.result = "Se ha borrado el dinerInput " + idDinerInput;
                    } else {
                        dinerInputResponse.status = 204;
                        dinerInputResponse.result = "No se ha podido borrar el dinerInput " + idDinerInput;
                    }
                    cb(dinerInputResponse);
                }).catch(error => {
                    dinerInputResponse.status = 500;
                    dinerInputResponse.fields = error.fields
                    dinerInputResponse.result = "Error eliminando el dinerInput " + idDinerInput;
                    cb(dinerInputResponse);
                });
            } else {
                dinerInputResponse.status = 404;
                dinerInputResponse.result = "No se encontro el dinerInput " + idDinerInput;
                cb(dinerInputResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteDinerInput);
        } else {
            responseCB(err, null);
        }
    });
}

var getDinerInputRequest = function (request) {
    return {
        idDiner: request.idDiner,
        idInputType: request.idInputType,
        name: request.name,
        genderType: request.genderType,
        size: request.size,
        quantity: request.quantity,
        description: request.description
    };
}

module.exports = {
    getDinerInput: getDinerInput,
    getAllDinerInputs: getAllDinerInputs,
    createDinerInput: createDinerInput,
    updateDinerInput: updateDinerInput,
    deleteDinerInput: deleteDinerInput,
    getDinerInputRequest: getDinerInputRequest
};