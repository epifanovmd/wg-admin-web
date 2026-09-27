import { createContext, useContext } from "react";

import { KANBAN_LABELS, type KanbanLabels } from "./constants";

export const KanbanLabelsContext = createContext<KanbanLabels>(KANBAN_LABELS);

export const useKanbanLabels = () => useContext(KanbanLabelsContext);
