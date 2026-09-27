import { Card, PageHeader, PageLayout } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useJobsVM } from "../model/useJobsVM";
import { JobList } from "./JobList";

const header = (
  <PageHeader
    title="Фоновые задачи"
    subtitle="Установка и удаление агентов — прогресс в реальном времени"
  />
);

export const JobsPage: FC = observer(() => {
  const { jobs, isLoading, cancellingId, cancel } = useJobsVM();

  return (
    <PageLayout header={header}>
      <Card title="Мои задачи" description="Последние 50 задач">
        <JobList
          jobs={jobs}
          isLoading={isLoading}
          cancellingId={cancellingId}
          onCancel={cancel}
        />
      </Card>
    </PageLayout>
  );
});
