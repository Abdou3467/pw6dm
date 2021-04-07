$('.cart').click(function (e) { 
    if(confirm('Are you sure you want to add this to your cart?')){
        // $.post()
        var text = $(this).parent().text();
        $.post("/addToCart", {bouq_id: parseInt(text.charAt(text.search('Bouquet') + 8))},
            function (data) {
                alert(data.message);
            },
            "json"
        );
    }else {
        console.log('cancelled');
    }
    
});


$('.custom').click(function (e) { 
    location.replace('/CustomOrder');
});