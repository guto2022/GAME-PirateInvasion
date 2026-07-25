class Boat {
  constructor(x, y, width, height, boatPos, boatAnimation) {
    var options = {
      restitution: 0.8,
      friction: 1.0,
      density: 1.0
    };

    this.animation = boatAnimation;
    this.speed = 0.05;
    this.body = Bodies.rectangle(x, y, width, height, options);
    this.width = width;
    this.height = height;

    this.boatPosition = boatPos;
    this.isBroken = false;

    World.add(world, this.body);
  }

  animate() {
    this.speed += 0.05;
  }

  remove(index, brokenAnimation) {
    // Atualiza a animação com a quebrada que veio do sketch.js
    if (brokenAnimation) {
      this.animation = brokenAnimation;
    }
    this.speed = 0.05;

    // Mantém as dimensões fixas em 300x300 e ajusta a posição vertical para não encolher
    this.width = 300;
    this.height = 300;
    this.boatPosition = -60; 

    this.isBroken = true;

    setTimeout(() => {
      if (boats[index]) {
        Matter.World.remove(world, boats[index].body);
        delete boats[index];
      }
    }, 2000);
  }

  display() {
    var angle = this.body.angle;
    var pos = this.body.position;

    var i = floor(this.speed % this.animation.length);

    push();
    translate(pos.x, pos.y);
    rotate(angle);

    imageMode(CENTER);
    // Força o desenho fixo em 300x300
    image(this.animation[i], 0, this.boatPosition, 300, 300);
    
    noTint();
    pop();
  }
}