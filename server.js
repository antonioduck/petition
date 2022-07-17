const express = require("express");
const app = express();
const db = require("./db");

const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");

app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.redirect("/petition");
});

app.get("/petition", (req, res) => {
  if (req.cookies.signed === "1") {
    return res.redirect("/signed");
  }
  res.render("petition", { title: "My Petition" });
});

app.post("/petition", (req, res) => {
  const data = req.body;
  console.log(data);
  db.addSignature(data.first, data.last, data.signature)
    .then(() => {
      console.log("addSignature worked");
      //set the cookie
      res.cookie("signed", 1);
      //redirect if successful
      res.redirect("/signed");
    })
    .catch((err) => {
      console.log("An error occured", err);
      const error = {
        message: "Are you sure , that u filled all fields?",
      };

      res.render("petition", {
        title: "Something went wrong . Pls try again",
        error,
      });
    });
});

app.get("/signed", (req, res) => {
  res.render("signed", { title: "My signed users" });
});

app.get("/signers", (req, res) => {
  res.render("signers", { title: "List of users who signed" });
});

app.get("/cities", (req, res) => {
  db.getCities()
    .then((results) => {
      console.log("results from get cities ", results);
    })
    .catch((err) => console.log("err in GetCities", err));
});

app.post("/add-city", (req, res) => {
  db.addCity("Cyena", "Equador")
    .then(() => {
      console.log("Yea it worked");
    })
    .catch((err) => {
      console.log("err in add city ", err);
      res.sendStatus(500);
    });
});
app.listen(8080, () => console.log("petition server is listening ..."));
