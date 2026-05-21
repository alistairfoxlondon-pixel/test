import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: Promise<{ corridor: string }>;
};

// Next.js 15 requires async params and metadata generators
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { corridor } = await params;

  try {
    const datasetPath = path.join(process.cwd(), "data", "routes", "dataset.json");
    const data = JSON.parse(await fs.readFile(datasetPath, "utf-8"));
    const complianceData = data[corridor];

    if (!complianceData) {
      return { title: "Compliance Route Not Found" };
    }

    return {
      title: `Remote Work from ${complianceData.home_country} to ${complianceData.destination_country} | NomadShield`,
      description: complianceData.seo_description || `Complete remote work compliance guide for moving from ${complianceData.home_country} to ${complianceData.destination_country}.`,
      alternates: {
        canonical: `/remote-work-compliance/${corridor}`,
      },
    };
  } catch {
    return { title: "Compliance Route" };
  }
}

export async function generateStaticParams() {
  const datasetPath = path.join(process.cwd(), "data", "routes", "dataset.json");
  try {
    const data = JSON.parse(await fs.readFile(datasetPath, "utf-8"));
    return Object.keys(data).map((corridor) => ({
      corridor,
    }));
  } catch {
    console.error("Failed to load dataset for static params");
    return [];
  }
}

export default async function CompliancePage({ params }: Props) {
  const { corridor } = await params;

  const datasetPath = path.join(process.cwd(), "data", "routes", "dataset.json");
  let complianceData;

  try {
    const fileContents = await fs.readFile(datasetPath, "utf-8");
    const data = JSON.parse(fileContents);
    complianceData = data[corridor];
  } catch {
    console.error("Error reading dataset");
  }

  if (!complianceData) {
    notFound();
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Cross-Border Report: Remote Work from ${complianceData.home_country} to ${complianceData.destination_country}`,
    "description": complianceData.seo_description,
    "author": {
      "@type": "Organization",
      "name": "NomadShield",
    },
    "publisher": {
      "@type": "Organization",
      "name": "NomadShield",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nomadshield-engine.vercel.app/logo.png" // Placeholder
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1f2937] font-sans pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white border-b border-gray-200 py-6 px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-black text-[#1e3a8a] tracking-tight hover:opacity-80 transition-opacity">
            NOMAD<span className="text-[#10b981]">SHIELD</span>
          </Link>
          <Link href="/" className="text-sm text-blue-600 font-semibold hover:underline">
            &larr; New Assessment
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-10 px-4">
        <AdSlot position="top-banner" />

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
            Legal Framework Audit
          </span>
          <h1 className="text-3xl font-extrabold mt-3 text-gray-900 tracking-tight">
            Cross-Border Report: Remote Work from {complianceData.home_country} to {complianceData.destination_country}
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed text-base">
            {complianceData.summary_paragraph}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Regulatory Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-[#1e3a8a] border-b pb-2 mb-4">
                1. Visa Framework & Earning Thresholds
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                <strong>Visa Available:</strong> {complianceData.visa_type}
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm border-l-4 border-[#10b981]">
                <strong>Income Threshold Standard:</strong> {complianceData.income_requirement}
              </div>
            </div>

            <AdSlot position="in-content" />

            {/* Regulatory Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-[#1e3a8a] border-b pb-2 mb-4">
                2. Double Taxation & Fiscal Residency Status
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                <strong>Tax Threshold:</strong> {complianceData.tax_threshold}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>Treaty Status:</strong> {complianceData.double_taxation_treaty}
              </p>
            </div>

            {/* Regulatory Card 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-[#1e3a8a] border-b pb-2 mb-4">
                3. Permanent Establishment Corporate Risk
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {complianceData.employer_risk}
              </p>
            </div>
          </div>

          {/* Sidebar Area with Quick Metrics and Ad Target */}
          <div className="space-y-6">
            <div className="bg-[#1e3a8a] text-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold uppercase tracking-wider text-xs text-blue-200 mb-3">
                Audit Parameters
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="block text-blue-200 font-medium">Source Vector</span>
                  <span className="text-sm font-semibold">{complianceData.home_country}</span>
                </div>
                <div>
                  <span className="block text-blue-200 font-medium">Target Anchor</span>
                  <span className="text-sm font-semibold">{complianceData.destination_country}</span>
                </div>
              </div>
            </div>

            <AdSlot position="sidebar" />
          </div>
        </div>
      </main>
    </div>
  );
}
