/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



'use strict';

require( 'dotenv' ).config( {silent: true} );

var express = require( 'express' );  // app server
var bodyParser = require( 'body-parser' );  // parser for post requests
var watson = require( 'watson-developer-cloud' );  // watson sdk
var http = require('http');
// The following requires are needed for logging purposes
var uuid = require( 'uuid' );
var vcapServices = require( 'vcap_services' );
var basicAuth = require( 'basic-auth-connect' );

// The app owner may optionally configure a cloudand db to track user input.
// This cloudand db is not required, the app will operate without it.
// If logging is enabled the app must also enable basic auth to secure logging
// endpoints
var cloudantCredentials = vcapServices.getCredentials( 'cloudantNoSQLDB' );
var cloudantUrl = null;
if ( cloudantCredentials ) {
  cloudantUrl = cloudantCredentials.url;
}
cloudantUrl = cloudantUrl || process.env.CLOUDANT_URL; // || '<cloudant_url>';
var logs = null;
var app = express();

// Bootstrap application settings
app.use( express.static( './public' ) ); // load UI from public folder
app.use( bodyParser.json() );

// Create the service wrapper
var conversation = watson.conversation( {
  url: 'https://gateway.watsonplatform.net/conversation/api',
  username: process.env.CONVERSATION_USERNAME || '<username>',
  password: process.env.CONVERSATION_PASSWORD || '<password>',
  version_date: '2016-07-11',
  version: 'v1'
} );

// Endpoint to be call from the client side
app.post( '/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if ( !workspace || workspace === '<workspace-id>' ) {
    return res.json( {
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
        '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' +
        'Once a workspace has been defined the intents may be imported from ' +
        '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    } );
  }
  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };
  if ( req.body ) {
    if ( req.body.input ) {
      payload.input = req.body.input;
    }
    if ( req.body.context ) {
      // The client must maintain context/state
      payload.context = req.body.context;
    }
  }
  // Send the input to the conversation service
  conversation.message( payload, function(err, data) {
    if ( err ) {
      return res.status( err.code || 500 ).json( err );
    }
    updateMessage(res, payload, data);
  } );
} );

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(res, input, data) {
  if(checkWeather(data)){
    var path = getLocationURL(data.context.long, data.context.lat);

    var options = {
      host: 'api.wunderground.com',
      path: path
    };

    http.get(options, function(resp){
      var chunkText = '';
      resp.on('data', function(chunk){
        chunkText += chunk.toString('utf8');
      });
      resp.on('end', function(){
        var chunkJSON = JSON.parse(chunkText);
        var params = [];
        if(chunkJSON.location) {
          var when = data.entities[0].value;
          params.push ( chunkJSON.location.city );
          var forecast = null;
          if ( when == 'today' ) {
            forecast = chunkJSON.forecast.txt_forecast.forecastday[0].fcttext;
          } else if ( when == 'tomorrow' ) {
            forecast = chunkJSON.forecast.txt_forecast.forecastday[3].fcttext;
          } else{
            forecast = chunkJSON.forecast.txt_forecast.forecastday[0].fcttext;
          }
          params.push ( forecast );

          data.output.text = replaceParams ( data.output.text, params );
        }
        return res.json(data);
      });
    }).on('error', function(e){
      console.log("failure!");
    });
  }
  else if(checkZillow(data)){

    console.log(data.context.numstuff);

      var Zillow  = require('node-zillow');

      //var zwsid = process.env.ZWSID;
      var zwsid = 'X1-ZWz19gpodwxgcr_1oefy';
      var zillow = new Zillow(zwsid);


      var parameters = {
          state:'tx',
          city:'dallas',
          childtype:'neighborhood',

      };

      zillow.get('GetRegionChildren', parameters)
          .then(function(results) {


              //console.log(results.response.list.region);



              return results;

              // results here is an object { message: {}, request: {}, response: {}}
          });


    var params = [];
    var sentence = "Here is the first link: www.google.com \n Here is the second link: Facebook.com";
    params.push(sentence);

    var sentence2 = "Here is the 3 link: Facebook.com \n";
    params.push(sentence2);

    data.output.text = replaceParams ( data.output.text, params );
    return res.json(data);

  }
  else if(data.context.part != undefined){

      var place = [];
      var map = [];

      var m1234 = [];
      m1234.push("Northwest Dallas");
      m1234.push("http://www.zillow.com/homes/Northwest-Dallas-Dallas-TX_rb/");
      m1234.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75235/");
      m1234.push("http://www.zillow.com/northwest-dallas-dallas-tx/schools/");
      map.push(m1234);

      var m2134 = [];
      m2134.push("Near East");
      m2134.push("http://www.zillow.com/homes/Near-East-Dallas-TX_rb/");
      m2134.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75219/");
      m2134.push("http://www.zillow.com/near-east-dallas-tx/schools/");
      map.push(m2134);

      var m3124 = [];
      m3124.push("Cedar Crest");
      m3124.push("http://www.zillow.com/homes/Cedar-Crest-Dallas-TX_rb/");
      m3124.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75216/");
      m3124.push("http://www.zillow.com/cedar-crest-dallas-tx/schools/");

      map.push(m3124);

      var m3142 = [];
      m3142.push("Buckner Terrace");
      m3142.push("http://www.zillow.com/homes/Buckner-Terrace-Dallas-TX_rb/");
      m3142.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75227/");
      m3142.push("http://www.zillow.com/buckner-terrace-dallas-tx/schools/");

      map.push(m3142);

      var m4 = [];
      m4.push("Preston Hollow");
      m4.push("http://www.zillow.com/homes/Preston-Hollow-Dallas-TX_rb/");
      m4.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75244/");
      m4.push("http://www.zillow.com/preston-hollow-dallas-tx/schools/");

      map.push(m4);

      var m5 = [];
      m5.push("Main Streets");
      m5.push("http://www.zillow.com/homes/M-Streets-Dallas-TX_rb/");
      m5.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75204/");
      m5.push("http://www.zillow.com/m-streets-dallas-tx/schools/");

      map.push(m5);

      var m6 = [];
      m6.push("Far north");
      m6.push("http://www.zillow.com/homes/Far-North-Dallas-TX_rb/");
      m6.push("https://www.neighborhoodscout.com/tx/dallas/hillcrest-brentfield/");
      m6.push("http://www.zillow.com/far-north-dallas-tx/schools/");

      map.push(m6);

      var m7 = [];
      m7.push("Lake highlands");
      m7.push("	http://www.zillow.com/homes/Lake-Highlands-Dallas-TX_rb/");
      m7.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75243/");
      m7.push("http://www.zillow.com/lake-highlands-dallas-tx/schools/");

      map.push(m7);

      //console.log(data.context.order);
      //console.log(map[0][0]);
      switch (data.context.order){
          case 1234:
            place = map[0];
          case 1243:
            place = map[0];
          case 1324:
            place = map[0];
          case 1342:
            place = map[0];
          case 1423:
            place = map[0];
          case 1432:
            place = map[0];
          case 2134:
            place = map[1];
          case 2143:
            place = map[2];
          case 2314:
            place = map[3];
          case 2341:
            place = map[5];
          case 2413:
            place = map[5];
          case 2431:
            place = map[5];
          case 3124:
            place = map[5];
          case 3142:
            place = map[5];
          case 3214:
            place = map[6];
          case 3241:
            place = map[5];
          case 3412:
            place = map[5];
          case 3421:
            place = map[7];
          case 4123:
            place = map[2];
          case 4132:
            place = map[3];
          case 4213:
            place = map[2];
          case 4231:
            place = map[7];
          case 4312:
            place = map[5];
          case 4321:
            place = map[7];



      }



    if(data.context.part === 1 )
    {
        
        var params = [];
        var sentence = "(type next to continue) We recommend " + place[0] + " as a place to live. Here are some home prices in the area: " + place[1];
        params.push(sentence);
        data.output.text = replaceParams ( data.output.text, params );

    }
    else if (data.context.part == 2 )
    {
        var params = [];
        var sentence = "Here are some schools in the area: " + place[3];
        params.push(sentence);
        data.output.text = replaceParams ( data.output.text, params );

    }
    else if ( data.context.part == 3 )
    {
        var params = [];
        var sentence = "Finally, for reference here is the safety report for " + place[0] + " : " + place[2];
        params.push(sentence);
        data.output.text = replaceParams ( data.output.text, params );
    }

    return res.json(data);
  }
  else if(data.context.order != undefined){

    //Call the correct select method  (if order = 4312 call select 4312)
      var row = select(data.context.order);

  }
  else{
    if(data.context.numstuff != undefined)
      console.log(data.context.numstuff);
   // console.log("Hello world");
    return res.json(data);
  }
}
function checkWeather(data){
  return data.intents && data.intents.length > 0 && data.intents[0].intent === 'weather'
      && data.entities && data.entities.length > 0 && data.entities[0].entity === 'day';
}
function checkZillow(data) {
  return data.intents && data.intents.length > 0 && data.intents[0].intent === 'zillow'
      && data.entities && data.entities.length > 0 && data.entities[0].entity === 'me';

}

function replaceParams(original, args){
  if(original && args){
    var text = original.join(' ').replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
          ? args[number]
          : match
          ;
    });
    return [text];
  }
  return original;
}

function getLocationURL(lat, long){
  if(lat != null && long != null){
    return '/api/' + key + '/geolookup/forecast/q/'  + long + ',' + lat + '.json';
  }
};

var key ="855a1cfac989e94a";//"add your key here";

if ( cloudantUrl ) {
  // If logging has been enabled (as signalled by the presence of the cloudantUrl) then the
  // app developer must also specify a LOG_USER and LOG_PASS env vars.
  if ( !process.env.LOG_USER || !process.env.LOG_PASS ) {
    throw new Error( 'LOG_USER OR LOG_PASS not defined, both required to enable logging!' );
  }
  // add basic auth to the endpoints to retrieve the logs!
  var auth = basicAuth( process.env.LOG_USER, process.env.LOG_PASS );
  // If the cloudantUrl has been configured then we will want to set up a nano client
  var nano = require( 'nano' )( cloudantUrl );
  // add a new API which allows us to retrieve the logs (note this is not secure)
  nano.db.get( 'car_logs', function(err) {
    if ( err ) {
      console.error(err);
      nano.db.create( 'car_logs', function(errCreate) {
        console.error(errCreate);
        logs = nano.db.use( 'car_logs' );
      } );
    } else {
      logs = nano.db.use( 'car_logs' );
    }
  } );

  // Endpoint which allows deletion of db
  app.post( '/clearDb', auth, function(req, res) {
    nano.db.destroy( 'car_logs', function() {
      nano.db.create( 'car_logs', function() {
        logs = nano.db.use( 'car_logs' );
      } );
    } );
    return res.json( {'message': 'Clearing db'} );
  } );

  // Endpoint which allows conversation logs to be fetched
  app.get( '/chats', auth, function(req, res) {
    logs.list( {include_docs: true, 'descending': true}, function(err, body) {
      console.error(err);
      // download as CSV
      var csv = [];
      csv.push( ['Question', 'Intent', 'Confidence', 'Entity', 'Output', 'Time'] );
      body.rows.sort( function(a, b) {
        if ( a && b && a.doc && b.doc ) {
          var date1 = new Date( a.doc.time );
          var date2 = new Date( b.doc.time );
          var t1 = date1.getTime();
          var t2 = date2.getTime();
          var aGreaterThanB = t1 > t2;
          var equal = t1 === t2;
          if (aGreaterThanB) {
            return 1;
          }
          return  equal ? 0 : -1;
        }
      } );
      body.rows.forEach( function(row) {
        var question = '';
        var intent = '';
        var confidence = 0;
        var time = '';
        var entity = '';
        var outputText = '';
        if ( row.doc ) {
          var doc = row.doc;
          if ( doc.request && doc.request.input ) {
            question = doc.request.input.text;
          }
          if ( doc.response ) {
            intent = '<no intent>';
            if ( doc.response.intents && doc.response.intents.length > 0 ) {
              intent = doc.response.intents[0].intent;
              confidence = doc.response.intents[0].confidence;
            }
            entity = '<no entity>';
            if ( doc.response.entities && doc.response.entities.length > 0 ) {
              entity = doc.response.entities[0].entity + ' : ' + doc.response.entities[0].value;
            }
            outputText = '<no dialog>';
            if ( doc.response.output && doc.response.output.text ) {
              outputText = doc.response.output.text.join( ' ' );
            }
          }
          time = new Date( doc.time ).toLocaleString();
        }
        csv.push( [question, intent, confidence, entity, outputText, time] );
      } );
      res.csv( csv );
    } );
  } );
}

module.exports = app;
