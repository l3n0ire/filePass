const path = require('path');
const express = require('express');
require('dotenv').config();
const app = express();
const firebase = require('firebase');
var admin = require("firebase-admin");
var urls=[]


// body parser
app.use(express.json());
// set static folder
app.use(express.static(path.join(__dirname,'public')))
// firebase config
var firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    databaseURL: process.env.databaseURL,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    type:process.env.type,
    private_key_id: process.env.private_key_id,
    private_key:process.env.private_key.replace(/\\n/g, '\n'),
    client_email:process.env.client_email,
    client_id:process.env.client_id,
    auth_uri : process.env.auth_uri,
    token_uri : process.env.token_uri,
    auth_provider_x509_cert_url : process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url
  };
firebase.initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: process.env.databaseURL
});

var bucket = admin.storage().bucket(process.env.storageBucket);

// download file
app.get('/api/files/:downloadCode', async function (req, res) {
  let folderName = req.params.downloadCode+'/'
  
  bucket.getFiles({prefix:folderName, delimiter:'/', autoPaginate:false},function(err, files) {
      if (!err) {
        // check if folder exists
        if(files.length!=0)
        {
          files.forEach(file=>{
            urls.push(file.metadata.mediaLink)
          });
          res.send({"urls":urls});
          // clear urls
          urls =[];
        }
        else{
            res.status(400).json({"message":"folder not found"})
        }
        
      }
      else
      {
        console.log("error");
        res.status(400).json({"message":err})
      }
  });
})

// get keys
app.get('/api/keys', function (req, res) {
    res.send(firebaseConfig)
})

// upload file
app.post('/api/files', function (req, res) {
    if("downloadCode" in req.body && "password" in req.body && "expireTime" in req.body){
        try{
            addToDB(req.body.downloadCode,req.body.password,req.body.expireTime);
            res.send({"message":"added to db"})
        }catch(error){
            console.log(error)
            res.status(500).json("server error")
        }
    }
    else
        res.status(400).json("missing parameter")
})

async function addToDB(downloadCode,password,expireTime){

    const res = await firebase.database().ref("users/"+downloadCode).set({
      downloadCode:downloadCode,
      password:password,
      expireTime:expireTime
    });  
}

const PORT= process.env.PORT || 5000;
console.log(process.env.apiKey)
app.listen(PORT,()=>console.log(`server running ${process.env.NODE_ENV} on port ${PORT}`));
