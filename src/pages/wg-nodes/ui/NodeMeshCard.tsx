import type { IWgMeshCell, IWgMeshMatrix } from "@shared/api/gen/main/model";
import { cn } from "@shared/lib/utils";
import { Card, Tooltip } from "@shared/ui";
import { FC } from "react";

/** Лучший RTT до каждой ноды без потерь — кандидат в релеи для неё. */
const bestByTarget = (cells: IWgMeshCell[]): Map<string, IWgMeshCell> => {
  const best = new Map<string, IWgMeshCell>();

  for (const cell of cells) {
    if (cell.rttMs === null || cell.lossPercent > 0) continue;

    const current = best.get(cell.toNodeId);

    if (!current || cell.rttMs < (current.rttMs ?? Infinity)) {
      best.set(cell.toNodeId, cell);
    }
  }

  return best;
};

/**
 * Связность нод: строка — откуда пингуют, столбец — куда (publicHost).
 * Подсвечен лучший RTT в столбце: через эту ноду релей до цели ближе всего.
 */
export const NodeMeshCard: FC<{ matrix: IWgMeshMatrix }> = ({ matrix }) => {
  if (matrix.nodes.length < 2) return null;

  const cells = new Map(
    matrix.cells.map(cell => [`${cell.fromNodeId}:${cell.toNodeId}`, cell]),
  );
  const best = bestByTarget(matrix.cells);

  return (
    <Card
      title="Связность нод"
      description="RTT в мс между публичными адресами; подсвечен лучший путь до ноды — кандидат в релеи"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left font-normal text-muted-foreground">
                откуда \ куда
              </th>
              {matrix.nodes.map(node => (
                <th key={node.id} className="p-2 text-right font-medium">
                  {node.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.nodes.map(from => (
              <tr key={from.id} className="border-t border-border">
                <th className="p-2 text-left font-medium">{from.name}</th>
                {matrix.nodes.map(to => {
                  if (from.id === to.id) {
                    return (
                      <td
                        key={to.id}
                        className="p-2 text-right text-muted-foreground"
                      >
                        —
                      </td>
                    );
                  }

                  const cell = cells.get(`${from.id}:${to.id}`);
                  const isBest = best.get(to.id) === cell && !!cell;

                  return (
                    <td
                      key={to.id}
                      data-best={isBest ? "" : undefined}
                      className={cn(
                        "p-2 text-right font-mono",
                        isBest && "font-semibold text-success",
                        cell && cell.lossPercent > 0 && "text-warning",
                        cell?.lossPercent === 100 && "text-destructive",
                      )}
                    >
                      {!cell ? (
                        <span className="text-muted-foreground">·</span>
                      ) : cell.rttMs === null ? (
                        <Tooltip content="Не отвечает (или ICMP закрыт)">
                          <span>×</span>
                        </Tooltip>
                      ) : (
                        <Tooltip content={`Потери ${cell.lossPercent}%`}>
                          <span>{cell.rttMs}</span>
                        </Tooltip>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
