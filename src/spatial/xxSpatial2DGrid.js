

// #region SUPPORT OBJECTS

// Hold a collection of spatial items
class SpatialCell {
  items: Array<SpatialItem> = [];
  push(itm: SpatialItem) {
    this.items.push(itm);
  }
  clear() {
    this.items.length = 0;
  }
}

// A position marked in a spatial grid that can hold any custom data the programmer
// may need to help define extra meaning to the point
class SpatialItem {
  // $FlowIgnore(unclear-type)
  customData: any = null; // Custom Data
  position: Array<number> = [0, 0];
  queryId: number = 0; // Query ID, helps identify that this item has already been saved for a query

  // $FlowIgnore(unclear-type)
  constructor(x: number, y: number, data: any = null) {
    this.position = [0, 0];
    this.queryId = 0;
    this.customData = data;
    this.setPos(x, y);
  }

  // $FlowIgnore(unclear-type)
  setData(d: any): this {
    this.customData = d;
    return this;
  }

  // Set the Position of the Item
  setPos(x: number, y: number): this {
    this.position[0] = x;
    this.position[1] = y;
    return this;
  }
}
// #endregion

/** Grid definition of a rect area. Each grid cell is considered a spatial area that
 * is used to store items. Spatial items are then added to the grid depending on their
 * position and size. For example, a circle item can be large enough where it overlaps
 * several cells, so that item is added to each overlapping cell.
 *
 * The main reason for this object is for fast lookups of 2D assets
 * by querying a position & range.
 */
export default class Spatial2DGrid {
  // #region MAIN
  cells: Array<SpatialCell | null> = []; // Grid cells are stored in a flat array
  width: number = 0; // Width of the grid
  height: number = 0; // Height of the grid
  cellSize: number = 100; // How large should a grid cell be
  cellXLen: number = 0; // Number of columns in the grid
  cellYLen: number = 0; // Number of rows in the grid
  queryId: number = 0; // Help create a unique list of spatial items by selecting one per query
  // #endregion

  // #region PRIVATE METHODS
  /** Resizes cell buffer while computing the cell x y count */
  _computeGrid(): void {
    this.cellXLen = Math.ceil(this.width / this.cellSize);
    this.cellYLen = Math.ceil(this.height / this.cellSize);

    // Append to cell if needed
    const cellLen = this.cellXLen * this.cellYLen;
    for (let i = this.cells.length; i < cellLen; i++) {
      this.cells.push(null);
    }
  }

  /** Convert grid coordinates to cell index */
  _gridToCellId(gx: number, gy: number): number {
    const y = gy > this.cellYLen ? this.cellYLen : gy < 0 ? 0 : gy;
    const x = gx > this.cellXLen ? this.cellXLen : gx < 0 ? 0 : gx;
    return y * this.cellXLen + x;
  }

  /** Convert Screen Coordinates to Cell Index */
  _screenToCellId(sx: number, sy: number) {
    const coord = this._screenToGridCoord(sx, sy);
    return this._gridToCellId(coord[0], coord[1]);
  }

  /** Convert Screen Coordinates to Grid Coordinates */
  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */
  _screenToGridCoord(sx, sy): Array<number> {
    const gx = Math.floor(sx / this.cellSize);
    const gy = Math.floor(sy / this.cellSize);
    return [gx, gy];
  }

  /** Compute the Mid Position of a cell from grid coordinates */
  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */
  _cellMidPoint(gx, gy): Array<number> {
    return [
      gx * this.cellSize + this.cellSize * 0.5,
      gy * this.cellSize + this.cellSize * 0.5,
    ];
  }
  // #endregion

  // #region SETTERS

  /** Set the size of the grid */
  setAreaSize(w: number, h: number): this {
    this.width = w;
    this.height = h;
    this._computeGrid();
    return this;
  }

  /** Set the square size of a cell */
  setCellSize(v: number): this {
    this.cellSize = v;
    return this;
  }
  // #endregion

  // #region MANAGE CELLS

  /** Internal method to add a spatial item to a cell */
  /* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
   * LTI update could not be added via codemod */
  _addToCell(gx, gy, sItem) {
    const idx = this._gridToCellId(gx, gy);
    let cell = this.cells[idx];

    // Cell is empty, create Spatial Cell to hold items.
    if (!cell) {
      this.cells[idx] = cell = new SpatialCell();
    }

    // Add Item to Cell
    cell.push(sItem);
  }

  /** Get Spatial Cell from Grid Coordinates */
  getCell(gx: number, gy: number): SpatialCell | null {
    const idx = this._gridToCellId(gx, gy);
    return this.cells[idx];
  }

  /** Remove all spatial items from the grid & reset queryId */
  clear(): this {
    for (const i of this.cells) {
      if (i) {
        i.clear();
      }
    }
    this.queryId = 0;
    return this;
  }
  // #endregion

  // #region METHODS

  // Add a circle collider to the grid. Add item to any overlapping cells.
  // $FlowIgnore(unclear-type)
  addCircle(sx: number, sy: number, radius: number, data: any = null) {
    // Compute the bounding box of the circle
    const minX = Math.max(sx - radius, 0);
    const minY = Math.max(sy - radius, 0);
    const maxX = Math.min(sx + radius, this.width);
    const maxY = Math.min(sy + radius, this.height);

    // Min & Max Grid Cordinates that the Circle Fits in.
    const gMin = this._screenToGridCoord(minX, minY);
    const gMax = this._screenToGridCoord(maxX, maxY);

    // Add Item to all the cells its within range
    const sItem = new SpatialItem(sx, sy, data);
    let gx, gy;
    for (gy = gMin[1]; gy <= gMax[1]; gy++) {
      for (gx = gMin[0]; gx <= gMax[0]; gx++) {
        this._addToCell(gx, gy, sItem);
      }
    }
  }

  /** Run a near query, returns any spatial item within a range of the screen position */
  getNear(
    sx: number, // Screen coordinates
    sy: number,
    xRange: number = 0, // X Cell Range
    yRange: number = 0, // Y Cell Range
  ): Array<SpatialItem> {
    const gCoord = this._screenToGridCoord(sx, sy);
    const midPnt = this._cellMidPoint(gCoord[0], gCoord[1]);

    // Use Mid Point to define range
    let minX, maxX;
    if (sx < midPnt[0]) {
      // To the left of the mid point
      minX = Math.max(gCoord[0] - xRange, 0);
      maxX = gCoord[0];
    } else {
      // To the right of the mid point
      minX = gCoord[0];
      maxX = Math.min(gCoord[0] + xRange, this.cellXLen);
    }

    let minY, maxY;
    if (sy < midPnt[1]) {
      // Above Mid point
      minY = Math.max(gCoord[1] - yRange, 0);
      maxY = gCoord[1];
    } else {
      // Below Mid Point
      minY = gCoord[1];
      maxY = Math.min(gCoord[1] + yRange, this.cellYLen);
    }

    // Begin query, loop all the cells within the range
    // and return a unique list of spatial Items
    const qId = ++this.queryId;
    const rtnSpatialItems: Array<SpatialItem> = [];
    let gx, gy, cell, itm;

    for (gy = minY; gy <= maxY; gy++) {
      for (gx = minX; gx <= maxX; gx++) {
        // Get cell and check if there are any items available
        cell = this.getCell(gx, gy);
        if (!cell || cell.items.length === 0) {
          continue;
        }

        // Collect a unique list of items
        for (itm of cell.items) {
          if (itm.queryId !== qId) {
            itm.queryId = qId; // Update ID so it won't be picked again.
            rtnSpatialItems.push(itm); // Save item for return list
          }
        }
      }
    }
    return rtnSpatialItems;
  }
  // #endregion
}
