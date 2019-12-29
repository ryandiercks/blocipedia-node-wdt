require("dotenv").config();
const userQueries = require("../db/queries.users.js");
const wikiQueries = require("../db/queries.wikis.js");
const passport = require("passport");
const secretKey = process.env.SECRET_KEY;
const publishableKey = process.env.PUBLISHABLE_KEY;
const stripe = require("stripe")(secretKey);

module.exports = {

  signUp(req, res, next){
    res.render("users/signup");
  },

  create(req, res, next){

    let newUser = {
      username:req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if(err){
        req.flash("error", err);
        res.redirect("/users/signup");
      } else {

        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed in!");
          res.redirect("/");
        })
      }
    });
  },

  signInForm(req, res, next){
    res.render("users/signIn");
  },

  signIn(req, res, next){
    passport.authenticate("local")(req, res, function () {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.");
        res.redirect("users/signIn");
      } else {
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    })
  },

  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  },

  show(req, res, next){

    userQueries.getUser(req.params.id, (err, result) => {

      if(err || result.user === undefined){
        req.flash("notice", "No user found with that ID.");
        res.redirect("/");
      } else {

        res.render("users/show", {...result});
      }
    });
  },


  upgradeForm(req, res, next){
    res.render("users/upgrade", {publishableKey});
  },

  upgrade(req, res, next){
    stripe.customers.create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken
    })
    .then((customer) => {
      stripe.charges.create({
        amount: 1500,
        currency: "usd",
        customer: customer.id,
        description: "Blocipedia Premium Membership"
      })
    })
    .then((charge) => {
      userQueries.upgradeUser(req.user.dataValues.id);
    })
  },

  downgradeForm(req, res, next){
    res.render("users/downgradeForm");
  },

  downgrade(req, res, next){
    userQueries.downgrade(req.user.dataValues.id);
    wikiQueries.privateChange(req.user.dataValues.id);
    req.flash("notice", "You no longer have premium membership. Please contact support if this was a mistake.");
    res.redirect("/");
  },

  payment(req, res, next){
    let payment = 1500;
    stripe.customers.create({
      email: req.body.stripeEmail,
      source:req.body.stripeToken,
    }) .then((customer) => {
      stripe.charges.create({
        amount: payment,
        description: "Blocipedia Premium Membership",
        currency: "usd",
        customer: customer.id,
      })
    }) .then((charge) => {
      userQueries.upgrade(req.user.dataValues.id);
      req.flash("notice", "You now have premium membership!");
      res.redirect("/");
    })
  },

  showCollaborations(req, res, next){
    userQueries.getUser(req.user.id, (err, result) => {
      user = result["user"];
      collaborations = result["collaborations"];
      if(err || user == null){
        res.redirect(404, "/");
      } else {
        res.render("users/collaborations", {user, collaborations});
      }
    });
  }

}
