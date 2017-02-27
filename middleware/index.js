function handleResponse(res, code, data) {
    var msg, cod, sts = 500;
    switch (code) {
        case 1:
            cod = 9;
            msg = "Completar parametros";
    }

    res.status(sts).send({
        code: cod,
        msg: msg,
        data: data
    });
}

function validateSocial(req, res, next) {
    var lng = req.query.lang;
    var srh = req.query.search;
    var nks = req.query.networks;
    var type = req.query.type;

    if (!(lng && srh && nks && type)) {
        handleResponse(res, 1);
    } else {
        next();
    }
}

function validateNews(req, res, next) {
    var search = req.query.search;
    var type = req.query.type;

    if (!(search && type)) {
        handleResponse(res, 1);
    } else {
        next();
    }
}


module.exports = {
    validateSocial,
    validateNews
}