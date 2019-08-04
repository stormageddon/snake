class Game {
    constructor() {
        this.height = 500;
        this.width = 500;
        this.rows = 20;
        this.cols = 20;
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext("2d");
        this.running = true;
        this.snake = new Snake(0,0,this.ctx);
        this.food = new Food(this.ctx)

        let keyPressListener = new KeyPressListener(this);
        //keyPressListener.keyup = keyPressListener.keyup.bind(this);
        document.addEventListener("keyup", keyPressListener.keyup)
    };

    start() {
        setInterval(x => {this.tick()}, 250)
    }

    end(didWin) {
        if (!didWin) {
            this.running = false;
            this.ctx.fillStyle = "rgb(255,0,0)"
            this.ctx.font = "30px Arial";
            this.ctx.fillText("You Lost", this.width / 2, this.height / 2 - 40);
        }
    }

    tick() {
        if (this.running) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.draw()
            this.snake.tick();
            //this.food.tick();
            //const collided = this.didCollide(this.snake, this.food)

            //if (collided) {
            //     this.snake.grow();
            // }
        }
    }

    draw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.width, this.height);

        // // draw the grid
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgb(47,79,79)";
        for (let i = 0; i <= 500; i += 500/20) {
		   this.ctx.moveTo(0, i);
		   this.ctx.lineTo(this.width, i);
		   this.ctx.stroke();
		}
        for (let i = 0; i <= 500; i += 500/20) {
		   this.ctx.moveTo(i, 0);
		   this.ctx.lineTo(i,this.height);
		   this.ctx.stroke();
		}
    }

    didCollide(snake, food) {
       return true
    }
}

let game;

function init() {
    game = new Game();
    game.start();
}

class KeyPressListener {
    constructor() {
    }

    keyup(e) {
        console.log(`key pressed: ${e.code}`);
        switch (e.code) {
            case 'Escape':
                game.running = !game.running;
                break;
            case 'ArrowLeft':
                if (game.snake.direction !== DIRECTIONS.RIGHT) game.snake.direction = DIRECTIONS.LEFT
                break;
            case 'ArrowRight':
                if (game.snake.direction !== DIRECTIONS.LEFT) game.snake.direction = DIRECTIONS.RIGHT
                break;
            case 'ArrowUp':
                if (game.snake.direction !== DIRECTIONS.DOWN) game.snake.direction = DIRECTIONS.UP
                break;
            case 'ArrowDown':
                if (game.snake.direction !== DIRECTIONS.UP) game.snake.direction = DIRECTIONS.DOWN
                break;
        }
    }
}

const DIRECTIONS = {
    LEFT: 'left',
    RIGHT: 'right',
    UP: 'up',
    DOWN: 'down'
}

class Food {
    constructor(ctx) {
        this.x = 100;
        this.y = 100;
        this.ctx = ctx;
        this.width = 32;
        this.height = 32;
    }

    tick() {
        this.draw();
    }

    draw() {
        this.ctx.fillStyle = "rgb(0,255,0)"
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Cube {
    constructor(x,y,ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
    }

    tick() {}

    draw() {
        console.log('drawing cube');
        this.ctx.fillStyle = "rgb(0,255,255)"
        this.ctx.fillRect(this.x + 1, this.y + 1, 500 / 20 - 2, 500 / 20 - 2);
    }
}

class Snake {
    constructor(x,y,ctx) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.head = new Cube(this.x, this.y, ctx);
        this.ctx = ctx;
        this.speed = 1;
        this.segments = 1;
        this.direction = DIRECTIONS.RIGHT
    }

    tick() {
        switch(this.direction) {
            case DIRECTIONS.RIGHT:
                this.x += 500 / game.rows;
                this.head.x = this.x
                break;
            case DIRECTIONS.LEFT:
                    this.x -= 500 / game.rows;
                    this.head.x = this.x                
                break;
            case DIRECTIONS.UP:
                    this.y -= 500 / game.rows;
                    this.head.y = this.y
                break;
            case DIRECTIONS.DOWN:
                    this.y += 500 / game.rows;
                    this.head.y = this.y
                break;
            default:
                console.log("Invalid direction");
        }
        
        this.checkForLoss()
        this.draw();
    }

    grow() {
        this.segments += 1;
    }

    checkForLoss() {
        if (this.x > game.width - this.width
            || this.x < 0
            || this.y > game.height - this.height
            || this.y < 0) {
                game.end(false);
        }
    }

    draw() {
        this.head.draw();
    }
}

function clamp(num, min, max) { 
    return num <= min ? min : num >= max ? max : num;
}

init();