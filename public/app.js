
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
  
  // copy the id over to the data id attribute for the modal save note button for use on that button click
  $("#saveNoteBtn").attr("data-id",thisId)


   // Now make an ajax call for the Article
   $.ajax({
    method: "GET",
    url: "/notes/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log('this is the data')
      console.log(data)

      $("#notesTitle").append('Note for article: ' + data._id);
      $("#notesBody").append(data.note.noteBody);
    })

})

$("#saveNoteBtn").on("click", function() {

   // Grab the id associated with the article from the submit button
   var thisId = $(this).attr("data-id");
   console.log(thisId)
   console.log($("#notesInput").val().trim())

   // Run a POST request to change the note, using what's entered in the inputs
   $.ajax({
     method: "POST",
     url: "/notes/" + thisId,
     data: {
       // Value taken from title input
       noteBody: $("#notesInput").val().trim()
     }
   })
     // With that done
     .then(function(data) {
       // Log the response
       console.log(data);
       // Empty the notes section
       $("#notesInput").val('');
     });
 
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