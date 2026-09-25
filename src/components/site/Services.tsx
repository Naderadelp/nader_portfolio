import Link from "next/link";

import type { ServiceCard } from "@/components/layout/types";
import { Reveal } from "@/components/layout/Reveal";

/**
 * What a client can hire me for.
 *
 * Every card ends in proof: links to the project pages that show the thing
 * being offered. A service with nothing to point at does not belong here.
 */
export function Services({ items }: { items: readonly ServiceCard[] }) {
  return (
    <ul className="grid gap-px border border-hairline bg-hairline md:grid-cols-2">
      {items.map((service, index) => (
        <li key={service.id} className="bg-bg">
          <Reveal delay={(index % 2) * 40} className="flex h-full flex-col p-6 sm:p-8">
            <p className="font-mono text-micro uppercase text-accent">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-3 text-section font-semibold text-fg">
              {service.title}
            </h3>
            <p className="mt-3 text-fg-secondary">{service.summary}</p>

            <ul className="mt-5 space-y-2 text-sm text-fg-secondary">
              {service.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-1 shrink-0 bg-fg-muted" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <p className="font-mono text-micro uppercase text-fg-muted">
                Shown in
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {service.proof.map((proof) => (
                  <li key={proof.href}>
                    <Link
                      href={proof.href}
                      className="inline-block border border-hairline px-2.5 py-1 text-sm text-fg no-underline transition-colors duration-200 hover:border-accent hover:text-accent motion-reduce:transition-none"
                    >
                      {proof.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
