var models = require('../models/');
var sequelize = require('sequelize');
var queryHelper = require('../helpers/queryHelper');
var async = require('async');
var _ = require('lodash');
var donationsModel = models.Donation;
var donationItemsModel = models.DonationItem;

donationsModel.hasMany(donationItemsModel, { as: 'items', foreignKey: 'idDonation' });

var getDonation = function (idDonation, responseCB) {
    async.auto({
        // this function will just be passed a callback
        findDonation: function (callback) {
            donationsModel.find({ where: { idDonation: idDonation }}).then(function (donation, err) {
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
                    callback(err,null);
                }
            });
        },
        findItem: ['findDonation', function(results, callback){
            var donation = results.findDonation;
            donation.getDonationItems({where:{idDonationItem: idDonationItem}}).then(function(donationItem){
                if(donationItem){
                    callback(null, { 'body': donationItem, 'status': 200 });
                }else{
                    callback({ 'body': {'result': "no se encontro el donationItem " + idDonationItem}, 'status': 404 },null)
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
                    callback(err,null);
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
                offset: page_size * page, limit: Math.ceil(page_size), where: whereClosure}).then(function (donationItemsCol) {
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
    getDonation: getDonation,
    getDonationItem: getDonationItem,
    getAllDonations: getAllDonations,
    getAllDonationItemsByDonation: getAllDonationItemsByDonation,
    createDinerRequest: createDinerRequest,
    updateDinerRequest: updateDinerRequest,
    deleteDinerRequest: deleteDinerRequest,
    getDinerRequestRequest: getDinerRequestRequest
};