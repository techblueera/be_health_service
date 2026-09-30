// Default every response to "private, no-store" so Cloudflare (or any other
// shared cache) never stores user-specific data, even when the URL ends in
// .pdf/.png/.js. A handler (or express.static) may still set its own
// Cache-Control afterwards for genuinely public content.
export const noStore = (req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  next();
};

export default noStore;
