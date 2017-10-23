var models = require('../models/');
var sequelize = require('sequelize');
var _ = require('lodash');
var queryHelper = require('../helpers/queryHelper');
var async = require('async');
var inputTypesModel = models.InputType;


var getInputType = function (idInputType, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findInputType: function (callback) {
            inputTypesModel.find({ where: {idInputType:idInputType}}).then(function (inputType, err) {
                if (err) {
                    // inputType not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!inputType) {
                    // incorrect inputType
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, { 'body': inputType, 'status': 200 });
            }).catch(error => {
                console.log(error);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el inputType " + idInputType, 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findInputType);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllInputTypes = function (req, responseCB) {
    var whereClosure = sequelize.and ( queryHelper.buildQuery("InputType",req.query) ) ;
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        inputTypesCount: function (callback) {
            inputTypesModel.count({ where: whereClosure }).then(function (inputTypesQty) {
                callback(null, inputTypesQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['inputTypesCount', function (results, cb) {
            inputTypesModel.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure }).then(function (inputTypesCol) {
                var total_pages = Math.ceil(results.inputTypesCount / page_size);
                var number_of_elements = inputTypesCol.length;
                var result = {
                    inputTypes: inputTypesCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.inputTypesCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los inputTypes", 'fields': error.fields }, 'status': 500 }, null);
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

var createInputType = function (inputTypeRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createInputType: function (cb) {
            var postInputType = getInputTypeRequest(inputTypeRequest);
            inputTypesModel.create(postInputType).then(function (inputType) {
                cb(null, { 'body': inputType, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el inputType", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createInputType);
        } else {
            responseCB(err, null);
        }
    });
}

var updateInputType = function (idInputType, inputTypeRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateInputType: function (callback) {
            getInputType(idInputType, function (err, result) {
                if (!err) {
                    var inputType = result.body;
                    if (inputType) {
                        inputType.update(getInputTypeRequest(inputTypeRequest)).then(function (updatedInputType) {
                            callback(null, { 'body': updatedInputType, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el inputType', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el inputType' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateInputType);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteInputType = function (idInputType, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findInputType: function (callback) {
            var inputType;
            getInputType(idInputType, function (err, result) {
                if (!err) {
                    inputType = result.body;
                    callback(null, inputType);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteInputType: ['findInputType', function (results, cb) {
            var inputType = results.findInputType;
            var inputTypeResponse = {};
            if (inputType) {
                inputType.destroy().then(function (result) {
                    if (result == 1) {
                        inputTypeResponse.status = 200;
                        inputTypeResponse.result = "Se ha borrado el inputType " + idInputType;
                    } else {
                        inputTypeResponse.status = 204;
                        inputTypeResponse.result = "No se ha podido borrar el inputType " + idInputType;
                    }
                    cb(inputTypeResponse);
                }).catch(error => {
                    inputTypeResponse.status = 500;
                    inputTypeResponse.result = "Error eliminando el inputType " + idInputType;
                    inputTypeResponse.fields = error.fields                    
                    cb(inputTypeResponse);
                });
            } else {
                inputTypeResponse.status = 404;
                inputTypeResponse.result = "No se encontro el inputType " + idInputType;
                cb(inputTypeResponse);
            }

        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteInputType);
        } else {
            responseCB(err, null);
        }
    });
}

var getInputTypeRequest = function (request) {
    var inputTypeRequest = {
        code: request.code,
        name: request.name,
        description: request.description
    };

    inputTypeRequest = _.omitBy(inputTypeRequest, _.isUndefined);
    return inputTypeRequest;    
};


module.exports = {
    getInputTypeRequest: getInputTypeRequest,
    getInputType: getInputType,
    getAllInputTypes: getAllInputTypes,
    createInputType: createInputType,
    updateInputType: updateInputType,
    deleteInputType: deleteInputType
};