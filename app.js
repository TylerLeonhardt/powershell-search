var express = require('express');
var app = express();

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

app.use(express.static('static'));

app.get('/search', function (req, res) {
  client.search({
    index: 'ps',
    body: {
        "_source": ["suggest-name", "description", "download-count"],
        "suggest": {
        "packages-suggest-cmdlets" : {
            "prefix" : req.query.query,
            "completion" : {
                "field" : "suggest-cmdlets"
            }
        },
        "packages-suggest-name" : {
            "prefix" : req.query.query,
            "completion" : {
                "field" : "suggest-name"
            }
        },
        "packages-suggest-tags" : {
            "prefix" : req.query.query,
            "completion" : {
                "field" : "suggest-tags"
            }
        }
    }
    }
  }).then(function (resp) {
      console.log(resp.took);
      var results = new Map();
      resp.suggest["packages-suggest-cmdlets"][0].options.forEach(function(option) {
        results.set(option._id, option);
      });
      resp.suggest["packages-suggest-name"][0].options.forEach(function(option) {
        results.set(option._id, option);
      });
      resp.suggest["packages-suggest-tags"][0].options.forEach(function(option) {
        results.set(option._id, option);
      });

      var data = { data: [...results.values()].sort(function(a, b) { return b._score - a._score }).slice(0,5) }

      res.json(data);
  }, function (err) {
      //console.trace(err.message);
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});