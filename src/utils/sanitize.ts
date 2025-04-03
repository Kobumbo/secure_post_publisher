import { marked } from 'marked';
import DOMPurify from 'dompurify';
import he from 'he';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const sanitizeInput = async (input: string): Promise<string> => {
    // 1. Escape HTML entities to prevent HTML injection
    const escaped = he.encode(input);
    // 2. Convert escaped Markdown to HTML
    const html = await marked(escaped);
    // 3. Sanitize HTML to remove any remaining dangerous elements
    return purify.sanitize(html);
};
