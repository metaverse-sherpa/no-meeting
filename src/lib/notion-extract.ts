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
