import type { AgentDto, IAgentWorkerDto } from "@shared/api/gen/main/model";

/** Воркер, который работает и в порядке. */
export const makeWorker = (
  patch: Partial<IAgentWorkerDto> = {},
): IAgentWorkerDto => ({
  name: "echo",
  state: "running",
  version: "1.0.0",
  release: false,
  restarts: 0,
  health: { ok: true },
  manifest: {
    configs: [],
    commands: [],
    events: [],
    requests: [],
  },
  ...patch,
});

/** Агент на связи с одним воркером. */
export const makeAgent = (patch: Partial<AgentDto> = {}): AgentDto => ({
  id: "a-1",
  name: "node-01",
  labels: {},
  online: true,
  revoked: false,
  remoteIp: "203.0.113.10",
  version: "1.0.0",
  enrolledAt: 1_790_000_000_000,
  lastSeenAt: 1_790_000_100_000,
  host: { hostname: "node-01", os: "linux", arch: "amd64" },
  desiredRev: 1,
  appliedRev: 1,
  workers: [makeWorker()],
  alerts: [],
  outbox: 0,
  ...patch,
});
