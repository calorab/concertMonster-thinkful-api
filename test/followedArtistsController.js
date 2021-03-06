const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const faker = require('faker');

const User = require('../Models/user');
const Artist = require('../Models/artist');
const {app, runServer, closeServer} = require('../app');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

generateData = () => {
  
  User.create(
    {
      email: faker.internet.email(), 
      password: faker.internet.password()
    }
  )
  .then(user => {
    Artist.create({
        name: "Halsey",
        tour: "2020-06-04",
        url: "http://www.songkick.com/artists/203876-alison-krauss?utm_source=54847&utm_medium=partner",
        creator: user._id 
      })
      .then(artist => {
        Artist.findOne(artist._id).then(artist => console.log('THE ARTIST IN GENERATEDATA ', artist))
      })
      .catch(err => {
        console.log(err);
        return err;
      });
  })
  
    
};

tearDownDb = () => {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Followed Artists Controller', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL).then(() => {
      return generateData();
    });
  });

  after(function() {
    return tearDownDb().then(() => { 
      return closeServer()}); 
  });


  describe('FollowedArtists - GET', function() {
    it('should get all artists followed by creator', function() { 

        User.findOne({email: 'test@test.com'})
          .then(user => {
            let userId = user._id;
            return chai.request(app)
            .get('/followedartists/myartists')
            .send({userId: userId})
            .then(response => {
              res = response.body;
              expect(res).to.have.property('message');
              expect(res).to.be.a('object');
              expect(res.artists).to.have.lengthOf(0);
            });  
          })
    });
  });

  describe('FollowedArtists - POST', function() {
    it('should add an artist to the followed artists of the creator', function() {
        User.find({email: 'test@test.com'})
          .then(user => {
            let userId = user._id; 
            return chai.request(app)
              .post('/followedartists/myartist')
              .send(
                {
                  req: 
                  {
                    body: {
                      name: faker.name.findName(),
                      tour: '2020-10-8',
                      url: faker.internet.url(),
                      userId: userId
                    }
                  }
                }
              )
              .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.artists).to.have.lengthOf(1);
              });  
        });
    });
  });

  describe('FollowedArtists - DELETE', function() { 
    it('Should remove selected artist from database', function() {
  
      Artist.find()
        .then(artist => {
          let userId = artist.creator;
          return chai.request(app)
          .delete('/followedartists/deleteartist')
          .send({userId: userId})
          .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res).to.have.property({ message: 'Artist removed from Followed Artists DB!' });
            expect(res.body.artists).to.have.lengthOf(0);
          }); 
        }); 
    });
  });
});
