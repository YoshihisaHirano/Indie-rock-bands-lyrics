class Block {
  constructor(x, y, h, w, name) {
    this.x = x;
    this.y = y;
    this.height = h;
    this.width = w;
    this.name = name;
    this.speed = 0.1;
  }

  show(index, colorArr, album) {
    fill(`rgba(${blockColorArr[index]}, 0.9)`);
    if(album) fill(`rgba(${albumColorArr[index]}, 0.7)`);
    noStroke();
    rect(this.x, this.y, this.width, this.height-2);
  }

  move(start, end) {
    if(this.x <= start || this.x + this.width >= end) this.speed *= -1;
    this.x += this.speed;
  }
}

class Bubble {
  constructor(x, y, r, name) {
    this.x = x;
    this.y = y;
    this.radius = r;
    this.name = name;
  }

  show(index, colorArr) {
    fill(`rgba(${bubbleColor[index]}, 0.75)`);
    noStroke();
    ellipseMode(RADIUS);
    ellipse(this.x, this.y, this.radius, this.radius);

      fill(255);
      noStroke();
      textSize(18.5);
      textAlign(CENTER, BASELINE);
      text(this.name, this.x, this.y+7);
  }
}

class Arc {
  constructor(word) {
    this.word = word;
  }

  showWord(index) {
    noStroke();
    fill(250);
    textFont('Courier New');
    textAlign(LEFT, BASELINE);
    textSize(20);
    if(this.word.length > 7) textSize(17);
    text(this.word, width-90, (index + 1) * 31);
  }

  showArc(index) {
    noFill();
    strokeWeight(11-(index/2));
    stroke(`rgba(168, 28, ${index*45}, 1)`);
    ellipseMode(CENTER);
    arc(width-100, 330, height-(index*62)+15, height-(index*62)+15, 180, 269)
  }
}


  class Label {
    constructor(year, name, yearTextSize, nameTextSize, yPosition) {
      this.year = year;
      this.name = name;
      this.yearTextSize = yearTextSize;
      this.nameTextSize = nameTextSize;
      this.yPosition = yPosition;
    }

    showName(index) {
      fill(255);
      noStroke();
      textSize(this.nameTextSize);
      textAlign(LEFT, CENTER);
      text(this.name, 95, this.yPosition);
    }

    showYear(index) {
      fill(255);
      noStroke();
      textSize(this.yearTextSize);
      textAlign(CENTER, CENTER);
      text(this.year, 40, this.yPosition);
    }

  }
