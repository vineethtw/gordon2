function ProfileImage (id, url){
    var self = this;

    self.id = id;
    self.url = url;

    self.html = function()  {
        var html = String.format('<img id="{0}" src="{1}" class="profilePicture"/>', self.id, self.url);
        return html;
    };

    self.hide = function(){
        $('#'+id).hide();
    };

    self.show = function(){
        $('#'+id).show();
    };

    self.jQueryObject = function()  {
        return $("#"+id)[0];
    };
};

function ImageRepository(pictureArray) {
    var self = this;
    self.pictures = pictureArray;

    this.getPictures = function(count) {
        return self.pictures;
    };

};