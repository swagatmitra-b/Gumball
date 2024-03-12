const canvas = document.getElementById("canvas");
const scoreBoard = document.querySelector(".score");
const towerBoard = document.querySelector(".tower");
const boostBoard = document.querySelector(".boost");

const ctx = canvas.getContext("2d");

let canvasWidth = innerWidth;
let canvasHeight = innerHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const camera = {
  x: 0,
  y: 0,
};

let keypressed = [];
let count = 0;
let score = 0;
let boost = 0;
let tower = new Set();
let active = true;

const protaColors = ["#d90947", "#cc5679", "#cf7c95", "#d6a5b4"];

class GumBall {
  constructor(x, y, radius, color) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.color = color;
    this.radius = radius;
    this.speed = 1.8;
  }

  move(direction) {
    switch (direction) {
      case "w":
        this.velocity.y = -this.speed;
        break;
      case "s":
        this.velocity.y = this.speed;
        break;
      case "a":
        this.velocity.x = -this.speed;
        break;
      case "d":
        this.velocity.x = this.speed;
        break;
    }
  }

  stop(direction) {
    switch (direction) {
      case "w":
      case "s":
        this.velocity.y = 0;
        break;
      case "a":
      case "d":
        this.velocity.x = 0;
        break;
    }
  }

  render() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.stroke();
  }

  updateCamera() {
    camera.x += this.velocity.x;
    camera.y += this.velocity.y;
  }

  update() {
    if (
      (this.position.y - this.radius <= 0 && keypressed.includes("w")) ||
      (this.position.y + this.radius >= canvasHeight &&
        keypressed.includes("s"))
    ) {
      this.position.y += 0;
    } else if (
      (this.position.x - this.radius <= 0 && keypressed.includes("a")) ||
      (this.position.x + this.radius >= canvasWidth && keypressed.includes("d"))
    ) {
      this.position.x += 0;
    } else {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
    this.updateCamera();
  }

  updateEvil(x, y) {
    const angle = Math.atan2(y - this.position.y, x - this.position.x);
    const velocityX = Math.cos(angle);
    const velocityY = Math.sin(angle);
    this.position.x += velocityX * (1 / this.radius) * 9;
    this.position.y += velocityY * (1 / this.radius) * 9;
  }
}

class safeHouse {
  constructor(x, y, dimension, color) {
    this.x = x;
    this.y = y;
    this.dimension = dimension;
    this.color = color;
  }
  render() {
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - camera.x,
      this.y - camera.y,
      this.dimension,
      this.dimension
    );
  }
}

const prota = new GumBall(
  canvasWidth / 2,
  canvasHeight / 2,
  10,
  protaColors[0]
);

let evilGumball = [];
const safeHouses = [
  new safeHouse(100 - camera.x, 100 - camera.y, 35, "green"),
  new safeHouse(100 - camera.x, 600 - camera.y, 35, "green"),
  new safeHouse(1400 - camera.x, 600 - camera.y, 35, "green"),
  new safeHouse(1400 - camera.x, 100 - camera.y, 35, "green"),
];

function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  showTowers();
  showBoost();
  for (let house of safeHouses) {
    house.render();
  }
  prota.render();
  prota.update();
  evilGumball.forEach((gumball, idx) => {
    gumball.render();
    gumball.updateEvil(prota.position.x, prota.position.y);
    const centreDistance = Math.hypot(
      prota.position.x - gumball.position.x,
      prota.position.y - gumball.position.y
    );
    const actualDistance =
      Math.floor(centreDistance) - prota.radius - gumball.radius;
    if (actualDistance < 1) {
      evilGumball = evilGumball.filter((_, i) => i != idx);
      count++;
      prota.color = protaColors[count];
    } else if (actualDistance < 3 && actualDistance > 1) {
      score += 5;
    } else if (actualDistance < 10 && actualDistance > 3) {
      score += 3;
    } else if (actualDistance < 15) {
      score += 1;
    }
    scoreBoard.innerText = score;
    boost = Math.floor(score / 50);
    if (count > 3) cancelAnimationFrame();
  });
  checkHouse();
  if (tower.size == 4) {
    const halfLength = Math.ceil(evilGumball.length / 2);
    evilGumball = evilGumball.slice(halfLength, evilGumball.length - 1);
    tower.clear();
    count--;
    if (count < 0) count = 0;
    prota.color = protaColors[count];

    active = !active;
  }
  requestAnimationFrame(animate);
}
animate();

function checkHouse() {
  safeHouses.forEach((house) => {
    const distance = Math.hypot(
      prota.position.x - house.x + camera.x,
      prota.position.y - house.y + camera.y
    );
    const on = 20 <= distance && distance <= 25;
    if (on) {
      if (active) {
        if (!tower.has(house)) house.color = "blue";
      } else {
        if (!tower.has(house)) house.color = "green";
      }
      tower.add(house);
    }
  });
}

function showTowers() {
  towerBoard.innerText = `${tower.size}/4`;
}

function showBoost() {
  boostBoard.innerText = boost;
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
    case "s":
    case "a":
    case "d":
      if (!keypressed.includes(e.key)) keypressed.unshift(e.key);
      prota.move(e.key);
      break;
    case " ":
      if (boost > 0) {
        prota.speed = 3;
        prota.move(keypressed[0]);
      }
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
    case "s":
    case "a":
    case "d":
      prota.stop(e.key);
      keypressed = keypressed.filter((key) => key != e.key);
      break;
    case " ":
      prota.speed = 1.5;
      prota.move(keypressed[0]);
      boost--;
      if (boost < 0) boost = 0;
      else score -= 50;
  }
});

function generateEvilGumball() {
  const posXMax = [prota.position.x - 300, prota.position.x + 300];
  const posXMin = [prota.position.x - 50, prota.position.x + 50];
  const posYMax = [prota.position.y - 300, prota.position.y + 300];
  const posYMin = [prota.position.y - 50, prota.position.y + 50];

  const xMax = Math.floor(Math.random() * 2);
  const xMin = Math.floor(Math.random() * 2);
  const yMax = Math.floor(Math.random() * 2);
  const yMin = Math.floor(Math.random() * 2);

  const posX =
    Math.floor(Math.random() * (posXMax[xMax] - posXMin[xMin])) + posXMin[xMin];
  const posY =
    Math.floor(Math.random() * (posYMax[yMax] - posYMin[yMin])) + posYMin[yMin];
  const radius = Math.floor(Math.random() * (25 - 7)) + 7;
  const eGumball = new GumBall(posX, posY, radius, "gray");
  evilGumball.push(eGumball);
}

setInterval(() => generateEvilGumball(), 1400);
