const express = require("express");

const app = express();
const SECRET_KEY = "my_very_secret_key";
const port = 8001;

const layer8_middleware = require("layer8_middleware")

const upload = layer8_middleware.multipart({ dest: "pictures/dynamic" });

app.get("/healthcheck", (req, res) => {
    console.log("Enpoint for testing");
    console.log("req.body: ", req.body);
    res.send("Bro, ur poems coming soon. Relax a little.");
  });

app.use(layer8_middleware.tunnel);

app.use('/media', layer8_middleware.static('pictures'));

app.use('/test', (req, res) => {
    console.log(req.body)
  res.status(200).json({ message: 'Test endpoint' });
});

app.post("/echo", (req, res) => {
    const { message } = req.body;
    console.log(message)
    res.status(200).json(message);
});
  

let counter = 0;
let jsonObjs = [{"number":"one"}, {"number":"two"}, {"number": "three"}]
app.get("/nextjson", (req, res) => {
    counter++;
    let marker = counter % 3;
    console.log("Served: ", jsonObjs[marker]);
    res.status(200).json(jsonObjs[marker]);
});

app.post("/imageupload", upload.single('file'), (req, res) => {
    console.log("You've hit /imageupload")
    const uploadedFile = req.file;

    if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({ 
        message: "File uploaded successfully!",
        url: `${req.protocol}://${req.get('host')}/media/dynamic/${req.file?.name}`
    });

    //delete any images saved...
});
  


app.listen(port, () => {
console.log(
    `\nA mock Service Provider backend is now listening on port ${port}.`
);
});









