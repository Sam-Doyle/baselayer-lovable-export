import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns true if the value looks like a Portable Text block array
 * (i.e. an array of objects with `_type`).
 */
export function isPortableText(value: unknown): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    "_type" in value[0]
  );
}

/**
 * Extract plain text from a value that may be a string OR a Portable Text
 * block array. Useful for meta descriptions, overview excerpts, etc.
 */
export function toPlainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isPortableText(value)) return "";
  return value
    .filter((block: any) => block._type === "block" && block.children)
    .map((block: any) =>
      (block.children as any[])
        .filter((child: any) => child._type === "span")
        .map((span: any) => span.text || "")
        .join("")
    )
    .join("\n\n");
}
