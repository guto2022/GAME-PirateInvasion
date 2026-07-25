const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon;
var balls = [];
var boats = [];
var score = 0;

// --- ESTADOS DE JOGO ---
var PLAY = 1;
var END = 0;
var gameState = PLAY;

// Variáveis da vida e limite da montanha (x = 600)
var towerHealth = 100;
var invisibleWallX = 600; 

var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

function preload() {
  backgroundImg = loadImage("assets/background.gif");
  towerImage = loadImage("assets/tower.png");
  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");

  brokenBoatSpritedata = loadJSON("assets/boat/brokenBoat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/brokenBoat.png");

  waterSplashSpritedata = loadJSON("assets/waterSplash/waterSplash.json");
  waterSplashSpritesheet = loadImage("assets/waterSplash/waterSplash.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  engine = Engine.create();
  world = engine.world;

  angleMode(DEGREES);
  angle = 15;

  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(250, height - 700, 260, 200, angle);

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);

  if (gameState === PLAY) {
    Engine.update(engine);

    showBoats();

    for (var i = 0; i < balls.length; i++) {
      showCannonBalls(balls[i], i);
      collisionWithBoat(i);
    }

    if (towerHealth <= 0) {
      towerHealth = 0;
      gameState = END;
    }
  } else if (gameState === END) {
    // Desenha o estado estático do jogo
    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) boats[i].display();
    }
    for (var i = 0; i < balls.length; i++) {
      if (balls[i]) balls[i].display();
    }
  }

  // Chão
  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  // Torre
  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 50, height - 775, 240, 465);
  pop();

  cannon.display();

  // Vida da Torre
  fill("#6d4c41");
  textSize(40);
  text("Vida da Torre: " + towerHealth, 40, 60);

  // Tela de Fim de Jogo
  if (gameState === END) {
    showGameOverScreen();
  }
}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided && !boats[i].isBroken) {
        // Passa a animação de destruição diretamente
        boats[i].remove(i, brokenBoatAnimation);

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === 32 && gameState === PLAY) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function keyReleased() {
  if (keyCode === 32 && gameState === PLAY) {
    if (balls.length > 0 && balls[balls.length - 1]) {
      balls[balls.length - 1].shoot();
    }
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      ball.remove(index);
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);

      var boat = new Boat(
        width,
        height - 100,
        300,
        300,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        if (boats[i].isBroken) {
          Matter.Body.setVelocity(boats[i].body, { x: 0, y: 0 });
        } else {
          Matter.Body.setVelocity(boats[i].body, { x: -0.9, y: 0 });
        }

        boats[i].display();
        boats[i].animate();

        if (
          boats[i].body.position.x <= invisibleWallX &&
          !boats[i].isBroken
        ) {
          towerHealth -= 25;
          // Passa a animação de destruição na colisão com a parede
          boats[i].remove(i, brokenBoatAnimation);
        }
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 300, 300, -60, boatAnimation);
    boats.push(boat);
  }
}

// --- TELA DE GAME OVER E BOTÃO DE REINICIAR ---
function showGameOverScreen() {
  push();
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  fill("white");
  textAlign(CENTER, CENTER);
  
  textSize(50);
  textStyle(BOLD);
  text("FIM DE JOGO!", width / 2, height / 2 - 80);

  // MENSAGEM PEDIDA: Torre destruída
  textSize(28);
  fill("#ff4444");
  text("A torre foi destruída!", width / 2, height / 2 - 20);

  // BOTÃO DE REINICIAR
  fill("#4CAF50");
  rectMode(CENTER);
  rect(width / 2, height / 2 + 50, 220, 60, 10);

  fill("white");
  textSize(22);
  text("REINICIAR", width / 2, height / 2 + 50);
  pop();
}

function mousePressed() {
  if (gameState === END) {
    if (
      mouseX > width / 2 - 110 &&
      mouseX < width / 2 + 110 &&
      mouseY > height / 2 + 20 &&
      mouseY < height / 2 + 80
    ) {
      resetGame();
    }
  }
}

function resetGame() {
  for (var i = 0; i < boats.length; i++) {
    if (boats[i]) {
      Matter.World.remove(world, boats[i].body);
    }
  }
  for (var i = 0; i < balls.length; i++) {
    if (balls[i]) {
      Matter.World.remove(world, balls[i].body);
    }
  }

  boats = [];
  balls = [];
  towerHealth = 100;
  gameState = PLAY;
}