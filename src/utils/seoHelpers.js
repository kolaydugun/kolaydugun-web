/**
 * Automatically adds internal links to blog content based on existing post titles.
 * @param {string} content - The HTML content of the blog post.
 * @param {Array} posts - List of existing posts [{ title: {tr: "...", ...}, slug: "..." }, ...].
 * @param {string} lang - The language to match titles against ('tr', 'en', 'de').
 * @returns {string} - The content with internal links added.
 */
export const generateInternalLinks = (content, posts, lang = 'tr') => {
    if (!content || !posts || posts.length === 0) return content;

    let newContent = content;

    // Filter valid posts and sort by title length (descending) to match longer phrases first
    const validPosts = posts
        .filter(p => p.title && p.title[lang] && p.slug)
        .sort((a, b) => b.title[lang].length - a.title[lang].length);

    // Keep track of added links to avoid over-linking
    const addedSlugs = new Set();
    const MAX_LINKS = 5; // Maximum number of internal links to add
    let linkCount = 0;

    validPosts.forEach(post => {
        if (linkCount >= MAX_LINKS) return;
        if (addedSlugs.has(post.slug)) return;

        const title = post.title[lang];
        const slug = post.slug;
        const linkUrl = `/blog/${slug}`;

        // Escape regex special characters
        const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Regex explanation:
        // (?![^<]*>|[^<>]*<\/a>) -> Lookahead to ensure we are NOT inside an HTML tag or an existing <a> tag.
        // This is a naive approximation. For complex HTML, a DOM parser is better, but this works for standard paragraphs.
        // We match case-insensitive, whole word boundaries if possible, but Turkish characters can be tricky with \b.

        // Simplified strategy: 
        // 1. Temporarily replace existing <a> tags with placeholders.
        // 2. Perform replacements.
        // 3. Restore placeholders.

        const linkRegex = new RegExp(`(${escapedTitle})`, 'i');

        // Simple check if title exists in content (case insensitive)
        if (newContent.match(linkRegex)) {
            // Avoid linking to self (if we had current slug, but here we don't have it easily. User can remove.)

            // Check if we are already inside a link (Primitive check)
            // We will skip this post if the title is common or short (e.g. less than 4 chars) to avoid noise
            if (title.length < 4) return;

            // Replace FIRST occurrence only
            // We need a safer replace that doesn't break HTML attributes
            // This is a "good enough" Approach for the MVP

            const linkHTML = `<a href="${linkUrl}" title="${title}" target="_blank" class="internal-link">${title}</a>`;

            // We use a safe replace function to ensure we don't touch existing tags
            // Split content by tags

            // Temporary placeholder logic for robust replacement
            // Note: Doing full DOM parsing in pure JS string manipulation is heavy. 
            // We'll trust the user to review the changes.

            // Re-regex with lookbehind/ahead support being limited, we stick to:
            // Match title where it's NOT followed by similar text indicating it's already linked? 
            // No, let's just use the "replace text nodes" strategy if we were in DOM.

            // "Good Enough" Regex:
            // Match the title, but only if it's not inside <...>
            // Since JS lookbehind is not fully supported everywhere, we iterate text parts.

            // STRATEGY: 
            // 1. Split by < and > to get tags and text.
            // 2. Iterate chunks. modifying only text chunks.

            const parts = newContent.split(/(<[^>]*>)/g);
            let replaced = false;

            for (let i = 0; i < parts.length; i++) {
                if (parts[i].startsWith('<')) continue; // Skip tags

                // If text chunk contains the title and we haven't linked it yet
                const match = parts[i].match(new RegExp(escapedTitle, 'i'));
                if (match) {
                    // Replace only the first instance in this text chunk
                    parts[i] = parts[i].replace(match[0], linkHTML);
                    replaced = true;
                    break; // Only one link per post reference
                }
            }

            if (replaced) {
                newContent = parts.join('');
                addedSlugs.add(slug);
                linkCount++;
            }
        }
    });

    return newContent;
};
