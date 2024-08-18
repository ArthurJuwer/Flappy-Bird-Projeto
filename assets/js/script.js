  const ctx = myCanvas.getContext('2d');
  const FPS = 40;
  const jump_amount = -10;
  const max_fall_speed = +10;
  const acceleration = 1;
  const pipe_speed = -2;
  const audio = document.getElementById('myAudio');

// REINICIAR JOGO NO FINAL DELE NAO ESTA FUNCIONANDO

  let game_mode = 'prestart';
  let time_game_last_running;
  let bottom_bar_offset = 0;
  let pipes = [];
  let divpowerup = 0
  let power_ups = [];
  let number_mission = 2;
  let audioInitialized = false;

  audio.volume = '0.1'

  let score = 0;
  let seconds = 0;
  let minutes = 0;
  let ingame = false;
  const cidades = [
    "Sao Leopoldo", "Novo Hamburgo", "Estancia Velha", "Ivoti",
    "Dois Irmaos", "Morro Reuter", "Santa Maria do H", "Presid. Lucena",
    "Linha Nova", "Picada Cafe", "Nova Petropolis", "Gramado",
    "Canela", "São Chico de P"
  ];
  const powerUpImages = [
    './assets/images/powerups/FlappyTrain.webp',
    './assets/images/powerups/FlappyShoes.webp',
    './assets/images/powerups/FlappyChopp.webp',
    './assets/images/powerups/FlappyCoffe.webp',
    './assets/images/powerups/FlappyTShirt.webp',
    './assets/images/powerups/FlappyCheese.webp',
    './assets/images/powerups/FlappyChopp.webp',
    './assets/images/powerups/FlappyHoney.webp',
    './assets/images/powerups/FlappyCheese.webp',
    './assets/images/powerups/FlappyCoffe.webp',
    './assets/images/powerups/FlappyGrappe.webp',
    './assets/images/powerups/FlappyChocolate.webp',
    './assets/images/powerups/FlappyIce.webp'
  ];
  let powerUpCollectCount = -1;
  let cidadeAtual = 0;
  let logoLoaded = false;
  let imgLogo = new Image();
  imgLogo.src = './assets/images/FlappyLogo.webp';
  imgLogo.onload = function() {
    logoLoaded = true;
  };
  let pipe_piece = new Image();
  pipe_piece.onload = add_all_my_pipes;
  pipe_piece.src = './assets/images/FlappyPipe.webp';

  function detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        return "Android";
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    } else {
        return "PC";
    }
  }

  const deviceType = detectDevice();
  let canvasContent = document.getElementById("myCanvas");
  if (deviceType === "PC") {
    canvasContent.width = 1000;
    canvasContent.height = 480;
  } else {
    canvasContent.width = 320;
    canvasContent.height = 480;
  }
  function MySprite(img_url) {
    this.x = 0;
    this.y = 0;
    this.visible = true;
    this.velocity_x = 0;
    this.velocity_y = 0;
    this.MyImg = new Image();
    this.MyImg.src = img_url || '';
    this.angle = 0;
    this.flipV = false;
    this.flipH = false;
    this.finish = false;
  }
  MySprite.prototype.Do_Frame_Things = function () {
    ctx.save();
    ctx.translate(this.x + this.MyImg.width / 2, this.y + this.MyImg.height / 2);
    ctx.rotate((this.angle * Math.PI) / 180);
    if (this.flipV) ctx.scale(1, -1);
    if (this.flipH) ctx.scale(-1, 1);
    if (this.visible)
      ctx.drawImage(this.MyImg, -this.MyImg.width / 2, -this.MyImg.height / 2);
    this.x = this.x + this.velocity_x;
    this.y = this.y + this.velocity_y;
    ctx.restore();
  };
  function ImagesTouching(thing1, thing2) {
    if (!thing1.visible || !thing2.visible) return false;
    let padding = 10; 
    if (
      thing1.x + padding >= thing2.x + thing2.MyImg.width ||
      thing1.x + thing1.MyImg.width - padding <= thing2.x
    )
      return false;
    if (
      thing1.y + padding >= thing2.y + thing2.MyImg.height ||
      thing1.y + thing1.MyImg.height - padding <= thing2.y
    )
      return false;
    return true;
  }
  function Got_Player_Input(MyEvent) {
    if (!audioInitialized) {
      audio.play().then(function () {
        audioInitialized = true;
      }).catch(function (error) {
        console.log('Falha ao iniciar o áudio:', error);
      });
    }

    switch (game_mode) {
      case 'prestart': {
        game_mode = 'running';
        break;
      }
      case 'running': {
        bird.velocity_y = jump_amount;
        break;
      }
      case 'over':
        if (new Date() - time_game_last_running > 1000) {
          reset_game();
          game_mode = 'running';
          break;
        }
    }
    MyEvent.preventDefault();
  }
  addEventListener('touchstart', Got_Player_Input);
  addEventListener('mousedown', Got_Player_Input);
  addEventListener('keydown', Got_Player_Input);
  function make_bird_slow_and_fall() {
    if (bird.velocity_y < max_fall_speed) {
      bird.velocity_y = bird.velocity_y + acceleration;
    }
    if (bird.y > myCanvas.height - bird.MyImg.height) {
      bird.velocity_y = 0;
      game_mode = 'over';
    }
    if (bird.y < 0 - bird.MyImg.height) {
      bird.velocity_y = 0;
      game_mode = 'over';
    }
  }

  function add_pipe(x_pos, top_of_gap, gap_width, city) {
    let top_pipe = new MySprite();
    top_pipe.MyImg = pipe_piece;
    top_pipe.x = x_pos;
    top_pipe.y = top_of_gap - pipe_piece.height;
    top_pipe.velocity_x = pipe_speed;
    pipes.push(top_pipe);
  
    let bottom_pipe = new MySprite();
    bottom_pipe.MyImg = pipe_piece;
    bottom_pipe.flipV = true;
    bottom_pipe.x = x_pos;
    bottom_pipe.y = top_of_gap + gap_width;
    bottom_pipe.velocity_x = pipe_speed;
    pipes.push(bottom_pipe);

    let middle_y = top_of_gap + (gap_width / 2);
    add_power_up(x_pos, middle_y, city);
  }
  function make_bird_tilt_appropriately() {
    if (bird.velocity_y < 0) {
      bird.angle = -15;
    } else if (bird.angle < 70) {
      bird.angle = bird.angle + 4;
    }
  }
  function show_the_pipes() {
    for (let i = 0; i < pipes.length; i++) {
      pipes[i].Do_Frame_Things();
    }
  }

  function show_the_power_ups() {
    for (let i = 0; i < power_ups.length; i++) {
      power_ups[i].Do_Frame_Things();
    }
  }

  function check_for_end_game() {
    for (let i = 0; i < pipes.length; i++) {
      if (ImagesTouching(bird, pipes[i])) {
        if(pipes[i].finish) {
          game_mode = 'finish'
        } else {
          game_mode = 'over';
        }
      }
    }
  }
  function display_intro_instructions() {
    if (logoLoaded) {
      if (deviceType === "PC") {
        ctx.drawImage(imgLogo, 350, 90, 300, 120);
      } else {
        ctx.drawImage(imgLogo, 12.5, 45, 300, 120);
      }
      
    }
    ctx.font = '18px "04b_19"';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Clique na tela para iniciar', myCanvas.width / 2, 350);
  }

  function display_game_over() {
    const modalWidth = 250;
    const modalHeight = 120;
    const modalX = (myCanvas.width - modalWidth) / 2;
    const modalY = (myCanvas.height - modalHeight) / 2;
    const borderColor = '#523747';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    const gameOverText = 'Game Over';
    ctx.textAlign = 'center';
    ctx.font = '40px "04b_19"';

    ctx.strokeStyle = 'rgb(234, 253, 219)';
    ctx.lineWidth = 12;
    ctx.strokeText(gameOverText, myCanvas.width / 2, modalY - 20);
    ctx.strokeStyle = 'rgb(82, 55, 71)';
    ctx.lineWidth = 8;
    ctx.strokeText(gameOverText, myCanvas.width / 2, modalY - 20);
    ctx.fillStyle = 'rgb(245, 186, 24)';
    ctx.fillText(gameOverText, myCanvas.width / 2, modalY - 20);

    ctx.fillStyle = 'rgb(219, 218, 150)';
    ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
    ctx.font = '20px "04b_19"';
    ctx.fillStyle = 'rgb(234, 253, 219)';
    const details = [
      `Cidade: ${cidades[cidadeAtual]}`,
      `Itens Coletados: ${score}`,
      `Tempo Total: ${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    ];
    
    details.forEach((detail, index) => {
      const yPosition = modalY + 40 + (index * 30);
      ctx.strokeStyle = 'rgb(82, 55, 71)';
      ctx.lineWidth = 3;
      ctx.strokeText(detail, modalX + modalWidth / 2, yPosition);
      ctx.fillText(detail, modalX + modalWidth / 2, yPosition);
    });

    const restartText = 'Clique na tela para reiniciar';
    ctx.strokeStyle = 'rgb(82, 55, 71)';
    ctx.lineWidth = 4;
    ctx.strokeText(restartText, myCanvas.width / 2, modalY + modalHeight + 40);
    ctx.fillStyle = 'rgb(245, 186, 24)';
    ctx.fillText(restartText, myCanvas.width / 2, modalY + modalHeight + 40);
  }
  function display_game_finish() {
    const modalWidth = 250;
    const modalHeight = 150;
    const modalX = (myCanvas.width - modalWidth) / 2;
    const modalY = (myCanvas.height - modalHeight) / 2;
    const borderColor = '#523747';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
    ctx.textAlign = 'center';
    ctx.font = '40px "04b_19"';
    ctx.strokeStyle = 'rgb(234, 253, 219)';
    ctx.lineWidth = 12; 
    ctx.strokeText('Parabens!', myCanvas.width / 2, modalY - 20);

    ctx.strokeStyle = 'rgb(82, 55, 71)'; 
    ctx.lineWidth = 6;
    ctx.strokeText('Parabens!', myCanvas.width / 2, modalY - 20);

    ctx.fillStyle = 'rgb(245, 186, 24)'; 
    ctx.fillText('Parabens!', myCanvas.width / 2, modalY - 20);

    ctx.fillStyle = 'rgb(219, 218, 150)';
    ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

    ctx.fillStyle = 'rgb(210, 170, 79)';
    ctx.textAlign = 'center';
    ctx.font = '20px "04b_19"';

    ctx.strokeStyle = 'rgb(0, 0, 0)'; 
    ctx.lineWidth = 3; 
    ctx.strokeText('Cidade: ' + cidades[cidadeAtual], modalX + modalWidth / 2, modalY + 40);
    ctx.strokeText('Frutas Coletadas: ' + score, modalX + modalWidth / 2, modalY + 70);
    ctx.strokeText('Tempo Total: ' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds, modalX + modalWidth / 2, modalY + 100);
    ctx.fillStyle = 'rgb(234, 253, 219)'; // Cor do texto
    ctx.fillText('Cidade: ' + cidades[cidadeAtual], modalX + modalWidth / 2, modalY + 40);
    ctx.fillText('Frutas Coletadas: ' + score, modalX + modalWidth / 2, modalY + 70);
    ctx.fillText('Tempo Total: ' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds, modalX + modalWidth / 2, modalY + 100);
    ctx.font = '20px "04b_19"'; 

    ctx.strokeStyle = 'rgb(82, 55, 71)'; 
    ctx.lineWidth = 8; 
    ctx.strokeText('Clique na tela para reiniciar', myCanvas.width / 2, modalY + modalHeight + 40);
    ctx.fillStyle = 'rgb(245, 186, 24)'; 
    ctx.fillText('Clique na tela para reiniciar', myCanvas.width / 2, modalY + modalHeight + 40);
  }

  function display_bar_running_along_bottom() {
    if (deviceType === "PC") {
      ctx.drawImage(bottom_bar, 0, myCanvas.height - bottom_bar.height, 1000, bottom_bar.height);
    } else {
      if (bottom_bar_offset < -23) bottom_bar_offset = 0;
      ctx.drawImage(bottom_bar, bottom_bar_offset, myCanvas.height - bottom_bar.height);
    }
  }

  function reset_game() {
    bird.y = myCanvas.height / 2;
    bird.angle = 0;
    pipes = []; 
    power_ups = []; 
    add_all_my_pipes(); 
    score = 0; 
    number_mission = 0;
    minutes = 0; 
    seconds = 0; 
    number_mission = 2;
    cidadeAtual = 0;
  }

  function add_all_my_pipes() {
    const gapWidth = 180;
    const pipeConfigs = [
      { x: 500, y: 100, id: 1 },{ x: 800, y: 50, id: 2 },{ x: 1000, y: 250, id: 3 },{ x: 1200, y: 150, id: 4 },
      { x: 1600, y: 100, id: 5 },{ x: 1800, y: 150, id: 6 },{ x: 2000, y: 200, id: 7 },{ x: 2200, y: 250, id: 8 },
      { x: 2400, y: 60, id: 9 },{ x: 2700, y: 300, id: 10 },{ x: 3000, y: 100, id: 11 },{ x: 3300, y: 250, id: 12 },
      { x: 3600, y: 50, id: 13 },{ x: 3900, y: 100, id: 1 },{ x: 4100, y: 120, id: 2 },{ x: 4350, y: 250, id: 3 },
      { x: 4700, y: 150, id: 4 },{ x: 4900, y: 100, id: 5 },{ x: 5110, y: 150, id: 6 },{ x: 5280, y: 200, id: 7 },
      { x: 5400, y: 200, id: 8 },{ x: 5690, y: 60, id: 9 },{ x: 5900, y: 270, id: 10 },{ x: 6100, y: 140, id: 11 },
      { x: 6240, y: 250, id: 12 },{ x: 6400, y: 80, id: 13 }];
    pipeConfigs.forEach(config => {
        add_pipe(config.x, config.y, gapWidth, config.id);
    });
    const finishLine = new MySprite('http://s2js.com/img/etc/flappyend.png');
    finishLine.x = 6700;
    finishLine.velocity_x = pipe_speed;
    finishLine.finish = true;
    pipes.push(finishLine);
}
  
  function add_power_up(x_pos, y_pos) {
    powerUpCollectCount++;

    let imageIndex = Math.floor(powerUpCollectCount / 2) % powerUpImages.length;
    let power_up = new MySprite(powerUpImages[imageIndex]);
  
    power_up.x = x_pos;
    power_up.y = y_pos;
    power_up.velocity_x = pipe_speed;
    power_ups.push(power_up);
    divpowerup++;
  }

  function add_power_up_in_middle(x_pos, top_of_gap, gap_width, city) {
    let middle_y = top_of_gap + (gap_width / 2);
    add_power_up(x_pos, middle_y, city);
  }

  function check_for_power_up() {
    for (let i = 0; i < power_ups.length; i++) {
      if (ImagesTouching(bird, power_ups[i])) {
        power_ups[i].visible = false; 
        score += 1;
        if (score === number_mission) {
          cidadeAtual += 1;
          number_mission += 2;
        }
      }
    }
  }

  function drawMenu() {
    const posY = 10;

    let plate = new Image();
    plate.src = './assets/images/FlappyPlate.webp';

    ctx.drawImage(plate, 0, 0, 140, 110);

    ctx.textAlign = 'left';
    ctx.font = '11px "04b_19"';
    
    let posXText = 28;
    let timeText = 'Tempo: ' + (minutes < 10 ? '0' : '') + minutes + ' : ' + (seconds < 10 ? '0' : '') + seconds;
    let itemsText = 'Itens: ' + score;
    let cityText = cidades[cidadeAtual];
    ctx.fillStyle = 'rgb(250, 250,250)'; // Cor do texto
    ctx.fillText(timeText, posXText, posY + 40);
    ctx.fillText(itemsText, posXText, posY + 60);
    ctx.fillText(cityText, posXText, posY + 80);
}


  function increment_time() {
    if (ingame == true) {
      seconds++;
      if (seconds === 60) {
        seconds = 0;
        minutes++;
      }
    }
  }

  function Do_a_Frame() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    bird.Do_Frame_Things();
    display_bar_running_along_bottom();
    switch (game_mode) {
      case 'prestart': {
        display_intro_instructions();
        break;
      }
      case 'running': {
        time_game_last_running = new Date();
        bottom_bar_offset = bottom_bar_offset + pipe_speed;
        show_the_pipes();
        show_the_power_ups();
        make_bird_tilt_appropriately();
        make_bird_slow_and_fall();
        check_for_end_game();
        check_for_power_up();
        drawMenu();
        ingame = true;
        break;
      }
      case 'over': {
        make_bird_slow_and_fall();
        display_game_over();
        ingame = false;
        break;
      }
      case 'finish': {
        display_game_finish();
        ingame = false;
        break;
      }
    }
  }
  let bottom_bar = new Image();
  bottom_bar.src = './assets/images/flappybottom.webp'; 

  let bird = new MySprite('./assets/images/FlappyBird.webp'); 
  bird.x = myCanvas.width / 4.0;
  bird.y = myCanvas.height / 2;

  setInterval(increment_time, 1000);
  setInterval(Do_a_Frame, 1000 / FPS);