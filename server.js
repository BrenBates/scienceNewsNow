var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware



// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

//set up handlebars engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scienceNews", { useNewUrlParser: true });

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.sciencenews.org/all-stories").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("div p").each(function(i, element) {
        // Save an empty result object
       
        var result = {};
    
        // Add the text and href of every link, and save them as properties of the result object
            
            result.title = $(this).parent().children("h3").children("a").text().trim();
            result.link = $(this).parent().children("h3").children("a").attr("href");
            result.summary = $(this).text().trim();


        console.log(result)
  
        // Create a new Article using the `result` object built from scraping

        if(result.title !== '') {
            db.Article.remove()
            .then(function() {
           
                db.Article.create(result)
                .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
                })
                .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
                });
            })

        }
       

      });
  
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });

// Routes

app.get("/", function(req,res) {

    db.Article.find({})
    .then(function(dbArticles) {
        console.log(dbArticles)
        let hbsObject = {
            articles: dbArticles
        }
        res.render("index",hbsObject);
    })
    .catch(function(err) {
        res.json(err);
    });
    
});

app.get("/saved", function(req,res) {
    res.render("savedarticles");
})


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  