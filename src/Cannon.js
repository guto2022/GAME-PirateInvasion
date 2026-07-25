class Cannon {
  constructor(x, y, width, height, angle) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.cannon_image = loadImage("assets/canon.png");
    this.cannon_base = loadImage("assets/cannonBase.png");
  }

  display() {
    if (keyIsDown(DOWN_ARROW) && this.angle < 70) {
      this.angle += 1;
    }

    if (keyIsDown(UP_ARROW) && this.angle > -30) {
      this.angle -= 1;
    }

    // 1. DESENHA O TUBO DO CANHÃO (que gira)
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    imageMode(CENTER);
    // Desenhamos no ponto (0, 0) para girar no próprio centro!
    image(this.cannon_image, 0, 0, this.width, this.height);
    pop();

    // 2. DESENHA A BASE DO CANHÃO (fictícia/estática)
    push();
    imageMode(CENTER);
    // A base fica logo abaixo da origem do canhão
    image(this.cannon_base, this.x - 30, this.y - 20, this.width * 1.25, this.height * 1.5);
    pop();
    
    noFill();
  }
}