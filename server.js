const express = require("express");
const app = express();
const db = require("./db");

const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true,
  })
);

app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/petition", (req, res) => {
  if (req.session.signatureId !== undefined) {
    db.getSignaturesById(req.session.signatureId).then((signature) => {
      signature = signature.rows[0];
      console.log(signature);
      res.render("signed", {
        signature: signature.signature,
      });
    });
  } else {
    res.render("petition", { title: " welcome to my petition" });
  }
});

app.post("/petition", (req, res) => {
  const data = req.body;
  console.log(data);
  db.addSignature(data.first, data.last, data.signature)
    .then((Newdata) => {
      console.log("addSignature worked");
      //set the cookie
      res.cookie("signed", 1);
      //redirect if successful

      req.session.signatureId = Newdata.rows[0].id;
      res.redirect("/signed");
    })
    .catch((err) => {
      console.log("An error occured", err);
      const error = {
        message:
          "something went wrong !!Are you sure , that u filled all fields?",
      };

      res.render("petition", {
        title: "Something went wrong . Pls try again",
        error,
      });
    });
});

app.get("/signed", (req, res) => {
  db.getSignaturesById(req.session.signatureId).then((signature) => {
    signature = signature.rows[0];
    console.log(signature);
    res.render("signed", {
      signature: signature.signature,
    });
  });
});

app.get("/signers", (req, res) => {
  res.render("signers", { title: "List of users who signed" });
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Lets register" });
});

app.post("/register", (req, res) => {
  const data = req.body;
  //console.log(data);
  db.insertUser(data.first, data.last, data.email, data.password)
    .then(() => {
      console.log("registration worked");

      res.redirect("/petition");
    })
    .catch((err) => {
      console.log("An error occured", err);
      const error = {
        message:
          "something went wrong !!Are you sure , that u filled all fields properly?",
      };

      res.render("register", {
        title: "Something went wrong . Pls try again",
        error,
      });
    });
});

app.get("/login", (req, res) => {
  res.render("login", { title: "Lets Log in" });
});

app.post("/login", (req, res) => {
  if (true) {
  } else {
    res.render("petition", {
      title: "Welcome to Petition",
    });
  }
});
// app.get("/cities", (req, res) => {
//   db.getCities()
//     .then((results) => {
//       console.log("results from get cities ", results);
//     })
//     .catch((err) => console.log("err in GetCities", err));
// });

// app.post("/add-city", (req, res) => {
//   db.addCity("Cyena", "Equador")
//     .then(() => {
//       console.log("Yea it worked");
//     })
//     .catch((err) => {
//       console.log("err in add city ", err);
//       res.sendStatus(500);
//     });
// });
app.listen(8080, () => console.log("petition server is listening ..."));
