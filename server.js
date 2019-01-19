const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const vision = require('@google-cloud/vision');
const fs = require("fs");


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
      const vertices = object.boundingPoly.normalizedVertices;
      vertices.forEach(v => console.log(`x: ${v.x}, y:${v.y}`));
    });
    callback();
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