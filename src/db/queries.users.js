require("dotenv").config();
const User = require("./models").User;
const Wiki = require("./models").Wiki;
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

  createUser(newUser, callback){

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      const msg = {
        to: newUser.email,
        from: 'noreply@blocipedia.com',
        subject: 'Blocipedia Registration',
        text: 'You have been successfully registered for Blocipedia!',
        html: '<strong>Please sign in to begin your Bloci experience</strong>',
      };

      sgMail.send(msg);
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getUser(id, callback){

    let result = {};
    User.findById(id)
    .then((user) => {

      if(!user) {
        callback(404);
      } else {

        result["user"] = user;

        Wiki.scope({method: ["allWikis", id]}).findAll()
        .then((wikis) => {

          result["wikis"] = wikis;
          callback(null, result);

        })
      }
    })
  },

  upgrade(id, callback){
    return User.findById(id)
    .then((user) => {
      if(!user){
        return callback("User does not exist!");
      } else{
      return user.updateAttributes({role: 1});
    }
    }) .catch((err) =>{
      callback(err);
    })
  },

  downgrade(id, callback){
    return User.findById(id)
    .then((user) => {
      if(!user){
        return callback("User does not exist!");
      } else{
        return user.updateAttributes({role: 0})
      }
    }) .catch((err) => {
      callback(err);
    })
  }

}
