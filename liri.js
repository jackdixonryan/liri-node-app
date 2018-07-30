var keys = require("./keys.js");
var request = require("request");
var Spotify = require("node-spotify-api");
var fs = require("fs");

var spotify = new Spotify(keys.spotify);
var action = process.argv[2];
var inputArray = [];
var input;

function spotifySearch(songInput){
    spotify.search({ type: 'track', query: songInput, limit: 1 }, function(err, data){
        if (err) console.log(err);
        var songName = data.tracks.items[0].name;
        var albumName = data.tracks.items[0].album.name;
        var artistName = data.tracks.items[0].album.artists[0].name;
        var url = data.tracks.items[0].preview_url;
        fs.appendFile('liri.txt', 
            ("==============================\n" + 
            "SONG NAME: " + songName + "\n" +
            "ALBUM NAME: " + albumName + "\n" + 
            "ARTIST NAME: " + artistName + "\n" +
            "PREVIEW HERE: " + url + "\n" +
            "===============================\n"),
            "utf-8", 
            function(err){
                if (err) console.log(err);
        });
    });
}

for (var i = 3; i < process.argv.length; i++){
    inputArray.push(process.argv[i]);
}

if (inputArray.length === 0){
    inputArray.push("Mr.");
    inputArray.push("Nobody");
}

input = inputArray.join(" ");
console.log(input);

if (action === "spotify"){
    spotifySearch(input);
}

if (action === "movie"){
    request(("http://www.omdbapi.com/?apikey=trilogy&t=" + input), function(error, response, body){
        var rottenBool = false;
        var imdbBool = false;
        var json = JSON.parse(body);
        fs.appendFile("liri.txt", (
            "==============================\n" +
            "TITLE: " + json.Title + "\n" +
            "RELEASED: " + json.Year + "\n"),
            "utf-8", 
            function(err){
            if (err) throw err;
        });
        for (var j = 0; j < json.Ratings.length; j++){
            var rating = json.Ratings[j];
            if (rating.Source === "Rotten Tomatoes"){
                fs.appendFile("liri.txt", ("TOMATOMETER: " + rating.Value + "\n"), "utf-8", function(err){
                    if (err) throw err;
                });
                console.log("TOMATOMETER:", rating.Value);
                rottenBool = true;
            } else if (rating.Source === "Internet Movie Database"){
                fs.appendFile("liri.txt", ("IMDB RATING: " + rating.Value + "\n"), "utf-8", function(err){
                    if (err) throw err;
                });
                console.log("IMDB RATING:", rating.Value);
                imdbBool = true;
            }  
        } 
        if (rottenBool === false){
            var noTom = "No Tomatometer could be found for this movie.\n";
            fs.appendFile("liri.txt", noTom, "utf-8", function(err){
                if (err) throw err;
            })
        }
        if (imdbBool === false){
            noImdb = "No IMDB rating could be found for this movie.\n"
            fs.appendFile("liri.txt", noImdb, "utf-8", function(err){
                if (err) throw err;
            });
        }

        fs.appendFile("liri.txt", (
            "PRODUCED IN: " + json.Country + "\n" +
            "LANGUAGE: " + json.Language + "\n" +
            "STARRING: " + json.Actors + "\n" +
            "PLOT SUMMARY: " + json.Plot + "\n" +
            "===================================\n"
        ), "utf-8", function(err){
            if (err) console.log(err);
        });
        console.log("PRODUCED IN:", json.Country);
        console.log("LANGUAGE:", json.Language);
        console.log("STARRING:", json.Actors);
        console.log("PLOT SUMMARY:", json.Plot);
        //console.log(json);
    });    
}

if (action === "clear"){
    fs.writeFile("liri.txt", "", "utf-8", function(err){
        if (err) console.log(err);
    });
}

if (action === "random"){

    var text = JSON.stringify(fs.readFileSync("random.txt", "utf-8"));
    var randArray = text.split("-");
    console.log(randArray);
    //console.log(text);
    //spotifySearch(text);
    var randSong = randArray[Math.floor(Math.random() * randArray.length)];

    spotifySearch(randSong);

}

if (action === "news"){
    request(("https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=be051ce4a2914a458d75290b6bccb660&q=" + input), function(error, response, body){
        var newsJson = JSON.parse(body);
        for (var y = 0; y < 10; y++){
            var title = newsJson.response.docs[y].headline.main;
            var snippet = JSON.stringify(newsJson.response.docs[y].snippet)
            console.log(snippet);
            fs.appendFile("liri.txt", 
            ("===========================\n" +
            title + "\n" 
            + snippet + "\n" +
            "============================"), "utf-8", function(err){
                if (err) throw err;
            });
        }
    });
}

