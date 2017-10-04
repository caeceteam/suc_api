var models = require('../models/');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var foodTypeService = require('./foodTypesService');
var async = require('async');
var dinerFoodsModel = models.DinerFood;
var foodTypesModel = models.FoodType;

models.DinerFood.belongsTo(foodTypesModel, { as: 'foodType', foreignKey: 'idFoodType' });

var getDinerFood = function (idDinerFood, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerFood: function (callback) {
            dinerFoodsModel.find({ where: { idDinerFood: idDinerFood } }).then(function (dinerFood, err) {
                if (err) {
                    // dinerFood not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!dinerFood) {
                    // incorrect dinerFood
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, dinerFood);
            }).catch(error => {
                console.log(error);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el dinerFood " + idDinerFood, 'fields': error.fields }, 'status': 500 }, null);
            });
        },
        findFoodType: ['findDinerFood', function (results, cb) {
            var dinerFood = results.findDinerFood;
            foodTypeService.getFoodType(dinerFood.idFoodType, function (err, result) {
                if (!err) {
                    cb(null, result.body);
                } else {
                    cb(err, null);
                }
            });
        }]
    }, function (err, results) {
        if (!err) {
            var findDinerFoodResult = { dinerFood: results.findDinerFood, foodType: results.findFoodType };
            responseCB(null, { 'body': findDinerFoodResult, 'status': 200 });
        } else {
            responseCB(err, null);
        }
    });
}

var getAllDinerFoods = function (idDiner, req, responseCB) {
    var whereClosure = sequelize.and(queryHelper.buildQuery("DinerFood", req.query));
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        dinerFoodsCount: function (callback) {
            dinerFoodsModel.count({ where: whereClosure }).then(function (dinerFoodsQty) {
                callback(null, dinerFoodsQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['dinerFoodsCount', function (results, cb) {
            var promises = [];
            dinerFoodsModel.findAll({
                offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure,
                include: [
                    {
                        model:foodTypesModel,  
                        as: 'foodType'
                    }
                ]
            }).then(function (dinerFoodsCol) {
                var total_pages = Math.ceil(results.dinerFoodsCount / page_size);
                var number_of_elements = dinerFoodsCol.length;

                var result = {
                    dinerFoods: dinerFoodsCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.dinerFoodsCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })

            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los dinerFoods", 'fields': error.fields }, 'status': 500 }, null);
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

var createDinerFood = function (dinerFoodRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDinerFood: function (cb) {
            var postDinerFood = getDinerFoodRequest(dinerFoodRequest);
            dinerFoodsModel.create(postDinerFood).then(function (dinerFood) {
                cb(null, { 'body': dinerFood, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el dinerFood", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createDinerFood);
        } else {
            responseCB(err, null);
        }
    });
}

var updateDinerFood = function (idDinerFood, dinerFoodRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateDinerFood: function (callback) {
            getDinerFood(idDinerFood, function (err, result) {
                if (!err) {
                    var dinerFood = result.body.dinerFood;
                    if (dinerFood) {
                        console.log(dinerFood);
                        dinerFood.update(getDinerFoodRequest(dinerFoodRequest)).then(function (updatedDinerFood) {
                            callback(null, { 'body': updatedDinerFood, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el dinerFood', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el dinerFood' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateDinerFood);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteDinerFood = function (idDinerFood, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDinerFood: function (callback) {
            getDinerFood(idDinerFood, function (err, result) {
                if (!err) {
                    callback(null, result.body.dinerFood);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteDinerFood: ['findDinerFood', function (results, cb) {
            var dinerFood = results.findDinerFood;
            var dinerFoodResponse = {};
            if (dinerFood) {
                dinerFood.destroy().then(function (result) {
                    if (result == 1) {
                        dinerFoodResponse.status = 200;
                        dinerFoodResponse.result = "Se ha borrado el dinerFood " + idDinerFood;
                    } else {
                        dinerFoodResponse.status = 204;
                        dinerFoodResponse.result = "No se ha podido borrar el dinerFood " + idDinerFood;
                    }
                    cb(dinerFoodResponse);
                }).catch(error => {
                    dinerFoodResponse.status = 500;
                    dinerFoodResponse.fields = error.fields
                    dinerFoodResponse.result = "Error eliminando el dinerFood " + idDinerFood;
                    cb(dinerFoodResponse);
                });
            } else {
                dinerFoodResponse.status = 404;
                dinerFoodResponse.result = "No se encontro el dinerFood " + idDinerFood;
                cb(dinerFoodResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteDinerFood);
        } else {
            responseCB(err, null);
        }
    });
}

var getDinerFoodRequest = function (request) {
    return {
        idDiner: request.idDiner,
        idFoodType: request.idFoodType,
        name: request.name,
        unity: request.unity,
        quantity: request.quantity,
        description: request.description,
        endingDate: request.endingDate,
        creationDate: request.creationDate,
        expirationDate: request.expirationDate
    };
}

module.exports = {
    getDinerFood: getDinerFood,
    getAllDinerFoods: getAllDinerFoods,
    createDinerFood: createDinerFood,
    updateDinerFood: updateDinerFood,
    deleteDinerFood: deleteDinerFood,
    getDinerFoodRequest: getDinerFoodRequest
};