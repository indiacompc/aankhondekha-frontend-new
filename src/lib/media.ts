import { HOSTED_MEDIA } from "./media.generated";

/**
 * Resolve a media path to its hosted URL.
 * Large videos live in Firebase Storage (the `public/` originals are too big
 * for git). If a path has been uploaded, return its Storage URL; otherwise
 * fall back to the local `/public` path so dev still works with local files.
 */
export function media(path: string): string {
  return HOSTED_MEDIA[path] ?? path;
}
