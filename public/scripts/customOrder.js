$(".buttons[name|='plus']").click(function () {
  let name = $(this).attr("name").split("-")[1];
  let flower = ".quantity[name='q-" + name + "']";
  let price = ".price[name='p-" + name + "']";

  let curr = parseInt($(flower).text());
  $(flower).text(curr + 1);

  let curr_price = parseInt($("#price").text());
  let flow_price = parseInt($(price).text());
  $("#price").text(curr_price + flow_price);
});

$(".buttons[name|='minus']").click(function () {
  let name = $(this).attr("name").split("-")[1];
  let flower = ".quantity[name='q-" + name + "']";

  let price = ".price[name='p-" + name + "']";
  let curr_price = parseInt($("#price").text());
  let curr = parseInt($(flower).text());

  if (curr > 0) {
    let flow_price = parseInt($(price).text());
    $(flower).text(curr - 1);
    $("#price").text(curr_price - flow_price);
  }
});

$("#custom").click(function () {
  let check = parseInt($(".quantity[name|='q']").text());
  if (check === 0) {
    alert("Bouquet Must have at least one flower!!");
  } else {
    if (confirm("Do you want to add the current selection to your cart?")) {
        // BODGE TIME!
        let flowers = [];
        //rose
        let q = parseInt($(".quantity[name='q-rose']").text());
        if(q > 0){
            flowers.push(['rose', q]);
        }

        q = parseInt($(".quantity[name='q-tulip']").text());
        if(q > 0){
            flowers.push(['tulip', q]);
        }

        q = parseInt($(".quantity[name='q-lily']").text());
        if(q > 0){
            flowers.push(['lily', q]);
        }

        q = parseInt($(".quantity[name='q-orchid']").text());
        if(q > 0){
            flowers.push(['orchid', q]);
        }

        q = parseInt($(".quantity[name='q-iris']").text());
        if(q > 0){
            flowers.push(['iris', q]);
        }

        q = parseInt($(".quantity[name='q-sunflower']").text());
        if(q > 0){
            flowers.push(['sunflower', q]);
        }

        $.post("/custom", {flowers},
            function (data) {
                alert(data.message);
                location.reload();
            },
            "json"
        );
    }
  }
});
