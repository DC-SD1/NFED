/**
 * Decode HTML entities in a string
 *
 * Handles common HTML entities like &amp;, &lt;, &gt;, &quot;, &#39;, etc.
 * This is a lightweight implementation that doesn't require external dependencies.
 */
export function decodeHTMLEntities(text: string | undefined | null): string {
  if (!text) {
    return "";
  }

  // Map of common HTML entities
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&euro;": "€",
    "&pound;": "£",
    "&yen;": "¥",
    "&cent;": "¢",
    "&sect;": "§",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
  };

  // Replace named entities
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, "g"), char);
  }

  // Replace numeric entities (e.g., &#123; or &#x7B;)
  decoded = decoded.replace(/&#(\d+);/g, (_, dec: string) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex: string) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
}
