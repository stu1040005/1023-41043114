const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設定畫布大小
canvas.width = 800;
canvas.height = 600;

// 遊戲變數
let paddle, balls, bricks, score, lives, ballSpeed, background, trail, timeLimit, timeRemaining, comboCount;

// 初始化遊戲
function initGame(level = 'easy', bg = 'nightSky') {
  score = 0;
  lives = 3;
  ballSpeed = level === 'easy' ? 3 : level === 'medium' ? 5 : 7;
  background = bg; // 設置背景主題
  timeLimit = level === 'medium' ? 60 : null; // 中等難度的時間限制
  timeRemaining = timeLimit;

  paddle = {
    x: (canvas.width - 100) / 2,
    y: canvas.height - 30,
    width: 100,
    height: 20,
    speed: 8,
    dx: 0,
  };

  balls = [{
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: ballSpeed,
    dx: ballSpeed,
    dy: -ballSpeed,
    trail: [],
  }];

  generateBricks(level);
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  
  if(level=="medium")
  {
    setInterval(() => {       
          spawnPowerUp(Math.random() * (canvas.width - 20),0);       
      }, 3000);
      
  }
}

// 背景繪製
function drawBackground() {
  switch (background) {
    case 'nightSky':
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
    case 'forest':
      ctx.fillStyle = '#228B22'; // 森林綠色
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
  }
}

// 升級道具變數
let powerUps = [];

// 隨機生成道具
function spawnPowerUp(x, y) {
  const powerUpTypes = ['expandPaddle', 'speedUpBall', 'extraLife']; // 新增額外生命道具
  const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  powerUps.push({
    x: x,
    y: y,
    type: type,
    speed: 3,
  });
}

// 繪製道具
function drawPowerUps() {
  powerUps.forEach((powerUp) => {
    ctx.fillStyle = powerUp.type === 'expandPaddle' ? 'orange' : powerUp.type === 'speedUpBall' ? 'purple' : 'red'; // 顏色區分
    ctx.fillRect(powerUp.x, powerUp.y, 20, 20);
  });
}

// 移動道具
function movePowerUps() {
  powerUps.forEach((powerUp, index) => {
    powerUp.y += powerUp.speed;
    // 檢查是否與擋板碰撞
    if (powerUp.y + 20 > paddle.y && powerUp.x > paddle.x && powerUp.x < paddle.x + paddle.width) {
      if (powerUp.type === 'expandPaddle') {
        paddle.width += 30; // 擴大擋板
      } else if (powerUp.type === 'speedUpBall') {
        balls.forEach(ball => {
          ball.speed += 2; // 增加球速
          ball.dx = (ball.dx > 0 ? 1 : -1) * ball.speed; // 保持方向
          ball.dy = (ball.dy > 0 ? 1 : -1) * ball.speed; // 保持方向
        });
      } else if (powerUp.type === 'extraLife') {
        lives++; // 增加生命
      }
      powerUps.splice(index, 1); // 移除道具
    }

    // 如果道具掉出畫布
    if (powerUp.y > canvas.height) {
      powerUps.splice(index, 1);
    }
  });
}

// 按下鍵時更新擋板的方向
function keyDownHandler(e) {
  if (e.key === 'ArrowRight' || e.key === 'd') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    paddle.dx = -paddle.speed;
  }
}

// 放開鍵時停止擋板移動
function keyUpHandler(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'd') {
    paddle.dx = 0;
  }
}

// 擋板移動
function movePaddle() {
  paddle.x += paddle.dx;

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

// 磚塊生成
function generateBricks(level) {
  const rowCount = level === 'easy' ? 3 : level === 'medium' ? 5 : 7;
  const colCount = 8;
  const brickWidth = 75;
  const brickHeight = 20;
  const padding = 10;
  const offsetTop = 30;
  const offsetLeft = 35;

  bricks = [];
  for (let row = 0; row < rowCount; row++) {
    bricks[row] = [];
    for (let col = 0; col < colCount; col++) {
      const strength = level === 'hard' ? (row % 2 + 1) : 1;
      bricks[row][col] = { x: 0, y: 0, status: strength };
      bricks[row][col].x = col * (brickWidth + padding) + offsetLeft;
      bricks[row][col].y = row * (brickHeight + padding) + offsetTop;
    }
  }
}

// 繪製擋板
function drawPaddle() {
  ctx.fillStyle = '#0095DD';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// 繪製球
function drawBall() {
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFDD00';
    ctx.fill();
    ctx.closePath();
  });
}

// 繪製磚塊
function drawBricks() {
  bricks.forEach(row => {
    row.forEach(brick => {
      if (brick.status > 0) {
        ctx.fillStyle = background === 'forest' ? 'blue' : (brick.status === 2 ? 'red' : 'green');
        ctx.fillRect(brick.x, brick.y, 75, 20);
      }
    });
  });
}

// 球的運動
function moveBalls() {
const level = document.getElementById('difficulty').value;
  balls.forEach((ball, ballIndex) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 添加尾跡效果
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) {
      ball.trail.shift(); // 控制尾跡長度
    }

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy *= -1;
    }
    if (
      ball.y + ball.radius > paddle.y &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      ball.dy *= -1;
    }

    bricks.forEach(row => {
      row.forEach(brick => {
        if (
          brick.status > 0 &&
          ball.x > brick.x &&
          ball.x < brick.x + 75 &&
          ball.y > brick.y &&
          ball.y < brick.y + 20
        ) {
          ball.dy *= -1;
          brick.status--;
          score += 10;

          // 連擊加分
          comboCount++;
          if (comboCount > 1) {
            score += (comboCount - 1) * 5; // 連擊加分
          }
          
          if(level=="hard")
          {
            spawnPowerUp(brick.x, brick.y); // 磚塊擊破時生成道具
          }
          
        }
      });
    });

    if (ball.y + ball.radius > canvas.height) {
      lives--;
      if (lives == 0) {
        alert('遊戲結束！');
        document.location.reload();
        
      } else {
        resetBallAndPaddle();
      }
    }
  });
}

// 繪製球的尾跡
function drawBallTrail() {
  balls.forEach(ball => {
    ctx.fillStyle = 'rgba(255, 221, 0, 0.5)';
    ball.trail.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });
  });
}

// 分數與生命顯示
function drawScore() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Score: ' + score, 8, 20);
}

function drawLives() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Lives: ' + lives, canvas.width - 80, 20);
}

function drawTime() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Time: ' + Math.floor(timeRemaining), canvas.width / 2 - 20, 20); // 取整顯示時間
}
function areAllBricksCleared() {
    return bricks.every(row => row.every(brick => brick.status === 0));
  }
// 更新遊戲畫面
function update() {
  movePaddle();
  moveBalls();
  movePowerUps(); // 更新道具
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();  // 繪製背景
  drawPaddle();
  drawBallTrail();   // 繪製球的尾跡
  drawBall();
  drawBricks();
  drawPowerUps();    // 繪製道具
  drawScore();
  drawLives();
  drawTime(); // 顯示剩餘時間

  if (timeRemaining !== null) {
    timeRemaining -= 1 / 60; // 每幀減少一秒
    if (timeRemaining <= 0) {
      alert('時間到！遊戲結束！');
      document.location.reload();
    }
  }
  if (areAllBricksCleared()) {
    setTimeout(() => {
      alert('恭喜通關！您的分數是：' + score);
      document.location.reload(); // 重置遊戲
    }, 100); // 延遲，避免立即彈出提示框
  } else {
    requestAnimationFrame(update); // 若未通關則繼續更新畫面
  }
}

// 重設球與擋板
function resetBallAndPaddle() {
  balls = [{
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: ballSpeed,
    dx: ballSpeed,
    dy: -ballSpeed,
    trail: [],
  }];
  paddle.x = (canvas.width - paddle.width) / 2;
  comboCount = 0; // 重置連擊計數
}

// 開始遊戲按鈕
document.getElementById('startButton').addEventListener('click', () => {
  const level = document.getElementById('difficulty').value;
  const bg = document.getElementById('background').value; // 背景選擇
  initGame(level, bg);
  update();
});
