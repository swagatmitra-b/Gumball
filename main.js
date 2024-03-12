const canvas = document.getElementById("canvas");
const scoreBoard = document.querySelector(".score");
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

const protaColors = ["#d90947", "#cc5679", "#cf7c95", "#d6a5b4"];

class GumBall {
  constructor(x, y, radius, color) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.color = color;
    this.radius = radius;
  }

  move(direction) {
    const speed = 1.8;
    switch (direction) {
      case "w":
        this.velocity.y = -speed;
        break;
      case "s":
        this.velocity.y = speed;
        break;
      case "a":
        this.velocity.x = -speed;
        break;
      case "d":
        this.velocity.x = speed;
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
    this.position.x += velocityX * (1 / this.radius) * 12;
    this.position.y += velocityY * (1 / this.radius) * 12;
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
  checkVacancy() {}
}

const prota = new GumBall(
  canvasWidth / 2 + 200,
  canvasHeight / 2,
  10,
  protaColors[0]
);

let evilGumball = [];
const safeHouses = [
  new safeHouse(100 - camera.x, 100 - camera.y, 20, "green"),
  new safeHouse(100 - camera.x, 600 - camera.y, 20, "green"),
  new safeHouse(1400 - camera.x, 600 - camera.y, 20, "green"),
  new safeHouse(1400 - camera.x, 100 - camera.y, 20, "green"),
];

function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
    console.log(score);
    if (count > 3) cancelAnimationFrame();
  });
  requestAnimationFrame(animate);
}
animate();

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
    case "s":
    case "a":
    case "d":
      if (!keypressed.includes(e.key)) keypressed.unshift(e.key);
      prota.move(e.key);
      break;
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

setInterval(() => generateEvilGumball(), 1000);
