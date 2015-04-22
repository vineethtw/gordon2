function BackgroundContainer(id, elementToHold){
    var self = this;
    self.id = id;
    self.container = $(id);
    self.images = [];

    self.addImage = function(i)   {
        self.container.append(i.html());
        self.images.push(i);
    };

    self.show = function()  {
        self.container.imagesLoaded(function(){
            self.container.packery({'itemSelector': elementToHold, 'gutter': 5});
        });
    };
};

function Tweets(tweetJSON)   {
    var self = this;
    self._tweets = [];
    $.each(tweetJSON,
        function (index, tweet) {
        self._tweets.push(
            new Tweet(
                tweet["id"],
                tweet["message"],
                tweet["profile_image_uri"],
                tweet["profile_image_uri_small"],
                tweet["media_uris"],
                tweet['user']
            )
        );
    });

    self.getProfileImages = function()   {
        var profileImages = $.map(self._tweets, function(tweet, i){
            return new ProfileImage("img_"+ tweet.id, tweet.profile_image)
        });
        return profileImages;
    };

    self.getLastTweetId = function()    {
        return Math.max.apply(Math, $.map(self._tweets, function(t, i) {return t.id}));
    };

    self.getATweet = function() {
        var unprocessedTweet = _.find(self._tweets, function(t){
            return t.processedCount == 0;
        });
        unprocessedTweet.process();
        return unprocessedTweet;
    };
};

$(document).ready(function() {
    console.log("Ready");
    fetchTweetsAndDisplay();
});


function fetchTweetsAndDisplay() {
    var fetcher = new TweetFetcher('http://localhost:3000/tweets/fetch');
    var backgroundContainer = new BackgroundContainer("#backgroundContainer", '.profilePicture');

    var tweets = null;
    fetcher.fetch(function(data)    {
        tweets = new Tweets(data);
        $.each(tweets.getProfileImages(), function(i, profileImage){
            backgroundContainer.addImage(profileImage);
        });
        backgroundContainer.show();
        var display = new Display();
        window.setInterval(function(){
            var tweetToShow = tweets.getATweet();
            display.withTweet(tweetToShow);
        }, 10000);
    });
};

function Display() {
    var self = this;
    var source = $("#tweet-message-template").html();
    var clouds = $("#clouds");
    self.template = Handlebars.compile(source);

    self.withTweet = function(tweet){
        clouds.empty();
        var modalTemplate = self.template(tweet);
        clouds.append($(modalTemplate));
    };
}

function updateOnceMore(tweets)   {
    var fetcher = new TweetFetcher('http://localhost:3000/tweets/fetch');
    fetcher.fetchSince(function(data){
        var newTweets = new Tweets(data);
    }, tweets.getLastTweetId());
}
