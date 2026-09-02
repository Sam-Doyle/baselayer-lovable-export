const DEFAULT_PRODUCT_EXTERNAL_ID = 7469557612615;
const DEFAULT_DISPLAY_CAP = 50;
const DEFAULT_PER_PAGE = 100;
const DEFAULT_MAX_PAGES = 20;
const DEFAULT_TIMEOUT_MS = 15_000;
const PHOTO_WIDTH = 320;

const VERIFIED_STATUSES = new Set([
  'buyer',
  'confirmed-buyer',
  'verified-purchase',
  'semi-verified-purchase',
  'admin',
]);

export class JudgeMeAuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JudgeMeAuthenticationError';
  }
}

export class JudgeMeDataValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JudgeMeDataValidationError';
  }
}

function requireObject(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new JudgeMeDataValidationError(`${path} must be an object.`);
  }
  return value;
}

function validPhotoUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : null;
  } catch {
    return null;
  }
}

function sizePhoto(value) {
  const photoUrl = validPhotoUrl(value);
  if (!photoUrl) return null;

  const url = new URL(photoUrl);
  if (url.searchParams.has('width')) {
    url.searchParams.set('width', String(PHOTO_WIDTH));
  }
  return url.toString();
}

function pictureIsHidden(picture) {
  return picture.hidden === true || picture.hidden === 'true' || picture.hidden === 1;
}

function normalizeReview(raw, index) {
  requireObject(raw, `reviews[${index}]`);

  if (!Number.isInteger(raw.id) || raw.id <= 0) {
    throw new JudgeMeDataValidationError(`reviews[${index}].id must be a positive integer.`);
  }
  if (!Number.isInteger(raw.rating) || raw.rating < 1 || raw.rating > 5) {
    throw new JudgeMeDataValidationError(`reviews[${index}].rating must be an integer from 1 to 5.`);
  }
  if (raw.pictures != null && !Array.isArray(raw.pictures)) {
    throw new JudgeMeDataValidationError(`reviews[${index}].pictures must be an array when present.`);
  }

  const reviewer = raw.reviewer == null ? null : requireObject(raw.reviewer, `reviews[${index}].reviewer`);
  const pictures = (raw.pictures ?? [])
    .filter((picture) => {
      requireObject(picture, `reviews[${index}].pictures[]`);
      return !pictureIsHidden(picture);
    })
    .map((picture) => {
      const urls = picture.urls == null ? null : requireObject(picture.urls, `reviews[${index}].pictures[].urls`);
      return urls ? sizePhoto(urls.huge ?? urls.original) : null;
    })
    .filter(Boolean);

  return {
    id: raw.id,
    rating: raw.rating,
    title: typeof raw.title === 'string' ? raw.title : '',
    body: typeof raw.body === 'string' ? raw.body : '',
    reviewer: typeof reviewer?.name === 'string' && reviewer.name.trim() ? reviewer.name : 'Anonymous',
    verified: raw.verified === true || VERIFIED_STATUSES.has(raw.verified),
    createdAt: typeof raw.created_at === 'string' ? raw.created_at.slice(0, 10) : '',
    pictures,
  };
}

export function parseJudgeMePage(payload, page) {
  const data = requireObject(payload, `Judge.me page ${page}`);
  if (!Array.isArray(data.reviews)) {
    throw new JudgeMeDataValidationError(`Judge.me page ${page} is missing a reviews array.`);
  }
  return data.reviews;
}

export async function fetchAllReviews({
  shopDomain,
  apiToken,
  fetchImpl = fetch,
  apiUrl = 'https://api.judge.me/api/v1/reviews',
  perPage = DEFAULT_PER_PAGE,
  maxPages = DEFAULT_MAX_PAGES,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
  const all = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = `${apiUrl}?${new URLSearchParams({
      api_token: apiToken,
      shop_domain: shopDomain,
      published: 'true',
      per_page: String(perPage),
      page: String(page),
    })}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetchImpl(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 401) {
      throw new JudgeMeAuthenticationError(
        `401 from Judge.me. Check JUDGEME_SHOP_DOMAIN and JUDGEME_PRIVATE_TOKEN against ` +
        `Settings > Integrations > View API tokens. Tried shop_domain="${shopDomain}".`,
      );
    }
    if (response.status === 403) {
      throw new JudgeMeAuthenticationError(
        `403 from Judge.me — JUDGEME_PRIVATE_TOKEN must hold the private token.`,
      );
    }
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} from Judge.me`);

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new JudgeMeDataValidationError(
        `Judge.me page ${page} was not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const batch = parseJudgeMePage(payload, page);
    all.push(...batch);
    if (batch.length < perPage) return all;
  }

  console.warn(`⚠️  Hit the ${maxPages}-page ceiling; aggregate covers the first ${all.length} reviews only.`);
  return all;
}

export function buildReviewSnapshot(
  rawReviews,
  {
    productExternalId = DEFAULT_PRODUCT_EXTERNAL_ID,
    displayCap = DEFAULT_DISPLAY_CAP,
    fetchedAt = new Date().toISOString().slice(0, 10),
  } = {},
) {
  if (!Array.isArray(rawReviews)) {
    throw new JudgeMeDataValidationError('Judge.me reviews must be an array.');
  }

  const forProduct = rawReviews.filter((review, index) => {
    requireObject(review, `reviews[${index}]`);
    const externalId = Number(review.product_external_id);
    if (
      review.product_external_id == null ||
      review.product_external_id === '' ||
      !Number.isInteger(externalId) ||
      externalId < 0
    ) {
      throw new JudgeMeDataValidationError(
        `reviews[${index}].product_external_id must identify a product or the store.`,
      );
    }
    return externalId === productExternalId;
  });
  const dropped = rawReviews.length - forProduct.length;
  if (dropped > 0) {
    console.log(`   ${dropped} review(s) excluded — store reviews or another product, not this PDP.`);
  }

  const reviews = forProduct.map((review, index) => normalizeReview(review, index));
  const count = reviews.length;
  const rating = count
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / count) * 10) / 10
    : 0;
  const histogram = [0, 0, 0, 0, 0];
  for (const review of reviews) histogram[review.rating - 1] += 1;

  const sorted = [...reviews].sort((a, b) => {
    const photos = (b.pictures.length > 0) - (a.pictures.length > 0);
    return photos || b.createdAt.localeCompare(a.createdAt);
  });

  return {
    fetchedAt,
    rating,
    count,
    histogram,
    reviews: sorted.slice(0, displayCap),
  };
}

export function assertSafeSnapshotReplacement(existing, next, allowEmpty = false) {
  requireObject(existing, 'Existing review snapshot');
  requireObject(next, 'New review snapshot');
  if (!Number.isInteger(existing.count) || existing.count < 0) {
    throw new JudgeMeDataValidationError('Existing review snapshot has an invalid count.');
  }
  if (!Number.isInteger(next.count) || next.count < 0) {
    throw new JudgeMeDataValidationError('New review snapshot has an invalid count.');
  }
  if (existing.count > 0 && next.count === 0 && !allowEmpty) {
    throw new JudgeMeDataValidationError(
      `Judge.me returned zero matching product reviews while the last-known-good snapshot has ${existing.count}. ` +
      `Refusing to overwrite it. Set JUDGEME_ALLOW_EMPTY_SNAPSHOT=true only after confirming the product truly has no published reviews.`,
    );
  }
}
