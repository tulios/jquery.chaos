$(function() {
  $("#container").chaos();

  $("#mess").click(function(e) {
    e.preventDefault();
    $("#container").chaos().original();
  });

  $("#organize").click(function(e) {
    e.preventDefault();
    $("#container").chaos().organize();
  });

  $("#organize-reverse").click(function(e) {
    e.preventDefault();
    $("#container").chaos().organize({order: "reverse"});
  });
});