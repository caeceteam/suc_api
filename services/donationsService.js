var models = require('../models/');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var async = require('async');
var _ = require('lodash');
var donationsModel = models.Donation;
var donationItemsModel = models.DonationItem;

donationsModel.hasMany(donationItemsModel, { as: 'items', foreignKey: 'idDonation' })
var getDonation = function (idDonation, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDonation: function (callback) {
            donationsModel.find({ where: { idDonation: idDonation }, include: [{ model: donationItemsModel, as: 'items' }] }).then(function (donation, err) {
                if (err) {
                    // donation not found 
                    return callback({ 'body': {}, 'status': 401 }, null);
                }

                if (!donation) {
                    // incorrect donation
                    return callback({ 'body': {}, 'status': 404 }, null);
                }
                callback(null, donation);
            }).catch(error => {
                console.log(error);
                callback({ 'body': { 'result': "Ha ocurrido un error obteniendo el donation " + idDonation, 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, { 'body': results.findDonation, 'status': 200 });
        } else {
            responseCB(err, null);
        }
    });
}

var getDonationItem = function (idDonation, idDonationItem, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDonation: function (callback) {
            getDonation(idDonation, function (err, result) {
                if (!err) {
                    callback(null, result.body)
                } else {
                    callback(err, null);
                }
            });
        },
        findItem: ['findDonation', function (results, callback) {
            var donation = results.findDonation;
            donation.getItems({ where: { idDonationItem: idDonationItem } }).then(function (donationItem) {
                if (donationItem.length == 1) {
                    callback(null, { 'body': donationItem[0], 'status': 200 });
                } else {
                    callback({ 'body': { 'result': "no se encontro el donationItem " + idDonationItem }, 'status': 404 }, null)
                }
            });
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, { 'body': results.findItem.body, 'status': 200 });
        } else {
            responseCB(err, null);
        }
    });
}



var getAllDonations = function (req, responseCB) {
    var whereClosure = sequelize.and(queryHelper.buildQuery("Donation", req.query));
    var date = req.query.creationDate;

    //Agrego filtro temporal. Por defecto trae los ultimos 30 dias - Esto si el usuario no filtra directo
    //por creation date
    if (date == undefined) {
        date = new Date();
        var daysRange = req.query.daysRange ? req.query.daysRange : 30;
        date.setTime(date.getTime() - daysRange * 86400000);
        whereClosure.creationDate = { $gte: date };
    }
    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        donationsCount: function (callback) {
            donationsModel.count({ where: whereClosure }).then(function (donationsQty) {
                callback(null, donationsQty)
            }).catch(error => {
                callback(error, null);
            });
        },
        paginate: ['donationsCount', function (results, cb) {
            var promises = [];
            console.log(results);
            donationsModel.findAll({
                offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure
            }).then(function (donationsCol) {
                var total_pages = Math.ceil(results.donationsCount / page_size);
                var number_of_elements = donationsCol.length;

                var result = {
                    donations: donationsCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.donationsCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })

            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo las donaciones", 'fields': error.fields }, 'status': 500 }, null);
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

var getAllDonationItemsByDonation = function (idDonation, req, responseCB) {
    console.log(idDonation);
    var whereClosure = sequelize.and(queryHelper.buildQuery("DonationItem", req.query));

    var page_size = req.query.pageSize ? req.query.pageSize : 10;
    var page = req.query.page ? req.query.page : 0;
    var total_elements;

    async.auto({
        // this function will just be passed a callback
        findDonation: function (callback) {
            getDonation(idDonation, function (err, result) {
                if (!err) {
                    callback(null, result.body)
                } else {
                    console.log("falle");
                    callback(err, null);
                }
            });
        },
        donationItemsCount: ['findDonation', function (results, callback) {
            var donation = results.findDonation;
            donation.getItems({ where: whereClosure }).then(function (donationsItems) {
                callback(null, donationsItems.length)
            }).catch(error => {
                callback(error, null);
            });
        }],
        paginate: ['donationItemsCount', function (results, cb) {
            var promises = [];
            whereClosure.idDonation = idDonation;
            donationItemsModel.findAll({
                offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure
            }).then(function (donationItemsCol) {
                var total_pages = Math.ceil(results.donationItemsCount / page_size);
                var number_of_elements = donationItemsCol.length;

                var result = {
                    donationItems: donationItemsCol,
                    pagination: {
                        page: page,
                        size: page_size,
                        number_of_elements: number_of_elements,
                        total_pages: total_pages,
                        total_elements: results.donationItemsCount
                    }
                };
                cb(null, { 'body': result, 'status': 200 })

            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error obteniendo los items de la donacion idDonation: " + idDonation, 'fields': error.fields }, 'status': 500 }, null);
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

var createDonation = function (donationRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDonation: function (cb) {
            var postDonation = getDonationRequest(donationRequest);
            postDonation.creationDate = new Date();
            postDonation.status = 0;
            donationsModel.create(postDonation).then(function (donation) {
                cb(null, { 'body': donation, 'status': 201 });
            }).catch(error => {
                cb({ 'body': { 'result': "Ha ocurrido un error creando el donation", 'fields': error.fields }, 'status': 500 }, null);
            });
        },
        createItems: ['createDonation', function (results, cb) {
            var donation = results.createDonation.body;
            var postDonation = getDonationRequest(donationRequest);
            if (postDonation.items && postDonation.items.length > 0) {
                var insertDonationItemsPromises = [];
                for (var itemIx in postDonation.items) {
                    var item = postDonation.items[itemIx];
                    var postItem = getDonationItemRequest(item);
                    postItem.idDonation = donation.idDonation;
                    insertDonationItemsPromises.push(models.DonationItem.create(postItem));
                }
                Promise.all(insertDonationItemsPromises).then(function (values) {
                    var donationJson = donation.toJSON();
                    donationJson.items = values;
                    cb(null, { 'body': donationJson, 'status': 201 });
                }).catch(error => {
                    cb({ 'body': { 'result': "Ha ocurrido un error creando los items", 'fields': error.fields }, 'status': 500 }, null);
                });
            } else {
                cb(null, { 'body': donation, 'status': 201 })
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createItems);
        } else {
            responseCB(err, null);
        }
    });
}

var createDonationItem = function (donationItemRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        createDonationItem: function (cb) {
            var postDonationItem = getDonationItemRequest(donationItemRequest);
            donationItemsModel.create(postDonationItem).then(function (donationItem) {
                cb(null, { 'body': donationItem, 'status': 201 });
            }).catch(error => {
                console.log(error);
                cb({ 'body': { 'result': "Ha ocurrido un error creando el donationItem", 'fields': error.fields }, 'status': 500 }, null);
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.createDonationItem);
        } else {
            responseCB(err, null);
        }
    });
}

var updateDonation = function (idDonation, donationRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateDonation: function (callback) {
            getDonation(idDonation, function (err, result) {
                if (!err) {
                    var donation = result.body;
                    if (donation) {
                        donation.update(getDonationRequest(donationRequest)).then(function (updatedDonation) {
                            callback(null, { 'body': updatedDonation, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar la donation', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar la donation' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateDonation);
        } else {
            responseCB(err, null);
        }
    });

}

var updateDonationItem = function (idDonation, idDonationItem, donationItemRequest, responseCB) {
    async.auto({
        // this function will just be passed a callback
        updateDonationItem: function (callback) {
            getDonationItem(idDonation, idDonationItem, function (err, result) {
                if (!err) {
                    var donationItem = result.body;
                    if (donationItem) {
                        donationItem.update(getDonationItemRequest(donationItemRequest)).then(function (updatedDonationItem) {
                            callback(null, { 'body': updatedDonationItem, 'status': 202 });
                        }).catch(error => {
                            callback({ 'body': { 'result': 'No se puedo actualizar el donationItem', 'fields': error.fields }, 'status': 500 }, null);
                        });
                    } else {
                        callback({ 'body': { 'result': 'No se puedo actualizar el donationItem' }, 'status': 404 }, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        }
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.updateDonationItem);
        } else {
            responseCB(err, null);
        }
    });

}

var deleteDonation = function (idDonation, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDonation: function (callback) {
            getDonation(idDonation, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteDonation: ['findDonation', function (results, cb) {
            var donation = results.findDonation;
            var donationResponse = {};
            if (donation) {
                donation.destroy().then(function (result) {
                    if (result == 1) {
                        donationResponse.status = 200;
                        donationResponse.result = "Se ha borrado la donation " + idDonation;
                    } else {
                        donationResponse.status = 204;
                        donationResponse.result = "No se ha podido borrar la donation " + idDonation;
                    }
                    cb(donationResponse);
                }).catch(error => {
                    console.log(error);
                    donationResponse.status = 500;
                    donationResponse.fields = error.fields
                    donationResponse.result = "Error eliminando la donation " + idDonation;
                    cb(donationResponse);
                });
            } else {
                donationResponse.status = 404;
                donationResponse.result = "No se encontro la donation " + idDonation;
                cb(donationResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteDonation);
        } else {
            responseCB(err, null);
        }
    });
}

var deleteDonationItem = function (idDonation, idDonationItem, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDonationItem: function (callback) {
            getDonationItem(idDonation, idDonationItem, function (err, result) {
                if (!err) {
                    callback(null, result.body);
                } else {
                    callback(err, null);
                }
            });
        },
        deleteDonationItem: ['findDonationItem', function (results, cb) {
            var donationItem = results.findDonationItem;
            var donationItemResponse = {};
            if (donationItem) {
                donationItem.destroy().then(function (result) {
                    if (result == 1) {
                        donationItemResponse.status = 200;
                        donationItemResponse.result = "Se ha borrado el donationItem " + idDonationItem;
                    } else {
                        donationItemResponse.status = 204;
                        donationItemResponse.result = "No se ha podido borrar el donationItem " + idDonationItem;
                    }
                    cb(donationItemResponse);
                }).catch(error => {
                    donationItemResponse.status = 500;
                    donationItemResponse.fields = error.fields
                    donationItemResponse.result = "Error eliminando el donationItem " + idDonationItem;
                    cb(donationItemResponse);
                });
            } else {
                donationItemResponse.status = 404;
                donationItemResponse.result = "No se encontro el donationItem " + idDonationItem;
                cb(donationItemResponse);
            }
        }]
    }, function (err, results) {
        if (!err) {
            responseCB(null, results.deleteDonationItem);
        } else {
            responseCB(err, null);
        }
    });
}

var getDonationRequest = function (request) {
    var donationRequest = {
        idDonation: request.idDonation || request.id_donation,
        idUserSender: request.idUserSender || request.id_user_sender,
        idDinerReceiver: request.idDinerReceiver || request.id_diner_receiver,
        title: request.title,
        description: request.description,
        creationDate: request.creationDate || request.creation_date,
        status: request.status
        items: request.items
    };

    donationRequest = _.omitBy(donationRequest, _.isUndefined);

    return donationRequest;
}

var getDonationItemRequest = function (request) {
    var donationItemRequest = {
        idDonationItem: request.idDonationItem || request.id_donation_item,        
        idDonation: request.idDonation || request.id_donation,
        foodType: request.foodType || request.food_type,
        inputType: request.inputType || request.input_type,
        unit: request.unit,
        quantity: request.quantity,
        description: request.description
    };

    donationItemRequest = _.omitBy(donationItemRequest, _.isUndefined);

    return donationItemRequest;
}

module.exports = {
    getDonation: getDonation,
    getDonationItem: getDonationItem,
    getAllDonations: getAllDonations,
    getAllDonationItemsByDonation: getAllDonationItemsByDonation,
    createDonation: createDonation,
    createDonationItem: createDonationItem,
    getDonationRequest: getDonationRequest,
    getDonationItemRequest: getDonationItemRequest,
    updateDonation: updateDonation,
    updateDonationItem: updateDonationItem,
    deleteDonation: deleteDonation,
    deleteDonationItem: deleteDonationItem
};
