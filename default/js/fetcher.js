function TweetFetcher(url)    {
    var self = this;
    self.url = url;
    self.lastCallTime = null;

    self.fetch = function(callback) {
        if (self.currentCallIsTooSoon())  {
            console.log("Not going to fire call to " +  self.url);
        };

        self.lastCallTime = new Date();
        $.getJSON(self.url, function(data) {
            callback(data);
        });
    };

    self.fetchSince = function(sinceId, callback) {
            var urlToFire = String.format("{0}?since={1}", self.url, sinceId);

            if (self.currentCallIsTooSoon())  {
                console.log("Not going to fire call to " +  urlToFire);
            };
            self.lastCallTime = new Date();
            $.getJSON(urlToFire, function(data) {
                callback(data);
            });
        };

    self.currentCallIsTooSoon = function(){
        if (self.lastCallTime != null)  {
            var timeElapsedSinceLastCall = new Date() - self.lastCallTime;
            if ( timeElapsedSinceLastCall < 60000) {
                return true;
            }
        };
        return false;
    };

};