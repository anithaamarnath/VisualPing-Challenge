# VisualPing Crawler Challenge

## Appoarch 

I built the crawler stpe by step. Instead of trying the whole challleng at once, I started with small crawler, observed the problem, and improved it as I discovered different cases.

## Quick Start 

Clone the Repository:

git clone <Repo-url>
Move into the project folder:

cd <Your Project folder>

npm install 

create a `.env` file:

VISUALPING_USERNAME = 
VISUALPING_PASSWORD = 
START_URL = 

Then run: 

node crawler.js 
node browserCrawler.js 


Final output 
Browser crawl completed:
Broswer pages visited:   1000
 passwords found:  5




## How the Crawler Evolved 

1. Extract actual URL from Google redirect.
2. Fetch the starting page. 
3. Search for Passwords.
4. Extract links.
5. Resolve relative URLs.
6. Visit discovered pages. 
7. Track visited URLs.
8. Investigate query parameters.
9. Inspect Content type
10. Handle pagination
11. Normalize URLs.
12. REstrict the  crwal scope.
13. Introduce a queue.
14. Add browser- based crawling with Playwright.
15. Inspect JavaScript, CSS, images, and other resources.
16. Detect encoded content. 


## Main challenge I Encountered 

During development, the main problems I encountered were:

1. Google redirect URLs.
2. Relative URLs.
3. Duplicate links.
4. Query paramter varitions.
5. pagination.
6. Non HTML resources.
7. Crawl loops.
8. Incearsing numbers of discovered pages.
9. Browser automation compatibility issues.
10. Determining when the crawl is actually complete.
11. Information stored in resources instead of normal HTML.


Instead of solving all of these at once, I handled each problem separately and tested the crawler again after every change.

## How I Determined Crawl Completion 

I use a `visited` set to prevent the same normalized URL from being processed repeatedly and a queue to keep track of newly discovered URLs.

The crawl is considered complete when the queue is empty, meaning the are no more discovered URLs waiting to be processed.

`MAX_BROWSER_PAGES` is used only as a safelty limit. Reaching this limit does not necessarily mean that the entire site has been crawled.

This distinction becam important beacus pagination can genererate a large number of reachable URLs.


### Key Learning

The biggest thing I learned from this challenge is that a crawler is more than simply finding `<a href>` links.


A reliable crawler needs to think about: 

- Redirects
- URL resolution 
- URL normalizationa
- Quesry parameters 
- Images
- Metadate
-Encoded content
- Binary reosurces
- Duplicate detection 
- Pagination 
- Contnet types
- Linked resources 
- Dynamic content
- Crawl boundaries.
- Completion conditions.

Building the crawler incrementally helped me understand why each part was necessary and made it easier to debug problems a s the crawler beacame larger.

The image investigation was especially useful because it demonstrated  that information can exist inside a resource without being directly visible as normal HTML text.
Instead of assuming one extraction techniue woul work everywher, I started using the resource type and actual response contnet to decide how it should be inspected.

The overal strategy throughout the challenge has been:

** Discover -> Inspect -> Isolate -> Test -> Improve the crawler -> Repeat **




