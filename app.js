var dogecoin = require('node-dogecoin')()
var address,
    bal_old=0,
    delta = 0;

var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(process.env.PORT || 3000);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

exports.init = function() {
    dogecoin.auth('dogecoinrpc','8s7vTQestoRnuahx2dxNtkDMYEAXmHeGgJuqGwYMQzyh'); //.set('host', 'localhost').set({port:22555})

    //retrieve the address or generate a new address
    dogecoin.getAddressesByAccount("toiletpaper", function(err, result) {
        if (err)
            return err;
        if (result.length != 0){
            if (result.length >1)
                console.log("Warning: more than one address exists. Balances may not be correct.");
            address = result[0];
        }
        else
            dogecoin.getNewAddress("toiletpaper", function(err, result) {
                if (err)
                    return err;
                address = result;
                console.log("address to broadcast: " + address);
            })
        console.log("address to broadcast: " + address);
    })
    getbalance(true); //get the initial balance
    setInterval(function(){getbalance(false,updatecredit)}, 5000);
}

//retrieve balance
getbalance = function(init, callback) {
    //retrieve balance
    dogecoin.getBalance("toiletpaper", function(err, result) {

    if (err)
        return err;

    //empty accounts have a composite object as balance.
    if (typeof result === 'number')
        result = result.result;

    if (init)
        bal_old = result;
    else {
        delta = result - bal_old;
        bal_old = result;
    }
    callback();
    })
}

updatecredit = function() {
    if (delta > 0){
        console.log('updatecredit', 'delta:', delta);
        io.sockets.emit('updatecredit', {delta: delta});
    } else {
        console.log('updatecredit', 'no change');
    }
}

exports.init();