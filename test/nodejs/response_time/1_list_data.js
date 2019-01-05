var $ = require("jquery");
var AnalevR = require("../analevr.js");
var config = require("../config.js");

AnalevR.webdis_url = config.webdis_url;

class AnalevRTest {
    constructor(i) {
        this.i = i;
        this.start = Date.now();
    }

    run() {
        AnalevR.session_id = config.sessions[0];
        AnalevR.call({
            'function': "data.get_catalogues", 
            'params': [],    
            'onProgress': (message) => {}, 
            'onFinish': () => {
                
            }, 
            'onSuccess': (message) => {
                var stop = Date.now();
                var time_spent = stop - this.start;
                console.log(this.i + " : " + time_spent + "ms")
            }, 
            'onFailed': (message) => {
                console.log(message)
            }, 
        });
    }
}

for (var i=0; i<1000; i++) {
    var test = new AnalevRTest(i);
    test.run();
}


// AnalevR.webdis_url = config.webdis_url;
// AnalevR.session_id = config.sessions[0];

// var starts = {};
// for (var i=0; i<100; i++) {
//     starts[i] = Date.now();
//     AnalevR.call({
//         'function': "data.get_catalogues", 
//         'params': [],    
//         'onProgress': (message) => {}, 
//         'onFinish': () => {
            
//         }, 
//         'onSuccess': (message) => {
//             var stop = Date.now();
//             var time_spent = stop - starts[i];
//             console.log(i + " : " + time_spent + "ms")
//         }, 
//         'onFailed': (message) => {
//             console.log(message)
//         }, 
//     });
// }