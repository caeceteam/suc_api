var models = require('../models/');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var async = require('async');
var foodTypesModel = models.FoodType;


var getFoodType = function (idFoodType, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findFoodType: function (callback) {
            foodTypesModel.find({ where: {idFoodType:idFoodType}}).then(function (foodType, err) {
                if (err) {
                    // foodType not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!foodType) {
                    // incorrect foodType
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, { 'body': foodType, 'status': 200 });
            }).catch(error => {
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el foodType " + idFoodType, 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.findFoodType);
        } else {
            responseCB(err, null);
        }
    });
}

var getAllFoodTypes = function (req, responseCB) {
    var whereClosure = sequelize.and ( queryHelper.buildQuery("FoodType",req.query) ) ;
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        foodTypesCount: function (callback) {
            foodTypesModel.count().then(function (foodTypesQty) {
                callback(null, foodTypesQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['foodTypesCount', function (results, cb) {
            foodTypesModel.findAll({ offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure }).then(function (foodTypesCol) {
                var total_pages = Math.ceil(results.foodTypesCount / page_size);
                var number_of_elements = foodTypesCol.length;
                var result = {
                    foodTypes: foodTypesCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.foodTypesCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los foodTypes", 'fields': error.fields }, 'status': 500 }, null);
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

var createFoodType = function (foodTypeRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createFoodType: function (cb) {
            var postFoodType = getFoodTypeRequest(foodTypeRequest);
            foodTypesModel.create(postFoodType).then(function (foodType) {
                cb(null, { 'body': foodType, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el foodType", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createFoodType);
        } else {
            responseCB(err, null);
        }
    });
}

var updateFoodType = function (idFoodType, foodTypeRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateFoodType: function (callback) {
            getFoodType(idFoodType, function (err, result) {
                if (!err) {
                    var foodType = result.body;
                    if (foodType) {
                        foodType.update(getFoodTypeRequest(foodTypeRequest)).then(function (updatedFoodType) {
                            callback(null, { 'body': updatedFoodType, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el foodType', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el foodType' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateFoodType);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteFoodType = function (idFoodType, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findFoodType: function (callback) {
            var foodType;
            getFoodType(idFoodType, function (err, result) {
                if (!err) {
                    foodType = result.body;
                    callback(null, foodType);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteFoodType: ['findFoodType', function (results, cb) {
            var foodType = results.findFoodType;
            var foodTypeResponse = {};
            if (foodType) {
                foodType.destroy().then(function (result) {
                    if (result == 1) {
                        foodTypeResponse.status = 200;
                        foodTypeResponse.result = "Se ha borrado el foodType " + idFoodType;
                    } else {
                        foodTypeResponse.status = 204;
                        foodTypeResponse.result = "No se ha podido borrar el foodType " + idFoodType;
                    }
                    cb(foodTypeResponse);
                }).catch(error => {
                    foodTypeResponse.status = 500;
                    foodTypeResponse.result = "Error eliminando el foodType " + idFoodType;
                    foodTypeResponse.fields = error.fields                    
                    cb(foodTypeResponse);
                });
            } else {
                foodTypeResponse.status = 404;
                foodTypeResponse.result = "No se encontro el foodType " + idFoodType;
                cb(foodTypeResponse);
            }

        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteFoodType);
        } else {
            responseCB(err, null);
        }
    });
}

var getFoodTypeRequest = function (request) {
    return {
        code: request.code,
        name: request.name,
        description: request.description,
        perishable: request.perishable,
        diabetic: request.diabetic,
        celiac: request.celiac
    };
};


module.exports = {
    getFoodTypeRequest: getFoodTypeRequest,
    getFoodType: getFoodType,
    getAllFoodTypes: getAllFoodTypes,
    createFoodType: createFoodType,
    updateFoodType: updateFoodType,
    deleteFoodType: deleteFoodType
};