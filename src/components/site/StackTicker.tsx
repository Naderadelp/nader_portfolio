import { Reveal } from "@/components/layout/Reveal";
import { TechTagList } from "@/components/ui/TechTag";

interface StackTickerProps {
  groups: readonly { label: string; items: string[] }[];
}

/**
 * A scrolling band of every technology, over the grouped lists that carry the
 * actual information.
 *
 * The band is `aria-hidden` in full. It is decoration — every name in it
 * appears again, correctly grouped and in a real list, immediately below. A
 * screen reader gaining nothing from hearing the same forty words twice in an
 * arbitrary order is the reason, and hiding it also means the duplicated track
 * that makes the loop seamless costs nothing in the accessibility tree.
 *
 * CSS `animation-play-state` pauses it on hover so anyone trying to read a
 * specific name can, and `prefers-reduced-motion` stops it dead via the global
 * rule in globals.css.
 */
export function StackTicker({ groups }: StackTickerProps) {
  const everything = groups.flatMap((group) => group.items);

  return (
    <div>
      <div
        aria-hidden="true"
        data-allows-x-scroll=""
        className="ticker-viewport relative -mx-5 overflow-hidden border-y border-hairline py-5 sm:-mx-8 lg:-mx-12"
      >
        <div className="animate-ticker flex w-max items-center gap-3">
          {/* Rendered twice: the animation translates by exactly -50%, so the
              second copy is under the cursor at the instant the first ends. */}
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center gap-3">
              {everything.map((item) => (
                <li
                  key={`${copy}-${item}`}
                  className="whitespace-nowrap border border-hairline bg-surface/60 px-3.5 py-1.5 font-mono text-label text-fg-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <dl className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2">
        {groups.map((group, index) => (
          <Reveal key={group.label} delay={index * 40}>
            <dt className="font-mono text-micro uppercase text-fg-muted">
              {group.label}
            </dt>
            <dd className="mt-3">
              <TechTagList
                items={group.items}
                label={`${group.label} technologies`}
              />
            </dd>
          </Reveal>
        ))}
      </dl>
    </div>
  );
}
