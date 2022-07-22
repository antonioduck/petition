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
    let CountSigners;
    db.countSignatures()
      .then((results) => {
        CountSigners = results.rows[0];
        console.log(CountSigners);
      })
      .then(() => {
        return db.getSignaturesById(req.session.signatureId);
      })
      .then((results) => {
        const signer = results.rows[0];
        // console.log(signer);
        res.render("thank-you", {
          signers: CountSigners.count,
          signature: signer.signature,
        });
      });
  } else {
    res.render("petition", { title: " welcome to my petition" });
  }
});

app.post("/petition", (req, res) => {
  const data = req.body;
  console.log(data);
  const userID = req.session.userID;
  db.addSignature(data.signature, userID)
    .then((Newdata) => {
      console.log("addSignature worked");
      //set the cookie
      res.cookie("signed", 1);
      //redirect if successful

      req.session.signatureId = Newdata.rows[0].id;
      res.redirect("/thank-you");
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

app.get("/thank-you", (req, res) => {
  let CountSigners;
  db.countSignatures()
    .then((results) => {
      CountSigners = results.rows[0];
      console.log(CountSigners);
    })
    .then(() => {
      return db.getSignaturesById(req.session.signatureId);
    })
    .then((results) => {
      const signer = results.rows[0];
      // console.log(signer);
      res.render("thank-you", {
        signers: CountSigners.count,
        signature: signer.signature,
      });
    });
});

app.get("/signers", (req, res) => {
  db.getSigners()
    .then((result) => {
      if (req.session.userID && req.session.signatureId) {
        console.log("Succesfully signed!");
        // console.log("result.rows.length: ", result.rows.length);
        console.log("result.rows: ", result.rows);
        res.render("signers", {
          layouts: "main",
          signers: result.rows,
        });
      } else {
        console.log("tried to enter '/signers' route without signing petition");
        res.redirect("/petition");
      }
    })
    .catch((err) => console.log("err in getSigners: ", err));
});

app.get("/signers/:city", (req, res) => {
  //console.log("req.params.city: ", req.params.city);
  const city = req.params.city;
  console.log(city);
  console.log("req.body: ", req.body);

  db.getSigners(city)
    .then((result) => {
      if (req.session.userID && req.session.signatureId) {
        console.log("Succesfully signed!");
        // console.log("result.rows.length: ", result.rows.length);
        console.log("result.rows: ", result.rows);
        res.render("signersCity", {
          signers: result.rows,
        });
      } else {
        console.log("tried to enter '/signers' route without signing petition");
        res.redirect("/petition");
      }
    })
    .catch((err) => console.log("err in getSigners: ", err));
});

app.get("/register", (req, res) => {
  // if (){}
  res.render("register", { title: "Lets register" });
});

app.post("/register", (req, res) => {
  const data = req.body;
  //console.log(data);
  db.insertUser(data.first, data.last, data.email, data.password)
    .then((result) => {
      console.log("registration worked");
      console.log(result);
      // log result, find the user id value, and store it in a cookie!\

      //res.cookie("registered_user_cookie", result.rows[0].id);
      req.session.userID = result.rows[0].id;
      res.redirect("/profile");
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
  const { email, password } = req.body;
  db.authenticateUser(email, password)
    .then((user) => {
      console.log("logged in ");
      console.log(user);
      // req.session.userID = result.rows[0].id;
      req.session.userID = user.id;

      res.redirect("/profile");
    })
    .catch((err) => {
      console.log("err", err);
      res.render("login");
      message: "Login failed";
    });
});

app.get("/profile", (req, res) => {
  res.render("profile", { title: "Lets Log in" });
});

app.post("/profile", (req, res) => {
  const data = req.body;
  const userID = req.session.userID;
  const age = data.age || null;
  db.insertProfileInfo(data.homepage, data.city, data.age, userID)

    .then(() => {
      console.log("profile registration worked");
      res.redirect("/petition");
    })

    .catch((err) => {
      console.log("An error occured", err);
      const error = {
        message: "something went wrong !",
      };
    });
});

app.get("/profile/edit", (req, res) => {
  res.render("profile-edit", { title: "lets modify the profile" });
});
// app.post("/profile/edit", (req, res) => {
//     // 1. Update the users table
//         // a. with password
//             // db.updateUserWithPassword
//                 // Make sure you hash the password first.
//         // b. without password
//             // db.updateUserWithoutPassword
//     // 2. Update the profiles table
//         // a. we already have profile info
//         // b. no profile info yet
//         // ➡️ Use an UPSERT query

//     let userUpdatePromise;

//     if(password) {
//         userUpdatePromise = db.updateUserWithPassword(...)
//     } else {
//         userUpdatePromise = db.updateUserWithoutPassword(...)
//     }

//     userUpdatePromise.then(() => {
//         return db.upsertProfile(...)
//     }).then(() => {
//         res.redirect("/petition")
//     }).catch((err) => {
//         console.log(err)
//     })

//     // If you feel adventorous, try to do this with Promise.all()
// })

app.get("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});
app.listen(8080, () => console.log("petition server is listening ..."));
