$(function() {

  var FlickrPhoto = function(photo) {
    this.photo = photo;
    this.datetaken = Date.parse(this.photo.datetaken);
    this.width = parseInt(this.photo.o_width || this.photo.width_m, 10);
    this.height = parseInt(this.photo.o_height || this.photo.height_m, 10);

    var ratio = Math.min(1, Math.min(240/this.width, 240/this.height))
    this.width_m = Math.floor(this.width * ratio);
    this.height_m = Math.floor(this.height * ratio);
  }

  FlickrPhoto.prototype = {
    url: function() {
      return 'http://farm' + this.photo.farm + '.static.flickr.com/' +
             this.photo.server + '/' + this.photo.id + '_' + this.photo.secret + "_m.jpg";
    },

    cssClass: function() {
      return this.width_m == 240 ? "width-240" : "height-240";
    },

    cssMonth: function() {
      return "month-" + this.datetaken.toString("MM");
    }
  }

  var displayAvailableMonths = function() {
    var availableMonths = [];
    $(".months .button").each(function() {
      var cssClass = "." + $(this).attr("id");
      if ($(cssClass).length > 0) {
        availableMonths.push(cssClass.replace(/\./, "#"));
      }
    });

    $(availableMonths.join(", ")).fadeIn();
  }

  var currentDate = (2).years().ago().toString("yyyy-MM-dd");

  $("#container").chaos().updateOptions({
    columnWidth: 1,
    padding: 3
  });

  $.ajax({
    url: 'http://api.flickr.com/services/rest/',
    data: {
      format: 'json',
      method: 'flickr.interestingness.getList',
      api_key: '9fe66826c43ba9b5f0fcad780ad75f7b',
      extras: "o_dims, url_m, date_taken",
      date: currentDate,
      per_page: 18
    },
    dataType: 'jsonp',
    jsonp: 'jsoncallback',
    success: function(data) {
      console.log(data);
      $.each(data.photos.photo, function(index, photo) {
        var fPhoto = new FlickrPhoto(photo);

        var atom = $("<div class='atom hide "+fPhoto.cssClass()+" "+fPhoto.cssMonth()+"' style='width: "+fPhoto.width_m+"px; height: "+fPhoto.height_m+"px;'></div>");
        var img = new Image();
        img.width = fPhoto.width_m;
        img.height = fPhoto.height_m;
        img.onload = function() {
          atom.append($(img));
          $("#container").append(atom);
          $("#container").chaos().setup(atom).organize({
            afterElementAnimation: function(element) {
              element.removeClass("hide");
            }
          });
          displayAvailableMonths();
        }
        img.src = fPhoto.url();
      });
    }
  });

});