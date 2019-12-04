const Artist = require('../Models/artist');


exports.getMyArtists = (req, res, next) => {
    res.status(200).json({message: 'Hello World!'})
};

exports.postArtist = (req, res, next) => {
    const artist = new Artist({
        name: req.body.name,
        genre: req.body.genre,
        url: req.body.url
    });

    artist
        .save()
        .then(result => {
            console.log(result, 'post success');
            res.status(201).json(result);
        })
        .catch(err => {
            console.log(err);
        });
};

exports.deleteArtist = (req, res, next) => {
    res.status(200).json({message: 'Artist removed from your Dashboard!'});
};