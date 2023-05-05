### Terms:

- Any live cell with fewer than two live neighbours dies, as if by underpopulation.
- Any live cell with two or three live neighbours lives on to the next generation.
- Any live cell with more than three live neighbours dies, as if by overpopulation.
- Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

- For the playing field, it is proposed to use torus surface emulation
- The field can be of any size.
- We propose to do the generation of the first generation using the mouse.

### Algorithm:

- 0 --> 3 live --> 1
- 1 --> < 2 live || > 3 live --> 0

### Torus surface emulation:

A toroidal field is a field in which the outer cells are considered neighbors.
In 2D space, it looks as if the left and right edges of the field were glued together,
and the top and bottom edges of the field were also glued together,
forming a donut or torus shape in 3D space.

```js
function getNeighborCount(x, y) {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue
      let nx = (x + dx + gridWidth) % gridWidth
      let ny = (y + dy + gridHeight) % gridHeight
      count += grid[nx][ny]
    }
  }
  return count
}
```

Here we are looking for neighbors for each cell by checking the cells around it.
When we get to the edges of the grid, we use the % modulo operator to "wrap"
the coordinates around to the other side of the grid.

In this piece of code, nx and ny are the coordinates of the neighboring cell.
If x + dx or y + dy go off the grid, then (x + dx + gridWidth) % gridWidth or (y + dy + gridHeight) % gridHeight make them "flip" to the other side of the grid.
This creates the effect of a toroidal field.

### Optimisation game:

One approach to improve performance might be to track changes in the mesh and only redraw cells that have actually changed. To do this, we will need to store the previous state of the grid and compare it with the current one on each update.

However, this approach can become quite difficult to implement. Moreover, for large grids such as 1000x1000, even determining which cells have changed can be challenging and time consuming in itself.

Instead, you can try other optimization techniques:

- Algorithm HashLife
- Use webworker
