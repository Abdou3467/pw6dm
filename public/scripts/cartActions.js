$(".cart").click(function (e) {
  if (confirm("Are you sure you want to remove this from your cart?")) {
    var text = $(this).parent().text();
    $.post(
      "/removeFromCart",
      { bouq_id: parseInt(text.charAt(text.search("Bouquet") + 8)) },
      function (data) {
        alert(data.message);
        location.reload();
      },
      "json"
    );
  } else {
    // do nothing
  }
});


$(".checkout").click(function () { 
  if(confirm("Are you sure you want to order these items?")) {
    $.post("/order", null,
        function (data) {
          alert(data.message);
          location.reload();
        },
        "json"
      );
  } 
  else {
    //do nothing
  } 
});