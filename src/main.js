const state = {
  grid: null,
  gridWidth: 1000,
  gridHeight: 1000,
  cellSize: 10,
}

const worker = new Worker('worker.js')
const canvas = document.getElementById('myCanvas')
canvas.width = state.gridWidth
canvas.height = state.gridHeight
const offscreenCanvas = canvas.transferControlToOffscreen()

worker.postMessage(
  {
    type: 'init',
    offscreenCanvas,
    gridWidth: state.gridWidth,
    gridHeight: state.gridHeight,
    cellSize: state.cellSize,
  },
  [offscreenCanvas]
)

worker.onmessage = function (e) {
  const {type} = e.data

  switch (type) {
    case 'gameEnded':
      alert('Игра окончена!')
      break
    default:
      console.error('Unknown message type:', type)
  }
}

document.getElementById('start-btn').addEventListener('click', function () {
  worker.postMessage({type: 'start'})
})

document.getElementById('pause-btn').addEventListener('click', function () {
  worker.postMessage({type: 'pause'})
})

document.getElementById('clear-btn').addEventListener('click', function () {
  worker.postMessage({type: 'clear'})
})

document.getElementById('random-btn').addEventListener('click', function () {
  worker.postMessage({type: 'randomize'})
})

canvas.addEventListener('click', function (event) {
  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) / state.cellSize)
  const y = Math.floor((event.clientY - rect.top) / state.cellSize)

  worker.postMessage({type: 'toggleCell', payload: {x, y}})
})
