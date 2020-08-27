let currentId = 1; //the default band_id to initially render data to the screen

//data structures to draw on the canvas
let block = [];
let albumBlock = [];
let albumLabels = [];
let bubbles = [];
let arcsArr = [];

//variables to hold data returned from the database
let posCount;
let frequentByPos;
let mostFrequentWords;
let bandAlbums;
let userInput;

//colors
const colorArr = ['199, 0, 57', '88, 24, 69', '255, 87, 51', '255, 195, 0', '144, 12, 63', '66, 123, 200', '255, 87, 51'];
const albumColorArr = ['99, 46, 143', '156, 42, 136', '144, 45, 166', '75, 45, 166', '43, 42, 156', '43, 42, 189'];
const bubbleColorArr = ['10, 92, 0', '116, 17, 168', '245, 59, 180', '168, 24, 118', '8, 161, 168', '92, 6, 62', '39, 168, 24'];
const bubbleColor = ['242,5,68', '2,15,89','115,2,44', '242,5,116', '189,65,242', '138,3,140', '5,151,242'];
const blockColorArr = ['2,19,115', '122,0,108', '140,3,53', '5,151,242', '115,2,75'];

const mainBlock = {
  x: 600,
  y: 370,
  h: 200,
  w: 200,
  strokeW: 8
};

const bubbleArea = {
  x: 110,
  y: 380,
  h: 215,
  w: 400
};

const albumArea = {
  x: 60,
  y: 50,
  h: 300,
  w: 400
};

//creating html elements with band names
let bandNodesArr = [];
getBands();

async function setup() {
  const cnv = createCanvas(900, 600);
  background(10);
  cnv.parent(container);
  angleMode(DEGREES);
  textFont('Courier New');

    userInput = new CanvasInput({
      canvas: document.getElementById('defaultCanvas0'),
      x: 30,
      y: 410,
      width: 80,
      height: 16,
      maxlength: 3,
      backgroundColor: '#000',
      fontColor: '#fff',
      boxShadow: 'none',
      placeHolder: 'type here',
    })

  mostFrequentWords = await Statistics.getMostPopular(currentId);
  arcsArr = drawMostFrequent(mostFrequentWords); //draws thicker and larger arcs for more popular words

  posCount = await Statistics.getPosCount(currentId);
  block = createBlock(posCount); //creates an array of Block elements

  bandAlbums = await Statistics.getBandsAlbums(currentId);
  albumBlock = createAlbumChart(bandAlbums); //adds bar chart with album word count
  albumLabels = createAlbumLabels(bandAlbums); //adds labels with year and album name to the bar chart

}

function draw() {
      background(10);
      userInput.render();

      showInfo();

  userInput.onkeyup(async () => {
     if(userInput._value) {
       frequentByChar = await Statistics.getPopularByChar(currentId, userInput._value);
       bubbles = createBubbles(frequentByChar); //returns an array of Bubble elements (with words inside)
     }
  });

//changing graphics depending on the bandId
  bandNodesArr.map((elt) => {
    elt.onmouseup = async function() {
      currentId = elt.id;

      //floating pos blocks
      posCount = await Statistics.getPosCount(currentId);
      block = createBlock(posCount); //creates an array of Block elements

      //album bars
      bandAlbums = await Statistics.getBandsAlbums(currentId);
      albumBlock = createAlbumChart(bandAlbums); //adds bar chart with album word count
      albumLabels = createAlbumLabels(bandAlbums); //adds labels with year and album name to the bar chart

      //bubbles with words
      if(userInput._value) {
        frequentByChar = await Statistics.getPopularByChar(currentId, userInput._value);
        bubbles = createBubbles(frequentByChar); //returns an array of Bubble elements (with words inside)
      }

      //drawing arcs with the most frequent words
      mostFrequentWords = await Statistics.getMostPopular(currentId);
      arcsArr = drawMostFrequent(mostFrequentWords); //returns an array of arc elements
    }
  })

  bandNodesArr.map((elt) => {
    if(elt.id === currentId) elt.style.border = '0.5px grey dashed';
    else elt.style.border = 'none';
  })

  if(!bubbles) {
    noStroke();
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("¯\\_(ツ)_/¯ nothing here", bubbleArea.x+100, bubbleArea.y+bubbleArea.h/2)
  } else {
     bubbles.map((elt, index) => elt.show(index, bubbleColorArr)); //drawing bubbles to the canvas
  }

  drawPosAsBlocks(block);//drawing blocks to the canvas
  block.map((elt, index) => {
    elt.move(mainBlock.x, mainBlock.w+mainBlock.x+mainBlock.strokeW);
    elt.show(index, colorArr);
  })

  //draws thicker and larger arcs for more popular words
    arcsArr.map((elt, index) => {
      elt.showWord(index);
      elt.showArc(index);
    })

//drawing album chart to the canvas
  albumBlock.map((elt, index) => {
    let i = index % 6;
    elt.show(i, colorArr, true);
  })

  albumLabels.map((elt, index) => {
    elt.showName(index);
    elt.showYear(index);
  })

}

function drawMostFrequent(dataObj) {
  const arcsArr = [];
  dataObj.words.map((elt, index) => {
    const newArc = new Arc(elt.word);
    arcsArr.push(newArc);
  })
  return arcsArr;
}

function createBlock(obj) {
  const block = [];

  const x = mainBlock.x;
  const y = mainBlock.y;
  const h = mainBlock.h;
  const w = mainBlock.w;
  const strokeW = mainBlock.strokeW;

  const max = obj.pos.reduce((a, b) => ({qty: a.qty + b.qty}));

  obj.pos.map((elt, index) => {
    const eltHeight = (h-strokeW*2)/obj.pos.length;
    const eltWidth = map(elt.qty, 0, max.qty/2, 0, w-strokeW)
    const eltY = y+strokeW+eltHeight*index;
    let eltX = x+strokeW+index*10;
    if(index !== 0) eltX += Math.floor(random(50));
    const name = Statistics.partOfSpeech[elt.part_of_speech]+'s';

    block.push(new Block (eltX, eltY, eltHeight, eltWidth, name));
})

return block;
}

//creating blocks for showing the ratio of pos
function drawPosAsBlocks(blockArr) {

  fill(20);
  strokeWeight(mainBlock.strokeW);
  stroke('rgba(230, 230, 230, 0.6)')
  rect(mainBlock.x-5, mainBlock.y, mainBlock.w+20, mainBlock.h);

  blockArr.map((elt, index) => {
    fill(230);
    noStroke();
    textSize(23);
    textAlign(LEFT, CENTER);
    text(elt.name, mainBlock.x, elt.y+20);

  })
}

//creating bubbles with the most common words starting from the typed letters
function createBubbles(dataObj) {
  const bubbles = [];
  const freqWordsArrF = dataObj.freqByPos;
  if(freqWordsArrF.length == 0) return;
  const shuffled = freqWordsArrF.splice(1, 3);
  const freqWordsArr = freqWordsArrF.concat(shuffled);
  const maxPerPos = freqWordsArr.reduce((a,b) => ({frequency: a.frequency + b.frequency}));

  freqWordsArr.map((elt, index) => {
    const bubbleName = elt.word;
    const bubbleAreaSize = map(elt.frequency*25, 0, maxPerPos.frequency, 0, bubbleArea.w);
    const bubbleRadius = Math.sqrt(bubbleAreaSize); //because it's misleading to bind radius to the data rather than circle's area
    let ellX;
    let ellY;

    if(index === 0) {
     ellX = bubbleArea.x + bubbleRadius;
     ellY = bubbleArea.y + bubbleArea.h*0.6;
    }
    else if(index % 2 === 1) {
      ellX = bubbles[index-1].radius + 15 + bubbles[index-1].x;
      ellY = bubbleArea.y + bubbleRadius + index*2 + 10;
    } else {
      ellX = bubbles[index-1].radius + 10 + bubbles[index-1].x;
      ellY = bubbleArea.y + bubbleArea.h*0.7 - index*3;
    }

    if(index > 1 && bubbles[index-2].name.length*7 > bubbles[index-2].radius) {
      ellX += 20;
      ellY += 30;
    }

    if(ellX + bubbleRadius >= bubbleArea.x + bubbleArea.w - 30) {
      ellX -= bubbleRadius*0.7;
    } else if(ellY + bubbleRadius > 600) {
      ellY -= 10;
    }

    for(let b of bubbles) {
      if(dist(b.x, b.y, ellX, ellY) < b.radius+bubbleRadius) {
        ellX += dist(b.x, b.y, ellX, ellY)*0.5;
        ellY += 10;
      }
    }

    bubbles.push(new Bubble(ellX, ellY, bubbleRadius, bubbleName));
  })

  return bubbles;
}

//creating bar chart for each album
function createAlbumChart(albumData) {
  const step = albumArea.h / albumData.albums.length; //the height of each album's section
  const albumBlockElts = [];
  albumData.albums.map((elt, index) => {

   //creating an array of pos for each album in order to make blocks out of them
    const miniBlockArr = [];
    for(let prop in elt) {
      if(prop !== 'band' && prop !== 'id' && prop !== 'band_id' && prop !== 'name' && prop !== 'year') {
        miniBlockArr.push({name: Statistics.partOfSpeech[prop], qty: elt[prop]})
      }
    }

    miniBlockArr.sort((a,b) => a.qty - b.qty);
    //counting the overal qty of the words in an album
    const wordQty = miniBlockArr.reduce((a, b) => ({qty: a.qty + b.qty}));

    let lastPosition = 90; // a variable to save the last position of a block
    //creating a colored bar for each element of the pos array
    miniBlockArr.map((eltB, i) => {
      let blockH = step*0.75;

      const blockW = eltB.qty/13;
      let blockY = albumArea.y + step*index - 15;

      if(step >= 75) {
        blockH = step*0.45;
        if(step >= 100) blockH = step*0.4;
        else if(step >= 51) blockH = step*0.47;
        blockY = albumArea.y + step*index;
      }

      if(i === 0) {
        blockX = lastPosition;
      }
      else {
        blockX = lastPosition;
        lastPosition += blockW;
      }
      const blocky = new Block(blockX, blockY, blockH, blockW, eltB.name);
      albumBlockElts.push(blocky);
    })

  })

  return albumBlockElts;
}

//adding text (year, album name) for each album
function createAlbumLabels(albumData) {
  const albumLabels = [];
    albumData.albums.map((elt, index) => {
      const step = albumArea.h / albumData.albums.length; //the height of each album's section
      console.log('step: ' + step)
      let yPosition = albumArea.y + step*index;
      if(step >= 74) yPosition = albumArea.y + step*index + 15;
      let nameTextSize;
      let yearTextSize;

      //making sure the text isn't too big
      if(step >= 100) yearTextSize = step/5;
      else if(step >= 74) yearTextSize = step/4;
      else if (step >= 51) nameTextSize = step/3;
      else yearTextSize = step/2.5;

      //making sure the text isn't too big
      if(step >= 100) nameTextSize = step/5;
      else if(step >= 74) nameTextSize = step/4;
      else if (step >= 51) nameTextSize = step/3;
      else nameTextSize = step/2.7;

      const albumLabel = new Label(elt.year, elt.name, yearTextSize, nameTextSize, yPosition);

      albumLabels.push(albumLabel);
    })

    return albumLabels;
}

// TODO: find a more clever way to show info
function showInfo() {
  if(mouseX <= mainBlock.x+mainBlock.w && mouseX >= mainBlock.x && mouseY >= mainBlock.y && mouseY <= mainBlock.y+mainBlock.h) {
    infobox.hidden = false;
    infobox.textContent = 'This section shows the compared part of speech usage in the whole discography of a chosen band';
  } else if(mouseX <= bubbleArea.x+bubbleArea.w && mouseX >= bubbleArea.x && mouseY >= bubbleArea.y && mouseY <= bubbleArea.y+bubbleArea.h) {
    infobox.hidden = false;
    infobox.textContent = 'This section shows the most popular words starting from the given letter';
  } else if(mouseX <= albumArea.x+albumArea.w && mouseX >= albumArea.x && mouseY >= albumArea.y && mouseY <= albumArea.y+albumArea.h) {
    infobox.hidden = false;
    infobox.textContent = 'This section shows album chart representing the quantity of words in band\'s albums. Different colors represent different parts of speech.';
  } else if(mouseX <= 850 && mouseX >= 450 && mouseY >= 25 && mouseY <= 320) {
    infobox.hidden = false;
    infobox.textContent = 'This section shows the most popular noun-like words from band\'s discography';
  } else {
    infobox.textContent = '';
    infobox.hidden = true;
  }
}
