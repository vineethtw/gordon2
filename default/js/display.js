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

function Tweet(id, message, profile_image, media_url, user){
    var self = this;
    self.id = id;
    self.message = message;
    self.profile_image = profile_image;
    self.media_url = null;

    if (media_url !=null && media_url.length>=1){
        self.media_url = media_url[0];
    }
    self.user = user;
}

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
        return self._tweets[0];
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
        window.setInterval(function(){
            var tweet = tweets.getATweet();
            display(tweet);
        }, 10000);
    });
};

function display(tweet) {
    var modal = new jBox('Modal', {content: tweet.message});
    modal.open();

}

function updateOnceMore(tweets)   {
    var fetcher = new TweetFetcher('http://localhost:3000/tweets/fetch');
    fetcher.fetchSince(function(data){
        var newTweets = new Tweets(data);

    }, tweets.getLastTweetId());
}
