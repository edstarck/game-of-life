let ctx
let offscreenCanvas
let state = {
  grid: null,
  gridWidth: null,
  gridHeight: null,
  cellSize: 10,
  gameInterval: null,
}

function createEmptyGrid() {
  state.grid = new Array(state.gridWidth)
  for (let i = 0; i < state.gridWidth; i++) {
    state.grid[i] = new Array(state.gridHeight).fill(0)
  }
  drawGrid()
}
function getNeighborCount(x, y) {
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
}
function updateGrid() {
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
    postMessage({type: 'gameEnded'})
    return
  }

  state.grid = newGrid
  drawGrid()
}
function drawGrid() {
  ctx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height)

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
}
function clearGrid() {
  for (let i = 0; i < state.gridWidth; i++) {
    state.grid[i].fill(0)
  }
  drawGrid()
}
function randomizeGrid() {
  for (let x = 0; x < state.gridWidth; x++) {
    for (let y = 0; y < state.gridHeight; y++) {
      state.grid[x][y] = Math.random() < 0.5 ? 1 : 0
    }
  }
  drawGrid()
}

self.onmessage = (event) => {
  const {type, payload, offscreenCanvas: offscreen} = event.data

  switch (type) {
    case 'init':
      offscreenCanvas = offscreen
      ctx = offscreenCanvas.getContext('2d')
      state.gridWidth = Math.ceil(offscreenCanvas.width / state.cellSize)
      state.gridHeight = Math.ceil(offscreenCanvas.height / state.cellSize)
      createEmptyGrid()
      break
    case 'start':
      state.gameInterval = setInterval(updateGrid, 100)
      break
    case 'pause':
      clearInterval(state.gameInterval)
      break
    case 'clear':
      clearGrid()
      break
    case 'randomize':
      randomizeGrid()
      break
    case 'toggleCell':
      const {x, y} = payload
      state.grid[x][y] = 1 - state.grid[x][y] // toggle cell value
      drawGrid()
      break
  }
}
