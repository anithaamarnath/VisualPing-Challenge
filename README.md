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



Browser crawl completed

Browser pages visited:  1010
Reaminign queue: 1
Paswords found: 4 
FINAL PASSWORDS
```
VISUALPING{349a583fba34c301}
VISUALPING{fb725e1f3d6728b1}
VISUALPING{2dd5105a3fad0ef3}
VISUALPING{73c8f3073fdc5f74}


During the crawl, I discovered that some information was stored inside image resources.
![Whiteboard Scan](images/whiteboard-scan.png)
```

This demonstrated why inspecting only HTML text and `<a href>` link was not suffient.






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




## Why I used Two Crawlers

I used two crawling approaches because they solve different parts of the challenge:

- `crawler.js` - HTTP based crawler using `fetch()`
- `browserCrawler.js` - browser based crawler using Playwright

### 1. HTTP Crawler (`crawler.js`)

I started with a simple HTTP crawler because it is lightweight and helped me understand the structure of the site.

It:

1. Fetches a URL diretly.
2. Reads the response body.
3. Searches for passwords.
4. Extracts referenced links/resources.
5. Resolves relative URLs.
6. Tracks visited URLs.
Restricts crawlign to teh same origim.
8. Follows discovered URLs.


This approach worked well for content that is directly available in the server response.

However, I relaized that an HTTP crawler alone does not behave exactly like a real browser.
Some resources can be loaded or created dynamically by JavaScript.

### 2. Browser Crawler (`browserCrawler.js`)

I added a Playwright browser crawler to ahndle content that a normal HTTP request couls miss.

The browser Crawler:

1. Load the page in real browser environment.
2, Execute JS.
3. Inspects the renedered DOM.
4. Watches browser network requests and responses.
5. Detects dynamically loaded scripts and resources.
6. Inspects attributes such as `href`, `src`, and `action`. 
7. Scan JS, CSS, and other text responses.
8. Adds newly discovered same-origin resiruces back to the crawl queue.

### Why Both Are Useful

The HTTP crawler helped with basic site traversal and understanding the raw server response.

The browser crawler extended that approach by showing what a real browser acctually loads and renders.

This was important because the challeng specifically demonstrated that not everything reachablr form a page is neccessarily presnet as a normal `<a href>` link.

```text
HTTP crawler:
Request -> Raw response -> Extract -> Follows


Browser crawler:

Load page -> Execute JS -> Observe DOM/network -> Extract -> Follows
```


### Key Learning

The biggest thing I learned from this challenge is that a crawler is more than simply finding `<a href>` links.


A reliable crawler needs to think about: 

- Redirects
- URL resolution 
- URL normalizationa
- Query parameters 
- Images
- Metadate
- Encoded content
- Binary reosurces
- Duplicate detection 
- Pagination 
- Contnet types
- Linked resources 
- Dynamic content
- Crawl boundaries.
- Completion conditions.

Building the crawler incrementally helped me understand why each part was necessary and made it easier to debug problems as the crawler beacame larger.

The image investigation was especially useful because it demonstrated  that information can exist inside a resource without being directly visible as normal HTML text.
Instead of assuming one extraction techniue woul work everywher, I started using the resource type and actual response contnet to decide how it should be inspected.

The overal strategy throughout the challenge has been:

** Discover -> Inspect -> Isolate -> Test -> Improve the crawler -> Repeat **

## Results 

Passwords recovered : 5 / 8

The password were discovered through multiple types rather than only visible HTML.




