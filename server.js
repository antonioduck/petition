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
  if (req.session.userID && req.session.signatureId) {
    let CountSigners;
    db.countSignatures()
      .then((results) => {
        CountSigners = results.rows[0];
        console.log(CountSigners);
        return db.getSignaturesByUserId(req.session.userID);
      })

      .then((results) => {
        const signer = results.rows[0];
        // console.log(signer);
        res.redirect("/thank-you");
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
      //res.cookie("signed", 1);
      //redirect if successful
      console.log("new data ", Newdata.rows[0].id);
      req.session.signatureId = Newdata.rows[0].id;
      console.log("new signature made and we are going to the thank u page");
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
  db.countSignatures().then((results) => {
    CountSigners = results.rows[0];
    console.log("these are the total signers", CountSigners);
    db.getSignaturesByUserId(req.session.userID).then((signatures) => {
      console.log("signature in thank-you: ", signatures);
      console.log("req.session", req.session);
      res.render("thank-you", {
        signers: CountSigners.count,
        signatures: signatures.rows[0],
      });
    });
  });
  // .then((results) => {
  //   console.log("these are my results", results);
  //   const signer = results.rows[0];
  //   console.log("signer", signer);

  // });
});

app.get("/signers", (req, res) => {
  db.getSigners()
    .then((result) => {
      // console.log(result);
      if (req.session.userID) {
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
      if (req.session.userID) {
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
          "Something went wrong !!Are you sure , that u filled all fields properly?",
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
      console.log("logged in ", user);
      // console.log(user.rows[0].id);
      // req.session.userID = user.id;
      // if(req.session.userID)
      let userId = user.id;
      req.session.userID = userId;

      db.getSignaturesByUserId(userId)
        .then((results) => {
          console.log("where the f... is the signature", results);
          if (results.rows[0]) {
            console.log(
              "results in post login GetSignaturesById",
              results.rows[0].signature
            );
            //  req.session.signatureId = ;
            res.redirect("/thank-you");
          } else {
            console.log("no signature found , we are going to petition");
            res.redirect("/petition");
          }
        })
        .catch((err) => {
          console.log("err in get signature at login", err);

          res.render("login", { title: "error in login" });
        });
    })
    .catch((err) => {
      console.log("error in logging in ", err);

      const error = {
        message:
          "Something went wrong !!Are you sure , that the e-mail and the password are correct?",
      };
      res.render("login", { title: "Error in login", error });
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
  db.getInfo(req.session.userID).then((result) => {
    res.render("profile-edit", { title: "My title", result: result.rows[0] });
  });
});

app.post("/profile/edit", (req, res) => {
  console.log("my data are ", req.body);

  db.UpdateUserProfile(
    req.body.first,
    req.body.last,
    req.body.email,
    req.session.userID
  ).then((result) => {
    console.log("the profile results are:", result.rows);
    res.redirect("/profile/edit");
  });

  // 1. Update the users table
  // a. with password
  // db.updateUserWithPassword
  // Make sure you hash the password first.
  // b. without password
  // db.updateUserWithoutPassword
  // 2. Update the profiles table
  // a. we already have profile info
  // b. no profile info yet
  // ➡️ Use an UPSERT query

  // let userUpdatePromise;

  // if(password) {
  //     userUpdatePromise = db.updateUserWithPassword(...)
  // } else {
  //     userUpdatePromise = db.updateUserWithoutPassword(...)
  // }

  // userUpdatePromise.then(() => {
  //     return db.upsertProfile(...)
  // }).then(() => {
  //     res.redirect("/petition")
  // }).catch((err) => {
  //     console.log(err)
  // })

  // If you feel adventorous, try to do this with Promise.all()
});

app.get("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/register");
});

app.post("/signature-delete", (req, res) => {
  console.log("We are in signature");
  const userId = req.session.userID;

  db.deleteSignature(userId)
    .then(() => {
      console.log("signature was deleted successfully");
      //update the cookie

      req.session.signatureId = null;
      req.session.message = "Your signature has  successfully deleted. .";

      return res.redirect("/petition");
    })
    .catch((err) => {
      console.log("error in deleting signature", err);
      res.sendStatus(500);
    });
});
app.listen(process.env.PORT || 8080, () =>
  console.log("petition server is listening ...")
);
