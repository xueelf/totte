# totte

Totte is a lightweight JavaScript HTTP client based on [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), which can be used in any runtime that supports `fetch`.

Read this in other languages: English | [简体中文](./README.zh.md)

## Installation

> [!IMPORTANT]
> Totte is a pure ESM package, if you encounter difficulties using it in your project, can [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

### CDN

```html
<script type="module">
  import totte from 'https://esm.sh/totte';
</script>
```

or

```html
<script type="importmap">
  {
    "imports": {
      "totte": "https://esm.sh/totte"
    }
  }
</script>
<script type="module">
  import totte from 'totte';
</script>
```

You can also use other CDNs according to your preferences, such as [jsDelivr](https://www.jsdelivr.com/) and [UNPKG](https://unpkg.com/).

### NPM

```shell
npm install totte
```

## Usage

```javascript
import totte from 'totte';

// Request GET
const result1 = await totte('https://example.org/products.json');
// Request POST
const result2 = await totte.post('https://example.org/post', {
  username: 'example',
});
// Request FormData
const result3 = await totte.post(
  'https://example.org/post',
  {
    username: 'example',
  },
  {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  },
);
```

Compared to `fetch`, `totte` provides a simpler and more flexible API.

```javascript
// GET Request
const response1 = await fetch('https://example.org/products.json');
const json1 = await response1.json();

// POST Request
const response2 = await fetch('https://example.org/post', {
  method: 'POST',
  body: JSON.stringify({
    username: 'example',
  }),
});
const json2 = await response2.json();

// Request FormData
const formData = new FormData();
formData.append('username', 'example');

const response3 = await fetch('https://example.org/post', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
const json3 = await response3.json();
```

You can also use `Totte` or `create` to generate new instance:

```javascript
import totte from 'totte';

const request = totte.create({
  origin: 'https://example.org',
});
const result = await totte('/products.json');
```

```javascript
import { Totte } from 'totte';

const request = new Totte(({
  origin: 'https://example.org',
});
const result = await totte('/products.json');
```

## API

**totte(init, config?)**  
**totte.get(url, payload?, options?)**  
**totte.post(url, payload?, options?)**  
**totte.put(url, payload?, options?)**  
**totte.patch(url, payload?, options?)**  
**totte.head(url, payload?, options?)**  
**totte.delete(url, payload?, options?)**  
**totte.create(options?)**  
**totte.useRequestInterceptor(callback?)**  
**totte.useResponseInterceptor(callback?)**

## Config

The request configuration items are exactly the same as fetch, and the following four additional attributes are added to it:

```typescript
interface RequestConfig {
  url: string;
  origin?: string;
  // request payload
  payload?: object | null;
  // default 'json', options are: 'array buffer' | 'bloom' | 'json' | 'text' | 'formData'
  responseType?: ResponseType;
}
```

## About

Totte is the romanization of the Japanese word "取って", which is exactly Fetch in English, and "totte" is also very similar to "tote", so I used it as the name of the project.
