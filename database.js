//This file is for internal use, its goal is to create a sql database of all words used in band's lyriics;
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

//RiTa is used to tag part of speech
const rita = require('rita');
//this is used to read files in Node
const fs = require('fs');
//importing album data from a separate file
const data = require('./data');
//importing folder-file data from a separate files
const dataToProcess = require('./dataToProcess');

//This function returns data from files as a string;
function readFile(fileName) {
  return fs.readFileSync(fileName).toString();
}

//Getting an array of strings where all words are separated by spaces so that they can be tokenized later
function getLyrics(fileArr, folderName) {
  let albums = [];
  for (let file of fileArr) {
    let data = readFile(`bands/${folderName}/${file}.txt`);
    data = data.replace(/\n+/g, ' ');
    let str = data.split(/[.,?!;()…"\n\s\r\t“”]+/).join(" ").toLowerCase();
    str = str.replace(/\[.*\]/g, '');
    albums.push(str);
  }
  return albums;
}

//getting all lyrics from a particular band and saving it to a variable
// const albumsLyricsAm = getLyrics(amFiles, amFolder);

//getting the words and pos count for each album
function addWordCountToAlbums(lyricsByAlbum, bandRef) {
  const datum = data[bandRef];
  for(let i = 0; i < lyricsByAlbum.length; i++) {
      const tokens = lyricsByAlbum[i].split(/\s+/);
      const currAlb = datum[i];
      currAlb.words = {};
      for(let token of tokens) {
        if (/\b\w+\b/.test(token)) {
          let posTag = rita.getPosTags(token, true)[0];
          if (/\d+/.test(token)) posTag = 'num';
          if (posTag === '-') posTag = 'func';

          if(!currAlb.words[posTag]) currAlb.words[posTag] = 1;
          else currAlb.words[posTag] += 1;
        }
      }
  }
  return datum;
}

//creating a dictionary for a particular band
function wordCount(albums, bandName) {

  const dictionary = {};
  for (let i = 0; i < albums.length; i++) {
    const tokens = albums[i].split(/\s+/);
    for (let token of tokens) {
      if (/\b\w+\b/.test(token)) {
        const posTag = rita.getPosTags(token, true)[0];
        if (!dictionary[token]) {
          dictionary[token] = {};

          if (/\d+/.test(token)) dictionary[token].partOfSpeech = 'num';
          else if (posTag === '-') dictionary[token].partOfSpeech = 'func';
          else dictionary[token].partOfSpeech = posTag;

          dictionary[token].word = token;
          dictionary[token].band = data[bandName][i].band;
          dictionary[token].albums = [data[bandName][i].albumName];
          dictionary[token].years = [data[bandName][i].year];
          dictionary[token].frequency = 1;
          dictionary[token].bandId = Object.keys(data).indexOf(bandName) + 1;
        } else if (!dictionary[token].albums.includes(data[bandName][i].albumName)) {
          dictionary[token].albums.push(data[bandName][i].albumName);
          dictionary[token].years.push(data[bandName][i].year);
          dictionary[token].frequency++;
        } else {
          dictionary[token].frequency++;
        }
      }
    }
  }
  const keys = Object.keys(dictionary);
  keys.sort((a, b) => {
    return dictionary[b].frequency - dictionary[a].frequency;
  });
  const sortedDictionary = {};
  for (let key of keys) {
    sortedDictionary[key] = dictionary[key];
  }

  return sortedDictionary;
}

//dictionaries for each band
// const dictionaryAm = wordCount(albumsLyricsAm, 'arcticMonkeys');

//inserting bands into the Band sql table
function addBands(dataObj) {
  const bandArr = [];
  const keys = Object.keys(dataObj);
  for(let key of keys) {
    const bandObj = {
      name: dataObj[key][0].band,
      albumQty: dataObj[key].length
    }

      bandArr.push(bandObj);
  }

  bandArr.map(elt => {
    db.run(`INSERT INTO Band (name, quantity_of_albums) VALUES ("${elt.name}", ${elt.albumQty})`, (err) => {
      if(err) console.log(err);
    })
  })

}

addBands(data);
// TODO: make sure that the correct id goes to each word and each album, now they are corrected through sql query inside the database
// id count does not follow the order of the items in the given data structure

//inserting the dictionaries in the Word sql table
function addDictionary(dictionary) {
  const keys = Object.keys(dictionary);
  const sqlWord = 'INSERT INTO Word (word, part_of_speech, band, years, albums, frequency, album_count, band_id) VALUES ($word, $pos, $band, $years, $albums, $frequency, $count, $bandId)';

  keys.map(key => {
    db.run(sqlWord, {
      $word: dictionary[key].word,
      $pos: dictionary[key].partOfSpeech,
      $band: dictionary[key].band,
      $years: dictionary[key].years.join(', '),
      $albums: dictionary[key].albums.join(', '),
      $count: dictionary[key].albums.length,
      $frequency: dictionary[key].frequency,
      $bandId: dictionary[key].bandId
    }, (err) => {
      if(err) console.log(err);
    })
  })
}

//adding albums to Album table
function addAlbums(albumsObj, bandRef) {
  const albumKeys = Object.keys(albumsObj);
  const bandId = Object.keys(data).indexOf(bandRef)+1;

  const sql = 'INSERT INTO Album (name, year, band, func, num, a, r, v, n, band_id) VALUES ($name, $year, $band, $func, $num, $adj, $adv, $verb, $noun, $bandId)';

  albumKeys.map(key => {
    db.run(sql, {
      $name: albumsObj[key].albumName,
      $year: albumsObj[key].year,
      $band: albumsObj[key].band,
      $bandId: bandId,
      $func: albumsObj[key].words.func,
      $adj: albumsObj[key].words.a,
      $adv: albumsObj[key].words.r,
      $noun: albumsObj[key].words.n,
      $verb: albumsObj[key].words.v,
      $num: albumsObj[key].words.num,
    }, err => {
      if(err) console.log(err);
    })
  })
}

dataToProcess.map(elt => {
  const albumLyrics = getLyrics(elt.files, elt.folder);
  console.log(elt.ref);
  const dictionary = wordCount(albumLyrics, elt.ref);
  const albums = addWordCountToAlbums(albumLyrics, elt.ref);
  addAlbums(albums);
  addDictionary(dictionary);
})
