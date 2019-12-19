console.log('hello world')
$("#scrapeBtn").on("click", function(event) {
    event.preventDefault();
    console.log('inside the click')
    window.location.href = "/scrape"
});