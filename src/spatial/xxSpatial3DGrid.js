

import {vec3} from 'gl-matrix';

type TVec3 = Array<number>;

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
  position: Array<number> = [0, 0, 0];
  queryId: number = 0; // Query ID, helps identify that this item has already been saved for a query

  // $FlowIgnore(unclear-type)
  constructor(x: number, y: number, z: number, data: any = null) {
    this.queryId = 0;
    this.customData = data;
    this.setPos(x, y, z);
  }

  // $FlowIgnore(unclear-type)
  setData(d: any): this {
    this.customData = d;
    return this;
  }

  // Set the Position of the Item
  setPos(x: number, y: number, z: number): this {
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;
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
export default class Spatial3DGrid {
  // #region MAIN
  cells: Array<SpatialCell | null> = []; // Grid cells are stored in a flat array

  minBound: TVec3 = [0, 0, 0]; // Min Position of Grid in World Space
  maxBound: TVec3 = [0, 0, 0]; // Max Position of Grid in World Space
  dimension: TVec3 = [0, 0, 0]; // How many cells in each axis
  maxCoord: TVec3 = [0, 0, 0]; // Max Coordinate for the Grid

  cellSize: number = 1; // Size of Each cell in grid
  xzCount: number = 0;
  queryId: number = 0; // Help create a unique list of spatial items by selecting one per query
  // #endregion

  // #region PRIVATE METHODS
  /** Resizes cell buffer while computing the cell x y count */
  _computeCells(): void {
    // Append to Cell if Needed
    const cellLen = this.dimension[0] * this.dimension[1] * this.dimension[2];
    for (let i = this.cells.length; i < cellLen; i++) {
      this.cells.push(null);
    }
  }

  /** Convert grid coordinates to cell index */
  _gridIdx(coord: TVec3): number {
    const c = SculptorMath.vec3_clamp(
      [0, 0, 0],
      [0, 0, 0],
      this.maxCoord,
      coord,
    );
    return c[1] * this.xzCount + c[2] * this.dimension[0] + c[0];
  }

  /** Convert WorldSpace Position to Grid Coordinates */
  _coordGrid(pos: TVec3): TVec3 {
    const v = vec3.sub([0, 0, 0], pos, this.minBound);
    vec3.scale(v, v, 1 / this.cellSize);
    vec3.floor(v, v);
    return v;
  }

  /** Get Midpoint of a cell from Grid Coordinates */
  _cellMidPoint(coord: TVec3) {
    return [
      coord[0] * this.cellSize + this.cellSize * 0.5,
      coord[1] * this.cellSize + this.cellSize * 0.5,
      coord[2] * this.cellSize + this.cellSize * 0.5,
    ];
  }

  _posInGrid(pos: TVec3): boolean {
    const min = this.minBound;
    const max = this.maxBound;
    return (
      pos[0] >= min[0] &&
      pos[0] <= max[0] &&
      pos[1] >= min[1] &&
      pos[1] <= max[1] &&
      pos[2] >= min[2] &&
      pos[2] <= max[2]
    );
  }
  // #endregion

  // #region SETTERS
  setCellSize(v: number): this {
    this.cellSize = v;
    return this;
  }

  /** Compute a Min/Max Chunk Boundary that fits over another bounds by using cell size */
  fitBound(bMin: TVec3, bMax: TVec3): this {
    // Figure out how many voxels can be made in bounding box
    const vsize = vec3.sub([0, 0, 0], bMax, bMin); // Get Length of Each Axis
    vec3.scale(vsize, vsize, 1 / this.cellSize);
    vec3.ceil(vsize, vsize);
    vec3.copy(this.dimension, vsize);
    vec3.scale(vsize, vsize, this.cellSize);

    this.xzCount = this.dimension[0] * this.dimension[2];
    vec3.sub(this.maxCoord, this.dimension, [1, 1, 1]);

    // Set the starting volume
    vec3.copy(this.minBound, [0, 0, 0]);
    vec3.copy(this.maxBound, vsize);

    // Move Volume's Mid Point to the Mesh's Mid Point
    const aMid = vec3.lerp([0, 0, 0], bMin, bMax, 0.5);
    const bMid = vec3.lerp([0, 0, 0], this.minBound, this.maxBound, 0.5);
    const delta = vec3.sub([0, 0, 0], bMid, aMid);
    vec3.sub(this.minBound, this.minBound, delta);
    vec3.sub(this.maxBound, this.maxBound, delta);

    this._computeCells();
    return this;
  }
  // #endregion

  // #region MANAGE CELLS
  _addToCell(coord: TVec3, sItem: SpatialItem): void {
    const idx = this._gridIdx(coord);

    let cell = this.cells[idx];
    if (!cell) {
      this.cells[idx] = cell = new SpatialCell();
    }

    cell.push(sItem);
  }

  getCell(coord: TVec3): SpatialCell | null {
    const idx = this._gridIdx(coord);
    return this.cells[idx];
  }

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
  /** Add a Sphere to the Spacing Grid */
  // $FlowIgnore(unclear-type)
  addSphere(pos: TVec3, radius: number, data: any = null) {
    // Compute the bounding area of the Circle
    const r = [radius, radius, radius];
    const min = vec3.sub([0, 0, 0], pos, r);
    const max = vec3.add([0, 0, 0], pos, r);
    vec3.max(min, min, this.minBound);
    vec3.min(max, max, this.maxBound);

    // Min & Max Grid Cordinates that the Circle Fits in.
    const gMin = this._coordGrid(min);
    const gMax = this._coordGrid(max);

    // Add Item to all the cells its within range
    const sItem = new SpatialItem(pos[0], pos[1], pos[2], data);
    let gx, gy, gz;
    for (gy = gMin[1]; gy <= gMax[1]; gy++) {
      for (gz = gMin[2]; gz <= gMax[2]; gz++) {
        for (gx = gMin[0]; gx <= gMax[0]; gx++) {
          this._addToCell([gx, gy, gz], sItem);
        }
      }
    }
  }

  /** Find all the cells near a World Space position */
  getNear(
    pos: TVec3,
    xRange: number = 0,
    yRange: number = 0,
    zRange: number = 0,
  ): Array<SpatialItem> {
    const rtn: Array<SpatialItem> = [];
    if (!this._posInGrid(pos)) {
      return rtn;
    }

    const gCoord = this._coordGrid(pos);

    const minX = Math.max(gCoord[0] - xRange, 0);
    const maxX = Math.min(gCoord[0] + xRange, this.maxCoord[0]);

    const minY = Math.max(gCoord[1] - yRange, 0);
    const maxY = Math.min(gCoord[1] + yRange, this.maxCoord[1]);

    const minZ = Math.max(gCoord[2] - zRange, 0);
    const maxZ = Math.min(gCoord[2] + zRange, this.maxCoord[2]);

    const qId = ++this.queryId;

    let gx, gy, gz, cell, itm;
    for (gy = minY; gy <= maxY; gy++) {
      for (gz = minZ; gz <= maxZ; gz++) {
        for (gx = minX; gx <= maxX; gx++) {
          // Get Cell and Check if there are any items available
          cell = this.getCell([gx, gy, gz]);
          if (!cell || cell.items.length === 0) {
            continue;
          }

          // Collect a unique list of items
          for (itm of cell.items) {
            if (itm.queryId !== qId) {
              itm.queryId = qId; // Update ID so it won't be picked again.
              rtn.push(itm); // Save item for return list
            }
          }
        }
      }
    }
    return rtn;
  }
  // #endregion
}
