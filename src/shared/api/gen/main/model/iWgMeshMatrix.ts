import type { IWgMeshCell } from "./iWgMeshCell.ts";
import type { IWgMeshMatrixNodesItem } from "./iWgMeshMatrixNodesItem.ts";

/**
 * Матрица связности нод.
 */
export interface IWgMeshMatrix {
  nodes: IWgMeshMatrixNodesItem[];
  cells: IWgMeshCell[];
}
