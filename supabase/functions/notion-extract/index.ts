import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotionExtractResult {
  title: string;
  content: string;
  alternatives?: string;
  decisionType?: string;
  deadline?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const result = parseNotionHtml(html);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseNotionHtml(html: string): NotionExtractResult {
  // Extract og:title
  let title = "";
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (ogTitleMatch) title = ogTitleMatch[1];

  // Fallback to <title>
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/\s*[-|]\s*Notion\s*$/i, "").trim();
    }
  }

  // Strip scripts, styles, nav elements
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

  // Extract text from block elements
  const blockTags = cleaned.match(/<(?:p|h[1-6]|li|div|blockquote)[^>]*>([\s\S]*?)<\/(?:p|h[1-6]|li|div|blockquote)>/gi) || [];

  const texts: string[] = [];
  for (const block of blockTags) {
    const text = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text && text.length > 3 && !texts.includes(text)) {
      texts.push(text);
    }
  }

  // Heuristic: find alternatives section
  const contentParts: string[] = [];
  const alternativesParts: string[] = [];
  let inAlternatives = false;

  for (const text of texts) {
    const lower = text.toLowerCase();
    if (lower.match(/^alternatives?\s*(considered)?[:.]?\s*$/i) || lower === "other options") {
      inAlternatives = true;
      continue;
    }
    if (inAlternatives && (lower.startsWith("deadline") || lower.startsWith("next step") || lower.startsWith("recommendation"))) {
      inAlternatives = false;
    }
    if (inAlternatives) {
      alternativesParts.push(text);
    } else {
      contentParts.push(text);
    }
  }

  let content = contentParts.slice(0, 30).join("\n\n");
  // Remove title from content if it's the first thing
  if (title && content.startsWith(title)) {
    content = content.slice(title.length).trim();
  }

  const fullContent = content.toLowerCase();

  let decisionType: string | undefined;
  if (fullContent.includes("sign off") || fullContent.includes("sign-off")) decisionType = "sign_off";
  else if (fullContent.includes("blocking concern") || fullContent.includes("blocker")) decisionType = "blocking_concern";
  else if (fullContent.includes("feedback") || fullContent.includes("thoughts")) decisionType = "feedback";
  else if (fullContent.includes("approval") || fullContent.includes("approve")) decisionType = "approval";

  let deadline: string | undefined;
  const deadlineMatch = fullContent.match(/deadline[:\s]+(\d{4}-\d{2}-\d{2})/i)
    || fullContent.match(/by[:\s]+(\w+ \d{1,2},? \d{4})/i)
    || fullContent.match(/due[:\s]+(\w+ \d{1,2},? \d{4})/i);
  if (deadlineMatch) {
    const parsed = Date.parse(deadlineMatch[1]);
    if (!isNaN(parsed)) deadline = new Date(parsed).toISOString().split("T")[0];
  }

  return {
    title: title || "",
    content: content || "",
    alternatives: alternativesParts.length > 0 ? alternativesParts.join("\n\n") : undefined,
    decisionType,
    deadline,
  };
}
