const vision = require('@google-cloud/vision');
const fs = require('fs');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const msg = {
  to: 'rickyhsu0101@gmail.com',
  from: 'duragontale@gmail.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};
sgMail.send(msg);
// Creates a client
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}
var base64str = base64_encode('./test.jpg');
axios.post("https://food-locator-app.herokuapp.com/api/sendImage", {img: base64str})
  .then(function(response){
    console.log(response.data);
  })
  .catch(function(error){
    console.log("error");
  });
async function detectObj(){
    const client = new vision.ImageAnnotatorClient({
        keyFilename: "./apikey.json"
    });
    
    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    const fileName = "./test.jpg";
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
   
}
//detectObj();