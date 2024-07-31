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

const result = await totte('https://api.yuki.sh/ping');

console.log(result);
// -> { status: 200, data: 'Ciallo～(∠·ω< )⌒★', ... }
```

You can also use class or create to create new instance:

```javascript
import totte from 'totte';

const request = totte.create({
  origin: 'https://api.yuki.sh',
});
const result = await totte('/ping');
```

```javascript
import { Totte } from 'totte';

const request = new Totte(({
  origin: 'https://api.yuki.sh',
});
const result = await totte('/ping');
```

## API

**totte(init, config?)**  
**totte.get(url, data?)**  
**totte.post(url, data?)**  
**totte.put(url, data?)**  
**totte.patch(url, data?)**  
**totte.head(url, data?)**  
**totte.delete(url, data?)**  
**totte.create(options?)**  
**totte.useRequestInterceptor(callback?)**  
**totte.useResponseInterceptor(callback?)**

## Config

The request configuration items are exactly the same as fetch, and the following four additional attributes are added to it:

```javascript
{
  origin: 'https://api.yuki.sh';
  url: '/ping';
  // options are: 'GET' | 'DELETE' | 'HEAD' | 'POST' | 'PUT' | 'PATCH'
  method: 'GET'; // default
  // options are: 'array buffer' | 'bloom' | 'json' | 'text' | 'formData'
  responseType: 'json', // default
}
```
