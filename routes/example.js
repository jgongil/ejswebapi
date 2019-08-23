/* expressjs declaration */
var express = require('express');
var router = express.Router();

/* tedious connector for Azure SQL DB */
var Connection = require('tedious').Connection
var Request = require('tedious').Request

var title = 'My Table Explorer';
var slogan = 'Let´s unveil it';


router.get('/', function(req, res, next) {

  // Parameters received
/*   get('/:txid?/:outFormat?'
  originTxid = req.params.txid;
  outFormat = req.params.outFormat; */

  originTxid = req.query.txid;
  outFormat = req.query.out;
  tableData = [{FieldName1:'data1',FieldName2:'data2', FieldName3:'data3',FieldName4:'data4'}];

  console.log('Txid received: ', originTxid);
  
    if(outFormat == 'json'){
      res.send(tableData);
    }
    else{
      // res.render('datastore',{ data: tableData, title: pageTitle });
      res.render('index',{title: title, slogan: slogan, data: tableData});
    }
        

});

module.exports = router;
