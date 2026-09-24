import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import * as diagrams from "@/components/diagrams";
import { caseStudies, profile, projects, stack } from "@/content";
import type { CaseStudySectionHeading } from "@/content";
import { REPO_ROOT } from "./helpers/paths";

/**
 * Content integrity.
 *
 * The content layer is plain data, so these tests import it rather than
 * parsing files. Each assertion stands in for something a reader would notice:
 * a case study missing its trade-off, a metric with no number, a repo link that
 * 404s, a "currently learning" tag presented as production experience.
 */

const NARRATIVE: CaseStudySectionHeading[] = [
  "Problem",
  "Constraint",
  "Approach",
  "Trade-off",
  "Outcome",
];

/** 'publish-pipeline' -> 'PublishPipelineDiagram' */
function diagramComponentName(key: string): string {
  return (
    key
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join("") + "Diagram"
  );
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe("case studies", () => {
  it("there are three of them, with unique slugs", () => {
    expect(caseStudies).toHaveLength(3);
    expect(new Set(caseStudies.map((c) => c.slug)).size).toBe(3);
  });

  describe.each(caseStudies.map((study) => [study.slug, study] as const))(
    "%s",
    (slug, study) => {
      it("carries all five narrative headings, in order", () => {
        expect(study.sections.map((s) => s.heading)).toEqual(NARRATIVE);
      });

      it("has non-empty prose under every heading", () => {
        for (const section of study.sections) {
          expect(
            section.paragraphs.length,
            `${slug} / ${section.heading} has no paragraphs`,
          ).toBeGreaterThan(0);

          for (const paragraph of section.paragraphs) {
            // A one-line placeholder would pass a non-empty check; a real
            // paragraph in this format does not fit in under ten words.
            expect(
              wordCount(paragraph),
              `${slug} / ${section.heading} has a stub paragraph: "${paragraph}"`,
            ).toBeGreaterThan(10);
          }
        }
      });

      it("runs 350–700 words of prose", () => {
        // The spec commits to 400–600. The assertion is wider so ordinary
        // editing does not trip it, but drift towards a two-liner or an essay
        // fails here rather than in front of a reader.
        const words = wordCount(
          study.sections.flatMap((s) => s.paragraphs).join(" "),
        );

        expect(
          words,
          `${slug} is ${words} words; the spec commits to 400–600.`,
        ).toBeGreaterThanOrEqual(350);
        expect(
          words,
          `${slug} is ${words} words; the spec commits to 400–600.`,
        ).toBeLessThanOrEqual(700);
      });

      it("has at least one metric, each with a label and a value", () => {
        expect(study.metrics.length).toBeGreaterThanOrEqual(1);

        for (const metric of study.metrics) {
          expect(metric.label.trim()).not.toBe("");
          expect(metric.value.trim()).not.toBe("");
          // Metrics discipline: every figure is countable, so every value
          // carries a digit. "Significant" is not a metric.
          expect(
            metric.value,
            `${slug} metric "${metric.label}" has no number in it`,
          ).toMatch(/\d/);
        }
      });

      it("names a diagram that a real exported component backs", () => {
        const expected = diagramComponentName(study.diagramKey);
        const registry = diagrams as unknown as Record<string, unknown>;

        expect(
          Object.keys(registry),
          `${slug} wants diagram "${study.diagramKey}" (${expected}), which ` +
            `@/components/diagrams does not export`,
        ).toContain(expected);
        expect(typeof registry[expected]).toBe("function");
      });

      it("states authorship and a stack", () => {
        expect(study.role.trim()).not.toBe("");
        expect(study.stack.length).toBeGreaterThan(0);
      });
    },
  );

  it("every diagram component is used by a case study", () => {
    // An orphaned diagram is dead weight that still ships in the bundle.
    const used = new Set(caseStudies.map((c) => diagramComponentName(c.diagramKey)));
    for (const exported of Object.keys(diagrams)) {
      expect(used, `${exported} is exported but no case study uses it`).toContain(
        exported,
      );
    }
  });
});

describe("projects", () => {
  it("each one either links a public repo or explains why it cannot", () => {
    for (const project of projects) {
      const explained = project.repoUrl !== null || Boolean(project.note?.trim());
      expect(
        explained,
        `${project.slug} has no repoUrl and no note explaining the absence`,
      ).toBe(true);
    }
  });

  it("has unique slugs and a summary on every card", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    for (const project of projects) {
      expect(project.summary.trim(), `${project.slug} has no summary`).not.toBe("");
    }
  });
});

describe("outbound links", () => {
  const outbound: { where: string; href: string }[] = [
    ...profile.socials
      .filter((s) => !s.href.startsWith("mailto:"))
      .map((s) => ({ where: `profile.socials/${s.platform}`, href: s.href })),
    ...projects
      .filter((p): p is typeof p & { repoUrl: string } => p.repoUrl !== null)
      .map((p) => ({ where: `projects/${p.slug}`, href: p.repoUrl })),
  ];

  it("there are some to check", () => {
    expect(outbound.length).toBeGreaterThan(0);
  });

  it.each(outbound)("$where -> $href is absolute and well-formed", ({ href }) => {
    expect(() => new URL(href)).not.toThrow();

    const url = new URL(href);
    expect(url.protocol).toBe("https:");
    expect(url.hostname).not.toBe("");
    // Stray whitespace or a trailing sentence period silently breaks a link.
    expect(href).toBe(href.trim());
    expect(href).not.toMatch(/\s/);
    expect(href).not.toMatch(/[.,)]$/);
  });

  it("the email social is a usable mailto: address", () => {
    const email = profile.socials.find((s) => s.platform === "email");
    expect(email).toBeDefined();
    expect(email!.href).toMatch(/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/);
    // The visible handle and the link must agree.
    expect(email!.href).toBe(`mailto:${email!.handle}`);
  });
});

describe("CV downloads", () => {
  it.each(profile.cvs)("$id points at a PDF that exists in public/", (cv) => {
    expect(cv.href.startsWith("/")).toBe(true);
    expect(cv.href.endsWith(".pdf")).toBe(true);
    expect(
      existsSync(join(REPO_ROOT, "public", cv.href.replace(/^\//, ""))),
      `${cv.href} is offered for download but no such file exists under public/`,
    ).toBe(true);
  });
});

describe("stack", () => {
  it("has exactly one group marked as learning", () => {
    const learning = stack.filter((group) => group.kind === "learning");
    expect(
      learning.map((g) => g.id),
      "Exactly one group may be 'currently learning'; everything else is " +
        "claimed as production experience.",
    ).toHaveLength(1);
  });

  it("every group is labelled, non-empty and has a unique id", () => {
    expect(new Set(stack.map((g) => g.id)).size).toBe(stack.length);
    for (const group of stack) {
      expect(group.label.trim(), `${group.id} has no label`).not.toBe("");
      expect(group.items.length, `${group.id} is empty`).toBeGreaterThan(0);
    }
  });
});
