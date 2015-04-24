function Tweet(id, message, profile_image, profile_image_small, media_url, userId) {
    var self = this;

    self.id = id;
    self.message = message;
    self.profile_image = profile_image;
    self.profile_image_small = profile_image_small,
    self.media_url = null;
    self.processedCount = 0;
    self.userId = userId;

    if (media_url !=null && media_url.length>=1) {
        self.media_url = media_url[0];
    };

    self.process = function()  {
        self.processedCount = self.processedCount + 1;
    };

    self.getProfileImage = function(size) {
        return new ProfileImage("img_"+ self.userId, self.profile_image, size)
    };
}