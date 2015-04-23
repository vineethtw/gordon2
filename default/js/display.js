function BackgroundContainer(id, elementToHold){
    var self = this;
    self.id = id;
    self.container = $(id);

    self.packery = self.container.packery({'itemSelector': elementToHold, 'gutter': 5});

    self.addImage = function(i)   {
        self.container.append(i.html());
        self.container.imagesLoaded(function(){
            self.container.packery('appended', [i.jQueryObject()]);
        });
    };

    /* Might be removed */
    self.updatePictureWall = function(tweetObjects){
        self.clear();
        var sortedTweetObjects = _.sortBy(tweetObjects._tweets, function(tweetObject){
            return tweetObject.processedCount;
        });
        var uniqueTweets = _.uniq(sortedTweetObjects, false, function(t){
            return t.profile_image;
        });

        var grouped = _.groupBy(sortedTweetObjects, function(tweetObject){
            return tweetObject.profile_image;
        });

        var mostTweets = _.uniq(_.sortBy(_.map(_.values(grouped), function(a) {return a.length;})), true);

        var filteredList = _.first(uniqueTweets, 20);

        $.each(filteredList, function(i, twit){
            if (mostTweets != null && mostTweets.length > 1 && grouped[twit.profile_image].length == _.last(mostTweets))
                self.addImage(twit.getProfileImage('bigger'));
            else
                self.addImage(twit.getProfileImage('usual'));
        });
    };

    self.clear = function() {
        self.container.packery('remove', $(elementToHold));
    };

    /* End */
};

function Tweets(tweetJSON)   {
    var self = this;
    self._tweets = [];
    self._currentProcessingLevel = 0;
    self.maxTweetId = 0;

    self.addToTweets = function(tweetCollection){
        $.each(tweetCollection,
                function (index, tweet) {
                    /* Store Maximum Tweet Id for future requests */
                    var tweetId = parseInt(tweet["id"]);
                    if (tweetId > self.maxTweetId){
                        self.maxTweetId = tweetId;
                    }
                    /*Create Tweet objects */
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
    };

    self.addToTweets(tweetJSON);

    self.updateWith = function(newTweetObjects) {
        if (newTweetObjects == null) {
            return;
        }
        self.addToTweets(newTweetObjects);
        self._currentProcessingLevel = 0;
    };

    self.getLastTweetId = function()    {
        return Math.max.apply(Math, $.map(self._tweets, function(t, i) {return t.id}));
    };

    self.getATweet = function() {
        if (_.isEmpty(self._tweets))    {
            return console.log("No tweets. What do I get from where?");
        }

        var nextTweet = self.getTweetForCurrentProcessingLevel();

        if (nextTweet == null)   {
            self._currentProcessingLevel = self.getNextProcessingLevelFromExistingTweets();
            nextTweet = self.getTweetForCurrentProcessingLevel();
        }

        nextTweet.process();
        return nextTweet;
    };

    self.getNextProcessingLevelFromExistingTweets = function(){
        var leastProcessedTweet = _.min(self._tweets, function(t){
            return t.processedCount;
        });
        return leastProcessedTweet.processedCount;
    };

    self.getTweetForCurrentProcessingLevel = function (){
        var unprocessedTweet = _.find(self._tweets, function(t){
            return t.processedCount == self._currentProcessingLevel;
        });
        return unprocessedTweet;
    };

    self.noTweetsToSpeakOf = function() {
        return self._tweets == null || _.isEmpty(self._tweets);
    };

    self.shouldRefill = function()  {
        return self._currentProcessingLevel != 0 || self.noTweetsToSpeakOf() ;
    };

};

$(document).ready(function() {
    console.log("Ready");
    fetchTweetsAndDisplay();
});


function fetchTweetsAndDisplay() {
    var fetcher = new TweetFetcher('http://localhost:4567/search');
    var backgroundContainer = new BackgroundContainer("#backgroundContainer", '.profilePicture');

    var tweets = null;
    fetcher.fetch(function(data)    {

        tweets = new Tweets(data);


        backgroundContainer.updatePictureWall(tweets);

        var display = new Display(fetcher, backgroundContainer);

        window.setInterval(function(){
            display.nextFrom(tweets);
        }, 10000);

    });
};

function Display(fetcher, backgroundContainer) {
    var self = this;
    var source = $("#tweet-message-template").html();
    var clouds = $("#clouds");

    self.fetcher = fetcher;

    self.template = Handlebars.compile(source);

    self.nextFrom = function(tweetsCollection){
        var tweet = tweetsCollection.getATweet();

        if (tweetsCollection.shouldRefill()){
            self.fetcher.fetchSince(tweetsCollection.maxTweetId + 1, function(newTweets){
                tweetsCollection.updateWith(newTweets);
            });
        }

        self.show(tweet);
    };

    self.show = function(tweet){
        clouds.empty();
        var modalTemplate = self.template(tweet);
        clouds.append($(modalTemplate));
    };
}
