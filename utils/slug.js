"use strict";

function generateSlug(text) {
  if (!text) return '';
  // Normalize accents, convert to lower case
  const normalized = text.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
  return normalized
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

module.exports = { generateSlug };
