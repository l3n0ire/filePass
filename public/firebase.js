const baseUrl = "https://myfilepass.herokuapp.com"
//const baseUrl = "http://localhost:5000"
// Your web app's Firebase configuration
fetch(baseUrl+'/api/keys')
  .then(res=>res.json())
  .then(firebaseConfig=>{
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log(firebase);
  });

async function random()
{
  let data = {
    "jsonrpc": "2.0",
    "method": "generateStrings",
    "params": {
        "apiKey": "53b56391-d01d-40b7-984b-1a92afe63182",
        "n": 1,
        "length": 6,
        "characters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "replacement": true
    },
    "id": 42
  }
  const response = await fetch('https://api.random.org/json-rpc/2/invoke', {
      method: "POST",
      body: JSON.stringify(data),
      headers: {"Content-type": "application/json; charset=UTF-8"}
  })

  const code = await response.json()
  const randomCode = code.result.random.data[0]
  return randomCode
}
var files=[]

function clickInput(){
  document.getElementById("input").click()
}

document.getElementById("input").addEventListener("change", function(){
  files= this.files;
});

async function uploadImage(){
    let downloadCode = await random();
    document.querySelector("#code").innerHTML = downloadCode;
    
    const ref = await firebase.storage().ref();

    for(let i=0;i<files.length;i++){
      const name = files[i].name;
      const metadata ={
          contentType:files[i].type
      }

      if (files[i].size > 2097152) {
        alert("File is too big!");
        return;
      }

      const imageRef = await ref.child(downloadCode + "/" + name);
      const snapshot = await imageRef.put(files[i],metadata);

    }
    alert("Upload Successful");

    let data = {
      "downloadCode":downloadCode,
      "password":"",
      "expireTime":""
    }
    // store in db
    let res = await fetch(baseUrl+'/api/files', {
      method: "POST",
      body: JSON.stringify(data),
      headers: {"Content-type": "application/json; charset=UTF-8"}
    })
  res = await res.json();
  console.log(res);
      
}
