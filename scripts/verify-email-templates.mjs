import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDirectory = path.join(root, "email-templates");
const expectedTemplates = [
  "alpine-editorial.html",
  "commerce-utility.html",
  "founder-field-note.html",
];

const errors = [];
const entries = await readdir(templateDirectory);
const actualTemplates = entries.filter((entry) => entry.endsWith(".html")).sort();

if (JSON.stringify(actualTemplates) !== JSON.stringify(expectedTemplates)) {
  errors.push(
    `Expected exactly three master templates (${expectedTemplates.join(", ")}); found ${actualTemplates.join(", ") || "none"}.`,
  );
}

for (const fileName of expectedTemplates) {
  const filePath = path.join(templateDirectory, fileName);
  let html;

  try {
    html = await readFile(filePath, "utf8");
  } catch (error) {
    errors.push(`${fileName}: could not read template (${error.message}).`);
    continue;
  }

  const fileStats = await stat(filePath);
  if (fileStats.size >= 102_400) {
    errors.push(`${fileName}: ${fileStats.size} bytes exceeds the 102 KB Gmail clipping budget.`);
  }

  const requiredFragments = [
    '<meta name="viewport"',
    '<meta name="color-scheme" content="light dark">',
    'class="preheader"',
    'role="presentation"',
    'width="600"',
    "max-width:600px",
    "data-bl-primary-cta",
    "min-height:48px",
    "line-height:48px",
    "{{ unsubscribe }}",
    "955 Harrison St, Denver, CO 80206",
    "https://baselayerskin.co/logo.png",
    "#1A2F4C",
    "#F7F4EE",
    "#C04510",
    "@media (prefers-color-scheme: dark)",
  ];

  for (const fragment of requiredFragments) {
    if (!html.includes(fragment)) {
      errors.push(`${fileName}: missing required fragment ${JSON.stringify(fragment)}.`);
    }
  }

  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  if (images.length === 0) {
    errors.push(`${fileName}: must include the Base Layer wordmark image.`);
  }

  for (const image of images) {
    const isDynamicCartImage = fileName === "commerce-utility.html"
      && /\bsrc="\{\{ item\.image \}\}"/i.test(image);
    if (!/\bsrc="https:\/\//i.test(image) && !isDynamicCartImage) {
      errors.push(`${fileName}: every image must use an absolute HTTPS source: ${image}`);
    }
    const alt = image.match(/\balt="([^"]*)"/i)?.[1]?.trim();
    if (!alt) {
      errors.push(`${fileName}: every image must have meaningful alt text: ${image}`);
    }
    if (/\.(svg|webp)(?:[?"#])/i.test(image)) {
      errors.push(`${fileName}: SVG/WebP email imagery is disallowed for desktop-client compatibility.`);
    }
  }

  const unsupportedLayoutTags = html.match(/<(?:script|video|canvas|iframe|form)\b/gi) ?? [];
  if (unsupportedLayoutTags.length > 0) {
    errors.push(`${fileName}: unsupported email element(s): ${unsupportedLayoutTags.join(", ")}.`);
  }

  const bannedCopy = ["clinically proven", "miracle", "act now", "100% free"];
  for (const phrase of bannedCopy) {
    if (html.toLowerCase().includes(phrase)) {
      errors.push(`${fileName}: contains banned marketing language ${JSON.stringify(phrase)}.`);
    }
  }

  if (!/<!--[\s\S]*MODULE:/i.test(html)) {
    errors.push(`${fileName}: reusable modules must be labelled with MODULE comments.`);
  }

  if (fileName === "commerce-utility.html") {
    const dynamicCartFragments = [
      "{% for item in params.items %}",
      "{{ item.image }}",
      "{{ item.name }}",
      "{{ item.variant_id_name }}",
      "{{ item.quantity }}",
      "{{ item.price }}",
      "{{ params.currency }}",
      "{{ params.url }}",
      "{% endfor %}",
    ];
    for (const fragment of dynamicCartFragments) {
      if (!html.includes(fragment)) {
        errors.push(`${fileName}: missing dynamic cart fragment ${JSON.stringify(fragment)}.`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Email template verification failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Email template verification passed for ${expectedTemplates.length} master formats.`);
