import { projects } from '../data/work'
import { ProjectCard } from './ProjectCard'
import { SectionLabel } from './SectionLabel'

export function SelectedWork() {
  return (
    <section id="work" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel
        num="01"
        title="Selected Work"
        caption="Two live AI products, an open-source desktop tool, and an Angular reference build — all shipped, all still being built on."
      />
      <div className="space-y-8">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  )
}
