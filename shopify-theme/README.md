# Vellum Shopify theme files

These files are added on top of Shopify's Horizon theme (the "Vellum" theme in the store).
They make the shop look like Vellum: the home page (hero, designs, family chat, steps, final call)
and the product page (live preview from `/embed/<template-id>` plus the order form).

- Product handles must equal Vellum template ids (e.g. `henna-tent`).
- The optional Arabic product name is read from the metafield `custom.name_ar`.
- The order form saves everything as line-item properties, so it shows on the order.
- Nothing secret lives here; the theme only links to public Vellum pages.
