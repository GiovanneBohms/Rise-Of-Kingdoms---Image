
const fs = require('fs');
const Jimp = require('jimp');

const caminhoImagemOriginal = 'img.jpg';
const caminhoImagemRedimensionadaCom4Cores = 'imgR.jpg';
const tamanhoRedimensionado = 43;
const maximoLinhas = 43;
const letras = "█▇▓▒░ "
const cores = letras.length;
const corText = "black"
const contraste = 0.6

async function inverterCores() {
  try {
      const imagem = await Jimp.read(caminhoImagemOriginal);
      imagem.invert();

      await imagem.writeAsync(caminhoImagemRedimensionadaCom4Cores);

      console.log('Cores da imagem invertidas com sucesso!');
  } catch (error) {
      console.error('Erro ao inverter as cores da imagem:', error);
  }
}

async function redimensionarEReduzirPara4Cores() {
    try {
        // await inverterCores();
        const imagem = await Jimp.read(caminhoImagemOriginal);
        imagem.contrast(contraste)

        imagem.resize(tamanhoRedimensionado, Jimp.AUTO);
        await imagem.posterize(cores);

        await imagem.writeAsync(caminhoImagemRedimensionadaCom4Cores);

        console.log('Imagem redimensionada e com 4 cores gerada com sucesso!');
    } catch (error) {
        console.error('Erro ao redimensionar e reduzir para 4 cores:', error);
    }
}

async function converterImagemParaMatrizComLimiteDeLinhas(maximoLinhas) {
    try {
        await redimensionarEReduzirPara4Cores();

        const imagemRedimensionada = await Jimp.read(caminhoImagemRedimensionadaCom4Cores);

        const largura = imagemRedimensionada.getWidth();
        const altura = imagemRedimensionada.getHeight();

        const matrizPixels = [];

        for (let y = 0; y < altura; y++) {
            const linha = [];
            for (let x = 0; x < largura; x++) {
                const pixel = Jimp.intToRGBA(imagemRedimensionada.getPixelColor(x, y));
                const valorPixel = Math.ceil((pixel.r + pixel.g + pixel.b) / (256 * 3 / 4));
                linha.push(valorPixel);
            }
            matrizPixels.push(linha);
        }

        if (matrizPixels.length > maximoLinhas) {
            matrizPixels.splice(maximoLinhas);
        }

        return matrizPixels;
    } catch (error) {
        console.error('Erro ao converter a imagem para matriz:', error);
        return null;
    }
}

function matrizParaStringComQuebraDeLinha(matriz) {
    let resultado = '';

    

    for (let linha of matriz) {
        for (let valor of linha) {
            let caractere = letras[valor];
            resultado += caractere;
        }
        resultado += '\n';
    }
    
    return resultado;
}

converterImagemParaMatrizComLimiteDeLinhas(maximoLinhas).then((matriz) => {
  if (matriz) {
      const stringComQuebrasDeLinha = matrizParaStringComQuebraDeLinha(matriz);
      const stringFinal = `<color=${corText}><size=3>\n${stringComQuebrasDeLinha}\n</size></color>`;
      fs.writeFile('img.txt', stringFinal, (err) => {
          if (err) {
              console.error('Erro ao salvar a string no arquivo:', err);
          } else {
              console.log('String salva em img.txt com sucesso!');
          }
      });
      console.log('String gerada com no máximo 40 linhas:\n', stringFinal);
  } else {
      console.log('Não foi possível gerar a matriz.');
  }
});