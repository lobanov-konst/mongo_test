var express = require('express');
var router = express.Router();
var mongoose = require('../libs/mongoose');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/summary', function (req, res, next) {
    var _date = new Date();
    _date.setDate(_date.getDate() - 1);
    mongoose.model('measure').find({"time": {"$lt": _date}}, function (err, res) {
        console.log(res)
    });
    mongoose.model('measure').aggregate(
        [
            {
                "$group": {
                    "_id": {
                        "hour": {"$hour": "$time"}
                        //"interval": {
                        //    "$subtract": [
                        //        {"$second": "$time"},
                        //        {"$mod": [{"$second": "$time"}, 24 * 60 * 60]}
                        //    ]
                        //}
                    },
                    "max_time": {"$max": "$time"},
                    "min_time": {"$min": "$time"},
                    "max_cpu": {"$max": "$cpu"},
                    "min_cpu": {"$min": "$cpu"},
                    "avg_cpu": {"$avg": "$cpu"},
                    "max_mem": {"$max": "$mem"},
                    "min_mem": {"$min": "$mem"},
                    "avg_mem": {"$avg": "$mem"}
                }
            },
            {
                "$sort": {"max_time": 1}
            },
            {
                "$project": {
                    "_id": 0,
                    "interval": {"start": "$max_time", "end": "$min_time"},
                    "cpu": {"max": "$max_cpu", "min": "$min_cpu", "avg": "$avg_cpu"},
                    "mem": {"max": "$max_mem", "min": "$min_mem", "avg": "$avg_mem"}
                }
            }
        ],
        function (err, result) {
            res.send(result);
        }
    );
});

module.exports = router;
