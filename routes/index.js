'use strict';
const express = require('express');
const router = express.Router();
const API_KEY_SEARCH = "c137257dc620f9c4618f0d6e113fc851";
const request = require("ajax-request");
const cheerio = require('cheerio');
const himalaya = require('himalaya');
const S = require('string');
const Promise = require('promise');
const Combinatorics = require('js-combinatorics');
const Array = require("array");

router.get('/getSocial', function (req, res, next) {
  var lng = req.query.lang;
  var srh = req.query.search;
  var nks = req.query.networks;
  var type = req.query.type;
  if (!(lng && srh && nks && type)) {
    res.send({
      cod: 9,
      msg: "Request inválido"
    });
    return;
  }
  var promises = [];
  var lang = lng.split(",");
  var networks = nks.split(",");
  var finds = Combinatorics.cartesianProduct(lang, networks).toArray();

  for (var i = 0; i < finds.length; i++) {
    promises.push(getPromise(finds[i][0], finds[i][1], srh, "2"));
    if (i === finds.length - 1) {
      Promise.all(promises)
        .then(function (ress) {
          var rsar = concatResponse(ress);
          var cls = Array(rsar);
          res.send(getResponse(cls, networks));
        });
    }
  }
});

function getResponse(array, networks) {
  var response = {};
  for (var i = 0; i < networks.length; i++) {
    response[networks[i]] = array.select({
      red: networks[i]
    });
    if (i === networks.length - 1) {
      return response;
    }
  }
}

function concatResponse(res) {
  var response = [];
  for (var i = 0; i < res.length; i++) {
    if (i === 0) {
      response = res[i];
    } else if (i < res.length) {
      response = response.concat(res[i]);
    }
    if (i === res.length - 1) {
      return response;
    }
  }

}

function getPromise(lang, network, search, limit) {
  return new Promise(function (resolve, reject) {
    request({
      url: 'https://api.social-searcher.com/v2/search',
      method: 'GET',
      data: {
        q: search,
        limit: limit,
        lang: lang,
        network: network,
        key: "c137257dc620f9c4618f0d6e113fc851"
      }
    }, function (err, ress, body) {
      if (err) {
        reject(err);
        return;
      }
      var arch = JSON.parse(body);
      var json = arch.posts;
      var response = [];

      for (var i = 0; i < json.length; i++) {
        response.push({
          red: json[i].network,
          date: json[i].posted,
          text: json[i].text,
          url: json[i].url,
          lang: json[i].lang
        });
        if (i === json.length - 1) {
          resolve(response);
        }
      }
    });
  });
}

router.get('/getNews/:search', function (req, res, next) {
  var search = req.params.search;
  console.log(search);
  request({
    url: 'http://buscamas.pe/' + search + '/',
    method: 'GET',
    data: {
      rnt: "y"
    }
  }, function (err, ress, body) {
    if (err) {
      res.send(err);
    } else {
      var response = [];
      var $ = cheerio.load(body);
      var container = $(".center_col").html();
      var str = S(container).collapseWhitespace().s;
      var str2 = S(str).replaceAll('> <', '><').s;
      var json = himalaya.parse(str2);
      for (var i = 0; i < json.length; i++) {
        if (i < json.length - 1) {
          response.push(getNewsResponse(json[i]));
        }
        if (i === json.length - 2) {
          res.send(response);
        }
      }
    }
  });
});


function getNewsResponse(json) {
  try {
    var img = json.children[0].children[0].children[0].children[0].children[0].attributes.src;
    var href = json.children[0].children[0].children[0].children[0].attributes.href;
    var title = json.children[0].children[0].children[0].children[0].children[0].attributes.title;
    var desc = json.children[0].children[0].children[2].children[0].content;
    if (img.search("default_new_buscamas") > 0) {
      img = json.children[0].children[0].children[0].children[0].children[0].attributes.dataset.original;
    }
  } catch (e) {}
  /*try {
    var img2 = json.children[0].children[0].children[0].children[0].children[0].children[0].attributes.src;
    var href2 = json.children[0].children[0].children[0].children[0].children[0].attributes.href;
    var title2 = json.children[0].children[0].children[0].children[0].children[0].children[0].attributes.title;
    var desc2 = json.children[0].children[0].children[1].children[0].content;
    if (img2.search("default_new_buscamas") > 0) {
      img2 = json.children[0].children[0].children[0].children[0].children[0].children[0].attributes.dataset.original;
    }
  } catch (e) {}*/
  try {
    var img3 = json.children[0].children[0].children[0].children[0].children[0].children[0].children[0].attributes.src;
    var href3 = json.children[0].children[0].children[0].children[0].children[0].children[0].attributes.href;
    var title3 = json.children[0].children[0].children[0].children[0].children[0].children[0].children[0].attributes.title;
    var desc3 = json.children[0].children[0].children[2].children[0].content;
    if (img3.search("default_new_buscamas") > 0) {
      img3 = json.children[0].children[0].children[0].children[0].children[0].children[0].children[0].attributes.dataset.original;
    }
  } catch (e) {}


  if (img) {
    return {
      img: img,
      href: href,
      title: title,
      desc: desc,
      source: json.children[0].children[1].children[0].attributes.className[0].substr(7),
      date: json.children[1].children[1].children[0].content
    };
  }
  /*else if (img2) {
    console.log("img2 : " + i);
    return desc2;
  }*/
  else if (img3) {
    return {
      img: img3,
      href: href3,
      title: title3,
      desc: desc3,
      source: json.children[0].children[1].children[0].attributes.className[0].substr(7),
      date: json.children[1].children[1].children[0].content
    };
  } else {
    return {
      img: "http://cdn.buscamas.e3.pe/f/img/default_new_buscamas.jpg?201607181629",
      href: json.children[0].children[0].children[0].children[0].children[0].attributes.href,
      title: json.children[0].children[0].children[0].children[0].children[0].children[0].content,
      desc: json.children[0].children[0].children[1].children[0].content,
      source: json.children[0].children[1].children[0].attributes.className[0].substr(7),
      date: json.children[1].children[1].children[0].content
    };
  }
}
module.exports = router;