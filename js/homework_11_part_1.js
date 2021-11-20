let points = 0;
let lvl = 1;

$(document).ready(function startGame() {
  const GAME_STEP_DELAY = 15 - lvl;

  let innerLevel = lvl;

  let blunder = 0;

  let currentGameStep = 0;
  
  let block = document.createElement('div')
  block.style.cssText = `
    background: #000;
    width: ${document.documentElement.clientWidth - 10}px;
    height: ${document.documentElement.clientHeight - 10}px;
    position: absolute;
    z-index: -1;
    cursor: crosshair;
  `
  let cartridges = null;
  let arrayCartridges = [];

  document.body.append(block)
  for (let i = 3; i > 0; i--) {
    cartridges = document.createElement('div')
    cartridges.style.cssText = `
      position: absolute;
      background: #964b00;
      width: 10px;
      height: 40px;
      bottom: 20px;
      right: ${i * 20}px;

      z-index: 1;
    `
    document.body.append(cartridges)
    arrayCartridges.push(cartridges)
  }

  $(block).click(function() {
    $(arrayCartridges[blunder]).remove();
    blunder = blunder + 1;
    if (points !== 0) {
      points = points - 1000;
    }
  })

  function getGameStepTime () {
    let dateNow = new Date();
    return `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}.${dateNow.getMilliseconds()}`;
  }

let arrayKey = [];
let win = 0;

  function Ball (options) {
    this.id = Math.trunc(Math.random() * 1000);
    this.diametr = options.diametr;
    this.color = options.color;
    this.x = options.x;
    this.y = options.y;
    this.directionX = options.startDirectionX || 1;
    this.directionY = 1;

    console.log('ball', this.id, this.directionX);
    arrayKey.push(this.id)

    this.createView = function () {
      let result = document.createElement('div')
      result.style.cssText = `
      display: inline-block;
      position: absolute;
      
      left: ${this.x}px;
      top: ${this.y}px;
      cursor: crosshair;
      width: ${this.diametr}px;
      height: ${this.diametr}px;
      background: ${this.color}`;
      //result.innerText = this.id;
      document.documentElement.append(result);

      return result;
    }

    this.div = this.createView();

    $(this.div).click(function() {
      this.remove(); 
      win = win + 1;
      if (win === arrayKey.length) {
        points = points + 1000 * win;
        lvl = lvl + 1;

        if (lvl > 15) {
          alert(`Благодарю за прохождение игры и вручаю медаль героя! 
Этот подвиг навсегда будет вписан в летопись этой игры! 
Ваши очки ${points}`);
          let newGame = confirm('Ссыграть ещё раз?');
          if (newGame) {
            lvl = 1;
            startGame();
          }
        } else {
          alert(`Следующий уровень ${lvl}, ваши очки ${points}`);
          for (let i = 0; i < arrayCartridges.length; i++) {
            $(arrayCartridges[i]).remove();
          }

          startGame();
        }
      }
    })

    this.renderState = function () {
      this.x = this.x + this.directionX;
      this.y = this.y + this.directionY;
    }

    this.renderView = function () {
      this.div.style.left = this.x + 'px';
      this.div.style.top = this.y + 'px';
    }


    this.live = function () {
      this.renderState();
      this.renderView();  
    }

    this.invertDirectionX = function () {
      this.directionX = this.directionX * -1;
    }

    this.invertDirectionY = function () {
      this.directionY = this.directionY * -1;
    }
  }

  function Wall (options) {
    this.id = Math.trunc(Math.random() * 1000);
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    

    this.createView = function () {
      let result = document.createElement('div');
      result.style.cssText = `
      position: absolute;
      left: ${this.x}px;
      top: ${this.y}px;
      width: ${this.width}px;
      height: ${this.height}px;
      background: green;
      `;
      document.documentElement.append(result);
      return result;
    }

    this.div = this.createView();

    this.renderState = function () {
      
    }

    this.renderView = function () {
      
    }

    this.live = function () {
      this.renderState();
      this.renderView();
      
    }
  }

  let objects = [];
  let arrayColor = ['#008000', '#0000FF', '#FF0000', '#FFFF00', '#00FFFF', '#ADFF2F', '#FFA500'];

  //Функия, которая возвращает случае целое число от min до max
  function random(min, max) {
    if (isNaN(min) || isNaN(max)) {
      return null;
    }

    let result = 0;
    let randomNumber = Math.random();

    result = (max - min) * randomNumber + min;
    return Math.floor(result);
  }


  for (let i = 0; i < random(5, 10); i++) {
    let randomColorNumber = random(0, arrayColor.length);
    let degree = random(1, 100)

    objects.push( new Ball({
      diametr: random(50, 80),
      color: arrayColor[randomColorNumber],
      x: random(50, document.documentElement.clientWidth - 100),
      y: random(50, document.documentElement.clientHeight - 100),
      startDirectionX: Math.pow(-1, degree),
    }));

  }

  objects.push( new Wall({
    x: 0,
    y: 0,
    width: document.documentElement.clientWidth,
    height: 10,
  }));

  objects.push( new Wall({
    x: 0,
    y: 0,
    width: 10,
    height: document.documentElement.clientHeight,
  }));

  objects.push( new Wall({
    x: document.documentElement.clientWidth - 10,
    y: 0,
    width: 10,
    height: document.documentElement.clientHeight,
  }));

  objects.push( new Wall({
    x: 0,
    y: document.documentElement.clientHeight - 10,
    width: document.documentElement.clientWidth-10,
    height: 10,
  }));

let numberOfCollisions = 0;
let array = [];
let j = 0;

for (let i = 0; i < arrayKey.length; i++) {
  array[i] = numberOfCollisions;
}

  function checkCollision (objectA, objectB) {
    if (objectA !== objectB) {
      let ball = null;
      let wall = null;
      if (objectA instanceof Ball) {
        ball = objectA;
      } else if (objectA instanceof Wall) {
        wall = objectA;
      }
      if (objectB instanceof Ball) {
        ball = objectB;
      } else if (objectB instanceof Wall) {
        wall = objectB;
      }

      if (ball && wall) {
        if ((ball.x + ball.diametr === wall.x || 
          ball.x === wall.x + wall.width)
          && ball.y > wall.y && ball.y < wall.y + wall.height
          
          ) {
          ball.invertDirectionX();
         
      }

      if (ball.x > wall.x 
        && ball.x < wall.x + wall.width 
        && ball.y === wall.y + wall.height
        && numberOfCollisions < 3
        ) {
          ball.invertDirectionY();
          for (let i = 0; i < arrayKey.length; i++) {
            
            if (ball.id === arrayKey[i]) {

              array[i] = array[i] + 1;
              console.log(array[i])
              if (array[i] === 3) {
                j++
                if ((j == arrayKey.length) || (array[i] > 3)) {
                  numberOfCollisions = array[i];
                }
              }
            }

            
          }
        } 
      }


      if (ball && wall) {
        if (ball.x >= wall.x 
          && ball.x <= wall.x + wall.width 
          && ball.y + ball.diametr === wall.y
          ) {
          ball.invertDirectionY();
          
      }
    } 
  }
}

function isGameOver () {
  let balls = objects.filter(item => item instanceof Ball);
  let wall = objects.find(item => item instanceof Wall);

  return !!balls.find(ball => ball.y < wall.y);
}

function doGameStep () {
  let currentGameStepTime = getGameStepTime();

    for(let i=0; i < objects.length; i++) {
      objects[i].live();
      
    }

    for(let i=0; i < objects.length; i++) {
      let objectA = objects[i];
      for (let j= i + 1; j < objects.length; j++ ) {
        let objectB = objects[j];
        checkCollision(objectA, objectB);

      }
    }

    let gameOver = isGameOver();

    if (!gameOver && (blunder < 3) && (innerLevel == lvl)) {
      setTimeout(doGameStep, GAME_STEP_DELAY);
    } else if (gameOver){
      alert('Игра закончена, вы пропустили квадрат');
    } else if (blunder > 2) {
      alert('Игра закончена, вы потратили все свои патроны');
    } else if (innerLevel !== lvl) {
      return points
    }
  }

  setTimeout(doGameStep, GAME_STEP_DELAY);
});