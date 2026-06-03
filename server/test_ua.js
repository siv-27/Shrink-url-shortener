const useragent = require("express-useragent");
console.log("useragent.default.parse type:", typeof useragent.default.parse);
console.log("useragent.useragent.parse type:", typeof useragent.useragent.parse);
if (useragent.default.parse) {
  const parsed = useragent.default.parse("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
  console.log("Parsed keys from default.parse:", Object.keys(parsed));
}
if (useragent.useragent.parse) {
  const parsed = useragent.useragent.parse("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
  console.log("Parsed keys from useragent.parse:", Object.keys(parsed));
}



