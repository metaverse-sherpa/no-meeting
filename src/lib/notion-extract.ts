export interface NotionExtractResult {
  title: string;
  content: string;
  alternatives?: string;
  decisionType?: string;
  deadline?: string;
}

const NOTION_PAGE_PATTERN = /^https:\/\/[\w-]+\.notion\.site\/.+|^https:\/\/www\.notion\.so\/.+|^https:\/\/notion\.so\/.+/i;

export function isNotionUrl(url: string): boolean {
  return NOTION_PAGE_PATTERN.test(url.trim());
}

export async function extractNotionPage(url: string): Promise<NotionExtractResult> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Notion page: ${response.status}`);
  }

  const html = await response.text();
  return parseNotionHtml(html, url);
}

function parseNotionHtml(html: string, _url: string): NotionExtractResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Notion public pages embed content in a specific structure
  // The page title is usually in the first h1 or in the meta tags
  let title = '';

  // Try og:title first (most reliable for public Notion pages)
  const ogTitle = doc.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    title = ogTitle.getAttribute('content') || '';
  }

  // Fallback to first h1
  if (!title) {
    const h1 = doc.querySelector('h1');
    if (h1) {
      title = h1.textContent?.trim() || '';
    }
  }

  // Fallback to title tag
  if (!title) {
    const titleTag = doc.querySelector('title');
    if (titleTag) {
      title = titleTag.textContent?.trim() || '';
      // Notion titles often have " - Notion" suffix
      title = title.replace(/\s*[-|]\s*Notion\s*$/i, '');
    }
  }

  // Extract page content from Notion's content blocks
  // Notion public pages render content in divs with data-block-id
  const blocks = doc.querySelectorAll('[data-block-id]');
  const contentParts: string[] = [];
  const alternativesParts: string[] = [];
  let inAlternatives = false;

  blocks.forEach((block) => {
    const text = block.textContent?.trim();
    if (!text) return;

    // Detect sections that look like alternatives
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes('alternatives considered') ||
      lowerText.includes('other options') ||
      lowerText.includes('alternatives') ||
      lowerText.includes('other approaches')
    ) {
      inAlternatives = true;
      return;
    }

    // Detect sections that end the alternatives
    if (
      inAlternatives &&
      (lowerText.startsWith('deadline') ||
        lowerText.startsWith('next step') ||
        lowerText.startsWith('recommendation') ||
        lowerText.startsWith('risk') ||
        lowerText.startsWith('impact'))
    ) {
      inAlternatives = false;
    }

    if (inAlternatives) {
      alternativesParts.push(text);
    } else {
      contentParts.push(text);
    }
  });

  // If no data-block-id blocks found, try extracting from the main content area
  if (contentParts.length === 0) {
    // Notion pages often have a .page-body or .super-container class
    const pageBody = doc.querySelector('.page-body') || doc.querySelector('.super-container');
    if (pageBody) {
      const paragraphs = pageBody.querySelectorAll('p, h1, h2, h3, li');
      paragraphs.forEach((p) => {
        const text = p.textContent?.trim();
        if (text) contentParts.push(text);
      });
    }
  }

  // Try to detect decision type from content
  let decisionType: string | undefined;
  const fullContent = contentParts.join(' ').toLowerCase();
  if (fullContent.includes('sign off') || fullContent.includes('sign-off') || fullContent.includes('signoff')) {
    decisionType = 'sign_off';
  } else if (fullContent.includes('blocking concern') || fullContent.includes('blocker') || fullContent.includes('risk')) {
    decisionType = 'blocking_concern';
  } else if (fullContent.includes('feedback') || fullContent.includes('input') || fullContent.includes('thoughts')) {
    decisionType = 'feedback';
  } else if (fullContent.includes('approval') || fullContent.includes('approve') || fullContent.includes('proceed')) {
    decisionType = 'approval';
  }

  // Try to detect deadline from content
  let deadline: string | undefined;
  const deadlineMatch = fullContent.match(/deadline[:\s]+(\d{4}-\d{2}-\d{2})/i) ||
    fullContent.match(/by[:\s]+(\w+ \d{1,2},? \d{4})/i) ||
    fullContent.match(/due[:\s]+(\w+ \d{1,2},? \d{4})/i);
  if (deadlineMatch) {
    const parsed = Date.parse(deadlineMatch[1]);
    if (!isNaN(parsed)) {
      deadline = new Date(parsed).toISOString().split('T')[0];
    }
  }

  // Remove the title from the content if it appears as the first line
  let content = contentParts.join('\n\n');
  if (title && content.startsWith(title)) {
    content = content.slice(title.length).trim();
  }

  const alternatives = alternativesParts.length > 0
    ? alternativesParts.join('\n\n')
    : undefined;

  return {
    title: title || '',
    content: content || '',
    alternatives,
    decisionType,
    deadline,
  };
}
