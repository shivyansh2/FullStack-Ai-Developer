# HTML Notes (Day 1)
 
Short explanations for every tag and topic used in `index.html`.
 
---
 
## 1. Document structure
 
| Tag | Explanation |
|---|---|
| `<!DOCTYPE html>` | Tells the browser to use modern standards mode. Must be the first line. Not an HTML tag. Without it the browser uses "quirks mode". |
| `<html lang="en">` | Root element wrapping everything. `lang` helps screen readers, search engines and translators. |
| `<head>` | Information ABOUT the page (metadata, title, CSS links). Not displayed, except the title in the tab. |
| `<body>` | Everything the user sees and interacts with. |
 
## 2. Meta tags (inside `<head>`)
 
| Tag | Explanation |
|---|---|
| `<meta charset="UTF-8">` | Makes letters, symbols and emojis display correctly. Keep near the top of `<head>`. |
| `<meta name="viewport" ...>` | Makes the page fit phone screens. Without it, responsive CSS fails on mobile. |
| `<title>` | Text in the browser tab, bookmarks and search results. Unique per page, under about 60 characters. |
| `<meta name="description">` | Snippet search engines may show. About 150 to 160 characters, honest and specific. |
| `<meta property="og:*">` | Open Graph tags. Control the preview card when the link is shared on LinkedIn, WhatsApp or X. |
| `<link rel="stylesheet">` | Connects the external CSS file. `href` must match the real filename. |
 
## 3. Semantic HTML
 
Choose tags for what content IS, not how it looks. Benefits: accessibility, SEO, easier maintenance.
 
| Tag | Explanation |
|---|---|
| `<header>` | Intro area of the page or section. Logo and navigation. |
| `<nav>` | Block of main navigation links. A landmark for screen readers. |
| `<main>` | Unique content of the page. Only ONE per page. |
| `<section>` | Themed group of content, usually with a heading. |
| `<article>` | Self-contained content that makes sense alone (project card, blog post). |
| `<footer>` | Closing info: copyright, links. |
| `<div>` / `<span>` | Generic wrappers with no meaning. Use only when no semantic tag fits. |
 
## 4. Headings
 
- `<h1>` to `<h6>`: one `<h1>` per page, then `<h2>` for sections, `<h3>` for subsections.
- Never skip levels. Choose by structure, not by font size (use CSS for size).
## 5. Paragraphs and text
 
| Tag | Explanation |
|---|---|
| `<p>` | A paragraph. Block element. |
| `<strong>` | Important text (usually bold). Inline. |
| `<em>` | Emphasized text (usually italic). Inline. |
| `<span>` | Generic inline wrapper, no meaning. Used for styling a piece of text. |
| `<code>` | Marks computer code. Inline. |
| `<small>` | Side notes, hints, fine print. |
 
## 6. Links
 
- `<a href="...">`: the link. `href` is the destination.
- `href="#about"` jumps to the element with `id="about"` on the same page.
- Use meaningful link text ("View project"), never "click here".
- Inline element.
## 7. Images
 
`<img src="..." alt="..." width="400" height="300">`
 
- `src`: path to the file. Use local files, not hotlinked thumbnails that can break.
- `alt`: text for screen readers and broken images. Describe the content. Use `alt=""` if purely decorative.
- `width` and `height`: reserve space so the page does not jump while loading.
- Inline, self-closing.
## 8. Audio and video
 
- `<audio controls loop>`: embeds sound. `controls` shows play and pause. `loop` goes on `<audio>`, not on `<source>`.
- `<video controls poster="...">`: same idea. `poster` is a preview image.
- `<source src="..." type="...">`: the file and its type. The browser picks the first format it supports.
- Text inside `<audio>` or `<video>` is a fallback for old browsers.
- `<track kind="captions" src="..." srclang="en">`: captions for accessibility.
## 9. Lists
 
| Tag | Explanation |
|---|---|
| `<ul>` | Unordered list (bullets). Only `<li>` may be a direct child. |
| `<ol>` | Ordered list (numbers). Use when order matters. |
| `<li>` | One list item. |
 
## 10. Tables
 
Use tables for tabular DATA only, never for layout.
 
| Tag | Explanation |
|---|---|
| `<table>` | The table wrapper. |
| `<caption>` | Visible title. Screen readers announce it. |
| `<thead>` | Groups header row(s). |
| `<tbody>` | Groups body rows. |
| `<tr>` | One row. Cells must sit inside a `<tr>`. |
| `<th scope="col">` | Header cell. `scope` tells screen readers what it labels. |
| `<td>` | Normal data cell. |
 
## 11. Forms
 
| Tag | Explanation |
|---|---|
| `<form action method>` | Wraps the controls. `action` is where data is sent. `method` is `post` (send data) or `get` (search). |
| `<label for="id">` | Visible name of a field. `for` must match the input `id`. Clicking it focuses the input. A placeholder is NOT a label. |
| `<input>` | Main control. Inline, self-closing. Behavior depends on `type`. |
| `<textarea rows>` | Multi-line text. `rows` sets visible height. |
| `<fieldset>` + `<legend>` | Groups related controls (like radios) and names the group for screen readers. |
| `<button type="submit">` | Validates and sends the form. Must be INSIDE the form. |
| `<button type="button">` | Does nothing by itself. Used with JavaScript. |
 
`name` is the key used when the data is submitted. Radio buttons with the same `name` form one group.
 
## 12. Input types
 
| Type | Use |
|---|---|
| `text` | Single-line text |
| `email` | Checks email format, email keyboard on phones |
| `tel` | Phone keyboard (no automatic format check) |
| `number` | Numeric input with `min`, `max`, `step` |
| `password` | Hides characters |
| `url` | Web address |
| `date` | Date picker |
| `checkbox` | On/off choice, can pick many |
| `radio` | Pick one from a group |
| `file` | File upload (`multiple` allows several) |
| `range` | Slider |
| `search` | Search box |
 
## 13. Form validation attributes
 
| Attribute | Meaning |
|---|---|
| `required` | Cannot be empty |
| `type` | Built-in format check (`email`, `url`, `number`) |
| `minlength` / `maxlength` | Min and max number of characters |
| `min` / `max` | Min and max value (`number`, `range`, `date`) |
| `step` | Allowed increments |
| `pattern` | Whole value must match a regular expression |
| `title` | Hint shown when `pattern` fails |
| `multiple` | Allows several values (emails, files) |
| `autocomplete` | Lets the browser autofill, helps accessibility |
| `inputmode="numeric"` | Numeric keypad on phones |
| `novalidate` (on form) | Turns off browser validation |
 
Client-side validation is for user experience, not security. The server must always validate again.
 
## 14. `data-*` attributes
 
- Custom attributes that store extra info on an element: `data-project-id="1"`.
- JavaScript: `element.dataset.projectId` (hyphens become camelCase).
- CSS: `[data-featured="true"] { ... }`.
- The value is ALWAYS a string (`"false"` is truthy).
- Never store secrets. Do not use for accessibility state (use ARIA).
## 15. `id` vs `class`
 
- `id`: unique on the page. Use for link targets, `label for`, JS hooks.
- `class`: reusable, many elements can share it, one element can have several. Use for styling.
- `id` has higher specificity than `class`. Style with classes to keep specificity low.
## 16. Block vs inline elements
 
- **Block** (`div`, `p`, `section`, `h1`, `ul`): start on a new line, take full width, accept width, height and vertical margin.
- **Inline** (`span`, `a`, `strong`, `em`, `img`): flow within a line, ignore width, height and vertical margin.
- **inline-block**: flows inline but accepts width and height.
- Change with CSS `display`.
## 17. HTML entities
 
| Write | Shows | Note |
|---|---|---|
| `&lt;` | `<` | Otherwise it starts a tag |
| `&gt;` | `>` | |
| `&amp;` | `&` | Otherwise it starts an entity |
| `&quot;` | `"` | Useful inside attribute values |
| `&copy;` | © | Footer copyright |
| `&times;` | × | Close button symbol |
| `&nbsp;` | non-breaking space | Keeps words together. Never use for layout spacing. |
 
## 18. SEO basics
 
- Unique `<title>` and meta description per page.
- One `<h1>` and a logical heading order.
- Semantic tags (`main`, `nav`, `article`).
- Descriptive `alt` text.
- Meaningful link text.
- Fast, mobile-friendly page (viewport tag).
- `lang` attribute on `<html>`.
## 19. Accessibility basics
 
- Semantic HTML gives most accessibility for free.
- `alt` text on images.
- A `<label>` on every field.
- Color contrast of at least 4.5:1 for normal text.
- Visible focus outline.
- Do not rely on color alone to show meaning.
- `lang` on `<html>`.
- Skip link at the top (`<a href="#main" class="skip-link">`).
## 20. ARIA: when to use and when not to
| Attribute | Used for |
|---|---|
| `aria-label="Main"` on `<nav>` | Names a landmark when a page has more than one nav |
| `aria-label="Close project details"` on a button | Names an icon-only button that has no visible text |
| `aria-describedby="phone-hint"` | Links an input to its hint or error text |
| `aria-live="polite"` | Announces text changes (like "Message sent") without moving focus |
 
Other useful ones: `aria-expanded` (menu open or closed), `aria-hidden="true"` (hide decorative items), `aria-invalid="true"` (field has an error).
 
**Warning:** ARIA changes only what assistive tech is told. It adds no behavior or styling. Wrong ARIA is worse than none. A `<div role="button">` needs extra code to match a real `<button>`, so use `<button>`.
 
## 21. Keyboard accessibility
 
- Keys: **Tab** forward, **Shift+Tab** back, **Enter** activates links and buttons, **Space** activates buttons, **Esc** closes menus and dialogs.
- Use native `<a>`, `<button>`, `<input>`: they are keyboard-ready by default.
- Tab order should follow the visual order.
- Never remove the focus outline without replacing it (`:focus-visible` in CSS).
- `tabindex="0"` makes a custom element focusable. `tabindex="-1"` is focusable by script only. Avoid positive values.
- Hide the skip link visually until it receives focus. Do not use `display: none`, or it becomes unreachable.
**Test:** put the mouse aside and Tab through the whole page. Can you reach everything, see where you are, and use the form?
 
---

 