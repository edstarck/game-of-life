const state = {
  grid: null,
  nextGrid: null,
  gridWidth: null,
  gridHeight: null,
  cellSize: 10,
  requestId: null,
  gameInterval: null,
  changedCells: new Set(),
  canvas: document.createElement('canvas'),
  getCtx() {
    return this.canvas.getContext('2d')
  },
}

const methods = {
  drawGrid() {
    const ctx = state.getCtx()

    for (const cell of state.changedCells) {
      const [x, y] = cell.split(',').map(Number)
      const fillStyle = state.grid[x][y] === 1 ? 'black' : 'white'

      // cash coordinates
      const xPos = x * state.cellSize
      const yPos = y * state.cellSize

      ctx.fillStyle = fillStyle
      ctx.fillRect(xPos, yPos, state.cellSize, state.cellSize)
      ctx.strokeRect(xPos, yPos, state.cellSize, state.cellSize)
    }

    state.changedCells.clear()
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
    state.nextGrid = new Array(state.gridWidth)
    for (let i = 0; i < state.gridWidth; i++) {
      state.grid[i] = new Array(state.gridHeight).fill(0)
      state.nextGrid[i] = new Array(state.gridHeight).fill(0)
    }

    // Initialize changedCells with all cell coordinates
    for (let x = 0; x < state.gridWidth; x++) {
      for (let y = 0; y < state.gridHeight; y++) {
        state.changedCells.add(`${x},${y}`)
      }
    }
  },
  updateGrid() {
    const {drawGrid, getNeighborCount} = methods
    const newGrid = state.grid.map((row) => [...row])

    for (let x = 0; x < state.gridWidth; x++) {
      for (let y = 0; y < state.gridHeight; y++) {
        let neighbors = getNeighborCount(x, y)
        if (state.grid[x][y] === 1 && (neighbors < 2 || neighbors > 3)) {
          state.nextGrid[x][y] = 0
        } else if (state.grid[x][y] === 0 && neighbors === 3) {
          state.nextGrid[x][y] = 1
        } else {
          state.nextGrid[x][y] = state.grid[x][y]
        }

        // Add cells to the changedCells set only if their state has changed
        if (state.nextGrid[x][y] !== state.grid[x][y]) {
          state.changedCells.add(`${x},${y}`)
        }
      }
    }

    if (JSON.stringify(state.nextGrid) === JSON.stringify(state.grid)) {
      clearInterval(state.gameInterval)
      alert('Игра окончена!')
      return
    }

    // Swap grid and nextGrid
    ;[state.grid, state.nextGrid] = [state.nextGrid, state.grid]
    drawGrid()
  },
}

document.addEventListener('DOMContentLoaded', function () {
  const {createCanvas, createEmptyGrid} = mutation
  const {drawGrid} = methods

  createCanvas('app', {w: 2000, h: 2000})
  createEmptyGrid()
  drawGrid()
})

state.canvas.addEventListener('click', function (event) {
  const {drawGrid} = methods
  const rect = state.canvas.getBoundingClientRect()

  const x = Math.floor((event.clientX - rect.left) / state.cellSize)
  const y = Math.floor((event.clientY - rect.top) / state.cellSize)

  state.grid[x][y] = 1 - state.grid[x][y]

  // Add this cell to changedCells so it will be redrawn
  state.changedCells.add(`${x},${y}`)

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

  clearInterval(state.gameInterval)

  for (let x = 0; x < state.gridWidth; x++) {
    for (let y = 0; y < state.gridHeight; y++) {
      const oldValue = state.grid[x][y]
      state.grid[x][y] = 0

      // If the cell value changed, add it to changedCells
      if (oldValue !== 0) {
        state.changedCells.add(`${x},${y}`)
      }
    }
  }

  drawGrid()
})
document.getElementById('random-btn').addEventListener('click', function () {
  const {drawGrid} = methods

  for (let x = 0; x < state.gridWidth; x++) {
    for (let y = 0; y < state.gridHeight; y++) {
      const oldValue = state.grid[x][y]
      const newValue = Math.random() < 0.5 ? 1 : 0

      state.grid[x][y] = newValue

      // If the cell value changed, add it to changedCells
      if (oldValue !== newValue) {
        state.changedCells.add(`${x},${y}`)
      }
    }
  }

  drawGrid() // create a random initial generation
})
