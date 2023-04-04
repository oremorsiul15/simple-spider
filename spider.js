const axios = require("axios");
const cheerio = require("cheerio");
const url = require("url");

const visitedUrls = new Set();
const endpoints = new Set();

async function fetchPage(urlToFetch) {
  try {
    const response = await axios.get(urlToFetch);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${urlToFetch}: ${error.message}`);
    return null;
  }
}

async function findEndpoints(baseUrl, currentUrl) {
  if (visitedUrls.has(currentUrl)) {
    return;
  }

  visitedUrls.add(currentUrl);

  const html = await fetchPage(currentUrl);
  if (!html) {
    return;
  }

  const $ = cheerio.load(html);
  const links = $("a");

  links.each((_, element) => {
    const linkUrl = $(element).attr("href");
    const absoluteUrl = url.resolve(baseUrl, linkUrl);

    if (absoluteUrl.startsWith(baseUrl) && !visitedUrls.has(absoluteUrl)) {
      if (absoluteUrl.includes("/api/") || absoluteUrl.includes("/endpoint/")) {
        endpoints.add(absoluteUrl);
      } else {
        findEndpoints(baseUrl, absoluteUrl);
      }
    }
  });
}

async function main() {
  const targetUrl = "https://www.example.com";
  await findEndpoints(targetUrl, targetUrl);

  console.log("Discovered endpoints:");
  for (const endpoint of endpoints) {
    console.log(endpoint);
  }
}

main().catch((error) => console.error(`Error: ${error.message}`));
