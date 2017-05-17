var express = require('express');
 var router = express.Router();
 var models = require('../models/');
 var jwt = require('jsonwebtoken');
var secret = "pruebadetoken";
router.get('/:id?',function(req,res,next){
 
    if(req.params.id){
     
        models.task.find({id:req.params.id}).then(function(task){
           // if user is found and password is right
        // create a token
        var taskUnit = task.dataValues;
        var token = jwt.sign(taskUnit, secret);
        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token,task:taskUnit
        });
        });
     }else{
        models.task.findAll().then(function(tasks){
        res.json(tasks);
      });
    }
});

router.post('/', function(req,res,next){
  console.log(req.body.id);
  models.task.create({Id:req.body.id, Title: req.body.title, Status:req.body.status}).then(function(task){
    res.json(task);
  });
});

router.put('/:id', function(req,res,next){
  models.task.find({where:{Id:req.params.id}}).then(function(task){
    console.log("se encontro la tarea");
    console.log(task);
    task.Title = req.body.title;
    task.Status = req.body.status;
    task.save();
    console.log("se hizo update");
    console.log(task);
    res.json(task);
  });

});
 
 module.exports=router;