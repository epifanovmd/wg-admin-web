/** Единая шкала высот контролов: Button, Input, Select, Segmented, Tabs. */
export const CONTROL_HEIGHT = { sm: "h-8", md: "h-10", lg: "h-12" } as const;

export type ControlSize = keyof typeof CONTROL_HEIGHT;
