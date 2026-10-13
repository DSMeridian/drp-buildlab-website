#!/usr/bin/env node
/* Builds the redesign concept into /concept/ — every page of the proposed
   site, in English, for the founders to review on staging.

     node tools/concept/build.js

   Shared styles and behaviour live in concept/assets/ and are edited by hand.
   This is a design preview: it is not part of the market build in tools/,
   does not touch src/, and every page is noindex. Legal text is read from
   the English half of src/algemene-voorwaarden and src/privacy so it stays
   the version that is live today. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'concept');
/* On the staging branch, netlify.toml publishes this folder as the site root. */
const B = process.env.CONCEPT_BASE ?? ''; // '' = served at the site root; '/concept' = in a subfolder
const V = Date.now().toString(36); // cache-buster for the shared assets

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = n => '€' + n.toLocaleString('en-GB', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
const arr = '<span class="arr" aria-hidden="true">→</span>';

/* ── Data ─────────────────────────────────────────────────────────────── */

const CASES_RAW = [
  {
    slug: 'kasteel-warmelo', name: 'Kasteel Warmelo', em: 'Kasteel <em>Warmelo</em>',
    url: 'kasteelwarmelo.nl', href: 'https://kasteelwarmelo.nl/', img: 'warmelo',
    sector: 'Heritage estate and tourism', where: 'Diepenheim, Netherlands', scope: 'Design and development, in three languages',
    tags: ['Design', 'Development', 'NL · EN · DE', 'Responsive'], kinds: 'Website',
    short: 'A website for a centuries-old estate in Twente: historic gardens, a yearly sand sculpture exhibition, a terrace and holiday homes in the orangery. In Dutch, English and German.',
    brief: ['Kasteel Warmelo in Diepenheim is an estate with four centuries of garden architecture. Each season it hosts a sand sculpture exhibition, this year 28 works by ten artists, alongside events, a terrace and holiday homes in the former orangery.', 'Visitors come from the Netherlands, Germany and further away, so the site has to sell a day out and an overnight stay, in three languages.'],
    did: ['We designed the site around the estate itself: an aerial photo of the castle, the numbers that matter (675+ years of history, 7 hectares of gardens, 28 sand sculptures) and a clear route to the gardens, events, food and drink, and stays.', 'Visitors switch between Dutch, English and German in one tap, and the practical information on the season, parking and dogs is easy to find on a phone.'],
    hDesk: 5200, hMob: 3600, phoneImg: 'warmelo-mob'
  },
  {
    slug: 'start-to-business', name: 'Start to Business', em: 'Start to <em>Business</em>',
    url: 'start-to-business.be', href: 'https://start-to-business.be/', img: 'stb',
    sector: 'Coaching for entrepreneurs', where: 'Belgium', scope: 'Design, development, maintenance',
    tags: ['Design', 'Development', 'Responsive', 'Maintenance'], kinds: 'Website',
    short: 'A website for Petra Vanhandenhoven’s coaching practice for entrepreneurs, with her e-books, workshops and one-to-one guidance in one place. We designed and built it, and we still maintain it.',
    brief: ['Petra Vanhandenhoven helps entrepreneurs take the right steps with their business, through e-books, workshops and one-to-one guidance. She needed one place where all of that comes together, and that feels as personal as her coaching.'],
    did: ['We designed and built the site around Petra herself: a strong editorial headline, her portrait, and a clear route to each offer — e-books, workshops, guidance and her Dreamteam.', 'It works as well on a phone as on a desktop. We still maintain it, so updates and new offers go live without Petra having to touch any code.'],
    quote: 'Ideas deserve a strong online foundation.', hDesk: 3943, hMob: 3600, phoneImg: 'stb-mob'
  },
  {
    slug: 'hermosa-antwerp', name: 'Hermosa Antwerp', em: 'Hermosa <em>Antwerp</em>',
    url: 'hermosa-antwerp.myshopify.com', href: 'https://hermosa-antwerp.myshopify.com/', img: 'hermosa',
    sector: 'E-commerce, beauty', where: 'Antwerp', scope: 'Shopify maintenance and IT',
    tags: ['Shopify', 'E-commerce', 'IT maintenance'], kinds: 'Maintenance',
    short: 'A Shopify webshop for handmade BIAB press-on nails, shipped to customers worldwide. We are Hermosa’s IT maintenance partner and keep the shop running, up to date and ready to sell.',
    brief: ['Hermosa Antwerp sells handmade BIAB press-on nails and treatments, shipped to customers worldwide. The Shopify store is the business, so it has to work every day.'],
    did: ['DRP BuildLab is Hermosa’s IT maintenance partner. We keep the store up to date, fix problems before customers notice them, and make changes when the shop needs them.', 'Hermosa focuses on the product. We look after everything behind the checkout.'],
    quote: 'Technology supports beauty.', hDesk: 5200, hMob: 3600, phoneImg: 'hermosa-mob'
  },
  {
    slug: 'vonckx-performance', name: 'Vonckx Performance', em: 'Vonckx <em>Performance</em>',
    url: 'vonckx-performance.netlify.app', href: 'https://vonckx-performance.netlify.app/', img: 'vonckx',
    sector: 'Car tuning and maintenance', where: 'Booischot, Belgium', scope: 'Design and development',
    tags: ['Design', 'Development', 'Appointments', 'Responsive'], kinds: 'Website',
    short: 'A website for an independent garage in Booischot that does chiptuning, styling and regular servicing. Dark, sharp and built around one action: booking an appointment.',
    brief: ['Vonckx Performance is an independent garage for cars and light commercial vehicles, from chiptuning and styling to regular servicing. Visits are by appointment only.', 'So the website has one job: explain the services clearly and get drivers to book.'],
    did: ['We built a dark, workshop-style site with the services in one place, a selection of recent cars from the workshop, and a clear four-step process: we listen, we plan, we do the work, you drive away.', 'Address, phone and email sit right under the headline, so a driver on a phone can call in one tap or send a message to book.'],
    hDesk: 5200, hMob: 3600, phoneImg: 'vonckx-mob'
  },
  {
    slug: 'de-smedt-meridian', name: 'De Smedt Meridian', em: 'De Smedt <em>Meridian</em>',
    url: 'dsmeridian.com', href: 'https://dsmeridian.com/', img: 'dsm',
    sector: 'Global sales and market entry', where: 'Belgium', scope: 'Design and development',
    tags: ['Design', 'Development', 'B2B', 'Responsive'], kinds: 'Website',
    short: 'A website for an external sales agency that connects brands with distributors and buyers in more than 30 markets. Built to feel international and to book intro calls.',
    brief: ['De Smedt Meridian works as an embedded sales force for brands that want to sell abroad, connecting them to distributors and buyers across more than 30 markets.', 'The site needed to feel as international as the service, and turn interest into a booked call.'],
    did: ['We designed a dark, editorial site with a meridian globe as its signature, the key numbers up front, and one clear action throughout: book an intro call.'],
    hDesk: 1286, hMob: 2418, phoneImg: 'dsm-mob'
  },
  {
    slug: 'prestige-automotive', name: 'Prestige Automotive', em: 'Prestige <em>Automotive</em>',
    url: 'prestige-automotive.be', href: 'https://prestige-automotive.be/', img: 'prestige',
    sector: 'Car detailing', where: 'Heist-op-den-Berg, Belgium', scope: 'Design and development',
    tags: ['Design', 'Development', 'WhatsApp quotes', 'Responsive'], kinds: 'Website',
    short: 'A website for a premium car detailing studio: exterior, interior, paint correction and ceramic coating, with prices up front and quotes by WhatsApp.',
    brief: ['Prestige Automotive cleans, corrects and protects cars at its own location in Heist-op-den-Berg, from a hand wash to a full ceramic coating.', 'Customers want to know two things: what it costs, and how quickly they can book.'],
    did: ['We built a bold, dark site with the three packages and their starting prices (from €65, €85 and €250) side by side, and a WhatsApp button that is always in reach.', 'A quote request gets a personal answer within the hour, so the site leads every visitor to that one message.'],
    hDesk: 2511, hMob: 3600, phoneImg: 'prestige-mob'
  },
  {
    slug: 'welkomthuis', name: 'WelkomThuis', em: 'Welkom<em>Thuis</em>',
    url: 'welkomthuisinterieur.com', href: 'https://welkomthuisinterieur.com/', img: 'welkomthuis',
    sector: 'Moving support for seniors', where: 'Mortsel, Belgium', scope: 'Design and development',
    tags: ['Design', 'Development', 'Easy to read', 'Responsive'], kinds: 'Website',
    short: 'A website for Kato Vermeulen’s moving support for seniors: the interior design, the move and everything in between, as one personal journey.',
    brief: ['WelkomThuis helps people, mostly seniors, move from a large family home to a smaller house, apartment or service flat. Kato Vermeulen combines the work of an interior designer and a moving company in one personal journey.'],
    did: ['We designed the site for the people who read it: large type, plain words and a calm layout. It explains the three phases, before, during and after the move, and makes a free phone call with no obligation the next step.'],
    hDesk: 5200, hMob: 3600, phoneImg: 'welkomthuis-mob'
  },
  {
    slug: '0-procent-experiment', name: '0% Experiment', em: '0% <em>Experiment</em>',
    url: '0procentexperiment.com', href: 'https://0procentexperiment.com/', img: 'nulprocent',
    sector: 'Digital workbook', where: 'Online', scope: 'Design and development',
    tags: ['Design', 'Development', 'Digital product', 'Responsive'], kinds: 'Website',
    short: 'A website for a 30-day digital workbook that pauses alcohol as an experiment. No detox and no ban: one question a day.',
    brief: ['0% Experiment is a digital workbook that guides you through 30 days without alcohol, with one question each day. It is curious, not preachy: you are the test subject and the researcher.'],
    did: ['We designed a bright, confident site with a neon accent and big type that states the idea in one line: take one thing away and see what is left. It explains what the workbook is, how it works and who it is for, then leads straight to starting the experiment.'],
    hDesk: 4212, hMob: 3600, phoneImg: 'nulprocent-mob'
  }
];

const SERVICES = [
  {
    slug: 'websites-op-maat', name: 'Custom websites', em: 'Custom <em>websites</em>', from: 'from €499',
    short: 'A site designed around your business, never a template. A one-page site with contact form starts at €499; bigger sites on demand.',
    intro: 'Every website we make starts from your business: what you sell, who buys it and what they need to see before they contact you. No templates, no page builders that slow your site down.',
    incl: ['A design made for your business', 'Works on every phone, tablet and screen', 'Contact form and WhatsApp button', 'Google Maps and basic SEO', 'Personal guidance from start to launch', 'Two revision rounds included'],
    opts: [['onepager', 'One-page website', 'One page, including a contact form. The base for every multi-page site.'], ['extra-pagina', 'Extra page', 'Another page in the same style, on top of the base.'], ['cms', 'Edit it yourself', 'Manage texts, images and pages without technical knowledge.'], ['meertalig', 'Multilingual site', 'For example NL / FR / EN, with language detection.'], ['seo', 'SEO starter', 'Meta tags, page titles, alt texts and speed optimisation.'], ['logo', 'Logo design', 'A professional logo made for your brand.']],
    caseSlug: 'kasteel-warmelo',
    faq: [['Who is the €499 package for?', 'For business owners who have just started and have no website yet, or who want their existing website turned into a modern, professional one.'], ['How quickly will my website be online?', 'As soon as we have your texts, photos and logo, we can move fast. At the start we agree on a delivery date that fits the scope of your project, and we keep to it. Along the way you get a preview to approve.']]
  },
  {
    slug: 'webshops-shopify', name: 'Webshops & Shopify', em: 'Webshops <em>& Shopify</em>', from: 'On demand',
    short: 'Product catalogue, cart, checkout and order management, or a complete redesign of your existing Shopify store.',
    intro: 'A webshop has one job: turn visitors into orders. We build shops that are quick to browse, simple to pay in, and easy for you to run, on Shopify or built to measure.',
    incl: ['Product catalogue with clear categories', 'Cart, checkout and order management', 'Payment provider of your choice', 'Shipping and invoicing connected', 'Works on every phone', 'Training so you can run it yourself'],
    opts: [['shopify-herontwerp', 'Shopify redesign', 'A complete redesign of an existing Shopify webshop with a new theme.'], ['webshop-medium', 'Webshop (B2C)', 'Catalogue, cart, checkout and order management.'], ['webshop-uitgebreid', 'Webshop, extended', 'Extended cart and checkout, weekly boxes or subscription logic.'], ['betaling', 'Payment integration', 'Connection to the payment platform of your choice.'], ['productmigratie', 'Product migration', 'Moving your products to a new platform with clear categories.'], ['b2b-portaal', 'B2B portal', 'A closed section for business customers with their own login and prices.'], ['stockbeheer', 'Stock management', 'Custom stock management with real-time tracking across channels.']],
    caseSlug: 'hermosa-antwerp',
    faq: [['Do you only work with Shopify?', 'No. We redesign and maintain Shopify stores, and we also build webshops to measure when Shopify is not the right fit. We advise you on the first call.'], ['Is the price fixed?', 'Webshop prices are guide prices. The exact price is confirmed in your written quote, based on the number of products, features and integrations.']]
  },
  {
    slug: 'redesign', name: 'Redesign & refresh', em: 'Redesign <em>& refresh</em>', from: 'On demand',
    short: 'Your current site, modernised. We keep your content and brand and fix what holds it back.',
    intro: 'Your website already exists, but it looks dated, is slow on phones or does not bring in enquiries. We keep what works — your content, your brand, your Google ranking — and fix the rest.',
    incl: ['A review of what works and what does not', 'A modern design in your own brand', 'Faster loading on phones', 'Your content and URLs kept', 'Contact forms that work and stop spam', 'A preview before anything goes live'],
    opts: [['aanpassing-bestaand', 'Update existing website', 'Changes within your current layout and brand.'], ['vernieuwing-bestaand', 'Website or webshop refresh', 'A fresh, modern look that keeps your offer and brand.'], ['audit', 'Website audit', 'A check of structure, speed, mobile use and how easy you are to find.'], ['content-uitbreiding', 'Content expansion', 'Extra pages or information in the existing look and feel.'], ['contactform-herstel', 'Contact form repair', 'A working contact form, protected against spam and bots.']],
    caseSlug: null,
    faq: [['Will I lose my Google ranking?', 'No. We keep your existing page addresses or redirect them properly, so the ranking you built carries over to the new design.'], ['Can you work with my current hosting?', 'Usually, yes. If your hosting holds the site back, we advise you and help you move it.']]
  },
  {
    slug: 'onderhoud', name: 'Care plans', em: 'Care <em>plans</em>', from: '€29 / month',
    short: 'Updates, monitoring and changes when you need them. Urgent issues get a response within one working day.',
    intro: 'A website is never finished. With a care plan we keep it safe, fast and findable, and you have a team to call when something needs changing. It is optional, and you can cancel any month.',
    incl: ['Software and security updates', 'Backups', 'Uptime and error monitoring', 'Regular SEO checks', 'Urgent issues: response within 1 working day', 'Normal requests: response within 3 working days'],
    opts: [['onderhoud-maandelijks', 'Care plan, monthly', 'Management, updates and monitoring of your website or webshop.'], ['noodreparatie', 'Emergency repair', 'Urgent repair of a problem on a live website, within 24 to 48 hours.'], ['hosting-advies', 'Hosting advice and move', 'An analysis of your hosting and help moving it.']],
    caseSlug: 'hermosa-antwerp',
    faq: [['Am I tied to a contract?', 'No. You can cancel the monthly plan any month, and the website always stays yours.'], ['Do you maintain websites you did not build?', 'Yes. Hermosa Antwerp is an example: we are their IT maintenance partner for a Shopify store we did not build.']]
  },
  {
    slug: 'uitbreidingen', name: 'Growth add-ons', em: 'Growth <em>add-ons</em>', from: 'On demand',
    short: 'SEO, multilingual sites, payments, invoicing and booking integrations, Google reviews and custom calculators.',
    intro: 'Add-ons make an existing website do more: get found, sell in more languages, save you admin. Order them with a new website or add them to the one you have.',
    incl: ['Can be added to any website we build', 'Also available for existing sites', 'Fixed prices, confirmed in your quote', 'Built and tested by the same team'],
    opts: [['seo', 'SEO starter', 'Meta tags, page titles, alt texts and speed optimisation.'], ['google-ads', 'Google Ads setup', 'A first Google Ads campaign, set up for you. No ongoing management.'], ['meertalig', 'Multilingual site', 'For example NL / FR / EN, with language detection.'], ['koppelingen', 'Integrations', 'Connect a booking system, payment provider or accounting package.'], ['int-facturatie', 'Automatic invoicing', 'An invoice sent automatically after every payment.'], ['int-nieuwsbrief', 'Newsletter and personalisation', 'Personal emails based on purchase history.'], ['google-reviews', 'Google reviews', 'Your Google reviews shown on your site, always up to date.'], ['prijscalculator', 'Price calculator', 'A valuation, quote or cost calculator on your website.'], ['formulierlogica', 'Custom form logic', 'A form with validation and automatic notifications.'], ['leasingmodule', 'Leasing module', 'Subscriptions with recurring payments and contract management.'], ['ai-scouting', 'AI-powered scouting', 'Automatic monitoring of new, popular products or trends.'], ['fotografie', 'Photography, half day', 'Professional product or company photography.']],
    caseSlug: null,
    faq: [['Can I add these to a website someone else built?', 'Often, yes. We look at your site first and tell you honestly what is possible and what it costs.']]
  }
];

const CASE_ORDER = ['kasteel-warmelo', 'prestige-automotive', 'start-to-business', 'vonckx-performance', 'welkomthuis', 'hermosa-antwerp', '0-procent-experiment', 'de-smedt-meridian'];
const CASES = CASE_ORDER.map(k => CASES_RAW.find(c => c.slug === k));
const caseBy = k => CASES.find(c => c.slug === k);

/* prices come from the same catalogue the chat assistant reads */
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pricing-catalog.json'), 'utf8'));
const PRICE = {};
for (const d of CAT.diensten) PRICE[d.id] = { p: d.prijs, u: d.eenheid };
for (const d of CAT.onderhoud) PRICE[d.id] = { p: d.prijs, u: d.eenheid };
const UNIT = { 'per pagina': ' / page', 'per maand': ' / month', 'per jaar': ' / year', integratie: ' / integration' };
/* Only the one-pager and the monthly care plan are priced publicly;
   everything else is quoted on demand. */
const PUBLIC_PRICES = ['onepager', 'onderhoud-maandelijks'];
const priceOf = id => { const x = PRICE[id]; if (!x) throw new Error('No price for ' + id); return PUBLIC_PRICES.includes(id) ? eur(x.p) + (UNIT[x.u] || '') : 'On demand'; };

const OTHER = { href: '/contact/', name: 'Other services', short: 'Logo design, photography, Google Ads, hosting moves, integrations and whatever else your site needs. Just ask.', from: 'On demand' };
const svcRow = s => `<li><a href="${B}${s.href || `/diensten/${s.slug}/`}"><h3>${s.name}</h3><p>${s.short}</p><span class="price">${s.from} <span class="ar" aria-hidden="true">→</span></span></a></li>`;

const NOT_DONE = ['Printed matter such as business cards, flyers and brochures. We design the logo itself.', 'Mobile apps. We build websites and webshops only.', 'Day-to-day management of ad campaigns. We set up your first Google Ads campaign.', 'Accounting, legal or financial advice.', 'Writing all your content from scratch. We work with the texts you provide, unless agreed otherwise.'];

/* ── Shared pieces ────────────────────────────────────────────────────── */

const NAV = [['work', 'Work', '/werk/'], ['services', 'Services', '/diensten/'], ['about', 'About', '/over-ons/'], ['pricing', 'Pricing', '/prijzen/'], ['partner', 'Partners', '/partner-worden/'], ['contact', 'Contact', '/contact/']];
const LANGS = [['NL', 'Nederlands'], ['EN', 'English'], ['FR', 'Français'], ['ES', 'Español'], ['DE', 'Deutsch'], ['ID', 'Bahasa Indonesia'], ['JA', '日本語']];


const ICON = {
  instagram: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
  facebook: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  tiktok: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 14.5V2a5 5 0 0 0 5 5"/><circle cx="11.5" cy="14.5" r="4.5"/></svg>'
};
/* payment marks, as on the live footer */
const PAY = [
  ['Bancontact', '<svg viewBox="0 0 92 24" role="img" aria-label="Bancontact"><path fill="#005498" d="M6 6h14l-5 6H1z"/><path fill="#FFD800" d="M17 12h14l-5 6H12z"/><text x="34" y="15.5" font-family="Arial,Helvetica,sans-serif" font-size="9.5" font-weight="700" fill="#1e3764">Bancontact</text></svg>'],
  ['Visa', '<svg viewBox="0 0 48 24" role="img" aria-label="Visa"><text x="24" y="17" text-anchor="middle" font-family="Arial Black,Arial,Helvetica,sans-serif" font-size="13" font-weight="900" font-style="italic" fill="#1A1F71" letter-spacing=".5">VISA</text></svg>'],
  ['Mastercard', '<svg viewBox="0 0 40 24" role="img" aria-label="Mastercard"><circle cx="15" cy="12" r="8" fill="#EB001B"/><circle cx="25" cy="12" r="8" fill="#F79E1B"/><path fill="#FF5F00" d="M20 5.75a8 8 0 0 1 0 12.5 8 8 0 0 1 0-12.5z"/></svg>'],
  ['Bank transfer', '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#1a1f36" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.7 10v8M14.3 10v8M19 10v8"/><path d="M3 20h18"/></svg><span>Bank transfer</span>']
];

const logo = (label = 'DRP BuildLab home') => `<a class="logo" href="${B}/" aria-label="${label}"><span class="l1">DRP</span><span class="l2">BUILDLAB</span></a>`;

function header(cur) {
  const links = NAV.map(([k, t, h]) => `<a href="${B}${h}"${k === cur ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<div class="review" role="note">Site concept v1, for review by the founders. Not the live site · <a href="${B}/">Home</a></div>
<header class="hdr" id="hdr"><div class="wrap hdr-in">
  ${logo()}
  <nav class="nav" aria-label="Main">${links}</nav>
  <details class="lang"><summary aria-label="Language: English">EN</summary><ul>${LANGS.map(([c, n]) => `<li lang="${c.toLowerCase()}"${c === 'EN' ? ' aria-current="true"' : ''}>${n}</li>`).join('')}</ul></details>
  <a class="btn sm" href="${B}/contact/">Free demo website ${arr}</a>
  <button class="burger" type="button" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span></button>
</div></header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="menu-top">${logo()}<button class="menu-x" type="button" id="menuX" aria-label="Close menu">×</button></div>
  <nav aria-label="Mobile">${links}</nav>
  <a class="btn" href="${B}/contact/">Request your free demo website ${arr}</a>
</div>`;
}

const footer = () => `<footer class="ftr"><div class="wrap">
  <div class="ft-top">
    <div>
      <p class="ft-ask">Have a project in mind? Tell us about it.</p>
      <a class="ft-mail" href="mailto:info@drpbuildlab.com">info@drpbuildlab.com</a>
    </div>
    <div class="ft-acts">
      <a class="btn" href="${B}/contact/">Free demo website ${arr}</a>
      <a class="btn ghost" href="https://wa.me/32473744431" target="_blank" rel="noopener">WhatsApp us</a>
    </div>
  </div>
  <div class="ft-cols">
    <nav aria-label="Footer"><h2>Site</h2><ul>${NAV.map(([, t, h]) => `<li><a href="${B}${h}">${t}</a></li>`).join('')}</ul></nav>
    <div><h2>Services</h2><ul>${SERVICES.map(s => `<li><a href="${B}/diensten/${s.slug}/">${s.name}</a></li>`).join('')}</ul></div>
    <div><h2>Studio</h2><address>Honingstraat 1D<br>2220 Hallaar, Belgium</address><p>Monday to Friday, 9:00 to 18:00<br><a href="tel:+32473744431">+32 473 74 44 31</a></p><h2 class="ft-pay-h">We accept</h2><ul class="ft-pay">${PAY.map(([n, svg]) => `<li title="${n}">${svg}</li>`).join('')}</ul></div>
    <div><h2>Follow</h2><ul class="ft-social">${[['instagram', 'Instagram', '@drp_buildlab', 'https://www.instagram.com/drp_buildlab/'], ['facebook', 'Facebook', 'DRP BuildLab', 'https://www.facebook.com/share/1Hz1mJG22E/'], ['tiktok', 'TikTok', '@drpbuildlab', 'https://www.tiktok.com/@drpbuildlab']].map(([k, n, h, u]) => `<li><a href="${u}" target="_blank" rel="noopener"><span class="ico">${ICON[k]}</span><span><b>${n}</b><small>${h}</small></span></a></li>`).join('')}</ul></div>
  </div>
  <div class="ft-bot">
    ${logo()}
    <p>© 2026 DRP BuildLab · VAT BE 1033.313.383</p>
    <p><a href="${B}/algemene-voorwaarden/">Terms</a><a href="${B}/privacy/">Privacy</a></p>
    <a class="ft-top-link" href="#main">Back to top ↑</a>
  </div>
</div></footer>`;

function page({ title, desc, nav, body, cursor }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0b0b0c">
<link rel="icon" href="${B}/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,300..900;1,62..125,300..900&family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${B}/assets/site.css?v=${V}">
<script defer src="${B}/assets/site.js?v=${V}"></script>
</head>
<body>
${header(nav)}
<main id="main">
${body}
</main>
${footer()}
${cursor ? '<div class="cur" id="cur" aria-hidden="true">View</div>' : ''}
</body>
</html>
`;
}

const ctaBand = (h = 'Let’s build <em>yours.</em>', sub = 'Tell us about your business. We’ll call you with a free demo of your new website, with no obligation.') => `
<section class="sec blue tight"><div class="wrap cta-band">
  <div><h2 class="h2 cta">${h.replace('<em>', '<em style="color:var(--ink)">')}</h2><p class="lede" style="color:#fff;margin-top:20px">${sub}</p></div>
  <a class="btn dark" href="${B}/contact/">Request your free demo website ${arr}</a>
</div></section>`;

function caseMedia(c, { tile = false } = {}) {
  return `<a class="case-media" href="${B}/werk/${c.slug}/" aria-label="${esc(c.name)} case study">
    <div class="browser" style="view-transition-name:shot-${c.img}"><div class="bar"><i></i><i></i><i></i><span class="url">${c.url}</span></div>
      <div class="screen"><img src="${B}/img/${c.img}-desk-full.webp" width="1200" height="${c.hDesk}" loading="lazy" decoding="async" alt="${esc(c.name)} homepage on desktop"></div></div>
    <div class="phone"><div class="pscreen"><img src="${B}/img/${c.img}-mob-full.webp" width="420" height="${c.hMob}" loading="lazy" decoding="async" alt="${esc(c.name)} on a phone"></div></div>
  </a>`;
}

function caseRow(c, flip) {
  return `<article class="case${flip ? ' flip' : ''} rv">
    ${caseMedia(c)}
    <div>
      <p class="meta-line"><span>${c.sector}</span><span>${c.where}</span></p>
      <h3>${c.name}</h3>
      <p>${c.short}</p>
      <ul class="tags">${c.tags.map(t => `<li>${t}</li>`).join('')}</ul>
      <div class="case-acts"><a class="btn sm ghost" href="${B}/werk/${c.slug}/">View case ${arr}</a><a class="tlink" href="${c.href}" target="_blank" rel="noopener">Visit live site ↗</a></div>
    </div>
  </article>`;
}

const nextSlot = () => `<article class="case rv">
    <a class="slot" href="${B}/contact/"><span class="big">Your business<br><em>goes here.</em></span></a>
    <div>
      <p class="meta-line"><span>Next project</span><span>Anywhere</span></p>
      <h3>Could be yours</h3>
      <p>Tell us what you do. We’ll build a demo of your new website and walk you through it on a call, free and with no obligation.</p>
      <div class="case-acts"><a class="btn sm" href="${B}/contact/">Request your free demo ${arr}</a></div>
    </div>
  </article>`;

const faqBlock = items => `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><div class="a"><p>${a}</p></div></details>`).join('')}</div>`;

const phero = ({ crumbs, h1, lede, acts = '', md = true }) => `
<section class="phero"><div class="wrap">
  ${crumbs ? `<ol class="crumb">${crumbs.map(([t, h]) => h ? `<li><a href="${B}${h}">${t}</a></li>` : `<li aria-current="page">${t}</li>`).join('')}</ol>` : ''}
  <h1 class="h1${md ? ' md' : ''}">${h1}</h1>
  <div class="phero-row"><p class="lede">${lede}</p>${acts ? `<div class="acts">${acts}</div>` : ''}</div>
</div></section>`;

const demoForm = (id, title = 'Request your free demo website') => `<form class="form" id="${id}" novalidate data-concept="This is a concept, so nothing was sent. On the live site this request goes straight to the team, and we contact you within 24 hours.">
  <h3>${title}</h3>
  <div class="frow">
    <div class="fld"><label for="${id}-name">Your name</label><input id="${id}-name" name="name" autocomplete="name" required></div>
    <div class="fld"><label for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" autocomplete="email" required></div>
  </div>
  <div class="fld"><label for="${id}-biz">Business name or current website</label><input id="${id}-biz" name="business" autocomplete="organization"></div>
  <fieldset class="chips"><legend>What do you need?</legend>
    <input type="radio" name="need" id="${id}-n1" value="website" checked><label for="${id}-n1">New website</label>
    <input type="radio" name="need" id="${id}-n2" value="webshop"><label for="${id}-n2">Webshop</label>
    <input type="radio" name="need" id="${id}-n3" value="redesign"><label for="${id}-n3">Redesign</label>
    <input type="radio" name="need" id="${id}-n4" value="care"><label for="${id}-n4">Maintenance</label>
    <input type="radio" name="need" id="${id}-n5" value="unsure"><label for="${id}-n5">Not sure yet</label>
  </fieldset>
  <button class="btn dark" type="submit">Request my free demo ${arr}</button>
  <p class="ok" role="status" aria-live="polite"></p>
  <small>We reply within 24 hours. Your details are only used to contact you about this request. <a href="${B}/privacy/">Privacy policy</a></small>
</form>`;

/* ── Pages ────────────────────────────────────────────────────────────── */

const pages = {};

pages[''] = page({
  title: 'DRP BuildLab | Custom websites and webshops for businesses worldwide',
  desc: 'DRP BuildLab designs and builds custom websites and webshops for businesses worldwide. Request a free demo website.',
  nav: 'home', cursor: true,
  body: `
<section class="hero"><div class="wrap">
  <h1 class="h1"><span class="ln"><span>Websites</span></span><span class="ln"><span>built to</span></span><span class="ln"><span><em>win clients.</em></span></span></h1>
  <div class="phero-row" style="margin-top:40px">
    <p class="lede">We design and build <strong>custom websites and webshops</strong> for businesses worldwide. Tell us about yours and we’ll show you a <strong>free demo website</strong> before you commit to anything.</p>
    <div class="acts"><a class="btn" href="${B}/contact/">Request your free demo website ${arr}</a><a class="btn ghost" href="${B}/werk/">See our work</a></div>
  </div>
  <ul class="facts"><li>Custom built, no templates</li><li>Websites from €499</li><li>Care plans at €29 a month</li><li>One point of contact</li></ul>
</div>
<div class="wrap stage" id="stage"><div class="stage-in" id="stageIn">
  <div class="browser"><div class="bar"><i></i><i></i><i></i><span class="url">kasteelwarmelo.nl</span></div>
    <div class="screen"><img src="${B}/img/warmelo-desk.webp" width="1440" height="900" alt="Homepage of Kasteel Warmelo, designed and built by DRP BuildLab" fetchpriority="high" decoding="async"></div></div>
  <div class="phone" aria-hidden="true"><div class="pscreen"><img src="${B}/img/stb-mob.webp" width="420" height="909" alt="" decoding="async"></div></div>
  <a class="stage-tag" href="https://kasteelwarmelo.nl/" target="_blank" rel="noopener">Live at kasteelwarmelo.nl ↗</a>
</div></div></section>

<section class="reel-sec" id="reel" aria-label="Showreel">
  <div class="reel" id="reelBox">
    <video id="reelVid" muted loop playsinline preload="none" poster="${B}/media/reel-poster.webp" data-base="${B}/media/reel" aria-label="Showreel of client websites by DRP BuildLab"></video>
    <div class="reel-ui">
      <p>Showreel · Client websites by DRP BuildLab</p>
      <button type="button" class="reel-btn" id="reelBtn" aria-pressed="false">Pause</button>
    </div>
  </div>
</section>

<section class="sec" id="work"><div class="wrap">
  <div class="sec-head"><h2 class="h2 rv">Our work</h2><p class="sub rv">Real businesses, live right now. Hover a project to scroll through it on desktop and phone, or open it to see what we did.</p></div>
  <div class="cases">${caseRow(caseBy('kasteel-warmelo'), false)}${caseRow(caseBy('prestige-automotive'), true)}${caseRow(caseBy('0-procent-experiment'), false)}</div>
  <p class="all-work rv"><a class="btn ghost" href="${B}/werk/">See all projects ${arr}</a></p>
</div></section>

<section class="sec light"><div class="wrap stmt-grid">
  <p class="side-label">About DRP BuildLab</p>
  <div>
    <p class="statement" id="stmt" data-hl="honestly,|phone">DRP BuildLab is a small studio of builders. We make websites that look as good as the businesses behind them, we price them honestly, and we pick up the phone long after launch.</p>
    <div class="stmt-foot"><p>Based in Belgium, working with businesses wherever they are.</p><a class="tlink" href="${B}/over-ons/">Meet the team →</a></div>
  </div>
</div></section>

<section class="sec light" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><h2 class="h2 rv">What we <em>build</em></h2><p class="sub rv">Prices are shown up front and confirmed in a written quote.</p></div>
  <ul class="svc">${[...SERVICES, OTHER].map(svcRow).join('')}</ul>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-head"><h2 class="h2 rv">Why clients <em>stay</em></h2><p class="sub rv">What you can hold us to, from the first call to years after launch.</p></div>
  <div class="rows">
    <div class="row rv"><h3>See it before you sign</h3><p>On the first call we already show you an example made for your business. The demo is free, with no obligation.</p></div>
    <div class="row rv"><h3>One person to call</h3><p>No ticket systems and no rotating account managers. You know who is building your site, and you can reach them.</p></div>
    <div class="row rv"><h3>Prices on the table</h3><p>A one-page website from €499, everything else in a clear written quote. Two revision rounds included, and a written quote that is valid for 14 days.</p></div>
    <div class="row rv"><h3>We stay after launch</h3><p>Care plans at €29 a month keep your site fast, secure and current. Hermosa Antwerp and Start to Business still rely on us today.</p></div>
  </div>
</div></section>

<section class="sec light"><div class="wrap">
  <div class="sec-head"><h2 class="h2 rv">The D, the R <em>and the P</em></h2><p class="sub rv">Three founders, one studio. These are the people you talk to, from the first call to launch day and after.</p></div>
  <div class="team">
    ${[['dries', 'Dries De Smedt', 'Co-founder &amp; VP of Legal', 'D'], ['roan', 'Roan Bal', 'Co-founder &amp; VP of Operations', 'R'], ['par', 'Par Volckaerts', 'Co-founder &amp; VP of Marketing &amp; Communications', 'P']].map(([f, n, r, i]) => `<figure class="person rv"><div class="portrait"><img src="${B}/img/${f}.webp" width="800" height="1000" loading="lazy" decoding="async" alt="Portrait of ${n}"><span class="init" aria-hidden="true">${i}</span></div><figcaption><h3>${n}</h3><p class="role">${r}</p></figcaption></figure>`).join('')}
  </div>
  <div class="team-foot"><div class="builder"><img src="${B}/img/lathif.webp" width="800" height="1000" loading="lazy" decoding="async" alt="Portrait of Lathif Dewantoro"><p><strong>Lathif Dewantoro</strong>, Lead Developer, builds every site with them.</p></div><a class="tlink" href="${B}/over-ons/">More about us →</a></div>
</div></section>

<section class="sec fog"><div class="wrap">
  <div class="sec-head"><h2 class="h2 rv">Who we <em>work with</em></h2><p class="sub rv">The businesses that rely on us, and an open invitation to grow with us.</p></div>
  <div class="prt">
    <a class="prt-card rv" href="${B}/werk/start-to-business/"><div class="img"><img src="${B}/img/p-stb.webp" width="1000" height="1200" loading="lazy" decoding="async" alt="Partnership visual: DRP BuildLab and Start to Business"></div><div class="body"><h3>Start to Business</h3><p>We developed their website and still maintain it.</p><p class="q">“Ideas deserve a strong online foundation.”</p></div></a>
    <a class="prt-card rv" href="${B}/werk/hermosa-antwerp/"><div class="img"><img src="${B}/img/p-hermosa.webp" width="1000" height="1200" loading="lazy" decoding="async" alt="Partnership visual: DRP BuildLab and Hermosa Antwerp"></div><div class="body"><h3>Hermosa Antwerp</h3><p>DRP BuildLab is Hermosa’s IT maintenance partner.</p><p class="q">“Technology supports beauty.”</p></div></a>
    <div class="prt-card prt-cta rv"><h3>Refer a client, <em>earn on it.</em></h3><p>Your contacts get 10% off their quote, and you earn 5% of every invoice they pay. Your link never expires.</p><a class="btn" href="${B}/partner-worden/">Become a partner ${arr}</a></div>
  </div>
</div></section>

<section class="sec blue cta" id="demo"><div class="wrap cta-grid">
  <div>
    <h2 class="h2">Let’s build <em>yours.</em></h2>
    <ol class="steps">
      <li><b>You tell us about your business</b><span>Fill in the form. It takes about a minute.</span></li>
      <li><b>We call you with a demo</b><span>We show you an example made for your business. Free, with no obligation.</span></li>
      <li><b>Preview and approve</b><span>You see your site before it goes live. Two revision rounds are included.</span></li>
      <li><b>Live, and we stay</b><span>Your own domain, and a team you can call when you need a change.</span></li>
    </ol>
    <p class="alt"><span>info@drpbuildlab.com</span><span>WhatsApp +32 473 74 44 31</span></p>
  </div>
  ${demoForm('home')}
</div></section>`
});

pages['werk'] = page({
  title: 'Our work | DRP BuildLab', desc: 'Websites and webshops designed, built and maintained by DRP BuildLab, with links to the live sites.', nav: 'work', cursor: true,
  body: `${phero({ h1: 'Our <em>work</em>', lede: 'Websites and webshops we designed, built or look after, all live today. Open a project to see the brief and what we did.' })}
<section class="sec" style="padding-top:0"><div class="wrap"><div class="wgrid">
  ${CASES.map(c => `<article class="wtile rv">${caseMedia(c)}<h2><a href="${B}/werk/${c.slug}/" style="text-decoration:none">${c.name}</a></h2><p>${c.kinds} · ${c.sector}</p></article>`).join('')}
  <article class="wtile wide rv"><a class="slot" href="${B}/contact/"><span class="big">Your business<br><em>goes here.</em></span></a><div><h2>Could be yours</h2><p>Tell us what you do and we’ll build a free demo of your new website, with no obligation.</p><p style="margin-top:22px"><a class="btn" href="${B}/contact/">Request your free demo ${arr}</a></p></div></article>
</div>
</div></section>
${ctaBand()}`
});

CASES.forEach((c, i) => {
  const n = CASES[(i + 1) % CASES.length];
  pages['werk/' + c.slug] = page({
    title: `${c.name} | Work | DRP BuildLab`, desc: c.short, nav: 'work',
    body: `
<section class="phero"><div class="wrap">
  <ol class="crumb"><li><a href="${B}/werk/">Work</a></li><li aria-current="page">${c.name}</li></ol>
  <h1 class="h1 md">${c.em}</h1>
  <dl class="facts-dl"><div><dt>Client</dt><dd>${c.name}</dd></div><div><dt>Sector</dt><dd>${c.sector}</dd></div><div><dt>What we did</dt><dd>${c.scope}</dd></div><div><dt>Live site</dt><dd><a class="tlink" href="${c.href}" target="_blank" rel="noopener">${c.url} ↗</a></dd></div></dl>
</div></section>
<div class="shot-band"><div class="wrap"><div class="browser" style="view-transition-name:shot-${c.img}"><div class="bar"><i></i><i></i><i></i><span class="url">${c.url}</span></div>
  <div class="screen tall" tabindex="0" aria-label="Full page, scroll to see more"><img src="${B}/img/${c.img}-desk-full.webp" width="1200" height="${c.hDesk}" decoding="async" alt="The full ${esc(c.name)} homepage on desktop"></div></div></div></div>
<section class="light"><div class="wrap">
  <div class="two"><h2>The brief</h2><div>${c.brief.map(p => `<p>${p}</p>`).join('')}</div></div>
  <div class="two"><h2>What we did</h2><div>${c.did.map(p => `<p>${p}</p>`).join('')}<ul class="tags" style="margin-top:24px">${c.tags.map(t => `<li>${t}</li>`).join('')}</ul></div></div>
  <div class="two"><h2>On a phone</h2><div class="phones" style="justify-content:start"><div class="phone static"><div class="pscreen"><img src="${B}/img/${c.phoneImg}.webp" width="420" height="909" loading="lazy" decoding="async" alt="${esc(c.name)} on a phone, top of the page"></div></div><div class="phone static"><div class="pscreen"><img src="${B}/img/${c.img}-mob-full.webp" width="420" height="${c.hMob}" loading="lazy" decoding="async" alt="${esc(c.name)} on a phone, further down the page" style="transform:translateY(-38%)"></div></div></div></div>
  ${c.quote ? `<div class="two"><h2>In their words</h2><div><p class="statement" style="max-width:none;font-size:clamp(28px,3.4vw,48px)">“${c.quote}”</p><p class="muted" style="margin-top:16px">${c.name}</p></div></div>` : ''}
</div></section>
<a class="next" href="${B}/werk/${n.slug}/"><div class="wrap"><small>Next project</small><p class="h2" style="margin:0">${n.em} →</p></div></a>
${ctaBand()}`
  });
});

pages['diensten'] = page({
  title: 'Services | DRP BuildLab', desc: 'Custom websites, webshops and Shopify, redesigns, care plans and add-ons, with prices shown up front.', nav: 'services',
  body: `${phero({ h1: 'What we <em>build</em>', lede: 'Five services, each with its own page, what is included and a starting price. Every price is confirmed in a written quote.', acts: `<a class="btn" href="${B}/contact/">Request your free demo website ${arr}</a><a class="btn ghost" href="${B}/prijzen/">See all prices</a>` })}
<section class="sec light"><div class="wrap">
  <ul class="svc">${[...SERVICES, OTHER].map(svcRow).join('')}</ul>
</div></section>
<section class="sec fog"><div class="wrap">
  <div class="sec-head"><h2 class="h2">What we <em>don’t</em> do</h2><p class="sub">So you know in advance. If you need one of these, we are happy to point you to someone who does.</p></div>
  <ul class="nots">${NOT_DONE.map(t => `<li>${t}</li>`).join('')}</ul>
</div></section>
${ctaBand()}`
});

SERVICES.forEach(s => {
  const c = s.caseSlug && CASES.find(x => x.slug === s.caseSlug);
  const others = SERVICES.filter(x => x !== s);
  pages['diensten/' + s.slug] = page({
    title: `${s.name} | Services | DRP BuildLab`, desc: `${s.short} ${s.from.replace('from', 'From')}.`, nav: 'services',
    body: `${phero({ crumbs: [['Services', '/diensten/'], [s.name]], h1: s.em, lede: s.intro, acts: `<a class="btn" href="${B}/contact/">Request your free demo website ${arr}</a>` })}
<section class="sec light"><div class="wrap">
  <div class="sec-head"><h2 class="h2">What’s <em>included</em></h2><p class="sub">${s.from === 'On demand' ? 'Priced on demand: tell us what you need and we confirm the price in a written quote.' : `Starting at <strong style="color:var(--ink)">${s.from.replace('from ', '')}</strong>. Anything beyond that is priced on demand and confirmed in your quote.`}</p></div>
  <ul class="incl">${s.incl.map(t => `<li>${t}</li>`).join('')}</ul>
</div></section>
<section class="sec fog"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Options and <em>prices</em></h2><p class="sub">Prices exclude VAT. Options marked on demand are priced in your quote.</p></div>
  <div class="tscroll"><table class="ptable"><thead><tr><th scope="col">Option</th><th scope="col">Price</th></tr></thead><tbody>${s.opts.map(([id, n, d]) => `<tr><td><b>${n}</b><span>${d}</span></td><td>${priceOf(id)}</td></tr>`).join('')}</tbody></table></div>
</div></section>
${c ? `<section class="sec"><div class="wrap"><div class="cases">${caseRow(c, false)}</div></div></section>` : ''}
<section class="sec light"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Questions</h2><p class="sub">Something else? Ask us on the free demo call, or write to info@drpbuildlab.com.</p></div>
  ${faqBlock(s.faq)}
</div></section>
<section class="sec light" style="padding-top:0"><div class="wrap">
  <h2 class="h3" style="margin-bottom:24px">Other services</h2>
  <ul class="svc">${[...others, OTHER].map(svcRow).join('')}</ul>
</div></section>
${ctaBand()}`
  });
});

const TEAM = [
  ['dries', 'Dries De Smedt', 'Co-founder &amp; VP of Legal', 'D', 'Good agreements make good partnerships. That is Dries’s starting point at DRP BuildLab, where he looks after the legal side: from quotes and contracts to confidentiality, partnerships and careful handling of data. He turns the small print into plain language, so you always know where you stand.', 'dries.de-smedt@drpbuildlab.com'],
  ['roan', 'Roan Bal', 'Co-founder &amp; VP of Operations', 'R', 'A good idea only becomes valuable when it is finished on time, properly and without fuss. Roan keeps track of planning, follow-up and the way we work, from the first call to the day your website goes live. So you always know what the next step is and when to expect it.', 'roan.bal@drpbuildlab.com'],
  ['par', 'Par Volckaerts', 'Co-founder &amp; VP of Marketing &amp; Communications', 'P', 'A strong product deserves a story that sticks. Par looks after how we sound and look, from the website and social media to partnerships and the way we talk to clients. His aim is that you understand straight away what we do, why it matters and what it can mean for your business.', 'par.volckaerts@drpbuildlab.com'],
  ['lathif', 'Lathif Dewantoro', 'Lead Developer', '', 'A website is only as good as what happens when someone opens it. Lathif builds the sites, from the first design to the day they go live, and makes sure they load fast, work on every phone and are easy to find on Google. After launch he keeps them running, so you never have to think about the technical side.', 'lathif.dewantoro@drpbuildlab.com']
];

pages['over-ons'] = page({
  title: 'About us | DRP BuildLab', desc: 'Meet the founders of DRP BuildLab: a small web studio from Belgium building custom websites for businesses worldwide.', nav: 'about',
  body: `
<section class="phero media"><div class="bg" aria-hidden="true"><img src="${B}/img/founders-wide.webp" width="1920" height="1080" alt="" fetchpriority="high" decoding="async"></div><div class="wrap">
  <h1 class="h1 md"><span class="ln"><span>The people</span></span><span class="ln"><span>behind your</span></span><span class="ln"><span><em>website.</em></span></span></h1>
  <div class="phero-row"><p class="lede">Who we are, why we started and what you can expect from us.</p></div>
</div></section>

<section class="sec light"><div class="wrap stmt-grid">
  <p class="side-label">Our story</p>
  <div>
    <p class="statement" id="stmt" data-hl="fair|online.">Every business deserves a fair chance to be found online.</p>
    <div class="prose" style="margin-top:48px;font-size:18px;color:#2b2d33">
      <p>It started with a frustration. We saw good businesses that were almost invisible online, and agencies that asked €5,000 for a website that then took months to arrive.</p>
      <p>So we built DRP BuildLab: a studio that believes every business deserves a website made to measure. Affordable, honest, and priced on the work that actually goes into it. We work remotely from Belgium, so where you are does not decide whether we can build for you.</p>
    </div>
  </div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="sec-head"><h2 class="h2">What we <em>stand for</em></h2><p class="sub">Three promises behind every project.</p></div>
  <div class="rows">
    <div class="row"><h3>Honesty above all</h3><p>What we promise, we deliver. No hidden costs and no vague quotes.</p></div>
    <div class="row"><h3>Care when you want it</h3><p>Maintenance is optional, at €29 a month. Take it and your site stays safe, up to date and findable, without you having to think about it.</p></div>
    <div class="row"><h3>Worldwide, built personally</h3><p>We build for businesses wherever their customers are searching. You get the same small team, wherever you are.</p></div>
  </div>
</div></section>

<section class="sec light" id="team"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Four people, <em>one contact</em></h2><p class="sub">No ticket system and no rotating account managers. This is everyone who works on your website.</p></div>
  <div class="team four">
    ${TEAM.map(([f, n, r, i, bio, mail]) => `<figure class="person rv"><div class="portrait"><img src="${B}/img/${f}.webp" width="800" height="1000" loading="lazy" decoding="async" alt="Portrait of ${n}">${i ? `<span class="init" aria-hidden="true">${i}</span>` : ''}</div><figcaption><h3>${n}</h3><p class="role">${r}</p><p class="bio">${bio}</p><p class="mail"><a class="tlink" href="mailto:${mail}">${mail}</a></p></figcaption></figure>`).join('')}
  </div>
</div></section>

<section class="sec fog"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Why <em>DRP BuildLab</em></h2><p class="sub">For businesses that want to be online without the hassle and without surprises.</p></div>
  <div class="rows">
    <div class="row"><h3>One fixed contact</h3><p>You have our names and our number, from the first call to years after launch.</p></div>
    <div class="row"><h3>Fair prices</h3><p>No hidden costs. Agreed in advance, so you know exactly what you pay.</p></div>
    <div class="row"><h3>Made for phones</h3><p>Every DRP BuildLab site works on every device, because that is where your customers find you.</p></div>
    <div class="row"><h3>Built to be found</h3><p>SEO is part of the build, so Google can find, understand and index your site.</p></div>
    <div class="row"><h3>A partner for the long run</h3><p>After launch we are still there. Not a one-off supplier, but a team you keep.</p></div>
  </div>
</div></section>
${ctaBand()}`
});

pages['prijzen'] = page({
  title: 'Pricing | DRP BuildLab', desc: 'A one-page website from €499, everything else on demand. Optional care plan at €29 a month.', nav: 'pricing',
  body: `${phero({ h1: 'Fair prices, <em>no surprises</em>', lede: 'A one-page website with contact form from €499. Everything else is priced on demand, in a quote made to measure. Maintenance is optional at €29 a month.', acts: `<a class="btn" href="${B}/contact/">Request your free demo website ${arr}</a>` })}
<section class="sec fog"><div class="wrap">
  <div class="plans">
    <div class="plan rv"><p class="for">For new and small businesses</p><h2>Starter</h2><p class="amount">€499<small>one-off</small></p><p class="note">A one-page website with a contact form, made for your business. For businesses that have just started, or want their current site turned into a modern, professional one.</p>
      <ul><li>A website fully made for your business</li><li>Works on every phone and tablet</li><li>Contact form and WhatsApp button</li><li>Google Maps and basic SEO</li><li>Personal guidance from start to launch</li></ul>
      <a class="btn dark" href="${B}/contact/">Request a free quote ${arr}</a></div>
    <div class="plan dark rv"><p class="for">For bigger or more complex projects</p><h2>Made to measure</h2><p class="amount" style="font-size:clamp(48px,5vw,76px)">Quote</p><p class="note">Webshops, booking systems, multilingual sites, integrations or features nobody else has. We price it on the scope of your project.</p>
      <ul><li>As many pages as you need</li><li>Webshop, booking system or member portal</li><li>Advanced SEO and Google Ads</li><li>Multilingual websites</li><li>Custom integrations</li></ul>
      <a class="btn" href="${B}/contact/">Request a quote ${arr}</a></div>
  </div>
  <div class="care rv"><div><h2>Care plan, optional</h2><p>Updates, backups, security and SEO checks. Not included in the packages: you choose whether to add it, and you can cancel any month.</p></div><p class="amt">€29<small> / month</small></p></div>
</div></section>
<section class="sec light"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Extra <em>services</em></h2><p class="sub">Order them separately or with your website. Each is priced on demand and confirmed in your quote.</p></div>
  <div class="tscroll"><table class="ptable"><thead><tr><th scope="col">Service</th><th scope="col">Price</th></tr></thead><tbody>
    ${[['Logo design', 'logo'], ['Extra page', 'extra-pagina'], ['SEO starter', 'seo'], ['Google Ads setup', 'google-ads'], ['Multilingual site', 'meertalig'], ['Emergency repair (24 hours)', 'noodreparatie'], ['Integrations: booking, payments, accounting', 'koppelingen'], ['Edit it yourself (CMS)', 'cms']].map(([n, id]) => `<tr><td><b>${n}</b></td><td>${priceOf(id)}</td></tr>`).join('')}
    <tr><td><b>Add a webshop</b></td><td>On demand</td></tr><tr><td><b>Anything else, made to measure</b></td><td>On demand</td></tr>
  </tbody></table></div>
  <p class="muted" style="margin-top:20px">Every service, with what it includes, is on its own <a class="tlink" href="${B}/diensten/">service page</a>.</p>
</div></section>
<section class="sec light" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><h2 class="h2">Questions about <em>price</em></h2><p class="sub">The answers to what clients ask most.</p></div>
  ${faqBlock([
    ['What does a website from DRP BuildLab cost?', 'Every website is made to measure, so the price depends on the work that goes into it. For new businesses, or those updating an existing site, our starter package begins at €499. Everything else is priced on demand, in a quote made to measure. Maintenance is optional: €29 a month.'],
    ['Who is the €499 starter package for?', 'For business owners who have just started without a website, or who want their existing website turned into a modern, professional one.'],
    ['What does maintenance cost?', 'Maintenance is optional and costs €29 a month. For that we keep your website safe, fast and optimised for search. You are not tied in: you can cancel any month, and the website always stays yours.'],
    ['How quickly will my website be online?', 'As soon as we have your texts, photos and logo, we can move fast. At the start we agree on a delivery date that fits your project, and we keep to it. Along the way you get a preview to approve, so you are never left waiting.'],
    ['How does a quote to measure work?', 'For larger projects we first discuss what you need in a free introductory call. Then we make a personal quote based on the work involved: pages, features, integrations and maintenance. No hidden costs: you know in advance what you will pay.']
  ])}
</div></section>
${ctaBand()}`
});

pages['contact'] = page({
  title: 'Contact | DRP BuildLab', desc: 'Request a free demo website or a quote. We call you and show you an example made for your business.', nav: 'contact',
  body: `${phero({ h1: 'Let’s talk about <em>your website</em>', lede: 'Request your free demo website or a quote. We call you and show you an example made for your business straight away.' })}
<section class="sec light"><div class="wrap contact-grid">
  <div>
    <h2 class="h3" style="margin-bottom:20px">Reach us directly</h2>
    <ul class="clist">
      <li><span>Phone</span><a href="tel:+32473744431">+32 473 74 44 31</a></li>
      <li><span>WhatsApp</span><a href="https://wa.me/32473744431" target="_blank" rel="noopener">+32 473 74 44 31</a></li>
      <li><span>Email</span><a href="mailto:info@drpbuildlab.com">info@drpbuildlab.com</a></li>
      <li><span>Address</span>Honingstraat 1D, 2220 Hallaar, Belgium</li>
      <li><span>Company no.</span>BE 1033.313.383</li>
      <li><span>Instagram</span><a href="https://www.instagram.com/drp_buildlab/" target="_blank" rel="noopener">@drp_buildlab</a></li>
      <li><span>Facebook</span><a href="https://www.facebook.com/share/1Hz1mJG22E/" target="_blank" rel="noopener">DRP BuildLab</a></li>
      <li><span>TikTok</span><a href="https://www.tiktok.com/@drpbuildlab" target="_blank" rel="noopener">@drpbuildlab</a></li>
    </ul>
    <ol class="steps" style="margin-top:48px">
      <li><b>You send the form</b><span>It takes about a minute.</span></li>
      <li><b>We call you within 24 hours</b><span>With an example made for your business.</span></li>
      <li><b>You decide</b><span>No obligation. You only pay once you approve a quote.</span></li>
    </ol>
  </div>
  <form class="form" id="quote" novalidate data-concept="This is a concept, so nothing was sent. On the live site this goes to the same inbox as today’s quote form, and we contact you within 24 hours.">
    <h3>Request your free demo website</h3>
    <div class="frow">
      <div class="fld"><label for="q-first">First name</label><input id="q-first" name="first" autocomplete="given-name" required></div>
      <div class="fld"><label for="q-last">Last name</label><input id="q-last" name="last" autocomplete="family-name" required></div>
    </div>
    <fieldset class="chips"><legend>You are asking as</legend>
      <input type="radio" name="clienttype" id="q-t1" value="business" checked><label for="q-t1">Business</label>
      <input type="radio" name="clienttype" id="q-t2" value="private"><label for="q-t2">Private person</label>
    </fieldset>
    <div class="frow biz-only">
      <div class="fld"><label for="q-company">Company name</label><input id="q-company" name="company" autocomplete="organization"></div>
      <div class="fld"><label for="q-vat">Company or VAT number <small>(optional)</small></label><input id="q-vat" name="vat"></div>
    </div>
    <div class="frow">
      <div class="fld"><label for="q-phone">Phone</label><input id="q-phone" name="phone" type="tel" autocomplete="tel" required></div>
      <div class="fld"><label for="q-email">Email</label><input id="q-email" name="email" type="email" autocomplete="email" required></div>
    </div>
    <div class="fld"><label for="q-service">Which service do you have in mind?</label><select id="q-service" name="service" required><option value="">Choose a service</option><option>Starter package, €499</option><option>Made to measure, quote</option><option>Update an existing website</option><option>Extra services only (logo, SEO, …)</option><option>I don’t know yet</option></select></div>
    <div class="frow">
      <div class="fld"><label for="q-ref">Partner code <small>(optional)</small></label><input id="q-ref" name="ref"></div>
      <div class="fld"><label for="q-web">Current website <small>(optional)</small></label><input id="q-web" name="web" type="url" inputmode="url"></div>
    </div>
    <div class="fld"><label for="q-msg">Message <small>(optional)</small></label><textarea id="q-msg" name="message"></textarea></div>
    <label class="check" for="q-consent"><input type="checkbox" id="q-consent" name="consent" required><span>I agree that DRP BuildLab uses the details in this form to contact me about this request. <a href="${B}/privacy/">Privacy policy</a></span></label>
    <button class="btn dark" type="submit">Request my free demo ${arr}</button>
    <p class="ok" role="status" aria-live="polite"></p>
  </form>
</div></section>`
});

pages['partner-worden'] = page({
  title: 'Partner programme | DRP BuildLab', desc: 'Get a personal link. Your contacts get 10% off their quote, and you earn 5% of every invoice they pay.', nav: 'partner',
  body: `${phero({ h1: 'Earn on every <em>referral</em>', lede: 'You get a personal link. Whoever comes in through it gets 10% off their quote, and you earn 5% of every invoice that is paid.', acts: `<a class="btn" href="#apply">Request your link ${arr}</a>` })}
<section class="sec" style="padding-top:0"><div class="wrap">
  <dl class="terms">
    <div><dt>Discount for your client</dt><dd><em>10%</em> off the quote</dd></div>
    <div><dt>Your commission</dt><dd><em>5%</em> of the paid invoice</dd></div>
    <div><dt>When it is earned</dt><dd>On payment</dd></div>
    <div><dt>Payout</dt><dd>Monthly, by transfer</dd></div>
    <div><dt>Your link is valid</dt><dd>Until we revoke it</dd></div>
    <div><dt>Two links used</dt><dd>The first one counts</dd></div>
  </dl>
</div></section>
<section class="sec light"><div class="wrap">
  <div class="sec-head"><h2 class="h2">From link to <em>payout</em></h2><p class="sub">No targets and no minimum. You share your link when it fits.</p></div>
  <ol class="steps" style="margin:0">
    <li><b>Request your link</b><span>Fill in the form below. You get a personal link with your own code in it.</span></li>
    <li><b>Share it with your audience</b><span>Whoever requests a quote through your link automatically gets 10% off.</span></li>
    <li><b>The client pays the invoice</b><span>As soon as the invoice is paid in the client portal, your 5% is fixed. On payment, not on request.</span></li>
    <li><b>Paid out monthly</b><span>You follow every click, request and commission in your own dashboard. What you earn in a month is paid the month after.</span></li>
  </ol>
</div></section>
<section class="sec fog" id="apply"><div class="wrap contact-grid">
  <div>
    <h2 class="h2">Request your <em>link</em></h2>
    <p class="sub" style="margin-top:24px">Tell us briefly who you reach. We review every request personally and send your link once approved.</p>
    <p class="muted" style="margin-top:24px">Who can join: influencers, consultants, accountants, coaches, anyone with an audience of business owners. Prefer email? <a class="tlink" href="mailto:info@drpbuildlab.com">info@drpbuildlab.com</a></p>
  </div>
  <form class="form" id="partner" novalidate data-concept="This is a concept, so nothing was sent. On the live site we review your request and send your personal link within a few working days.">
    <div class="frow">
      <div class="fld"><label for="p-first">First name</label><input id="p-first" name="first" autocomplete="given-name" required></div>
      <div class="fld"><label for="p-last">Last name</label><input id="p-last" name="last" autocomplete="family-name" required></div>
    </div>
    <div class="fld"><label for="p-email">Email</label><input id="p-email" name="email" type="email" autocomplete="email" required></div>
    <div class="frow">
      <div class="fld"><label for="p-channel">Where do you reach your audience?</label><select id="p-channel" name="channel" required><option value="">Choose a channel</option><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>LinkedIn</option><option>Newsletter or blog</option><option>Offline network</option><option>Other</option></select></div>
      <div class="fld"><label for="p-size">Roughly how big is your audience?</label><select id="p-size" name="size" required><option value="">Choose a size</option><option>Under 1,000</option><option>1,000 – 10,000</option><option>10,000 – 50,000</option><option>50,000 – 250,000</option><option>Over 250,000</option></select></div>
    </div>
    <div class="fld"><label for="p-profile">Link to your profile or website</label><input id="p-profile" name="profile" type="url" inputmode="url" required></div>
    <div class="fld"><label for="p-code">Preferred code <small>(optional)</small></label><input id="p-code" name="code"></div>
    <div class="fld"><label for="p-msg">Tell us briefly about your audience <small>(optional)</small></label><textarea id="p-msg" name="message"></textarea></div>
    <label class="check" for="p-consent"><input type="checkbox" id="p-consent" name="consent" required><span>I agree that DRP BuildLab uses the details in this form to contact me about this request. <a href="${B}/privacy/">Privacy policy</a></span></label>
    <button class="btn dark" type="submit">Request my link ${arr}</button>
    <p class="ok" role="status" aria-live="polite"></p>
  </form>
</div></section>
<section class="sec light"><div class="wrap">
  <div class="sec-head"><h2 class="h2">What partners <em>ask</em></h2><p class="sub">The short answers.</p></div>
  ${faqBlock([
    ['Who can become a partner?', 'Anyone with an audience of business owners: social media creators, consultants, accountants, coaches, networkers. You don’t need a huge reach, just an audience for whom a custom website makes sense. We review every request personally.'],
    ['When do I earn my commission?', 'Only when the client actually pays the invoice in the client portal. A request or an approved quote earns nothing yet: we pay on what comes in, not on what is promised.'],
    ['What is the 5% calculated on?', 'On the amount the client actually pays, so after the 10% discount your link gave them, and excluding VAT. If a project is invoiced in instalments, you earn on every paid instalment.'],
    ['What if someone uses two partner links?', 'The first link counts. A link does not expire: whoever clicked it stays linked to that partner until we revoke the link, and a later link does not overwrite it.'],
    ['How do I track what I have earned?', 'You get a dashboard with your clicks, requests, paid invoices and open commission. What you earn in a calendar month is paid out by bank transfer during the following month.']
  ])}
</div></section>`
});

/* legal pages: the English half of the live pages, as they are today */
function legal(slug, title) {
  const html = fs.readFileSync(path.join(ROOT, 'src', slug, 'index.html'), 'utf8');
  const en = html.match(/<article class="legal-body" id="en" lang="en">([\s\S]*?)<\/article>/);
  if (!en) throw new Error('No English legal text in src/' + slug);
  const ver = (html.match(/Versie \/ Version: ([^<·]+)/) || [])[1];
  const bodyHtml = en[1].replace(/<h2 class="legal-lang">[\s\S]*?<\/h2>/, '').replace(/href="\/(privacy|algemene-voorwaarden|contact)"/g, `href="${B}/$1/"`);
  return page({
    title: `${title} | DRP BuildLab`, desc: `${title} of DRP BuildLab.`, nav: '',
    body: `${phero({ h1: title, lede: ver ? `Version: ${ver.trim()}. The Dutch version on the live site is the binding one.` : 'The Dutch version on the live site is the binding one.' })}
<section class="sec light"><div class="wrap"><article class="legal">${bodyHtml}</article></div></section>`
  });
}
pages['algemene-voorwaarden'] = legal('algemene-voorwaarden', 'Terms and conditions');
pages['privacy'] = legal('privacy', 'Privacy policy');

const notFound = page({
  title: 'Page not found | DRP BuildLab', desc: 'This page does not exist.', nav: '',
  body: `${phero({ h1: 'Page not <em>found</em>', lede: 'The page you were looking for does not exist, or it has moved.', acts: `<a class="btn" href="${B}/">Back to the homepage ${arr}</a><a class="btn ghost" href="${B}/contact/">Contact us</a>` })}`
});

/* ── Write ────────────────────────────────────────────────────────────── */
for (const [p, html] of Object.entries(pages)) {
  const dir = path.join(OUT, p);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
fs.writeFileSync(path.join(OUT, '404.html'), notFound);
console.log(`concept: wrote ${Object.keys(pages).length} pages to ${path.relative(ROOT, OUT)}/`);
