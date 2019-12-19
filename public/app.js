console.log('hello world')
$("#scrapeBtn").on("click", function() {
    console.log('inside the click')
    window.location.href("/scrape")
})