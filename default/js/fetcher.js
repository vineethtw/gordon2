function TweetFetcher(url)    {
    var self = this;
    self.url = url;


    self.fetch = function(callback) {
        $.getJSON(self.url, function(data) {
            callback(data);
        });
    };

    self.fetchSince = function(sinceId, callback) {
            var urlToFire = String.format("{0}?since={1}", self.url, sinceId);
            $.getJSON(urlToFire, function(data) {
                callback(data);
            });
        };

};