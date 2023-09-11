const canvas = document.querySelector("#canvas");
const fps = 1000 / 50;

//Functions:
// Function to render the player's and computer's scores:
const renderScore = (scorePlayer, scoreComputer) => {
  const playerScore = document.querySelector("#player-score");
  const cpuScore = document.querySelector("#computer-score");
  playerScore.innerHTML = `Your score: ${scorePlayer}`;
  cpuScore.innerHTML = `CPU Score: ${scoreComputer}`;
};
//Classes:
// Class for managing the game:
class Game {
  constructor() {
    // Initialize game objects:
    this.user = new User();
    this.cpu = new Computer();
    this.ball = new Ball();
    this.net = new Net();
    this.board = new Board();
    this.gameLoop;
  }

  //Method update will update position of the ball (x and y) by the velocityX and velocityY, update score
  update() {
    //Update the ball's position
    this.ball.updateBall();
    //Update the computer's paddle to follow the ball:
    this.cpu.controlPaddle(this.ball);
    //If the ball hits the top or bottom of the canvas, reverse its vertical velocity:
    if (this.ball.hitBottom() || this.ball.hitTop()) {
      this.ball.velocityY = -this.ball.velocityY;
    }
    // Check if the ball collides with the player's paddle and adjust the ball's direction.
    if (this.user.isCollision(this.ball.x, this.ball.y, this.ball.radius)) {
      this.ball.changeDirection();
      this.ball.increaseSpeed();
    }
    // Check if the ball collides with the computer's paddle and adjust the ball's direction.
    if (this.cpu.isCollision(this.ball.x, this.ball.y, this.ball.radius)) {
      this.ball.changeDirection();
      this.ball.increaseSpeed();
    }
    // Check if the ball collides with the computer's paddle and adjust the ball's direction.
    const userLost = this.ball.x - this.ball.radius < 0;
    const cpuLost = this.ball.x + this.ball.radius > canvas.width;

    if (userLost) {
      //means that the wall of the user was hit
      this.cpu.score++; //increase score of cpu
      this.ball.resetBall(); //reset ball
      this.cpu.decreaseLevel();
    } else if (cpuLost) {
      //means the cpu's wall was hit
      this.user.score++; //increase user's score
      this.ball.resetBall(); //reset ball
      this.cpu.increaseLevel(); // If computer lost - make him better
    }
  }
  // Render the game objects on the canvas.
  render() {
    //Clear the previous canvas
    this.board.renderBoard();
    //Render net
    this.net.renderNet();
    //Render scores:
    renderScore(this.user.score, this.cpu.score);
    //Render user's and computer's paddles using the board's renderRectangle method:
    //User's paddle:
    this.board.renderRectangle(
      this.user.x,
      this.user.y,
      this.user.width,
      this.user.height,
      this.user.color
    );
    //Cpu's paddle:
    this.board.renderRectangle(
      this.cpu.x,
      this.cpu.y,
      this.cpu.width,
      this.cpu.height,
      this.cpu.color
    );
    //Render the ball:
    this.ball.renderBall();
  }
  // Main game loop:
  frame() {
    //render everything
    this.update();
    this.render();
  }
  // Start the game loop
  startGame() {
    //passing the callback in arrow function to set this keyword correctly (we want this to point to the game class and not to window object). Method loses its original context and the this keyword will not be bound to the instance of the class
    this.game = setInterval(() => {
      this.frame();
    }, fps); //We call the frame method 50 times every second
  }
}
// Class for managing the game board (canvas):
class Board {
  constructor() {
    this.context = canvas.getContext("2d");
    this.x = 0;
    this.y = 0;
    this.width = canvas.width;
    this.height = canvas.height;
    this.color = "#302f2f";
  }
  //Render board method:
  renderBoard() {
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }
  //Render rectangle
  renderRectangle(x, y, width, height, color) {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, width, height);
  }
}
// Class for managing the player's paddle:
class User {
  constructor() {
    this.width = 10;
    this.height = 100;
    this.x = 0;
    this.y = canvas.height / 2 - this.height / 2;
    this.color = "white";
    this.score = 0;
  }
  // Move the player's paddle based on mouse input:
  movePaddle(e) {
    let rectangle = canvas.getBoundingClientRect(); //the canvas top, right, bottpm and left position is changing every time we scroll
    this.y = e.clientY - rectangle.top - this.height / 2; //y position of the mouse - top position of the canvas = y position of the user's paddle
  }
  // Check for collision between the ball and the player's paddle:
  isCollision(ballX, ballY, ballRadius) {
    const ballLeft = ballX - ballRadius;
    const ballCenter = ballY;
    const paddleRight = this.x + this.width;
    const paddleTop = this.y;
    const paddleBottom = this.y + this.height;
    if (
      ballLeft > 0 &&
      ballLeft <= paddleRight &&
      ballCenter <= paddleBottom &&
      ballCenter >= paddleTop
    ) {
      return true;
    }
    return false;
  }
}
// Class for managing the computer's paddle:
class Computer {
  constructor() {
    this.width = 10;
    this.height = 100;
    this.x = canvas.width - this.width;
    this.y = canvas.height / 2 - this.height / 2;
    this.color = "white";
    this.score = 0;
    this.level = 0.3;
  }
  // Increase the computer's level:
  increaseLevel() {
    this.level += 0.1;
  }
  // Decrease the computer's level
  decreaseLevel() {
    if (this.level < 0.2) {
      return;
    }

    this.level -= 0.1;
  }
  // Control the computer's paddle to follow the ball:
  controlPaddle(ball) {
    this.y += (ball.y - (this.y + this.height / 2)) * this.level; // increment this y position of the cpu's paddle by the difference between y positon of the ball and center of cpu's paddle (center of the paddle will be the same ass y position of the ball)
  }
  // Check for collision between the ball and the computer's paddle:
  isCollision(ballX, ballY, ballRadius) {
    const ballRight = ballX + ballRadius;

    const paddleLeft = this.x - this.width;
    const paddleTop = this.y;
    const paddleBottom = this.y + this.height;

    const ballCenter = ballY;

    if (
      ballRight < this.x &&
      ballRight >= paddleLeft &&
      ballCenter <= paddleBottom &&
      ballCenter >= paddleTop
    ) {
      return true;
    }

    return false;
  }
}

// Class for managing the game ball:
class Ball {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 10;
    this.color = "white";
    this.speed = 1;
    this.velocityX = 5;
    this.velocityY = 5;
  }
  renderBall() {
    game.board.context.fillStyle = this.color;
    game.board.context.beginPath();
    game.board.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    game.board.context.closePath(); //close the path
    game.board.context.fill(); //fill the shape
  }
  //Change direction of the ball by reversing its velocity
  changeDirection() {
    this.velocityX = -this.velocityX;
  }
  //Reset the ball's position and velocity
  resetBall() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speed = 1;

    const xDirection = this.velocityX / Math.abs(this.velocityX); //xDirection is the direction in which the ball will move after reset. Division of the current horizontal velocity by the absolute value. Will return 1 (ball moving to the right); -1 (ball moving to the left); 0 (ball not moving on the horizontal axis)

    this.velocityX = -xDirection * 5;
    this.velocityY = 5;
  }
  //Method hitBottom will return true or false based on the condition. Here we check if the bottom of the ball which is thus.ball.y + this.ball radius passed the bottom of the canvas (> canvas.height)
  hitBottom() {
    return this.y + this.radius > canvas.height;
  }
  //In the method hitTop we need to check if the top of the ball (this.y - this.radius) passed the top of the canvas (<0)
  hitTop() {
    return this.y - this.radius < 0;
  }
  //IcreaseSpeed Method calculates how much to increase the velocityX and velocityY of the ball to increase the speed of the vall but to maintain same direction
  increaseSpeed() {
    //Pitagors
    const v = Math.sqrt(
      this.velocityX * this.velocityX + this.velocityY * this.velocityY
    );
    //Calculating a and b of the triangle using proportion
    const a = (this.velocityY * this.speed) / v;
    const b = (this.velocityX * this.speed) / v;

    //Increase velocityX and veocityY appropriate:
    this.velocityX += b;
    this.velocityY += a;
  }
  //Update the ball's position based on the new velocity
  updateBall() {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }
}
class Net {
  //Single rectangle of the net:
  constructor() {
    this.width = 2;
    this.height = 10;
    this.color = "white";
    this.x = canvas.width / 2 - this.width / 2; //substract the width of the net divided by 2. We need to substract the width of the net from the width of the canvas /2 so the net will be placed exactly in the middle of the canvas
    this.y = 0; //y position is always the same. There will be a loop in the render net method that will render eah rectangle of the net
  }
  renderNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
      game.board.renderRectangle(
        this.x,
        this.y + i,
        this.width,
        this.height,
        this.color
      );
    }
  }
}

let game = new Game();
game.startGame();
canvas.addEventListener("mousemove", (e) => {
  game.user.movePaddle(e);
});
