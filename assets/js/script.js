const ctx = myCanvas.getContext('2d');
const FPS = 40;
const jump_amount = -10;
const max_fall_speed = +10;
const acceleration = 1;
const pipe_speed = -2;
const audio = document.getElementById('myAudio');

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

function add_pipe(x_pos, top_of_gap, gap_width) {
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
    ctx.drawImage(imgLogo, 12.5, 45, 300, 120);
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
  
  // Fundo escuro semi-transparente
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

  // Configuração de estilo para o texto "Game Over"
  const gameOverText = 'Game Over';
  ctx.textAlign = 'center';
  ctx.font = '40px "04b_19"';

  // Adiciona bordas e preenche o texto "Game Over"
  ctx.strokeStyle = 'rgb(234, 253, 219)';
  ctx.lineWidth = 12;
  ctx.strokeText(gameOverText, myCanvas.width / 2, modalY - 20);
  ctx.strokeStyle = 'rgb(82, 55, 71)';
  ctx.lineWidth = 8;
  ctx.strokeText(gameOverText, myCanvas.width / 2, modalY - 20);
  ctx.fillStyle = 'rgb(245, 186, 24)';
  ctx.fillText(gameOverText, myCanvas.width / 2, modalY - 20);

  // Modal
  ctx.fillStyle = 'rgb(219, 218, 150)';
  ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

  // Detalhes no modal
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

  // Texto para reiniciar
  const restartText = 'Clique na tela para reiniciar';
  ctx.strokeStyle = 'rgb(82, 55, 71)';
  ctx.lineWidth = 4;
  ctx.strokeText(restartText, myCanvas.width / 2, modalY + modalHeight + 40);
  ctx.fillStyle = 'rgb(245, 186, 24)';
  ctx.fillText(restartText, myCanvas.width / 2, modalY + modalHeight + 40);
}


function display_game_finish() {
  const modalWidth = 250; // Largura do modal
  const modalHeight = 150; // Altura do modal
  const modalX = (myCanvas.width - modalWidth) / 2;
  const modalY = (myCanvas.height - modalHeight) / 2;
  const borderColor = '#523747'; // Cor da borda do modal

  // Fundo escuro semi-transparente
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

  // Adiciona o texto "Parabéns!" acima do modal
  ctx.textAlign = 'center';
  ctx.font = '40px "04b_19"'; // Fonte maior para "Parabéns!"
  
  // Borda branca ao redor do texto "Parabéns!"
  ctx.strokeStyle = 'rgb(234, 253, 219)'; // Cor da borda branca
  ctx.lineWidth = 12; // Largura da borda branca
  ctx.strokeText('Parabens!', myCanvas.width / 2, modalY - 20);

  // Borda secundária ao redor do texto "Parabéns!"
  ctx.strokeStyle = 'rgb(82, 55, 71)'; // Cor da borda secundária
  ctx.lineWidth = 6;
  ctx.strokeText('Parabens!', myCanvas.width / 2, modalY - 20);

  // Preenche o texto "Parabéns!"
  ctx.fillStyle = 'rgb(245, 186, 24)'; // Cor do texto
  ctx.fillText('Parabens!', myCanvas.width / 2, modalY - 20);

  // Modal com fundo sólido
  ctx.fillStyle = 'rgb(219, 218, 150)'; // Cor de fundo do modal
  ctx.fillRect(modalX, modalY, modalWidth, modalHeight);

  // Borda ao redor do modal
  ctx.strokeStyle = borderColor; // Cor da borda
  ctx.lineWidth = 4;
  ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

  // Adiciona detalhes dentro do modal
  ctx.fillStyle = 'rgb(210, 170, 79)'; // Cor do texto
  ctx.textAlign = 'center';
  ctx.font = '20px "04b_19"'; // Fonte para detalhes

  // Informações sobre o progresso do jogador
  ctx.strokeStyle = 'rgb(0, 0, 0)'; // Cor da borda preta
  ctx.lineWidth = 3; // Largura da borda
  ctx.strokeText('Cidade: ' + cidades[cidadeAtual], modalX + modalWidth / 2, modalY + 40);
  ctx.strokeText('Frutas Coletadas: ' + score, modalX + modalWidth / 2, modalY + 70);
  ctx.strokeText('Tempo Total: ' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds, modalX + modalWidth / 2, modalY + 100);

  // Preenche o texto com cor
  ctx.fillStyle = 'rgb(234, 253, 219)'; // Cor do texto
  ctx.fillText('Cidade: ' + cidades[cidadeAtual], modalX + modalWidth / 2, modalY + 40);
  ctx.fillText('Frutas Coletadas: ' + score, modalX + modalWidth / 2, modalY + 70);
  ctx.fillText('Tempo Total: ' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds, modalX + modalWidth / 2, modalY + 100);

  // Adiciona o texto para reiniciar
  ctx.font = '20px "04b_19"'; // Fonte para reiniciar

  // Borda preta ao redor do texto "Reiniciar"
  ctx.strokeStyle = 'rgb(82, 55, 71)'; // Cor da borda preta
  ctx.lineWidth = 8; // Largura da borda preta
  ctx.strokeText('Clique na tela para reiniciar', myCanvas.width / 2, modalY + modalHeight + 40);

  // Preenche o texto "Reiniciar"
  ctx.fillStyle = 'rgb(245, 186, 24)'; // Cor do texto
  ctx.fillText('Clique na tela para reiniciar', myCanvas.width / 2, modalY + modalHeight + 40);
}



function display_bar_running_along_bottom() {
  if (bottom_bar_offset < -23) bottom_bar_offset = 0;
  ctx.drawImage(
    bottom_bar,
    bottom_bar_offset,
    myCanvas.height - bottom_bar.height
  );
}

function reset_game() {
  bird.y = myCanvas.height / 2;
  bird.angle = 0;
  pipes = []; 
  power_ups = []; 
  add_all_my_pipes(); 
  add_all_power_up();
  score = 0; 
  number_mission = 0;
  minutes = 0; 
  seconds = 0; 
  number_mission = 2;
  cidadeAtual = 0;
}

function add_all_my_pipes() {
  let gap_width = 180; 
  add_pipe(500, 100, gap_width);
  add_pipe(800, 50, gap_width);
  add_pipe(1000, 250, gap_width);
  add_pipe(1200, 150, gap_width);
  add_pipe(1600, 100, gap_width);
  add_pipe(1800, 150, gap_width);
  add_pipe(2000, 200, gap_width);
  add_pipe(2200, 250, gap_width);
  add_pipe(2400, 60, gap_width);
  add_pipe(2700, 300, gap_width);
  add_pipe(3000, 100, gap_width);
  add_pipe(3300, 250, gap_width);
  add_pipe(3600, 50, gap_width);
  add_pipe(3900, 100, gap_width);
  add_pipe(4100, 120, gap_width);
  add_pipe(4350, 250, gap_width);
  add_pipe(4700, 150, gap_width);
  add_pipe(4900, 100, gap_width);
  add_pipe(5110, 150, gap_width);
  add_pipe(5280, 200, gap_width);
  add_pipe(5400, 200, gap_width);
  add_pipe(5690, 60, gap_width);
  add_pipe(5900, 270, gap_width);
  add_pipe(6100, 140, gap_width);
  add_pipe(6240, 250, gap_width);
  add_pipe(6400, 80, gap_width);
  let finish_line = new MySprite('http://s2js.com/img/etc/flappyend.png');
  finish_line.x = 6700;
  finish_line.velocity_x = pipe_speed;
  finish_line.finish = true;
  pipes.push(finish_line);
}

function add_power_up(x_pos, y_pos, city) {  
  let power_up 
  switch (city) {
      case 1:
          power_up = new MySprite('./assets/images/powerups/FlappyTrain.webp');
          divpowerup++          
          break;
        case 2:
          power_up = new MySprite('./assets/images/powerups/FlappyShoes.webp')          
          divpowerup++          
          break
        case 3:
          power_up = new MySprite('./assets/images/powerups/FlappyChopp.webp')          
          divpowerup++          
          break
        case 4:
          power_up = new MySprite('./assets/images/powerups/FlappyCoffe.webp')          
          divpowerup++          
          break
        case 5:
          power_up = new MySprite('./assets/images/powerups/FlappyTShirt.webp')          
          divpowerup++          
          break
        case 6:
          power_up = new MySprite('./assets/images/powerups/FlappyCheese.webp')          
          divpowerup++          
          break
        case 7:
          power_up = new MySprite('./assets/images/powerups/FlappyChopp.webp')          
          divpowerup++          
          break
        case 8:
          power_up = new MySprite('./assets/images/powerups/FlappyHoney.webp')          
          divpowerup++          
          break
        case 9:
          power_up = new MySprite('./assets/images/powerups/FlappyCheese.webp')          
          divpowerup++          
          break
        case 10:
          power_up = new MySprite('./assets/images/powerups/FlappyCoffe.webp')          
          divpowerup++          
          break
        case 11:
          power_up = new MySprite('./assets/images/powerups/FlappyGrappe.webp')          
          divpowerup++          
          break
        case 12:
          power_up = new MySprite('./assets/images/powerups/FlappyChocolate.webp')          
          divpowerup++          
          break
        case 13:
          power_up = new MySprite('./assets/images/powerups/FlappyIce.webp')          
          divpowerup++          
          break
      }

        power_up.x = x_pos;
        power_up.y = y_pos;
        power_up.velocity_x = pipe_speed;
        power_ups.push(power_up);      
    }

function add_power_up_in_middle(x_pos, top_of_gap, gap_width, city) {
  let middle_y = top_of_gap + (gap_width / 2);
  add_power_up(x_pos, middle_y, city);
}
function add_all_power_up() {
  let gap_width = 180; 
  add_power_up_in_middle(500, 60, gap_width, 1);
  add_power_up_in_middle(800, 10, gap_width, 1);
  add_power_up_in_middle(1000, 230, gap_width, 2);
  add_power_up_in_middle(1200, 110, gap_width, 2);
  add_power_up_in_middle(1600, 60, gap_width, 3);
  add_power_up_in_middle(1800, 110, gap_width, 3);
  add_power_up_in_middle(2000, 160, gap_width, 4);
  add_power_up_in_middle(2200, 210, gap_width, 4);
  add_power_up_in_middle(2400, -10, gap_width, 5);
  add_power_up_in_middle(2700, 260, gap_width, 5);
  add_power_up_in_middle(3000, 60, gap_width, 6);
  add_power_up_in_middle(3300, 210, gap_width, 6);
  add_power_up_in_middle(3600, 10, gap_width, 7);
  add_power_up_in_middle(3900, 60, gap_width, 7);
  add_power_up_in_middle(4100, 80, gap_width, 8);
  add_power_up_in_middle(4350, 210, gap_width, 8);
  add_power_up_in_middle(4700, 110, gap_width, 9);
  add_power_up_in_middle(4900, 60, gap_width, 9);
  add_power_up_in_middle(5100, 110, gap_width, 10); 
  add_power_up_in_middle(5270, 160, gap_width, 10);
  add_power_up_in_middle(5390, 160, gap_width, 11);
  add_power_up_in_middle(5680, 20, gap_width, 11);
  add_power_up_in_middle(5900, 260, gap_width, 12);
  add_power_up_in_middle(6100, 80, gap_width, 12);
  add_power_up_in_middle(6240, 210, gap_width, 13);
  add_power_up_in_middle(6400, 10, gap_width, 13);

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
ctx.drawImage(plate, 0, 0);  


  ctx.textAlign = 'left';
  let posXText = 28;
  ctx.font = '12px "04b_19"';
  ctx.fillStyle = 'white';

  let timeText = 'Tempo: ' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  ctx.fillText(timeText, posXText, posY + 40);

  ctx.fillText('Itens: ' + score, posXText, posY + 60);
  
  ctx.fillText(cidades[cidadeAtual], posXText, posY + 80);
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
bird.x = myCanvas.width / 2.4;
bird.y = myCanvas.height / 2;

function scrollToCenter() {
  const scrollHeight = document.body.scrollHeight;
  const windowHeight = window.innerHeight;

  // Calcula o ponto de rolagem para centralizar a página
  const scrollTo = (scrollHeight / 2) - (windowHeight / 2);

  // Rola até o ponto calculado
  window.scrollTo(0, scrollTo);

  // Bloqueia a rolagem
  document.body.style.overflow = 'hidden';
}
add_all_power_up();
setInterval(increment_time, 1000);
setInterval(Do_a_Frame, 1000 / FPS);
scrollToCenter();