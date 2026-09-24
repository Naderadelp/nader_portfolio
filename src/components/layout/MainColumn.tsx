import { cn } from "@/components/ui/cn";

/**
 * The scrolling right-hand column: the `<main>` landmark plus the page footer.
 * At <1024px it is simply the second block of a single column.
 */
export function MainColumn({
  children,
  footer,
  className,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full min-w-0 lg:flex-1 lg:py-20", className)}>
      <main id="content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      {footer}
    </div>
  );
}
