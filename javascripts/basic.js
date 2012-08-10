$(function() {
  $("#container").chaos({
    padding: 5
  });

  $("#mess").click(function(e) {
    e.preventDefault();
    Page.activateButton(this);
    $(".atom").removeClass("hide");
    $("#container").chaos().original();
  });

  $("#organize").click(function(e) {
    e.preventDefault();
    Page.activateButton(this);
    $(".atom").removeClass("hide");
    $("#container").chaos().organize();
  });

  $("#organize-reverse").click(function(e) {
    e.preventDefault();
    Page.activateButton(this);
    $(".atom").removeClass("hide");
    $("#container").chaos().organize({order: "reverse"});
  });

  $(".filter .button").click(function(e) {
    e.preventDefault();
    Page.activateButton(this);
    var cssClass = "." + $(this).attr("id");

    $("#container").chaos().organize({
      selector: cssClass,
      beforeAnimation: function() {
        $(".atom").addClass("hide");
        $(cssClass).removeClass("hide");
      }
    });
  });
});