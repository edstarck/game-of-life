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
    // Создание offscreen canvas с такими же размерами, как и основной canvas
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = state.canvas.width
    offscreenCanvas.height = state.canvas.height
    const offscreenCtx = offscreenCanvas.getContext('2d')

    for (const cell of state.changedCells) {
      const [x, y] = cell.split(',').map(Number)
      const fillStyle = state.grid[x][y] === 1 ? 'black' : 'white'

      // cash coordinates
      const xPos = x * state.cellSize
      const yPos = y * state.cellSize

      offscreenCtx.fillStyle = fillStyle
      offscreenCtx.fillRect(xPos, yPos, state.cellSize, state.cellSize)
      offscreenCtx.strokeRect(xPos, yPos, state.cellSize, state.cellSize)
    }

    state.changedCells.clear()

    // Отображение offscreen canvas на основной canvas
    const ctx = state.getCtx()
    ctx.drawImage(offscreenCanvas, 0, 0)
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
    const {getNeighborCount} = methods
    let newGrid = JSON.parse(JSON.stringify(state.grid))
    let activeCells = new Set()

    // Поиск активных клеток
    for (let x = 0; x < state.gridWidth; x++) {
      for (let y = 0; y < state.gridHeight; y++) {
        let neighbors = getNeighborCount(x, y)
        if (state.grid[x][y] === 1 || neighbors === 3) {
          activeCells.add(`${x},${y}`)
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              let nx = (x + dx + state.gridWidth) % state.gridWidth
              let ny = (y + dy + state.gridHeight) % state.gridHeight
              activeCells.add(`${nx},${ny}`)
            }
          }
        }
      }
    }

    // Обновление активных клеток
    for (let cell of activeCells) {
      let [x, y] = cell.split(',').map(Number)
      let neighbors = getNeighborCount(x, y)
      if (state.grid[x][y] === 1 && (neighbors < 2 || neighbors > 3)) {
        newGrid[x][y] = 0
        state.changedCells.add(cell)
      } else if (state.grid[x][y] === 0 && neighbors === 3) {
        newGrid[x][y] = 1
        state.changedCells.add(cell)
      }
    }

    if (JSON.stringify(newGrid) === JSON.stringify(state.grid)) {
      clearInterval(state.gameInterval)
      alert('Игра окончена!')
      return
    }

    state.grid = newGrid
    methods.drawGrid()
  },
}

document.addEventListener('DOMContentLoaded', function () {
  const {createCanvas, createEmptyGrid} = mutation
  const {drawGrid} = methods

  createCanvas('app', {w: 1000, h: 1000})
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
  state.gameInterval = setInterval(function () {
    requestAnimationFrame(updateGrid)
  }, 100)
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
