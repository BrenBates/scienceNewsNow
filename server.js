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

// If deployed, use the deployed database.  Otherwise use the local host

// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scienceNews"

// , { useNewUrlParser: true }
// Connect to the Mongo DB
mongoose.connect(
    process.env.MONGODB_URI ||
    "mongodb://user:password1@ds149593.mlab.com:49593/heroku_xh5tsl9m",
    {
        useMongoClient: true
    }
    );

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.sciencenews.org/all-stories").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

    let articleCount = 0;
    
      // Now, we grab every h2 within an article tag, and do the following:
      $("div p").each(function(i, element) {
        // Save an empty result object
       
        let result = {};
    
        // Add the text and href of every link, and save them as properties of the result object
            
            result.title = $(this).parent().children("h3").children("a").text().trim();
            result.link = $(this).parent().children("h3").children("a").attr("href");
            result.summary = $(this).text().trim();
        
        // Create a new Article using the `result` object built from scraping

        if(result.title !== '') {
             db.Article.remove()
            .then(function() {
           
                db.Article.create(result)
                .then(function(dbArticle) {
                //toggle the article count 
                articleCount++;
               
                })
                .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
                });
            })

        }
       

      })
  
      // Send a message to the client
      res.sendStatus(200);
    });
  });

// Routes

app.get("/", function(req,res) {

    db.Article.find({})
    .then(function(dbArticles) {
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
    db.savedArticle.find({})
    .then(function(dbSavedArticles) {
       
        let hbsObject = {
            savedArticles: dbSavedArticles
        }
        res.render("savedarticles",hbsObject);
    })
    .catch(function(err) {
        res.json(err);
    });

})

app.get("/clearall", function(req,res) {
    db.Article.remove()
    .catch(function(err) {
        res.json(err);
    });
})

app.get("/clearallsaved", function(req,res) {
    db.savedArticle.remove()
    .catch(function(err) {
        res.json(err);
    });
})

// Get route for notes.  When the user clicks on the note button for a saved article this will trigger.
app.get("/notes/:id", function(req,res) {
     console.log(req.params.id)
    db.savedArticle.findOne({
        _id: req.params.id
    })
     .populate("note")
    .then(function(dbArticle) {
        console.log(dbArticle)
        res.send(dbArticle)
        // res.json(dbArticle)
    })
    .catch(function(err) {
        res.json(err);
    });

});

// Post route for adding a new note.  When the user clicks to save a new note in the notes modal this will trigger.
app.post("/notes/:id", function(req,res) {

   db.Note.create(req.body)
    .then(function(dbNote) {
        console.log('this is the new note', dbNote)
        return db.savedArticle.findOneAndUpdate(
            {_id: req.params.id},
            {note:dbNote._id},
            {new:true}
        );
    })
    .then(function(dbSavedArticle) {
        console.log('this is the saved article', dbSavedArticle)
        res.json(dbSavedArticle);
    })
    .catch(function(err) {
        res.json(err);
    })

})

app.get("/savearticle/:id", function(req,res) {

    db.Article.findOne({
        _id: req.params.id
    }).then(function(dbArticle) {
        var saveResult = {};

        saveResult.title = dbArticle.title
        saveResult.link = dbArticle.link
        saveResult.summary = dbArticle.summary
        
        db.savedArticle.create(saveResult).then(function(dbSaved) {
            console.log('save success')
            res.sendStatus(200);
        })
        .catch(function(err) {
            res.json(err);
        });
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/deletearticle/:id", function(req,res) {

    db.Article.deleteOne({
        _id: req.params.id
    }).then(function(dbDeletedArticle) {
       console.log('deleted',dbDeletedArticle)
        })
        .catch(function(err) {
            res.json(err);
        });
});

app.get("/deletesavedarticle/:id", function(req,res) {

    db.savedArticle.deleteOne({
        _id: req.params.id
    }).then(function(dbDeletedArticle) {
       console.log('deleted',dbDeletedArticle)
        })
        .catch(function(err) {
            res.json(err);
        });
});


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  