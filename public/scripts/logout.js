// logout button
$("#logout").click(() => {
  $.get("/logout", "", (data) => {
    location.reload();
  });
});

$("#home").click(() => {
     location.replace('/');
});
