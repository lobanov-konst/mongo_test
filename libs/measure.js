/**
 * Created by developer on 24.06.15.
 */
var os = require('os');
var mongoose = require('./mongoose');

function getCPUUsage(type, cpu) {
    var type = type || 'user', /* user | nice | sys | irq */
        cpu = cpu || os.cpus();
    var cpuUsageArr = cpu.map(function (item) {
        return item.times[type];
    });
    return cpuUsageArr.reduce(function (prev, cur) {
        return prev + cur;
    }, 0);
}

var measureModel = mongoose.model('measure', {time: Date, cpu: Number, mem: Number});
function run(timeout) {

    var _date = new Date();
    _date.setDate(_date.getDate() - 1);
    mongoose.model('measure').remove({"time": {"$lt": _date}}, function (err, res) {
    });

    var memUsage = os.freemem() / os.totalmem() * 100,
        cpuUsage = null,
        cpu = os.cpus(),
        cpu1 = {
            'user': getCPUUsage('user', cpu),
            'sys': getCPUUsage('sys', cpu),
            'idle': getCPUUsage('idle', cpu)
        },
        cpu2 = null;
    setTimeout(function () {
        cpu = os.cpus();
        cpu2 = {
            'user': getCPUUsage('user', cpu),
            'sys': getCPUUsage('sys', cpu),
            'idle': getCPUUsage('idle', cpu)
        };
        cpuUsage = (cpu2.user - cpu1.user + cpu2.sys - cpu1.sys) * 100 / (cpu2.user - cpu1.user + cpu2.sys - cpu1.sys + cpu2.idle - cpu1.idle);
        data = new measureModel({time: new Date(), cpu: cpuUsage, mem: memUsage});
        data.save();
        setTimeout(run, timeout || 1000);
    }, 1000);
}


exports.run = run;
