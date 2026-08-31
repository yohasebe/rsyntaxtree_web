# Third-party software

RSyntaxTree Web is MIT licensed (see LICENSE). It ships and loads the
libraries below, each under its own licence.

## Served from this repository

- **Ace** 1.5.3 (`public/js/lib/`) — the editor. BSD 3-Clause. Ace's minified
  build carries no notice of its own, so the licence is reproduced in full
  at the end of this file.
- **gh-fork-ribbon.css** (`public/css/`) — MIT, notice kept in the file.
- **whirl** (`public/css/`) — MIT, notice kept in the file.

## Loaded from a CDN

Served by jsDelivr, not redistributed here:

- **jQuery** and **jQuery UI** — MIT
- **Bootstrap** — MIT
- **Lightbox2** — MIT

## Drawing

Figures are drawn by the [rsyntaxtree](https://github.com/yohasebe/rsyntaxtree)
gem (MIT), which reaches Pango and librsvg through the ruby-gnome bindings
(LGPL, used as libraries and not modified).

## Ace licence

```
Copyright (c) 2010, Ajax.org B.V.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of Ajax.org B.V. nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
