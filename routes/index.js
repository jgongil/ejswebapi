/* expressjs declaration */
var express = require('express');
var router = express.Router();

/* tedious connector for Azure SQL DB */
var Connection = require('tedious').Connection
var Request = require('tedious').Request

var title = 'My Table Explorer';
var slogan = 'Let´s unveil it';

/* DB Authentication (webapp variables should be used or Azure Key Vault) */ 
var config = {  
  server: 's',  //update me
  authentication: {
      type: 'default',
      options: {
          userName: 'user', //update me
          password: 'pass'  //update me
      }
  },
  options: {
      // If you are on Microsoft Azure, you need encryption:
      encrypt: true,
      database: 'mydb'  //update me
  }
}; 


/* GET home page of datastore. */
/* 
 - receives txid parameter as optional
 - receives outFormat as optional
 - if no specific txid is received, first 1000 records will be retrieved
*/
router.get('/', function(req, res, next) {

  // Parameters received
/*   get('/:txid?/:outFormat?'
  originTxid = req.params.txid;
  outFormat = req.params.outFormat; */

  originTxid = req.query.txid;
  outFormat = req.query.out;
  console.log('Txid received: ', originTxid);

  // New DB Connection
  var connection = new Connection(config)
  connection.on('connect', function (err) {
  
    if (err) {
      console.log('DB Connection ERROR: ', err)
    } else {
      console.log('Sucessfully connected to DB')
      executeStatement()

    }
  })

  // Database transactions
  function executeStatement () {
  
    var tableData = []; // it will be the table retried as an array of JSON rows.
    var SQLStatement = "select top 1000 * from mytable;" // default SQL statement when no params are received.

    // SQL Statement definition
    if (originTxid) {
      SQLStatement = "select top 1000 * from mytable where txid = @txid;"
      console.log("SQLStatement is not default, txid received")
    }
    
    // Request definition
    request = new Request(SQLStatement, function (err, rowCount) {
      if (err) {
        console.log('ERROR when querying DB: ', err)
      } else {
        console.log('Result of the query contains: ' + rowCount + ' rows')
        if (rowCount == 0){
          console.log("No records returned");
        }
        if(outFormat == 'json'){
          res.send(tableData);
        }
        else{
          // res.render('datastore',{ data: tableData, title: pageTitle });
          res.render('index',{title: title, slogan: slogan, data: tableData});
        }
        
      }
      connection.close()
    })

    // Request parameters
    var TYPES = require('tedious').TYPES;
    request.addParameter('txid',TYPES.VarChar,originTxid);

    // Request output handling
    request.on('row', function (columns) {
      var jsonData = {};

      columns.forEach(function (column) {
        if (column.value === null) {
          //console.log('NULL')
        } else {
          jsonData[column.metadata.colName] = column.value;
        }
      })
      tableData.push(jsonData);
    })

    // Request execution
    connection.execSql(request);
  }

});

module.exports = router;
