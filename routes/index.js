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
const mdl = require("../middleware/index");


function handleResponse(res, code, data) {
  var msg, cod;
  switch (code) {
    case 1:
      cod = 1;
      msg = "Los medios sociales son los siguientes";
  }

  res.status(200).send({
    code: cod,
    msg: msg,
    data: data
  });
}

router.route("/getSocial").get(mdl.validateSocial, (req, res) => {
  var type = req.query.type;
  var cant = 2;
  if (Number(type) > 1) {
    cant = 100;
  }
  var promises = [];
  var lang = req.query.lang.split(",");
  var networks = req.query.networks.split(",");
  var finds = Combinatorics.cartesianProduct(lang, networks).toArray();
  for (var i = 0; i < finds.length; i++) {
    promises.push(getPromise(finds[i][0], finds[i][1], req.query.search, cant));
    if (i === finds.length - 1) {
      Promise.all(promises)
        .then(function (ress) {
          var rsar = concatResponse(ress);
          var cls = Array(rsar);
          handleResponse(res, 1, getResponse(cls, networks));
        }).catch((err) => {
          res.send({
            cod: 0,
            msg: "Intentar de nuevo , revisar parámetros"
          });
        });;
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

      if (!(arch.meta.http_code === 200)) {
        reject(arch.meta);
        return;
      }
      var json = arch.posts;
      var response = [];
      if (json.length > 0) {
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
      } else {
        resolve(response);
      }


    });
  });
}

router.route('/getNews').get(mdl.validateNews, (req, res) => {
  var search = req.query.search;
  var type = req.query.type;

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
      if (getTrueSearch(json[0])) {
        for (var i = 0; i < json.length; i++) {
          if (i < json.length - 1) {
            response.push(getNewsResponse(json[i]));
          }
          if (i === json.length - 2) {
            if (response.length > 0) {
              if (Number(type) === 1) {
                handleResponse(res, 1, response.slice(0, 9));
                return;
              }
              handleResponse(res, 1, response);
              return;
            }
            handleResponse(res, 1, response);
          }
        }
      } else {
        handleResponse(res, 1, response);
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

function getTrueSearch(json) {
  console.log()
  try {
    if (json.children[0].children[0].children[0].children[0].content.search("no produjo") > 0) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    return true;
  }


}


router.get("/test", (req, res) => {
  res.send("ok");
});


module.exports = router;