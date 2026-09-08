import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { useState } from "react";
import { act } from "@testing-library/react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import PurchaseOptions from "@/components/PurchaseOptions";
import { AVAILABLE_TIERS, DEFAULT_TIER, tierCtaLabel } from "@/config/product";
import { retirePrerenderSnapshot } from "@/lib/prerenderHandoff";

// Read the shipped bootstrap rather than duplicating its implementation. The
// fixture models the build's serialized SSR, not a second React-owned tree.
const indexHtml = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
const bootstrapScripts = [...indexHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((script) => script.includes("bl-prerender-root"));
const radioSelector = 'input[type="radio"][name="pdp-purchase-option"]';
const transitions = AVAILABLE_TIERS.flatMap((from) =>
  AVAILABLE_TIERS.filter((to) => to.id !== from.id).map((to) => ({
    from: from.id,
    to: to.id,
    label: `${from.label} → ${to.label}`,
  })),
);

let liveRoot: Root | undefined;
let errors: string[];
const originalUrl = window.location.href;
const captureWindowError = (event: ErrorEvent) => {
  errors.push(event.error instanceof Error ? event.error.message : event.message);
  // Assert every captured error below; avoid jsdom also reporting it as an
  // unhandled test-run error during the deliberately failing pre-fix run.
  event.preventDefault();
};

function installSerializedSnapshot(): HTMLElement {
  const markup = renderToStaticMarkup(
    <PurchaseOptions options={AVAILABLE_TIERS} selectedId={DEFAULT_TIER.id} onSelect={() => {}} />,
  );
  document.body.innerHTML = `<div id="root"><!--SSR-->${markup}<!--/SSR--></div>`;
  return document.getElementById("root")!;
}

function runActualBootstrap(): void {
  expect(bootstrapScripts).toHaveLength(1);
  new Function("document", "location", bootstrapScripts[0])(document, window.location);
}

function LiveOptions({ initialId }: { initialId: number }) {
  const [selectedId, setSelectedId] = useState(initialId);
  const selectedTier = AVAILABLE_TIERS.find((tier) => tier.id === selectedId)!;
  return <>
    <PurchaseOptions options={AVAILABLE_TIERS} selectedId={selectedId} onSelect={setSelectedId} />
    <output data-selected-offer>{tierCtaLabel(selectedTier)}</output>
  </>;
}

beforeEach(() => {
  errors = [];
  window.history.replaceState(null, "", "/face-cream?offer=single");
  window.addEventListener("error", captureWindowError);
});

afterEach(async () => {
  if (liveRoot) await act(async () => liveRoot?.unmount());
  liveRoot = undefined;
  window.removeEventListener("error", captureWindowError);
  document.body.replaceChildren();
  window.history.replaceState(null, "", originalUrl);
});

describe("serialized PDP radio ownership", () => {
  it("preserves named, checked static purchase options when JavaScript does not run", () => {
    const snapshot = installSerializedSnapshot();
    expect(snapshot.querySelectorAll(radioSelector)).toHaveLength(AVAILABLE_TIERS.length);
    expect(snapshot.querySelector(`input[value="${DEFAULT_TIER.id}"]`)).toBeChecked();
    expect(snapshot.querySelectorAll("input[checked]")).toHaveLength(1);
    expect(snapshot.querySelector("fieldset legend")).toHaveTextContent("Choose your purchase option");
    expect(document.getElementById("bl-prerender-root")).toBeNull();
    expect(document.querySelectorAll("#root")).toHaveLength(1);
  });

  it("isolates only the snapshot's radio names before the live tree mounts, preserving visual markup", () => {
    const snapshot = installSerializedSnapshot();
    const originalText = snapshot.textContent;
    const originalInputs = Array.from(snapshot.querySelectorAll("input"));
    const unrelated = document.createElement("input");
    unrelated.type = "radio";
    unrelated.name = "unrelated-form-option";
    document.body.appendChild(unrelated);

    runActualBootstrap();

    expect(document.getElementById("bl-prerender-root")).toBe(snapshot);
    expect(document.getElementById("root")).not.toBe(snapshot);
    expect(document.getElementById("root")).toBeEmptyDOMElement();
    expect(snapshot.querySelectorAll(radioSelector)).toHaveLength(0);
    expect(Array.from(snapshot.querySelectorAll("input"))).toEqual(originalInputs);
    expect(snapshot.querySelector(`input[value="${DEFAULT_TIER.id}"]`)).toBeChecked();
    expect(snapshot.querySelectorAll("input[checked]")).toHaveLength(1);
    expect(snapshot.textContent).toBe(originalText);
    expect(unrelated.name).toBe("unrelated-form-option");
  });

  it("leaves a non-prerendered SPA shell intact", () => {
    document.body.innerHTML = '<div id="root"><!--SKELETON--><p>Loading</p><!--/SKELETON--></div>';
    const root = document.getElementById("root");
    const originalMarkup = root!.innerHTML;
    runActualBootstrap();
    expect(document.getElementById("root")).toBe(root);
    expect(root!.innerHTML).toBe(originalMarkup);
    expect(document.getElementById("bl-prerender-root")).toBeNull();
  });

  describe.each([
    { state: "retained inert", retired: false },
    { state: "retired hidden", retired: true },
  ])("with a $state snapshot", ({ retired }) => {
    it.each(transitions)("switches $label without mixed React/non-React errors", async ({ from, to }) => {
      const snapshot = installSerializedSnapshot();
      runActualBootstrap();
      snapshot.inert = true;
      snapshot.style.pointerEvents = "none";
      snapshot.setAttribute("aria-hidden", "true");
      if (retired) retirePrerenderSnapshot(snapshot);

      const container = document.getElementById("root")!;
      liveRoot = createRoot(container);
      await act(async () => liveRoot!.render(<LiveOptions initialId={from} />));
      expect(container.querySelector(`input[value="${from}"]`)).toBeChecked();

      const target = container.querySelector<HTMLInputElement>(`input[value="${to}"]`)!;
      await act(async () => target.click());

      // Assert runtime errors before structural assertions so the pre-fix
      // failure proves the actual React restoration exception, not just count.
      expect(errors).toEqual([]);
      expect(target).toBeChecked();
      expect(container.querySelectorAll("input:checked")).toHaveLength(1);
      expect(container.querySelector("[data-selected-offer]")).toHaveTextContent(
        tierCtaLabel(AVAILABLE_TIERS.find((tier) => tier.id === to)!),
      );
      const documentRadios = Array.from(document.querySelectorAll(radioSelector));
      expect(documentRadios).toHaveLength(AVAILABLE_TIERS.length);
      expect(documentRadios.every((radio) => container.contains(radio))).toBe(true);
      expect(snapshot.querySelectorAll(radioSelector)).toHaveLength(0);
      expect(snapshot.isConnected).toBe(true);
      if (retired) expect(snapshot.style.display).toBe("none");
    });
  });
});
