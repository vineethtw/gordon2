function TweetFetcher(url)    {
    var self = this;
    self.url = url;


    self.fetch = function(callback) {
        $.getJSON(self.url, function(data) {
            callback(data);
        });
    };

    self.fetchSince = function(callback, sinceId) {
            $.getJSON(self.url + String.format("?since={0}", sinceId) , function(data) {
                callback(data);
            });
        };

};