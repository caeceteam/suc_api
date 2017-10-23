var models = require('../models/');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var dinersService = require('./dinersService');
var async = require('async');
var _ = require('lodash');
var dinerRequestModel = models.DinerRequest;

var getDinerRequest = function (idDinerRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerRequest: function (callback) {
            dinerRequestModel.find({ where: { idDinerRequest: idDinerRequest } }).then(function (dinerRequest, err) {
                if (err) {
                    // dinerRequest not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!dinerRequest) {
                    // incorrect dinerRequest
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, dinerRequest);
            }).catch(error => {
                console.log(error);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el dinerRequest " + idDinerRequest, 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, { 'body': results.findDinerRequest, 'status': 200 });
        } else {
            responseCB(err, null);
        }
    });
}

var getAllDinerRequests = function (req, responseCB) {
    var whereClosure = sequelize.and(queryHelper.buildQuery("DinerRequest", req.query));
    var date = req.query.creationDate;

    //Agrego filtro temporal. Por defecto trae los ultimos 30 dias - Esto si el usuario no filtra directo
    //por creation date
    if(date == undefined){
        date = new Date();
        var daysRange = req.query.daysRange ? req.query.daysRange : 30;
        date.setTime( date.getTime() - daysRange * 86400000 );
        whereClosure.creationDate = { $gte: date };      
    }
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        dinerRequestsCount: function (callback) {
            dinerRequestModel.count({ where: whereClosure }).then(function (dinerRequestsQty) {
                callback(null, dinerRequestsQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['dinerRequestsCount', function (results, cb) {
            var promises = [];
            dinerRequestModel.findAll({
                offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure
            }).then(function (dinerRequestsCol) {
                var total_pages = Math.ceil(results.dinerRequestsCount / page_size);
                var number_of_elements = dinerRequestsCol.length;

                var result = {
                    dinerRequests: dinerRequestsCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.dinerRequestsCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })

            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los dinerRequests", 'fields': error.fields }, 'status': 500 }, null);
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

var createDinerRequest = function (dinerRequestRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDinerRequest: function (cb) {
            var postDinerRequest = getDinerRequestRequest(dinerRequestRequest);
            postDinerRequest.creationDate = new Date();
            postDinerRequest.status = 0;
            dinerRequestModel.create(postDinerRequest).then(function (dinerRequest) {
                cb(null, { 'body': dinerRequest, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el dinerRequest", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createDinerRequest);
        } else {
            responseCB(err, null);
        }
    });
}

var updateDinerRequest = function (idDinerRequest, dinerRequestRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateDinerRequest: function (callback) {
            getDinerRequest(idDinerRequest, function (err, result) {
                if (!err) {
                    var dinerRequest = result.body;
                    if (dinerRequest) {
                        console.log(dinerRequest);
                        dinerRequest.update(getDinerRequestRequest(dinerRequestRequest)).then(function (updatedDinerRequest) {
                            callback(null, { 'body': updatedDinerRequest, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el dinerRequest', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el dinerRequest' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateDinerRequest);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteDinerRequest = function (idDinerRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerRequest: function (callback) {
            getDinerRequest(idDinerRequest, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteDinerRequest: ['findDinerRequest', function (results, cb) {
            var dinerRequest = results.findDinerRequest;
            var dinerRequestResponse = {};
            if (dinerRequest) {
                dinerRequest.destroy().then(function (result) {
                    if (result == 1) {
                        dinerRequestResponse.status = 200;
                        dinerRequestResponse.result = "Se ha borrado el dinerRequest " + idDinerRequest;
                    } else {
                        dinerRequestResponse.status = 204;
                        dinerRequestResponse.result = "No se ha podido borrar el dinerRequest " + idDinerRequest;
                    }
                    cb(dinerRequestResponse);
                }).catch(error => {
                    dinerRequestResponse.status = 500;
                    dinerRequestResponse.fields = error.fields
                    dinerRequestResponse.result = "Error eliminando el dinerRequest " + idDinerRequest;
                    cb(dinerRequestResponse);
                });
            } else {
                dinerRequestResponse.status = 404;
                dinerRequestResponse.result = "No se encontro el dinerRequest " + idDinerRequest;
                cb(dinerRequestResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteDinerRequest);
        } else {
            responseCB(err, null);
        }
    });
}

var getDinerRequestRequest = function (request) {
    var dinerRequest = {
        idDinerRequest: request.idDinerRequest,
        idDiner: request.idDiner,
        title: request.title,
        description: request.description,
        creationDate: request.creationDate,
        status: request.status
    };

    dinerRequest = _.omitBy(dinerRequest, _.isUndefined);

    return dinerRequest;
}

module.exports = {
    getDinerRequest: getDinerRequest,
    getAllDinerRequests: getAllDinerRequests,
    createDinerRequest: createDinerRequest,
    updateDinerRequest: updateDinerRequest,
    deleteDinerRequest: deleteDinerRequest,
    getDinerRequestRequest: getDinerRequestRequest
};