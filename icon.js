const fs = require('fs');
const { createCanvas } = require('canvas');

// Criar um canvas de 256x256 pixels para o ícone do instalador
const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Fundo transparente
ctx.clearRect(0, 0, 256, 256);

// Criar um círculo branco sólido
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.arc(128, 128, 64, 0, Math.PI * 2);
ctx.fill();

// Salvar como PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon.png', buffer);
