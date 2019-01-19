const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const vision = require('@google-cloud/vision');
const fs = require("fs");
const moment = require("moment");

const nodemailer = require("nodemailer");
const sendgridTransport= require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(sendgridTransport({
  auth:{
    api_user: 'rickyhsu0101',
    api_key: 'rickyhsu0101!'
  }
}));

const terms = ["Dessert", "Ice Cream", "Tin Can", "Wrapper", "Drink", "Food", "Pastry", "Baked goods"];
let lastCalled;
let food = false;
async function detectObj(callback){
    const client = new vision.ImageAnnotatorClient({
        keyFilename: "./apikey.json"
    });
    
    const fileName = "./out.png";
    const request = {
      image: {content: fs.readFileSync(fileName)},
    };
    
    const [result] = await client.objectLocalization(request);
    const objects = result.localizedObjectAnnotations;
    objects.forEach(object => {
      console.log(`Name: ${object.name}`);
      console.log(`Confidence: ${object.score}`);
      /*
      const vertices = object.boundingPoly.normalizedVertices;
      vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
      */
      if(food || terms.indexOf(object.name)!==-1){
          food = true;
      }
      
    });
    if(food){
        if(moment().diff(moment(lastCalled)) < 120000 && lastCalled!= undefined){
            console.log("same food");
        }else{
            console.log("EMAIL IS GOING TO BE SENT");
            lastCalled = moment().toDate();
            transporter.sendMail({
                to: "rickyhsu0101@gmail.com",
                from: '"Duragon Tale"<duragontale@gmail.com>',
                subject: "Available Food",
                text: "hello",
                html: `<div style = "width: 100%; text-align: center">There are food available</div><img src="uniquefoodrightnow"/>`,
                attachments: [{
                    filename: 'out.png',
                    path: __dirname + '/out.png',
                    cid: 'uniquefoodrightnow' //same cid value as in the html img src
                }]
              }, function(err, info){
                callback()
              });
        }
      }else{
        callback();
      }
    
}


app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use("/static", express.static(path.join(__dirname, '/ui')));
app.get("/", (req, res)=>{
    return res.sendFile(path.join(__dirname, "/ui/index.html"));
})
app.post("/api/sendImage", (req,res)=>{
    var base64Img = req.body.img.replace(/^data:image\/png;base64,/, "");
    //console.log(base64Img);
    fs.writeFileSync("out.png", base64Img, 'base64');
    detectObj(()=>{
        
        return res.json({status: 'succeed'});
    })
    
    
})
app.listen(8080, ()=>{
    console.log("PORT open on 8080");
})