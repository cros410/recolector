
function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
        next: function () {
            if (done) {
                return;
            }
            if (index < iterations) {
                index++;
                func(loop);
            } else {
                done = true;
                callback();
            }
        },
        iteration: function () {
            return index - 1;
        },
        break: function (err) {
            done = true;
            callback(err);
        }
    };
    loop.next();
    return loop;
}

function someFunction(a, b, callback) {
    callback();
}

module.exports = {
    asyncLoop,
    someFunction
}
