var models = require('../models/');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var async = require('async');
var dinersService = require('./dinersService');
var assistantsModel = models.Assistant;
var dinersModel = models.Diner;
var dinerAssistantsModel = models.DinerAssistant;
dinersModel.belongsToMany(assistantsModel, { through: dinerAssistantsModel, foreignKey: 'idDiner' });
assistantsModel.belongsToMany(dinersModel, { through: dinerAssistantsModel, foreignKey: 'idAssistant' });

var getAssistant = function (idAssistant, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findAssistant: function (callback) {
            assistantsModel.find({ where: { idAssistant: idAssistant } }).then(function (assistant, err) {
                if (err) {
                    // dinerInput not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!assistant) {
                    // incorrect dinerInput
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, assistant);
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el assistant " + idAssistant, 'fields': error.fields }, 'status': 500 }, null);
            });
        }, findDiner: ['findAssistant', function (results, cb) {
            var assistant = results.findAssistant;
            assistant.getDiners().then(function (diner) {
                var assistantResponse = { diner: diner, assistant: assistant };
                cb(null, { 'body': assistantResponse, 'status': 200 });
            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo el assistant " + idAssistant, 'fields': error.fields }, 'status': 500 }, null);
            });;
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findDiner);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllAssistants = function (idDiner, req, responseCB) {
    var whereClosure =  sequelize.and ( queryHelper.buildQuery("Assistant",req.query) ) ;

    console.log(whereClosure);
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            dinersService.getDiner(idDiner, function (err, result) {
                if (!err) {
                    callback(null, result.body.diner);
                } else {
                    callback(err, null);
                }
            });
        },
        assistantsCount: ['findDiner', function (results, callback) {
            var dinerAssistantsResponse = {};
            results.findDiner.getAssistants().then(function (assistants) {
                dinerAssistantsResponse.diner = results.findDiner;
                dinerAssistantsResponse.assistants = assistants;
                dinerAssistantsResponse.qty = assistants.length;
                callback(null, dinerAssistantsResponse)
            });
        }],
        paginate: ['assistantsCount', function (results, cb) {
            results.assistantsCount.diner.getAssistants({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure }).then(function (assistantsCol) {
                var total_pages = Math.ceil(results.assistantsCount.qty / page_size);
                var number_of_elements = assistantsCol.length;
                var result = {
                    assistants: assistantsCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.assistantsCount.qty
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los asistentes al comedor " + idDiner, 'fields': error.fields }, 'status': 500 }, null);
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

var createAssistant = function (assistantRequest, responseCB) {
    var postAssistant = getAssistantRequest(assistantRequest);

    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            dinersService.getDiner(postAssistant.idDiner, function (err, result) {
                if (!err) {
                    callback(null, result.body.diner);
                } else {
                    callback(err, null);
                }
            });
        },
        createAssistant: ['findDiner', function (results, cb) {
            var postAssistant = getAssistantRequest(assistantRequest);
            assistantsModel.create(postAssistant).then(function (assistant) {
                assistant.DinerAssistant = { active: postAssistant.active };
                results.findDiner.addAssistant(assistant);
                jsonCreatedAssistant = assistant.toJSON();
                jsonCreatedAssistant.active = postAssistant.active;
                cb(null, { 'body': jsonCreatedAssistant, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el assistant", 'fields': error.fields }, 'status': 500 }, null);
            });
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createAssistant);
        } else {
            responseCB(err, null);
        }
    });
}

var updateAssistant = function (idAssistant, assistantRequest, responseCB) {
    var putAssistant = getAssistantRequest(assistantRequest);
    async.auto({
        // this function will just be passed a callback
        findDiner: function (callback) {
            dinersService.getDiner(putAssistant.idDiner, function (err, result) {
                if (!err) {
                    callback(null, result.body.diner);
                } else {
                    callback(err, null);
                }
            });
        },
        findAssistant: function (callback) {
            getAssistant(idAssistant, function (err, result) {
                if (!err) {
                    callback(null, result.body.assistant);
                } else {
                    callback(err, null);
                }
            });
        },
        updateAssistant: ['findDiner', 'findAssistant', function (results, callback) {
            var assistant = results.findAssistant;
            var diner = results.findDiner;
            if (assistant) {
                assistant.update(putAssistant).then(function (updatedAssistant) {
                    dinerAssistantsModel.upsert({idAssistant:assistant.idAssistant,idDiner:diner.idDiner,active:putAssistant.active});
                    var jsonUpdatedAssistant = updatedAssistant.toJSON();
                    jsonUpdatedAssistant.active = putAssistant.active;
                    callback(null, { 'body':jsonUpdatedAssistant, 'status': 202 });
                }).catch(error => {
                    console.log(error);
                    callback({ 'body': { 'result': 'No se puedo actualizar el assistant', 'fields': error.fields }, 'status': 500 }, null);
                });
            } else {
                callback({ 'body': { 'result': 'No se puedo actualizar el assistant' }, 'status': 404 }, null);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateAssistant);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteAssistant = function (idAssistant, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findAssistant: function (callback) {
            getAssistant(idAssistant, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteAssistant: ['findAssistant', function (results, cb) {
            var assistant = results.findAssistant;
            var assistantResponse = {};
            if (assistant) {
                assistant.destroy().then(function (result) {
                    if (result == 1) {
                        assistantResponse.status = 200;
                        assistantResponse.result = "Se ha borrado el assistant " + idAssistant;
                    } else {
                        assistantResponse.status = 204;
                        assistantResponse.result = "No se ha podido borrar el assistant " + idAssistant;
                    }
                    cb(assistantResponse);
                }).catch(error => {
                    assistantResponse.status = 500;
                    assistantResponse.fields = error.fields
                    assistantResponse.result = "Error eliminando el assistant " + idAssistant;
                    cb(assistantResponse);
                });
            } else {
                assistantResponse.status = 404;
                assistantResponse.result = "No se encontro el assistant " + idAssistant;
                cb(assistantResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteAssistant);
        } else {
            responseCB(err, null);
        }
    });
}

var getAssistantRequest = function (request) {
    return {
        idDiner: request.idDiner, //Lo usamos para agregar el asistente al comedor
        name: request.name,
        surname: request.surname,
        bornDate: request.bornDate,
        street: request.street,
        streetNumber: request.streetNumber,
        floor: request.floor,
        door: request.door,
        zipcode: request.zipcode,
        latitude: request.latitude,
        longitude: request.longitude,
        phone: request.phone,
        contactName: request.contactName,
        scholarship: request.scholarship,
        eatAtOwnHouse: request.eatAtOwnHouse,
        economicSituation: request.economicSituation,
        celiac: request.celiac,
        diabetic: request.diabetic,
        document: request.document,
        active: request.active
    };
}

module.exports = {
    getAssistant: getAssistant,
    getAllAssistants: getAllAssistants,
    createAssistant: createAssistant,
    updateAssistant: updateAssistant,
    deleteAssistant: deleteAssistant,
    getAssistantRequest: getAssistantRequest
};