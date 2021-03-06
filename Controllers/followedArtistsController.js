
const Artist = require('../Models/artist');
const User = require('../Models/user');


exports.getMyArtists = (req, res, next) => {
    const userId = req.userId;
    Artist
        .find({creator: userId})
        .then(result => {
            res.status(200).json({
                message: 'Artists successfully retrieved!',
                artists: result
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};


exports.postArtist = (req, res, next) => {
    let creator;
    const artist = new Artist({
        name: req.body.name,
        tour: req.body.tour,
        url: req.body.url,
        creator: req.body.userId
    });

    artist
        .save()
        .then(result => {
            return User.findById(req.body.userId);
        })
        .then(user => {
            creator = user;
            user.artists.push(artist);
            return user.save();
        })
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

exports.deleteArtist = (req, res, next) => {
    const artistId = req.body.artistId;
    const userId = req.body.userId;
    Artist
        .findById(artistId)
        .then(artist => {
            if (artist.creator.toString() !== userId) 
            {
                throw new Error('Not authorized!');
            }
            return Artist.findByIdAndRemove(artistId);
        })
        .then(result => {
            return User.findById(req.body.userId);
        })
        .then(user => {
            user.artists.pull(artistId);
            return user.save();
        })
        .then(result => {
            res.status(200).json(
                {
                    message: 'Artist removed from Followed Artists DB!'
                }
            ); 
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};