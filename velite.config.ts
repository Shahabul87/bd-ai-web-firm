import { defineConfig, s } from "velite";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const servicePlatform = s.enum(["web", "android", "ios"]);

const blogs = {
  name: "Blog",
  pattern: "blogs/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("blogs"),
    date: s.isodate(),
    author: s.string().default("CraftsAI"),
    tags: s.array(s.string()),
    excerpt: s.string(),
    readTime: s.number(),
    featured: s.boolean().default(false),
    thumbnail: s.string().optional(),
    content: s.mdx(),
  }),
};

const caseStudies = {
  name: "CaseStudy",
  pattern: "case-studies/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("case-studies"),
    date: s.isodate(),
    client: s.string(),
    industry: s.string(),
    services: s.array(servicePlatform),
    results: s.array(
      s.object({
        metric: s.string(),
        value: s.string(),
      })
    ),
    thumbnail: s.string(),
    featured: s.boolean().default(false),
    tags: s.array(s.string()),
    excerpt: s.string(),
    content: s.mdx(),
  }),
};

const guides = {
  name: "Guide",
  pattern: "guides/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("guides"),
    date: s.isodate(),
    tags: s.array(s.string()),
    excerpt: s.string(),
    readTime: s.number(),
    downloadable: s.boolean().default(false),
    thumbnail: s.string().optional(),
    content: s.mdx(),
  }),
};

const products = {
  name: "Product",
  pattern: "products/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.slug("products"),
    tagline: s.string(),
    platforms: s.array(servicePlatform),
    features: s.array(
      s.object({
        icon: s.string(),
        title: s.string(),
        description: s.string(),
      })
    ),
    screenshots: s.array(s.string()),
    techStack: s.array(s.string()),
    useCases: s.array(
      s.object({
        title: s.string(),
        description: s.string(),
      })
    ),
    demoUrl: s.string().optional(),
    storeUrl: s.string().optional(),
    content: s.mdx(),
  }),
};

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
  },
  collections: { blogs, caseStudies, guides, products },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: "github-dark-dimmed" }],
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
});
