const fallbackGeos = [
  { country: "United States", city: "New York" },
  { country: "United Kingdom", city: "London" },
  { country: "Germany", city: "Berlin" },
  { country: "India", city: "Mumbai" },
  { country: "Canada", city: "Toronto" },
  { country: "Australia", city: "Sydney" },
  { country: "Japan", city: "Tokyo" },
  { country: "France", city: "Paris" },
  { country: "Singapore", city: "Singapore" },
  { country: "Brazil", city: "Sao Paulo" }
];

const cityPool = [
  { country: "United States", city: "San Francisco" },
  { country: "United States", city: "Chicago" },
  { country: "United Kingdom", city: "Manchester" },
  { country: "Germany", city: "Frankfurt" },
  { country: "India", city: "Bangalore" },
  { country: "Canada", city: "Vancouver" },
  { country: "Australia", city: "Melbourne" },
  { country: "Japan", city: "Osaka" },
  { country: "France", city: "Lyon" },
  { country: "Netherlands", city: "Amsterdam" },
  { country: "Singapore", city: "Singapore" },
  { country: "Spain", city: "Madrid" },
  { country: "South Korea", city: "Seoul" },
  { country: "India", city: "Delhi" },
  { country: "South Africa", city: "Cape Town" }
];

const parseVisitDetails = (req) => {
  const ua = req.useragent || {};

  let device = "Desktop";

  if (ua.isMobile) {
    device = "Mobile";
  } else if (ua.isTablet) {
    device = "Tablet";
  }

  const browser = ua.browser || "Unknown";
  const os = ua.os || "Unknown";

  const referrer =
    req.headers["referer"] ||
    req.headers["referrer"] ||
    "Direct";

  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "";

  if (typeof ip === "string" && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }

  let country = "Unknown";
  let city = "Unknown";

  if (
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip === "::ffff:127.0.0.1"
  ) {
    const randomGeo =
      fallbackGeos[Math.floor(Math.random() * fallbackGeos.length)];

    country = randomGeo.country;
    city = randomGeo.city;
    ip = "127.0.0.1";
  } else {
    let hash = 0;

    for (let i = 0; i < ip.length; i++) {
      hash = ip.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % cityPool.length;

    country = cityPool[index].country;
    city = cityPool[index].city;
  }

  return {
    ip,
    device,
    browser,
    os,
    referrer,
    country,
    city
  };
};

module.exports = {
  parseVisitDetails
};