import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '#content';
import { getProductBySlug } from '@/app/lib/content';
import PageLayout from '@/app/components/layout/PageLayout';
import PageHero from '@/app/components/shared/PageHero';
import CTABand from '@/app/components/shared/CTABand';
import MdxContent from '@/app/components/mdx/MdxContent';
import SectionHeader from '@/app/design/ui/SectionHeader';
import Card from '@/app/design/ui/Card';
import Button from '@/app/design/ui/Button';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.tagline,
    openGraph: {
      title: `${product.title} | CraftsAI`,
      description: product.tagline,
      url: `https://www.craftsai.org/products/${product.slug}`,
      siteName: 'CraftsAI',
      type: 'website',
    },
    alternates: {
      canonical: `https://www.craftsai.org/products/${product.slug}`,
    },
  };
}

const PLATFORM_LABELS: Record<string, string> = {
  web: 'Web Platform',
  android: 'Android App',
  ios: 'iOS App',
  desktop: 'Desktop App',
};

/* Matches Button's amber/chalk variants at size="lg" — used here because
   demoUrl/storeUrl are external links that need target="_blank", which the
   Button primitive (Link-only) does not support. */
const EXTERNAL_LINK_BASE =
  'inline-flex items-center justify-center gap-2 px-7 py-3.5 font-mono text-sm uppercase tracking-[0.15em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal';
const EXTERNAL_LINK_AMBER = `${EXTERNAL_LINK_BASE} bg-amber text-ink-950 hover:opacity-90`;
const EXTERNAL_LINK_CHALK = `${EXTERNAL_LINK_BASE} border border-[#EDEDE3]/45 text-[#EDEDE3] hover:border-amber hover:text-amber`;

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const downloads = product.downloads ?? [];
  // Section indexes shift by one when the Downloads section is present.
  const fig = (n: number) =>
    `fig. ${String(n + (downloads.length > 0 ? 1 : 0)).padStart(2, '0')}`;

  return (
    <PageLayout>
      <PageHero
        eyebrow={`Products / ${product.platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(' + ')}`}
        title={product.title}
        lede={product.tagline}
      >
        {product.demoUrl ? (
          <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className={EXTERNAL_LINK_AMBER}>
            View live demo
          </a>
        ) : null}
        {product.storeUrl ? (
          <a href={product.storeUrl} target="_blank" rel="noopener noreferrer" className={EXTERNAL_LINK_CHALK}>
            Get on Play Store
          </a>
        ) : null}
        {downloads.length > 0 ? (
          <a href="#downloads" className={product.demoUrl ? EXTERNAL_LINK_CHALK : EXTERNAL_LINK_AMBER}>
            Download desktop app
          </a>
        ) : null}
        <Button variant="chalk" size="lg" href="/quote">
          Request customization
        </Button>
      </PageHero>

      {downloads.length > 0 ? (
        <section id="downloads" className="border-t border-line bg-ink-900">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
            <SectionHeader
              index="fig. 01"
              eyebrow="Downloads"
              title="Install it on your computer."
            />
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {downloads.map((d) => (
                <Card key={d.os} className="flex h-full flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
                    {d.os}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-medium text-bone">{d.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-steel">
                    {d.note ?? ''}
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <span className="font-mono text-xs uppercase tracking-[0.15em] text-steel">
                      {d.size}
                    </span>
                    <a
                      href={d.url}
                      className={`${EXTERNAL_LINK_BASE} bg-amber px-5 py-2.5 text-ink-950 hover:opacity-90`}
                    >
                      Download
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader
          index={fig(1)}
          eyebrow="Features"
          title="Everything you need, built in from day one."
        />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {product.features.map((feature) => (
            <Card key={feature.title}>
              <span className="block text-3xl">{feature.icon}</span>
              <h3 className="mt-4 font-display text-lg font-medium text-bone">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <SectionHeader index={fig(2)} eyebrow="Tech stack" title="Built with." align="center" />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {product.techStack.map((tech) => (
              <span
                key={tech}
                className="border border-line px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-bone"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <SectionHeader index={fig(3)} eyebrow="Use cases" title="Who is it for?" align="center" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {product.useCases.map((useCase) => (
            <Card key={useCase.title} className="text-center">
              <h3 className="font-display text-lg font-medium text-bone">{useCase.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel">{useCase.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink-900">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <MdxContent code={product.content} />
        </div>
      </section>

      <CTABand
        title={`Interested in ${product.title}?`}
        lede="Get in touch to learn more, request a demo, or discuss customization options for your needs."
        primaryLabel="Get in touch"
        primaryHref="/quote"
        secondaryLabel="View all products"
        secondaryHref="/products"
      />
    </PageLayout>
  );
}
