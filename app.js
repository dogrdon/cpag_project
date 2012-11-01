/**
 * Module dependencies.
 */

var express = require('express');
var pg = require('pg');
var fs = require('fs');
var app = module.exports = express.createServer();
var path = require('path');
var configPath = path.join(__dirname, "config.json");
var config = JSON.parse(fs.readFileSync(configPath));
/*test connect*/
var conn = config.dbConnection;
var client = new pg.Client(conn);
client.connect();
/*test connect*/

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index.jade', {
    title: 'Chicago Art Map'
  });
});

app.get('/SeeAll', function(req, res){
  GrabData(req.body, res);
});

function GrabData(bounds, res){

  pg.connect(conn, function(err, client){

    //var moisql = 'SELECT array_to_json(array_agg(thys)) As art FROM (SELECT gid, (ST_AsGeoJSON(the_geom)) as the_geom FROM cpag) As thys;'
    var moisql = 'SELECT wrknm, gid, (ST_AsGeoJSON(the_geom)) as geometry, wrknm2, descfin, namecln, artist, location, img_src ';
	  moisql += 'FROM cpag, cpag_dt ';
    moisql += 'WHERE cpag.wrknm = cpag_dt.wrknm2;';
    

    client.query(moisql, function(err, result){
      // var featureCollection = new FeatureCollection();

      // for(i=0; i<result.rows.length; i++){
      //     featureCollection.features[i] = JSON.parse(result.rows[i].loca);
      //     //featureCollection.properties[i] = JSON.parse(result.rows[i].gid);
      // }

      // res.send(featureCollection);

      var featureCollection = toGeoJson(result.rows);
      res.send(featureCollection);
    });

  });
}

// function FeatureCollection(){
//   this.type = 'FeatureCollection';
//   this.features = new Array();
//   //this.properties = new Object;
// }

function toGeoJson(rows){
  var obj, i;

  obj = {
    type: "FeatureCollection",
    features: []
  };

  for (i = 0; i < rows.length; i++){
    var item, feature, geometry;

    item = rows[i];

    geometry = JSON.parse(item.geometry);
    delete item.geometry;

    feature = {
      type: "Feature",
      properties: item,
      geometry: geometry
    }

    obj.features.push(feature);
  }
  return obj;
}

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
