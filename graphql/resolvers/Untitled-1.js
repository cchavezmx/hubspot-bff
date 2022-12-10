/*
const cube = createCube(3)
  /\_\_\_\
 /\/\_\_\_\
/\/\/\_\_\_\
\/\/\/_/_/_/
 \/\/_/_/_/
  \/_/_/_/
Como ves el cubo tiene tres caras visualmente. Los símbolos que se usan para construir las caras del cubo son: /, \, _ y (espacio en blanco).

Otros ejemplos de cubos:

const cubeOfOne = createCube(1)
/\_\
\/_/
const cubeOfTwo = createCube(2)
 /\_\_\
/\/\_\_\
\/\/_/_/
 \/_/_/
A tener en cuenta:

Fíjate bien en los espacios en blanco que hay en el cubo.
El cubo tiene que ser simétrico.
Asegúrate de usar los símbolos correctos.
Cada nueva línea del cubo debe terminar con un salto de línea (\n) excepto la última.

*/

const createCube = (n) => {
  // Your code here
  let cube = ''
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      cube += '/'
      for (let k = 0; k < n; k++) {
        cube += '_'
      }
      cube += '\\'
    }
    cube += '\n'
  }
}
