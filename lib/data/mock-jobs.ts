import type { NormalizedJobSearchItem } from "@/types";

export const mockJobResults: NormalizedJobSearchItem[] = [
  {
    externalJobId: "mock-frontend-001",
    title: "Frontend Engineer",
    company: "Sunline Studio",
    location: "Remote - United States",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryEstimate: "$110k - $135k",
    source: "Fallback Demo",
    sourceUrl: "https://example.com/mock/frontend-engineer",
    companyLogo: null,
    datePosted: new Date().toISOString(),
    description:
      "Build accessible React interfaces, collaborate with design, and improve performance for customer-facing features in a remote product team."
  },
  {
    externalJobId: "mock-product-002",
    title: "Product Designer",
    company: "Cinder Works",
    location: "New York, NY",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryEstimate: "$95k - $118k",
    source: "Fallback Demo",
    sourceUrl: "https://example.com/mock/product-designer",
    companyLogo: null,
    datePosted: new Date(Date.now() - 86_400_000).toISOString(),
    description:
      "Create polished design systems, user flows, and prototypes for an analytics-heavy platform used by operations teams."
  },
  {
    externalJobId: "mock-data-003",
    title: "Data Analyst",
    company: "Lattice Harbor",
    location: "Chicago, IL",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryEstimate: "$82k - $96k",
    source: "Fallback Demo",
    sourceUrl: "https://example.com/mock/data-analyst",
    companyLogo: null,
    datePosted: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    description:
      "Analyze pipeline performance, build SQL dashboards, and communicate trends clearly to business stakeholders."
  },
  {
    externalJobId: "mock-fullstack-004",
    title: "Senior Full Stack Engineer",
    company: "Rivet Health",
    location: "Austin, TX",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryEstimate: "$145k - $165k",
    source: "Fallback Demo",
    sourceUrl: "https://example.com/mock/fullstack-engineer",
    companyLogo: null,
    datePosted: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    description:
      "Own delivery across Node.js services, PostgreSQL, and React applications while mentoring engineers and improving system reliability."
  },
  {
    externalJobId: "mock-ml-005",
    title: "Machine Learning Engineer",
    company: "Fjord Intelligence",
    location: "San Francisco, CA",
    remoteType: "REMOTE",
    employmentType: "CONTRACT",
    salaryEstimate: "$70/hr - $95/hr",
    source: "Fallback Demo",
    sourceUrl: "https://example.com/mock/ml-engineer",
    companyLogo: null,
    datePosted: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    description:
      "Prototype machine learning workflows, tune models, and partner with data engineers to productionize AI features."
  },
  {
    externalJobId: "mock-marketing-006",
    title: "Growth Marketing Analyst",
    company: "North Bloom",
    location: "Remote - Canada",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryEstimate: "$78k - $92k",
    source: "Fallback Demo",
    sourceUrl: "https://example.com/mock/growth-analyst",
    companyLogo: null,
    datePosted: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    description:
      "Own weekly campaign reporting, investigate funnel performance, and support experimentation across paid acquisition channels."
  }
];
