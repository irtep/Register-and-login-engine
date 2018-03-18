
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt'); 
const securityTools = require('./public/securityTools');

const app = express();

var identified = false;

const mongoDB1 = process.env.SECRET1; // admin
const mongoDB = process.env.SECRET2; // visitor
mongoose.connect(mongoDB); // change this if need db admin
mongoose.Promise = global.Promise;
const db = mongoose.connection;
const Schema = mongoose.Schema;

const usersSchema = new Schema( {
  
  username: {
    
    type: String,
    min: [3, 'Too short '],
    max: 200
    
  },
        
  password: {
        
    type: String,
    min: [6, 'Too few eggs'],
    max: 200
    
  }
  
})

// Compile model from schema
const usersModel = mongoose.model('usersModel', usersSchema );

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'));

// ----------------- HANDLE GETS -------------------

app.get("/", (request, response) => {

  console.log("get received");
  response.sendFile(__dirname + '/views/index.html');

});

app.get("/index3", (request, response) => {

  console.log("get received as index3");
  
  if (identified === true) {
    
    console.log("ide ok");
    response.sendFile(__dirname + '/views/index3.html');
    identified = false;
    
  }
    
});

// register place. Enable this if you want to register more users:
// also change mongoose.connect to admin user
//app.get("/index2", (req, res) => res.sendFile(__dirname + '/views/index2.html'))

// ----------------- HANDLE POSTS --------------------------

// request to log in :
app.post("/users", (request, response) => {
  
  console.log("Login attempt received");
  const usernamePassword = request.body;
  const usari = request.body.toBeSent[0];
  const passu = request.body.toBeSent[1]; 
  
	if (usari === "" ||  
			passu === "") {

	  console.log("username/password failed as other/both field/fields was/were empty");
  
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('emptys');
      
  } 
  
  else {
  
    let receivedData = [securityTools.checkInput(usari),securityTools.checkInput(passu)];
    let registeredUsers = [];
    let registeredPasswords = [];
    let verified = false;
    
      usersModel.find((err, results) => {
       
        if (err) console.log(err);
        
        for (let ix = 0;ix < results.length; ix++) {
 
          bcrypt.compare(receivedData[1], results[ix].password, (err, res) => {
           
            if (receivedData[0] === results[ix].username) {
          
              console.log("username found");
              
                if (res === true) {
                
                  console.log("password found");
                  verified = true;
                                
                }
            } // if username found  
              
            if (ix === results.length-1){
                 
              setTimeout(() => {  // timed so that it wouldnt be too fast
                
                console.log("results in");

                switch (verified) {

                  case true:

                    console.log("all ok. logging in: ", receivedData[0]);
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.end('right'); 
                    identified = true;

                  break;

                  case false:

                    console.log("wrong password or user name"); 
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.end('wrong');                

                  break;  

                  default: console.log("not found verified");                

              } // switch
                
             }, 250); //timer   
          } // if                             
        }); // hash ends              
      }  // for ends
    });  // find ends
  }  //else ends 
});  // post actions ends

// register user handler of index2.html
app.post("/adder", (request, response) => {
    
  console.log("adPost received");
  
  const usernamePassword = request.body;
  const usari = request.body.toBeSent[0];
  const passu = request.body.toBeSent[1]; console.log(usari); console.log(passu);
  
	if (usari === "" || 
			passu === "") {

	  console.log("username/password failed as other/both field/fields was/were empty");
  
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('emptys');
      
  } 
  
  else {
      
    const saltRounds = 10;
    let hashedPass = "placeholder"; 
    let checkedUser = securityTools.checkInput(usari); 
    let checkedPas = securityTools.checkInput(passu);
    let userNamesInDb = [];
    var foundAlready = false;
      
    bcrypt.hash(checkedPas, saltRounds, function(err, hash) {
      
      hashedPass = hash; 
  
      // check if username already exists, 
      usersModel.find((err, results) => {
       
        if (err) console.log(err);
        
        for (let ix= 0;ix < results.length;ix++) {
        
          userNamesInDb.push(results[ix].username);
        
        }
        
        for (let ix2 = 0;ix2 < userNamesInDb.length; ix2++) {
        
          if (checkedUser === userNamesInDb[ix2]) {foundAlready = true}
          
        }

        if (foundAlready === false) { 
          // Store hashs in your password DB.

          console.log("user found? ", foundAlready);
          var bob = new usersModel({ username: checkedUser, password: hashedPass });

          bob.save(function (err) {

            console.log("db save function fires");
            
            if (err) console.log(err);

          }); 
          
          console.log("responding all ok");
          response.writeHead(200, {'Content-Type': 'text/plain'});
          response.end('registered');
      
        }  
       
        else if (foundAlready === true) {
        
          console.log("responding already exists");
          response.writeHead(200, {'Content-Type': 'text/plain'});
          response.end('exists');
          console.log("responded");
        
        }
        
      }); // finder ends             
    }); // hash action ends      
  } // of else       
}); // post dealer ends

// --------------------- LISTEN PORT ---------------------
var listener = app.listen(process.env.PORT, () => {

  console.log('listening on port ' + listener.address().port);

});
