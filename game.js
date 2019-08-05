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
        this.food;
        this.score = 0;
        this.tickSpeed = 150; // in ms

        let keyPressListener = new KeyPressListener(this);
        document.addEventListener("keyup", keyPressListener.keyup)
    };

    start() {        
        this.food = new Food(this.ctx);
        this.food.generate();

        // draw the grid
        let backgroundCtx = document.getElementById('background-canvas').getContext("2d")
        backgroundCtx.lineWidth = 1;
        backgroundCtx.strokeStyle = "rgb(47,79,79)";
        for (let i = 0; i <= 500; i += 500/20) {
            backgroundCtx.moveTo(0, i);
            backgroundCtx.lineTo(this.width, i);
		    backgroundCtx.stroke();
		}
        for (let i = 0; i <= 500; i += 500/20) {
            backgroundCtx.moveTo(i, 0);
            backgroundCtx.lineTo(i,this.height);
            backgroundCtx.stroke();
        }
        
        this.gameTimer = setInterval(x => {this.tick()}, this.tickSpeed);
    }

    end(didWin) {
        if (!didWin) {
            this.running = false;
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = "rgb(255,0,0)"
            this.ctx.font = "30px Arial";
            this.ctx.fillText(`Game Over! Final Score was ${this.score}`, 40, this.height / 2 - 40);
        }
    }

    tick() {
        if (this.running) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.draw()
            this.snake.tick();
            this.food.tick();
            let collision = this.didCollide(this.snake, this.food);
            if (collision) {
                this.snake.grow();
                let arr = this.snake.body.slice();
                arr.push(this.snake.head);
                this.food.generate(arr);
                this.score++;
                this.tickSpeed -= 5;
                this.tickSpeed = this.clamp(tickSpeed, 75, 150)
                clearInterval(this.gameTimer);
                this.gameTimer = setInterval(x => {this.tick()}, this.tickSpeed);
            }
        }
    }

    didCollide(snake, food) {
       return snake.head.x === food.x && snake.head.y === food.y;
    }
}

let game, presses;

function init() {
    game = new Game();
    game.start();
}

class KeyPressListener {
    constructor() {
        presses = [];
    }

    keyup(e) {
        switch (e.code) {
            case 'Escape':
                game.running = !game.running;
                break;
            case 'ArrowLeft':
                if (game.snake.direction !== DIRECTIONS.RIGHT) presses.push(DIRECTIONS.LEFT)//game.snake.direction = DIRECTIONS.LEFT
                break;
            case 'ArrowRight':
                if (game.snake.direction !== DIRECTIONS.LEFT) presses.push(DIRECTIONS.RIGHT)//game.snake.direction = DIRECTIONS.RIGHT
                break;
            case 'ArrowUp':
                if (game.snake.direction !== DIRECTIONS.DOWN) presses.push(DIRECTIONS.UP)//game.snake.direction = DIRECTIONS.UP
                break;
            case 'ArrowDown':
                if (game.snake.direction !== DIRECTIONS.UP) presses.push(DIRECTIONS.DOWN)//game.snake.direction = DIRECTIONS.DOWN
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
        this.x = 2
        this.y = 2
        this.ctx = ctx;
        this.cube = new Cube(this.x, this.y, this.ctx, 255, 0, 0, false);
    }

    generate(invalidLocations) {
        this.x = Math.floor(Math.random() * game.rows);
        this.y = Math.floor(Math.random() * game.rows);

        while(!this.validCoordinates(this.x, this.y, invalidLocations)) {
            this.x = Math.floor(Math.random() * game.rows);
            this.y = Math.floor(Math.random() * game.rows);
        }

        delete this.cube;
        this.cube = new Cube(this.x, this.y, this.ctx, 255, 0, 0, false);
    }

    validCoordinates(x, y, invalidLocations) {
        if (!invalidLocations) return true;
        return !invalidLocations.some( cube => { return x === cube.x && y === cube.y } );
    }

    tick() {
        this.draw();
    }

    draw() {
        this.cube.draw();
    }
}

class Cube {
    constructor(x, y, ctx, red = 0, green = 255, blue = 255, isHead = false) {
        this.x = x;
        this.y = y;
        this.lastX;
        this.lastY;
        this.ctx = ctx;
        this.isHead = isHead;
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    tick() {}

    draw() {
        this.ctx.fillStyle = `rgb(${this.red},${this.green},${this.blue})`
        this.ctx.fillRect(this.x * (game.width / game.rows) + 1, this.y * (game.width / game.cols) + 1, 500 / 20 - 2, 500 / 20 - 2);

        if (this.isHead) {
            // Draw Eyes
            // this.ctx.beginPath();
            // this.ctx.arc(this.x + 8, this.y + 15, 2, 0, 2 * Math.PI);
            // this.ctx.fillStyle = 'rgb(0,0,0)';
            // this.ctx.fill();
            
            // this.ctx.beginPath();
            // this.ctx.arc(this.x + 18, this.y + 15, 2, 0, 2 * Math.PI);
            // this.ctx.fillStyle = 'rgb(0,0,0)';
            // this.ctx.fill();
        }
    }
}

class Snake {
    constructor(x,y,ctx) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.head = new Cube(this.x, this.y, ctx, 0, 255, 255, true);
        this.body = []
        this.ctx = ctx;
        this.speed = 1;
        this.direction = DIRECTIONS.RIGHT
    }

    tick() { 
        this.head.lastX = this.head.x;
        this.head.lastY = this.head.y;

        const newDirection = presses.shift();
        if (newDirection) {
            this.direction = newDirection;
        }

        switch(this.direction) {
            case DIRECTIONS.RIGHT:
                this.x += 1;
                this.head.x = this.x
                break;
            case DIRECTIONS.LEFT:
                    this.x -= 1;
                    this.head.x = this.x                
                break;
            case DIRECTIONS.UP:
                    this.y -= 1;
                    this.head.y = this.y
                break;
            case DIRECTIONS.DOWN:
                    this.y += 1;
                    this.head.y = this.y
                break;
            default:
                console.log("Invalid direction");
        }

        this.body.forEach( (cube, i) => {
            if (i === 0) {
                cube.lastX = cube.x;
                cube.lastY = cube.y;
                cube.x = this.head.lastX;
                cube.y = this.head.lastY;
            } else {
                cube.lastX = cube.x;
                cube.lastY = cube.y;
                cube.x = this.body[i - 1].lastX;
                cube.y = this.body[i - 1].lastY;
            }
        })
        
        this.checkForLoss()
        this.draw();
    }

    grow() {
        let cube = null;
        if (this.body.length === 0) {
            cube = new Cube(this.head.x-1, this.head.y, this.ctx, 0, 255, 255, false);
        }
        else {
            cube = new Cube(this.body[this.body.length - 1].x-1, this.body[this.body.length - 1].y, this.ctx);
        }
        
        this.body.push(cube);
    }

    checkForLoss() {
        if (this.x >= game.rows
            || this.x < 0
            || this.y >= game.cols
            || this.y < 0) {
                game.end(false);
                return;
        }

        if (this.body.length > 0) {
            const collidedWithSelf = this.body.filter(cube => {
                return cube.x === this.head.x && cube.y === this.head.y
            }).length > 0;

            game.end(!collidedWithSelf);
        }
        
    }

    draw() {
        this.head.draw();
        this.body.forEach(cube => {
            cube.draw();
        });
    }
}

function clamp(num, min, max) { 
    return num <= min ? min : num >= max ? max : num;
}

init();