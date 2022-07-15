const express = require("express");
const app = express();
const bd = require("./db");

const hb = require("express-handlebars");

app.engine("handlebars", hb.engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.redirect("/petition");
});

app.get("/petition", (req, res) => {
  res.render("petition", { title: "My Petition" });
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
