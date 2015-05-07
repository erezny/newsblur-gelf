
var log = require('graygelf')({
  host: 'localhost',
  port: 12201
});

var account = {
  username: "",
password: ""
};

var restler = require('restler');
var schedule = require('node-schedule');
var scheduledJobs = {};

log.fields.app = "nodejs";
log.fields.env = "dev";

var signedCookie = null;

var authResponse = function(data, response){
  //console.log(response);
  var logMsg = {
    statusCode: response.statusCode,
    statusMessage: response.statusMessage,
  };
  for (var k in data)
    logMsg[k]=data[k];

  log.info(logMsg);

  scheduledJobs.feedUpdate = schedule.scheduleJob('*/5 * * * *', function(){
    restler.get("https://api.newsblur.com//reader/feeds").on('complete',
      logFeeds);
  });

};

var logFeeds = function(data) {
  for (var i in data.feeds)
  {
    var feed = {
      feed_id: data.feeds[i].id,
      feed_address: data.feeds[i].feed_address,
      feed_title: data.feeds[i].feed_title,
      unread_ng: data.feeds[i].ng,
      unread_nt: data.feeds[i].nt,
      unread_ps: data.feeds[i].ps
    };
      log.info.a("Feed Update", "query stats on " + feed.feed_title, feed);
  }
};

restler.post("https://api.newsblur.com/api/login", {
  data:account}).on('complete', authResponse);
