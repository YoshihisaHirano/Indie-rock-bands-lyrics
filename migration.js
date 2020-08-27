const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize((err) => {
  if(err) console.log(err);
  db.run('DROP TABLE IF EXISTS Band', (err) => {
    if(err) console.log(err);
  });
  db.run('CREATE TABLE Band (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, quantity_of_albums INTEGER NOT NULL)', (err) => {
    if(err) console.log(err);
  });
});

db.serialize((err) => {
  if(err) console.log(err);
  db.run('DROP TABLE IF EXISTS Word', (err) => {
    if(err) console.log(err);
  });
  db.run('CREATE TABLE Word (id INTEGER PRIMARY KEY NOT NULL, word TEXT NOT NULL, part_of_speech TEXT NOT NULL, band TEXT NOT NULL, years TEXT NOT NULL, albums TEXT NOT NULL, frequency INTEGER NOT NULL, album_count INTEGER NOT NULL, band_id INTEGER NOT NULL, FOREIGN KEY(band_id) REFERENCES Band(id))',
  (err) => {
    if(err) console.log(err);
  });
});

db.serialize((err) => {
  if(err) console.log(err);
  db.run('DROP TABLE IF EXISTS Album', (err) => {
    if(err) console.log(err);
  });
  db.run('CREATE TABLE Album (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, year INTEGER NOT NULL, band TEXT NOT NULL, func INTEGER NOT NULL, num INTEGER, a INTEGER NOT NULL, r INTEGER NOT NULL, v INTEGER NOT NULL, n INTEGER NOT NULL, band_id INTEGER NOT NULL, FOREIGN KEY(band_id) REFERENCES Band(id))',
  (err) => {
    if(err) console.log(err);
  });
});
