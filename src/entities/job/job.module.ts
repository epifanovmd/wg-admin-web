import { ContainerModule } from "inversify";

import { IJobRealtime, JobRealtime } from "./api/job-realtime";
import { JobStore } from "./model/store";
import { IJobStore } from "./model/types";

export const jobModule = new ContainerModule(({ bind }) => {
  bind(IJobStore.Tid).to(JobStore).inSingletonScope();
  bind(IJobRealtime.Tid).to(JobRealtime).inSingletonScope();
});
