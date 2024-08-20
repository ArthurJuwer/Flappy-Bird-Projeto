  const ctx = myCanvas.getContext('2d');
  const FPS = 40;
  const TAMANHO_SALTO = -10;
  const VELOCIDADEQUEDA = +10;
  const ACELERACAO = 1;
  const VELOCIDADE_CANO = -2;
  const audio = document.getElementById('myAudio');
  let modoAtual = 'prestart';
  let horaUltimaPartida;
  let deslocamentoBarraInferior = 0;
  let canos = [];
  let divItens = 0
  let itens = [];
  let numeroMissao = 2;
  let audioInicializado = false;
  let pontuacao = 0;
  let segundos = 0;
  let minutos = 0;
  let emJogo = false;

  const CIDADES = [
    "Sao Leopoldo", "Novo Hamburgo", "Estancia Velha", "Ivoti",
    "Dois Irmaos", "Morro Reuter", "Santa Maria do H", "Presid. Lucena",
    "Linha Nova", "Picada Cafe", "Nova Petropolis", "Gramado",
    "Canela", "São Chico de P"
  ];
  const ITENS_IMAGENS = [
    './assets/images/itens/FlappyTrain.webp',
    './assets/images/itens/FlappyShoes.webp',
    './assets/images/itens/FlappyChopp.webp',
    './assets/images/itens/FlappyCoffe.webp',
    './assets/images/itens/FlappyTShirt.webp',
    './assets/images/itens/FlappyCheese.webp',
    './assets/images/itens/FlappyChopp.webp',
    './assets/images/itens/FlappyHoney.webp',
    './assets/images/itens/FlappyCheese.webp',
    './assets/images/itens/FlappyCoffe.webp',
    './assets/images/itens/FlappyGrappe.webp',
    './assets/images/itens/FlappyChocolate.webp',
    './assets/images/itens/FlappyIce.webp'
  ];
  let itensColetado = -1;
  let cidadeAtual = 0;
  let logoCarregada = false;
  let imagemLogo = new Image();
  imagemLogo.src = './assets/images/FlappyLogo.webp';
  imagemLogo.onload = function() {
    logoCarregada = true;
  };
  let pedacosCano = new Image();
  pedacosCano.onload = adicionarCanos;
  pedacosCano.src = './assets/images/FlappyPipe.webp';

  function pegarDispositivo() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
        return "Android";
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    } else {
        return "PC";
    }
}

const DISPOSITIVO_USUARIO = pegarDispositivo();
const conteudoCanvas = document.getElementById("myCanvas");

if (DISPOSITIVO_USUARIO === "PC") {
    conteudoCanvas.width = 1000;
    conteudoCanvas.height = 480;
    window.addEventListener('mousedown', AcaoJogador);
    window.addEventListener('keydown', AcaoJogador);
    window.addEventListener('touchstart', AcaoJogador);
} else {
    conteudoCanvas.width = 320;
    conteudoCanvas.height = 480;
    const botaoPularCelular = document.querySelector("#jumpButton");
    if (botaoPularCelular) {
        botaoPularCelular.addEventListener('click', AcaoJogador);
    }
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
  MySprite.prototype.fazerAtualizacoes = function () {
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
  function tocarImagens(thing1, thing2) {
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
  function AcaoJogador(MyEvent) {
    switch (modoAtual) {
      case 'prestart': {
        modoAtual = 'running';
        break;
      }
      case 'running': {
        passaro.velocity_y = TAMANHO_SALTO;
        break;
      }
      case 'over':
        if (new Date() - horaUltimaPartida
 > 1000) {
          reiniciarJogo();
          modoAtual = 'running';
          break;
      }
      case 'finish':
        if (new Date() - horaUltimaPartida
 > 1000) {
          reiniciarJogo();
          modoAtual = 'running';
          break;
        }
    }
    MyEvent.preventDefault();
    if (!audioInicializado) {
      audio.play().then(function () {
        audioInicializado = true;
        audio.volume = '0.1'
      }).catch(function (error) {
        console.log('Falha ao iniciar o áudio:', error);
      });
    }
  }
  
  const botaoPularCelular = document.querySelector("#jumpButton");
  
  botaoPularCelular.addEventListener('click', AcaoJogador);

  function fazerPassaroCairLento() {
    if (passaro.velocity_y < VELOCIDADEQUEDA) {
      passaro.velocity_y = passaro.velocity_y + ACELERACAO;
    }
    if (passaro.y > myCanvas.height - passaro.MyImg.height) {
      passaro.velocity_y = 0;
      modoAtual = 'over';
    }
    if (passaro.y < 0 - passaro.MyImg.height) {
      passaro.velocity_y = 0;
      modoAtual = 'over';
    }
  }

  function adicionarCano(x_pos, top_of_gap, gap_width, city) {
    let canoSuperior = new MySprite();
    canoSuperior.MyImg = pedacosCano;
    canoSuperior.x = x_pos;
    canoSuperior.y = top_of_gap - pedacosCano.height;
    canoSuperior.velocity_x = VELOCIDADE_CANO;
    canos.push(canoSuperior);
  
    let canoInferior = new MySprite();
    canoInferior.MyImg = pedacosCano;
    canoInferior.flipV = true;
    canoInferior.x = x_pos;
    canoInferior.y = top_of_gap + gap_width;
    canoInferior.velocity_x = VELOCIDADE_CANO;
    canos.push(canoInferior);

    let middle_y = top_of_gap + (gap_width / 2);
    adicionarItem(x_pos, middle_y, city);
  }
  function inclinarPassaro() {
    if (passaro.velocity_y < 0) {
      passaro.angle = -15;
    } else if (passaro.angle < 70) {
      passaro.angle = passaro.angle + 4;
    }
  }
  function mostrarOsCanos() {
    for (let i = 0; i < canos.length; i++) {
      canos[i].fazerAtualizacoes();
    }
  }

  function mostrarItens() {
    for (let i = 0; i < itens.length; i++) {
      itens[i].fazerAtualizacoes();
    }
  }

  function checarFinalJogo() {
    for (let i = 0; i < canos.length; i++) {
      if (tocarImagens(passaro, canos[i])) {
        if(canos[i].finish) {
          modoAtual = 'finish'
        } else {
          modoAtual = 'over';
        }
      }
    }
  }
  function mostrarInstrucoesInicio() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
    if (logoCarregada) {
      if (DISPOSITIVO_USUARIO === "PC") {
        ctx.drawImage(imagemLogo, 350, 90, 300, 120);
      } else {
        ctx.drawImage(imagemLogo, 12.5, 45, 300, 120);
      }
      
    }
    
    ctx.font = '18px "04b_19"';
    ctx.textAlign = 'center';

    let reiniciarTexto;
    DISPOSITIVO_USUARIO == 'PC' ? reiniciarTexto='Clique na tela para iniciar' : reiniciarTexto='Clique no botao para iniciar'

    ctx.strokeStyle = 'rgb(82, 55, 71)';
    ctx.lineWidth = 4;
    ctx.strokeText(reiniciarTexto, myCanvas.width / 2, 400);
    ctx.fillStyle = 'rgb(245, 186, 24)';
    ctx.fillText(reiniciarTexto, myCanvas.width / 2, 400);
  }

  function mostrarFimPerdidoJogo() {
    const modalWidth = 250;
    const modalHeight = 120;
    const modalX = (myCanvas.width - modalWidth) / 2;
    const modalY = (myCanvas.height - modalHeight) / 2;
    const borderColor = '#523747';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    const fimJogoPerdidoTexto = 'Game Over';
    ctx.textAlign = 'center';
    ctx.font = '40px "04b_19"';

    ctx.strokeStyle = 'rgb(234, 253, 219)';
    ctx.lineWidth = 12;
    ctx.strokeText(fimJogoPerdidoTexto, myCanvas.width / 2, modalY - 20);
    ctx.strokeStyle = 'rgb(82, 55, 71)';
    ctx.lineWidth = 8;
    ctx.strokeText(fimJogoPerdidoTexto, myCanvas.width / 2, modalY - 20);
    ctx.fillStyle = 'rgb(245, 186, 24)';
    ctx.fillText(fimJogoPerdidoTexto, myCanvas.width / 2, modalY - 20);

    ctx.fillStyle = 'rgb(219, 218, 150)';
    ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
    ctx.font = '20px "04b_19"';
    ctx.fillStyle = 'rgb(234, 253, 219)';
    const details = [
      `Cidade: ${CIDADES[cidadeAtual]}`,
      `Itens Coletados: ${pontuacao}`,
      `Tempo Total: ${minutos < 10 ? '0' : ''}${minutos}:${segundos < 10 ? '0' : ''}${segundos}`
    ];
    
    details.forEach((detail, index) => {
      const yPosition = modalY + 40 + (index * 30);
      ctx.strokeStyle = 'rgb(82, 55, 71)';
      ctx.lineWidth = 3;
      ctx.strokeText(detail, modalX + modalWidth / 2, yPosition);
      ctx.fillText(detail, modalX + modalWidth / 2, yPosition);
    });
    let reiniciarTexto;
    DISPOSITIVO_USUARIO == 'PC' ? reiniciarTexto='Clique na tela para reiniciar' : reiniciarTexto='Clique no botao para reiniciar'
    ctx.strokeStyle = 'rgb(82, 55, 71)';
    ctx.lineWidth = 4;
    ctx.strokeText(reiniciarTexto, myCanvas.width / 2, modalY + modalHeight + 40);
    ctx.fillStyle = 'rgb(245, 186, 24)';
    ctx.fillText(reiniciarTexto, myCanvas.width / 2, modalY + modalHeight + 40);
  }
  function mostrarFimJogo() {
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
    ctx.strokeText('Cidade: ' + CIDADES[cidadeAtual], modalX + modalWidth / 2, modalY + 40);
    ctx.strokeText('Frutas Coletadas: ' + pontuacao, modalX + modalWidth / 2, modalY + 70);
    ctx.strokeText('Tempo Total: ' + (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos, modalX + modalWidth / 2, modalY + 100);
    ctx.fillStyle = 'rgb(234, 253, 219)';
    ctx.fillText('Cidade: ' + CIDADES[cidadeAtual], modalX + modalWidth / 2, modalY + 40);
    ctx.fillText('Frutas Coletadas: ' + pontuacao, modalX + modalWidth / 2, modalY + 70);
    ctx.fillText('Tempo Total: ' + (minutos < 10 ? '0' : '') + minutos + ':' + (segundos < 10 ? '0' : '') + segundos, modalX + modalWidth / 2, modalY + 100);
    ctx.font = '20px "04b_19"'; 

    ctx.strokeStyle = 'rgb(82, 55, 71)'; 
    ctx.lineWidth = 8; 
    let reiniciarTexto;
    DISPOSITIVO_USUARIO == 'PC' ? reiniciarTexto='Clique na tela para reiniciar' : reiniciarTexto='Clique no botao para reiniciar'

    ctx.strokeText(reiniciarTexto, myCanvas.width / 2, modalY + modalHeight + 40);
    ctx.fillStyle = 'rgb(245, 186, 24)'; 
    ctx.fillText(reiniciarTexto, myCanvas.width / 2, modalY + modalHeight + 40);
  }

  function mostrarBarraAlongada() {
    if (DISPOSITIVO_USUARIO === "PC") {
      ctx.drawImage(barraInferior, 0, myCanvas.height - barraInferior.height, 1000, barraInferior.height);
    } else {
      if (deslocamentoBarraInferior
 < -23) deslocamentoBarraInferior
 = 0;
      ctx.drawImage(barraInferior, deslocamentoBarraInferior
, myCanvas.height - barraInferior.height);
    }
  }

  function reiniciarJogo() {
    passaro.y = myCanvas.height / 2;
    passaro.angle = 0;
    canos = []; 
    itens = []; 
    adicionarCanos(); 
    pontuacao = 0; 
    numeroMissao = 0;
    minutos = 0; 
    segundos = 0; 
    numeroMissao = 2;
    cidadeAtual = 0;
  }

  function adicionarCanos() {
    const gapWidth = 180;
    const canoConfiguracao = [
      { x: 500, y: 100, id: 1 },{ x: 800, y: 50, id: 2 },{ x: 1000, y: 250, id: 3 },{ x: 1200, y: 150, id: 4 },
      { x: 1600, y: 100, id: 5 },{ x: 1800, y: 150, id: 6 },{ x: 2000, y: 200, id: 7 },{ x: 2200, y: 250, id: 8 },
      { x: 2400, y: 60, id: 9 },{ x: 2700, y: 300, id: 10 },{ x: 3000, y: 100, id: 11 },{ x: 3300, y: 250, id: 12 },
      { x: 3600, y: 50, id: 13 },{ x: 3900, y: 100, id: 1 },{ x: 4100, y: 120, id: 2 },{ x: 4350, y: 250, id: 3 },
      { x: 4700, y: 150, id: 4 },{ x: 4900, y: 100, id: 5 },{ x: 5110, y: 150, id: 6 },{ x: 5280, y: 200, id: 7 },
      { x: 5400, y: 200, id: 8 },{ x: 5690, y: 60, id: 9 },{ x: 5900, y: 270, id: 10 },{ x: 6100, y: 140, id: 11 },
      { x: 6240, y: 250, id: 12 },{ x: 6400, y: 80, id: 13 }];
    canoConfiguracao.forEach(config => {
        adicionarCano(config.x, config.y, gapWidth, config.id);
    });
    const linhaFinal = new MySprite('http://s2js.com/img/etc/flappyend.png');
    linhaFinal.x = 6700;
    linhaFinal.velocity_x = VELOCIDADE_CANO;
    linhaFinal.finish = true;
    canos.push(linhaFinal);
}
  
  function adicionarItem(x_pos, y_pos) {
    itensColetado++;

    let imageIndex = Math.floor(itensColetado / 2) % ITENS_IMAGENS.length;
    let miniItem = new MySprite(ITENS_IMAGENS[imageIndex]);
  
    miniItem.x = x_pos;
    miniItem.y = y_pos;
    miniItem.velocity_x = VELOCIDADE_CANO;
    itens.push(miniItem);
    divItens++;
  }

  function adicionarItemMeio(x_pos, top_of_gap, gap_width, city) {
    let middle_y = top_of_gap + (gap_width / 2);
    adicionarItem(x_pos, middle_y, city);
  }

  function checarItem() {
    for (let i = 0; i < itens.length; i++) {
      if (tocarImagens(passaro, itens[i])) {
        itens[i].visible = false; 
        pontuacao += 1;
        if (pontuacao === numeroMissao) {
          cidadeAtual += 1;
          numeroMissao += 2;
        }
      }
    }
  }

  function desenharMenu() {
    const posY = 10;

    let placa = new Image();
    placa.src = './assets/images/FlappyPlate.webp';

    ctx.drawImage(placa, 0, 0, 140, 110);

    ctx.textAlign = 'left';
    ctx.font = '11px "04b_19"';
    
    
    let posXText = 28;
    let timeText = 'Tempo: ' + (minutos < 10 ? '0' : '') + minutos + ' : ' + (segundos < 10 ? '0' : '') + segundos;
    let itemsText = 'Itens: ' + pontuacao;
    let cityText = CIDADES[cidadeAtual];
    ctx.fillStyle = 'rgb(250, 250,250)';
    ctx.fillText(timeText, posXText, posY + 40);
    ctx.fillText(itemsText, posXText, posY + 60);
    ctx.fillText(cityText, posXText, posY + 80);
}


  function adicionarTemporizador() {
    if (emJogo == true) {
      segundos++;
      if (segundos === 60) {
        segundos = 0;
        minutos++;
      }
    }
  }

  function FazerAcao() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    passaro.fazerAtualizacoes();
    mostrarBarraAlongada();
    switch (modoAtual) {
      case 'prestart': {
        mostrarInstrucoesInicio();
        break;
      }
      case 'running': {
        horaUltimaPartida = new Date();
        deslocamentoBarraInferior += VELOCIDADE_CANO;
        mostrarOsCanos();
        mostrarItens();
        inclinarPassaro();
        fazerPassaroCairLento();
        checarFinalJogo();
        checarItem();
        desenharMenu();
        emJogo = true;
        break;
      }
      case 'over': {
        fazerPassaroCairLento();
        mostrarFimPerdidoJogo();
        emJogo = false;
        break;
      }
      case 'finish': {
        mostrarFimJogo();
        emJogo = false;
        break;
      }
    }
  }
  let barraInferior = new Image();
  barraInferior.src = './assets/images/flappybottom.webp'; 

  let passaro = new MySprite('./assets/images/FlappyBird.webp'); 
  passaro.x = myCanvas.width / 4.0;
  passaro.y = myCanvas.height / 2;

  setInterval(adicionarTemporizador, 1000);
  setInterval(FazerAcao, 1000 / FPS);