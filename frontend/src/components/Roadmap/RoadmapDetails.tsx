import type { LearningRoadmap } from '@/types/roadmap';

interface RoadmapDetailsProps {
  roadmap: LearningRoadmap;
}

export function RoadmapDetails({ roadmap }: RoadmapDetailsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-surface-container-low border border-outline-variant/10 p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {roadmap.durationInDays} ngày
          </span>
          <span className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
            {roadmap.dailyTasks.length} nhiệm vụ
          </span>
        </div>
        <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">{roadmap.title}</h2>
        <p className="mt-3 text-on-surface-variant leading-7">{roadmap.aiReasoningSummary}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            <h3 className="text-xl font-bold">Module nên học</h3>
          </div>
          <div className="space-y-4">
            {roadmap.recommendedModules.map((module, index) => (
              <article key={module.id} className="rounded-2xl bg-surface-container p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Module {index + 1}</p>
                    <h4 className="mt-1 font-bold text-on-surface">{module.title}</h4>
                    <p className="mt-2 text-sm text-on-surface-variant">Trọng tâm: {module.focusArea}</p>
                  </div>
                  <span className="text-xs font-bold text-secondary whitespace-nowrap">{module.estimatedHours} giờ</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">{module.whyRecommended}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-secondary">science</span>
            <h3 className="text-xl font-bold">Lab gợi ý</h3>
          </div>
          <div className="space-y-4">
            {roadmap.recommendedLabs.map((lab) => (
              <article key={lab.id} className="rounded-2xl bg-surface-container p-4">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-bold text-on-surface">{lab.title}</h4>
                  <span className="text-xs font-bold text-tertiary whitespace-nowrap">{lab.durationMinutes} phút</span>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">Hình thức: {lab.format}</p>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">{lab.outcome}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-tertiary">flag</span>
          <h3 className="text-xl font-bold">Mốc tiến độ</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {roadmap.milestones.map((milestone) => (
            <article key={milestone.id} className="rounded-2xl bg-surface-container p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-tertiary">Ngày {milestone.day}</p>
              <h4 className="mt-2 font-bold text-on-surface">{milestone.title}</h4>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">{milestone.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
          <h3 className="text-xl font-bold">Task theo ngày</h3>
        </div>
        <div className="space-y-3">
          {roadmap.dailyTasks.map((task) => (
            <article key={task.id} className="rounded-2xl bg-surface-container px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Ngày {task.day} • {task.taskType}</p>
                <h4 className="mt-1 font-semibold text-on-surface">{task.title}</h4>
                <p className="mt-2 text-sm text-on-surface-variant">Chủ đề: {task.relatedTopic}</p>
              </div>
              <div className="text-sm font-semibold text-secondary whitespace-nowrap">{task.durationMinutes} phút</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
