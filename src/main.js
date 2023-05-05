const state = {
  grid: null,
  gridWidth: null,
  gridHeight: null,
  cellSize: 20,
  canvas: document.createElement('canvas'),
  getCtx() {
    return this.canvas.getContext('2d')
  },
}

const methods = {
  drawGrid() {
    const ctx = state.getCtx()

    for (let x = 0; x < state.gridWidth; x++) {
      for (let y = 0; y < state.gridHeight; y++) {
        if (state.grid[x][y] === 1) {
          ctx.fillStyle = 'black'
        } else {
          ctx.fillStyle = 'white'
        }
        ctx.fillRect(
          x * state.cellSize,
          y * state.cellSize,
          state.cellSize,
          state.cellSize
        )
        ctx.strokeRect(
          x * state.cellSize,
          y * state.cellSize,
          state.cellSize,
          state.cellSize
        )
      }
    }
  },
}

const mutation = {
  createCanvas(el, {w, h}) {
    state.canvas.width = w
    state.canvas.height = h

    const ctx = state.getCtx()

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, state.canvas.width, state.canvas.height)
    document.getElementById(el).appendChild(state.canvas)

    state.gridWidth = state.canvas.width / state.cellSize
    state.gridHeight = state.canvas.height / state.cellSize
  },
  createEmptyGrid() {
    state.grid = new Array(state.gridWidth)
    for (let i = 0; i < state.gridWidth; i++) {
      state.grid[i] = new Array(state.gridHeight).fill(0)
    }
  },
}

document.addEventListener('DOMContentLoaded', function () {
  const {createCanvas, createEmptyGrid} = mutation
  const {drawGrid} = methods

  createCanvas('app', {w: 600, h: 400})
  createEmptyGrid()
  drawGrid()
})

state.canvas.addEventListener('click', function (event) {
  const {drawGrid} = methods
  const rect = state.canvas.getBoundingClientRect()
  // coordinates are relative to the upper left corner
  const x = Math.floor((event.clientX - rect.left) / state.cellSize)
  const y = Math.floor((event.clientY - rect.top) / state.cellSize)

  state.grid[x][y] = 1 - state.grid[x][y] // toggle cell value on mouse click
  drawGrid()
})

// Actions UI
document.getElementById('start-btn').addEventListener('click', function () {
  console.log('start')
})
document.getElementById('clear-btn').addEventListener('click', function () {
  console.log('clear')
})
document.getElementById('random-btn').addEventListener('click', function () {
  console.log('random')
})
