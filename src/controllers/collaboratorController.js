const express = require('express');
const router = express.Router();
const wikiQueries = require ('../db/queries.wikis.js');
const collaboratorQueries = require("../db/queries.collaborators.js");


module.exports = {

  add(req, res, next) {
    collaboratorQueries.add(req, (err, collaborator) => {
      if(err){
        req.flash("notice", "That user is already a collaborator or does not exist!");
        res.redirect(req.headers.referer);
      }
      else{ res.redirect(req.headers.referer)};
    });
  },

  edit(req, res, next){
    wikiQueries.getWiki(req.params.wikiId, (err, result) => {
      wiki = result["wiki"];
      collaborators = result["collaborators"];
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {
        res.render("collaborators/edit", {wiki, collaborators});

      }
    });
  },

  remove(req, res, next) {
    if(req.user){
      collaboratorQueries.remove(req, (err, collaborator) => {
        if(err){
          req.flash("error", err);
        }
        res.redirect(req.headers.referer);
      });
    } else {
      req.flash("notice", "Please sign in to remove collaborators.");
      res.redirect(req.headers.referer);
    }
  }
}
