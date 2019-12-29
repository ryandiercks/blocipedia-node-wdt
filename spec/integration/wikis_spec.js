const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/";
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {

  beforeEach((done) => {
    this.user;
    this.wiki;
    sequelize.sync({force: true}).then((res) => {
      User.create({
        username: "Tester",
        email: "test@test.com",
        password: "password",
      })
      .then((user) => {
        this.user = user;
        request.get({
          url: "http://localhost:3000/auth/fake",
          form: {
            id: user.id,
            username: user.name,
            email: user.email
          }
        });

        Wiki.create({
          title: "Computers" ,
          body: "There are a lot of them",
          userId: user.id,
          private: false
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    });
  });

  describe("GET /wikis", () => {

    it("should return a status code 200", (done) => {
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        done();
      });
    });

  });

  describe("POST /wikis/create", () => {
    it("should create new wiki and redirect", (done) => {
      const options = {
        url: `${base}create`,
        form: {
          title: "Cats",
          body: "Cats are nice",
          userId: this.user.id,
          private: false
        }
      };

      request.post(options,
        (err, res, body) => {
          Wiki.findOne({where: {title: "Cats"}})
          .then((wiki) => {
            expect(wiki.title).toBe("Cats");
            expect(wiki.body).toBe("Cats are nice");
            expect(wiki.private).toBe(false);
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });
  });

  describe("POST /wikis/:id/destroy", () => {
    it("should delete wiki with the associated ID", (done) => {
      Wiki.all()
      .then((wikis) => {
        const wikiCountBeforeDelete = wikis.length;
        expect(wikiCountBeforeDelete).toBe(1);
        request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
          Wiki.all()
          .then((wikis) => {
            expect(err).toBeNull();
            expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        });
      })
    });
  });

});
