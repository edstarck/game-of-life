const state = {
  grid: null,
  gridWidth: null,
  gridHeight: null,
  cellSize: 10,
  requestId: null,
  gameInterval: null,
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
  getNeighborCount(x, y) {
    let count = 0
    //   1 0 1
    //   1 I(0,0) 0
    //   0 0 1

    //   sum += grid[i - 1][j - 1]
    //   sum += grid[i][j - 1]
    //   sum += grid[i + 1][j - 1]
    //   etc......

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        // exclude myself from neighbors
        if (dx === 0 && dy === 0) {
          continue
        }
        let nx = (x + dx + state.gridWidth) % state.gridWidth
        let ny = (y + dy + state.gridHeight) % state.gridHeight
        count += state.grid[nx][ny]
      }
    }
    return count
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

    state.gridWidth = Math.ceil(state.canvas.width / state.cellSize)
    state.gridHeight = Math.ceil(state.canvas.height / state.cellSize)
  },
  createEmptyGrid() {
    state.grid = new Array(state.gridWidth)
    for (let i = 0; i < state.gridWidth; i++) {
      state.grid[i] = new Array(state.gridHeight).fill(0)
    }
  },
  updateGrid() {
    const {drawGrid, getNeighborCount} = methods

    let newGrid = new Array(state.gridWidth)
    for (let i = 0; i < state.gridWidth; i++) {
      newGrid[i] = new Array(state.gridHeight).fill(0)
    }

    for (let x = 0; x < state.gridWidth; x++) {
      for (let y = 0; y < state.gridHeight; y++) {
        let neighbors = getNeighborCount(x, y)
        if (state.grid[x][y] === 1 && (neighbors < 2 || neighbors > 3)) {
          newGrid[x][y] = 0
        } else if (state.grid[x][y] === 0 && neighbors === 3) {
          newGrid[x][y] = 1
        } else {
          newGrid[x][y] = state.grid[x][y]
        }
      }
    }

    if (JSON.stringify(newGrid) === JSON.stringify(state.grid)) {
      clearInterval(state.gameInterval)
      // cancelAnimationFrame(state.requestId)
      alert('Игра окончена!')
      return
    }

    state.grid = newGrid
    drawGrid()

    // state.requestId = requestAnimationFrame(mutation.updateGrid)
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
  const {updateGrid} = mutation
  state.gameInterval = setInterval(updateGrid, 100)
  //   updateGrid()
})
document.getElementById('pause-btn').addEventListener('click', function () {
  //   cancelAnimationFrame(state.requestId)
  clearInterval(state.gameInterval)
})
document.getElementById('clear-btn').addEventListener('click', function () {
  const {drawGrid} = methods
  //   cancelAnimationFrame(state.requestId)
  clearInterval(state.gameInterval)

  for (let i = 0; i < state.gridWidth; i++) {
    state.grid[i].fill(0)
  }

  drawGrid()
})
document.getElementById('random-btn').addEventListener('click', function () {
  const {drawGrid} = methods

  for (let x = 0; x < state.gridWidth; x++) {
    for (let y = 0; y < state.gridHeight; y++) {
      state.grid[x][y] = Math.random() < 0.5 ? 1 : 0
    }
  }

  drawGrid() // create a random initial generation
})
