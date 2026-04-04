import Link from 'next/link';
import Card, { CardBody } from '../ui/Card';
import Tag from '../ui/Tag';

interface Project {
  name: string;
  color: string;
  tags: string[];
  href: string;
}

const projects: Project[] = [
  {
    name: 'TaxoMind',
    color: 'from-indigo-500/20 to-purple-500/20',
    tags: ['Web App', 'EdTech'],
    href: '/portfolio/taxomind',
  },
  {
    name: 'FinCoach AI',
    color: 'from-emerald-500/20 to-teal-500/20',
    tags: ['Android', 'FinTech'],
    href: '/portfolio/fincoach-ai',
  },
  {
    name: 'MathPhysics',
    color: 'from-orange-500/20 to-amber-500/20',
    tags: ['Android', 'EdTech'],
    href: '/portfolio/mathphysics',
  },
];

export default function FeaturedWork() {
  return (
    <section className="py-20 sm:py-28 bg-[var(--surface-sunken)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Featured Projects
          </h2>
          <p className="mt-4 text-lg text-[var(--text-secondary)]">
            Real results from real projects
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {projects.map((project) => (
            <Card key={project.name} hover>
              {/* Color placeholder for image */}
              <div
                className={`h-48 bg-gradient-to-br ${project.color} flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-[var(--foreground)] opacity-60">
                  {project.name}
                </span>
              </div>
              <CardBody>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                  {project.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Tag key={tag} size="sm">
                      {tag}
                    </Tag>
                  ))}
                </div>
                <Link
                  href={project.href}
                  className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  Read case study &rarr;
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-12 text-center">
          <Link
            href="/portfolio"
            className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            View all projects &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
