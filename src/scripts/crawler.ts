import { JSDOM } from 'jsdom';
import { db } from '../lib/db';

interface PageData {
  url: string;
  title: string;
  content: string;
}

class DocumentationCrawler {
  private visited = new Set<string>();
  private queue: string[] = [];
  private baseUrl: string;

  constructor(startUrl: string) {
    if (!process.env.DOCS_BASE_URL) {
      throw new Error('DOCS_BASE_URL environment variable is required');
    }
    this.baseUrl = process.env.DOCS_BASE_URL;
    this.queue.push(startUrl);
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Skipping ${url} - Status: ${response.status} (${response.statusText})`);
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.text();
  }

  private extractContent(dom: JSDOM): PageData | null {
    const url = dom.window.location.href;
    let title = dom.window.document.title;
    const mainContent = dom.window.document.querySelector('main');

    if (!mainContent) {
      return null;
    }

    // Handle fragment identifiers
    if (url.includes('#')) {
      const fragmentId = url.split('#')[1];
      const anchorElement = dom.window.document.getElementById(fragmentId);
      if (anchorElement) {
        // Combine the main title with the section title
        const sectionTitle = anchorElement.textContent?.trim();
        if (sectionTitle) {
          title = `${title} - ${sectionTitle}`;
        }
      }
    }

    // Remove code blocks, scripts, and other non-text content
    const clone = mainContent.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('pre, code, script, style').forEach(el => el.remove());

    return {
      url: url,
      title: title,
      content: clone.textContent?.trim() || ''
    };
  }

  private extractLinks(dom: JSDOM): string[] {
    const links: string[] = [];
    dom.window.document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      try {
        const url = new URL(href, dom.window.location.href);
        if (url.hash === '#__docusaurus_skipToContent_fallback') return;
        if (url.hash === '#') return;

        // Only include links that match our base URL
        if (url.origin === this.baseUrl) {
          links.push(url.href);
        }
      } catch (e) {
        console.warn('Invalid URL:', href);
      }
    });
    return links;
  }

  private async savePage(pageData: PageData): Promise<void> {
    await db.execute({
      sql: `INSERT OR REPLACE INTO pages (url, title, content)
            VALUES (?, ?, ?)`,
      args: [pageData.url, pageData.title, pageData.content]
    });
  }

  public async crawl(): Promise<void> {
    while (this.queue.length > 0) {
      const url = this.queue.shift()!;
      // Skip Docusaurus "Skip to Content" URLs - these are accessibility features
      // of the Docusaurus documentation framework and not actual documentation pages
      if (url.includes('#__docusaurus_skipToContent_fallback')) continue;
      // Skip URLs that end with just '#' as they're equivalent to the base URL
      if (url.endsWith('#')) continue;
      if (this.visited.has(url)) continue;

      try {
        console.log('Crawling:', url);
        const html = await this.fetchPage(url);
        const dom = new JSDOM(html, { url });

        const pageData = this.extractContent(dom);
        if (pageData) {
          await this.savePage(pageData);
        }

        const links = this.extractLinks(dom);
        links.forEach(link => {
          if (!this.visited.has(link)) {
            this.queue.push(link);
          }
        });

        this.visited.add(url);
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Start crawling
const crawler = new DocumentationCrawler(`${process.env.DOCS_BASE_URL}`);
crawler.crawl().catch(console.error);