$("img").hover(function () {
    $(this).css("cursor", "pointer");
      $(this).addClass('zoom');
    }, function () {
      $(this).removeClass('zoom');
    }
  );