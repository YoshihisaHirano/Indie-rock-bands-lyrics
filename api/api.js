const express = require('express');
const apiRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

apiRouter.param('bandId', (req, res, next, bandId) => {
  db.get(`SELECT * FROM Band WHERE id = ${bandId}`, (err, row) => {
    if(err) next(err);
    else if(row) {
      req.band = row;
      next();
    }
    else res.sendStatus(404);
  })
})

apiRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Band`, (err, rows) => {
    if(err) next(err);
    else res.status(200).json({bands: rows});
  })
});

apiRouter.get('/:bandId/frequent', (req, res, next) => {
  db.all(`SELECT * FROM Word WHERE part_of_speech = 'n' AND band_id = ${req.band.id} AND word NOT LIKE "%\'%" ORDER BY frequency DESC LIMIT 10`, (err, rows) => {
    if(err) next(err);
    else res.status(200).json({words: rows});
  })
});

apiRouter.get('/:bandId/pos', (req, res, next) => {
  db.all(`SELECT part_of_speech, SUM(frequency) AS qty FROM Word WHERE band_id = ${req.band.id} AND part_of_speech != "num" GROUP BY 1 ORDER BY 2 DESC`, (err, rows) => {
    if(err) next(err);
    else res.status(200).json({pos: rows});
  })
});

apiRouter.get('/:bandId/albums', (req, res, next) => {
  db.all(`SELECT * FROM Album WHERE band_id = ${req.band.id} ORDER BY year`, (err, rows) => {
    if(err) next(err);
    else res.status(200).json({albums: rows});
  })
})

apiRouter.get('/:bandId/:char', (req, res, next) => {
    db.all(`SELECT * FROM Word WHERE band_id = ${req.band.id} AND word LIKE "${req.params.char}%" ORDER BY frequency DESC LIMIT 7`, (err, rows) => {
      if(err) next(err);
      else res.status(200).json({freqByPos: rows});
    })
})

module.exports = apiRouter;
