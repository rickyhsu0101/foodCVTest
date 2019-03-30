const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const vision = require('@google-cloud/vision');
const fs = require("fs");
const moment = require("moment");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const msg = {
  to: 'rickyhsu0101@gmail.com',
  from: 'duragontale@gmail.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};


const terms = ["Dessert", "Ice Cream", "Tin Can", "Wrapper", "Drink", "Food", "Pastry", "Baked goods", "Bread","Kitchenware"];
const not = ["Tableware", "Plate"];



async function detectObj(callback){
  const tags = [];
  let lastCalled;
  let food = false;
  console.log("detecting object");
    const client = new vision.ImageAnnotatorClient({
        keyFilename: "./apikey.json"
    });
    
    const fileName = "./out.png";
    const request = {
      image: {content: fs.readFileSync(fileName)},
    };
    
    const [result] = await client.objectLocalization(request);
    const objects = result.localizedObjectAnnotations;
    console.log(objects.length);
    objects.forEach(object => {
      console.log(`Name: ${object.name}`);
      console.log(`Confidence: ${object.score}`);
      /*
      const vertices = object.boundingPoly.normalizedVertices;
      vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
      */
     /*
      if(tags.indexOf(object.name)===-1&&terms.indexOf(object.name)!==-1){
          tags.push(object.name);
      }*/
      if(tags.indexOf(object.name)===-1){
        tags.push(object.name);
      }
      food = true;
    });
    if(tags.length > 0){
      console.log(tags.reduce((acc, cv)=>acc+ " "+cv));}
    if(food){
       
            console.log("EMAIL IS GOING TO BE SENT");
            lastCalled = moment().toDate();
            msg.text = 'hello';
            msg.html = `<div style = "width: 100%; text-align: center">Food Type: ${tags.reduce((acc, cv)=>acc+ ", "+cv)}</div><div style = "width: 100%; text-align: center">There are food available. Please go claim it now.</div><img src="uniquefoodrightnow"/>`;
            
            sgMail.send(msg, function(err, info){
              callback(tags);
            })
            /*
            transporter.sendMail({
                to: "rickyhsu0101@gmail.com",
                from: '"Free Food Co."<duragontale@gmail.com>',
                subject: "Food Available Near Your Area",
                text: "hello",
                html: `<div style = "width: 100%; text-align: center">Food Type: ${tags.reduce((acc, cv)=>acc+ ", "+cv)}</div><div style = "width: 100%; text-align: center">There are food available. Please go claim it now.</div><img src="uniquefoodrightnow"/>`,
                attachments: [{
                    filename: 'out.png',
                    path: __dirname + '/out.png',
                    cid: 'uniquefoodrightnow' //same cid value as in the html img src
                }] x
              }, function(err, info){
                callback(tags)
              });*/
      }else{
        callback(tags);
      }
    
}



const db = "mongodb://rickyhsu0101:rickyhsu0101@ds231501.mlab.com:31501/food-locator";
mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err, 'there is an error'));
require('./models/index');
const FoodPosting = mongoose.model("foodpostings");

app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
app.use("/static", express.static(path.join(__dirname, '/ui')));
app.get("/", (req, res)=>{
    return res.sendFile(path.join(__dirname, "/ui/index.html"));
});
app.post("/api/sendImage", (req,res)=>{
    var base64Img = req.body.img.replace(/^data:image\/png;base64,/, "");
    //console.log(base64Img);
    fs.writeFileSync("out.png", base64Img, 'base64');
    detectObj((tags)=>{
        console.log(tags);
        return res.json({status: 'succeed', tags: tags});
    });
});
app.post("/api/postfood", (req, res)=>{
  var base64Img = req.body.img.replace(/^data:image\/png;base64,/, "");
  let newFood = {
    image: base64Img,
    time: new Date().getUTCMilliseconds(),
    type: req.body.type,
    description: req.body.description,
    locationLat: req.body.locationLat,
    locationLong: req.body.locationLong,
    donor: req.body.donor,
    acceptor: req.body.acceptor
  }
  new FoodPosting(newFood).save()
    .then(food=>{
      return res.json({status: 'succeed', newFood});
    });
});
app.get("/api/food/:lat/:long", (req, res)=>{
  FoodPosting.find({locationLat: req.params.lat, locationLong: req.params.long})
    .then(food=>{
      if(food){
        return res.json({status: 'succeed', food});
      }else{
        return res.json({status: 'fail'});
      }
    });
});
app.listen(PORT, ()=>{
    console.log("PORT open on " + PORT);
})