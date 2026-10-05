import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { gettingStartedSteps } from "./dashboard.data";

const stepColors = ["bg-blue-600", "bg-emerald-600", "bg-violet-600"];

export function GettingStarted() {
  return (
    <section
      aria-label="Primeros pasos"
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 md:px-8">
        <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          Primeros pasos
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Sigue estos pasos para publicar tu primer reporte.
        </p>
      </div>

      {/* Steps */}
      <ol className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
        {gettingStartedSteps.map((step, index) => (
          <li key={step.href} className="flex flex-col gap-3 p-6 md:p-8">
            {/* Number badge */}
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 items-center justify-center rounded-full ${stepColors[index] ?? "bg-blue-600"} text-xs font-bold text-white`}
            >
              {index + 1}
            </span>

            {/* Content */}
            <div className="flex flex-1 flex-col">
              <p className="text-sm font-bold text-gray-900">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {step.description}
              </p>
            </div>

            {/* CTA */}
            <Link
              to={step.href}
              className="group mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
            >
              {step.cta}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}