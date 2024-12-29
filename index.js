require('dotenv').config();
const dns = require("dns");
const urlparser = require("url");
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });

const schema = new mongoose.Schema({ url: "string" });
const Url = mongoose.model("Url", schema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', (req, res) => {
  const bodyurl = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(bodyurl).hostname,
    (err, address) => {
      if (!address) {
        res.json({ error: "invalid url" });
      } else {
        const url = new Url({ url: req.body.url });
        url.save((err, data) => {
          console.log(data);
          res.json({ original_url: data.url, short_url: data.id });
        });
      }
    });
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if (!data) {
      res.json({ error: "invalid url" });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
