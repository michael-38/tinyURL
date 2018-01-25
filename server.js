const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 8080; // .env file yet to be created
const bodyParser = require("body-parser");
const exportedFunctions = require("./app.js");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('randomkey_a1b3c5'))

app.set('view engine', 'ejs');


/*
Database
*/

const allURL =
  {
    "b2xVn2":
    { longURL: "http://www.lighthouselabs.ca",
      id: "user1RandomID"
    },
    "9sm5xK":
    { longURL: "http://www.google.com",
      id: "user2RandomID"
  }
};

const allUsers = {
  "user1RandomID" : {
      id: "user1RandomID",
      email: "user1@example.com",
      password: "1111"
    },
  "user2RandomID" : {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "2222"
    }
};


/*
Middleware
*/



/*
GET Routes
*/




app.get("/", (req, res) => {
  let current_user = req.cookies.user_id
  if (current_user) {
    res.redirect("/urls");
  }
  else {
    res.redirect("/login")
  }
})


app.get("/urls", (req, res) => {
  for (user in allUsers) {
    if (user = req.cookies.user_id) {
  let templateVars = {
  allURL: allURL ,
  user: allUsers[req.cookies.user_id]
  }
  res.render("urls_index", templateVars)
  return;
} else {
  res.status(403).send("unauthorized access");
}
}
})

app.get("/urls/new", (req, res) => {
  for (user in allUsers) {
    if (user = req.cookies.user_id) {
    let templateVars = {  ////declare a variable (which is an object)
    urls: [req.params.id,allURL[req.params.id]], // with key "urls" that contains an array that consists of the shortURL random string (:id) and its corresponding original URL in urlDatabase
    user: allUsers[req.cookies.user_id]
  };
  res.render("urls_new", templateVars); //render the urls_new ejs/html page when a request to /urls/new is received
  return;
} else {
  res.status(403).send("unauthorized access");
}
}
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = allUsers[req.params.shortURL]; //declear a variable that references the urlDatabase (an object), with the key req.params.shortURL
  res.redirect(longURL); //redirect to the original URL
});

app.get("/login", (req, res) => {
  res.render("urls_login");
})

app.get("/register", (req, res) => { //GET route for registration page
  res.render("urls_register"); // render the url_register ejs/html page when a request to /urls/new is received
});



/*
POST Routes
*/

app.post("/register", (req, res) => {
  let emailConflict = 0;
  for (accounts in allUsers) {
    if (req.body.email === accounts.email) {
      emailConflict += 1;
    }
  }
  if((req.body.email.length === 0) || (req.body.password.length === 0)) {
    res.status(400).send("Please enter an email address/password");
  } else if (emailConflict > 0) {
    res.status(400).send("Email already in use");
  } else {
    randomID = exportedFunctions.generateRandomString();
    allUsers[randomID] =
      {
        id: randomID,
        email: req.body.email,
        password: req.body.password
      }
  res.clearCookie("user_id");  //clear username cookie
  res.cookie("user_id", randomID); //set new username cookie
  res.redirect("/urls");
    }
});




function findUserVerifyPassword (userEmail, password) {
  for (user in allUsers) {
    if (allUsers[user].email === userEmail && allUsers[user].password === password) {
      return allUsers[user]
    }
  }
  return false
}

app.post("/login", (req, res) => {

if((req.body.login_email.length === 0) || (req.body.login_password.length === 0)) {
    res.status(400).send("Please enter an email address/password");
  }
const userEmail = req.body.login_email
const password = req.body.login_password

const user = findUserVerifyPassword(userEmail, password);

if (user) {
  // add coookie and redirect
  res.cookie("user_id", user.id);
  res.redirect("/urls");
} else {
  // 401 error
  res.status(401).send("User not found/password incorrect");
}
});






app.post("/logout", (req, res) => {
  res.clearCookie("user_id");  //clear username cookie
  res.redirect("/login");
});

app.post("/urls/new", (req, res) => { //POST route when user clicks Submit button on the urls_new page to create a new short URL
  randomString = exportedFunctions.generateRandomString(); //declare a variable with a randomly generated string
  allURL[randomString] = {
    longURL: req.body.longURL,
    id: req.cookies.user_id
  };
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let templateVars = {
    urls: [req.params.id, allURL[req.params.id]],
    user: allUsers[req.cookies.user_id]
    };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => { //POST route when user clicks Update button on the urls_show page
  allURL[req.params.id] = {
    longURL: req.body.updatedURL,
    id: req.cookies.user_id
    }; //update the urlDatabase with the updatedURL a user inputted
  res.redirect("/urls"); //redirect to the /urls (home) page
});

app.post("/urls/:id/delete", (req, res) => { //POST route when a user clicks Delete button on the urls_index (home) page
  delete allURL[req.params.id]; //delete an entry from urlDatabase
  res.redirect("/urls"); //redirect to the /urls (home) page
});




app.listen(PORT, () => {
  console.log(`Currently listening on port ${PORT}!`); //to indicate server is listening to the correct port
});
