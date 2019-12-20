
$("#scrapeBtn").on("click", function(event) {
    event.preventDefault();
    
    $.ajax({
      method: "GET",
      url: "/scrape",
      success: function() {
        $('#scrapeModal').modal('show');
      }
    })
});

//When the scrape modal is closed, then refresh the page,
//hopefully this gives the scrape enough time to finish populating articles
$("#scrapeModal").on("hidden.bs.modal", function() {
  location.reload();
});

$("#clearArticlesBtn").on("click", function() {
  $.ajax({
    method: "GET",
    url: "/clearall",
    success: location.reload()
  })
});

$("#clearSavedArticlesBtn").on("click", function() {
  $.ajax({
    method: "GET",
    url: "/clearallsaved",
    success: location.reload()
  })
});

$(".saveBtn").on("click", function() {

    var thisId = $(this).attr("data-id");
    console.log(thisId);

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/savearticle/" + thisId,
    success: function() {
    console.log('hello world', thisId)
    $.ajax({
      method: "GET",
      url: "/deletearticle/" + thisId,
      success: location.reload()
    })
  }
    
  });

});

$(".noteBtn").on("click", function() {

  $("#notesTitle").empty()
  $("#notesBody").empty()
  let thisId = $(this).attr("data-id")
  console.log("Article id: " + thisId)

   // Now make an ajax call for the Article
   $.ajax({
    method: "GET",
    url: "/notes/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data)
      $("#notesTitle").append("<h5>" + data.title + "</h5>")
    })

})


$(".deleteBtn").on("click", function() {
  event.preventDefault();
  let thisId = $(this).attr("data-id");
  console.log(thisId);

// Now make an ajax call for the Article
$.ajax({
  method: "GET",
  url: "/deletesavedarticle/" + thisId,
  success: location.reload()
})

})