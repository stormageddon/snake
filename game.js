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

        let keyPressListener = new KeyPressListener(this);
        //keyPressListener.keyup = keyPressListener.keyup.bind(this);
        document.addEventListener("keyup", keyPressListener.keyup)
    };

    start() {        
        this.food = new Food(this.ctx);

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
        
        setInterval(x => {this.tick()}, 150)
    }

    end(didWin) {
        if (!didWin) {
            this.running = false;
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
                this.food.generate();
                this.score++;
            }
        }
    }

    draw() {        
    }

    didCollide(snake, food) {
       return snake.head.x === food.x && snake.head.y === food.y;
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
        this.x = 2
        this.y = 2
        this.ctx = ctx;
        this.cube = new Cube(this.x, this.y, this.ctx, 255, 0, 0, false);
    }

    generate() {
        console.log('GENERATE');
        this.x = Math.floor(Math.random() * game.rows);
        this.y = Math.floor(Math.random() * game.rows);
        delete this.cube;
        this.cube = new Cube(this.x, this.y, this.ctx, 255, 0, 0, false);
    }

    tick() {
        console.log(`(${this.cube.x}, ${this.cube.y})`)
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
        console.log(this.body);
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
            switch(this.direction) {
                case DIRECTIONS.RIGHT:
                    cube.x += 1;
                    break;
                case DIRECTIONS.LEFT:
                    cube.x -= 1;               
                    break;
                case DIRECTIONS.UP:
                    cube.y -= 1;
                    break;
                case DIRECTIONS.DOWN:
                    cube.y += 1;
                    break;
                default:
                    console.log("Invalid direction");
                this.body[i] = cube;
            }
        })
        
        this.checkForLoss()
        this.draw();
    }

    grow() {
        if (this.body.length === 0) {
            const cube = new Cube(this.head.x, this.head.y, this.ctx, 0, 255, 255, false);
            this.body.push(cube);
        }       
    }

    checkForLoss() {
        if (this.x >= game.rows
            || this.x < 0
            || this.y >= game.cols
            || this.y < 0) {
                game.end(false);
        }
    }

    draw() {
        console.log(`head: (${this.head.x},${this.head.y})`);
        this.head.draw();
        this.body.forEach(cube => cube.draw());
    }
}

function clamp(num, min, max) { 
    return num <= min ? min : num >= max ? max : num;
}

init();