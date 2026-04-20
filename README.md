# Gallery Mode

> A museum in place of a marketplace.

Gallery Mode is a browser extension that replaces the ads on the websites you visit with public-domain paintings from the world's great museums. Instead of yet another car commercial, you'll see Rembrandt, Vermeer, Monet, and Turner.

Every painting is a canvas work from roughly **1300 to 1920** — Renaissance through Impressionism. Click any piece to open the museum's own page about it, with full provenance and curatorial notes.

---

## Install

Gallery Mode isn't in the Chrome Web Store or Firefox Add-ons store yet, so installation takes a couple of extra steps. It's still quick — about two minutes — and you don't need any coding experience.

### For Chrome, Brave, Edge, Arc, and other Chrome-based browsers

1. **Download the extension.** Go to the [latest release page](https://github.com/tbw875/gallery-mode/releases/latest) and click **`gallery-mode-chrome.zip`** to download it.
2. **Unzip the file.** Double-click the file you just downloaded. You'll get a folder called `gallery-mode-chrome`. Move this folder somewhere you won't accidentally delete it — your Documents folder is fine.
3. **Open your browser's extensions page.** Copy and paste this into your address bar and hit Enter: `chrome://extensions`
4. **Turn on Developer mode.** There's a toggle in the top-right corner. Flip it on.
5. **Click "Load unpacked".** A button will appear in the top-left.
6. **Select the `gallery-mode-chrome` folder** from wherever you saved it in step 2.
7. **Pin the extension.** Click the puzzle-piece icon in your browser's toolbar, find Gallery Mode, and click the pin next to it so its gold "G" icon stays visible.

That's it. Browse any website with ads and you'll start seeing paintings.

### For Firefox

1. **Download the extension.** Go to the [latest release page](https://github.com/tbw875/gallery-mode/releases/latest) and click **`gallery-mode-firefox.xpi`** to download it.
2. **Open Firefox's add-ons debugging page.** Copy and paste this into your address bar and hit Enter: `about:debugging#/runtime/this-firefox`
3. **Click "Load Temporary Add-on…"**
4. **Select the `gallery-mode-firefox.xpi` file** you just downloaded.

Gallery Mode is now running. Note: Firefox unloads temporary add-ons when you quit the browser, so you'll need to repeat these steps each time you restart. This is a Firefox limitation for extensions not yet published to their official store — once Gallery Mode is in the Firefox Add-ons store, this goes away.

---

## Using Gallery Mode

After install, there's nothing to configure. Browse the web normally and ads will be replaced with artwork.

**Click the gold G in your toolbar** to open the popup:
- Toggle the extension on or off
- Choose which museums to pull from (Art Institute of Chicago, The Metropolitan Museum, Cleveland Museum of Art)
- Open the full settings page

**In the settings page** you can:
- Block specific websites (so their ads are left alone)
- Show or hide the painting's title and artist on hover
- Clear the cache to see a fresh rotation

**Click any painting** to open that museum's page about it — full details, provenance, and high-resolution zoom.

---

## Troubleshooting

**"I don't see any paintings."**
Make sure the toggle in the popup is on. If it is, try refreshing the page. Some websites load their ads a moment after everything else, so give it a second.

**"The gold G icon isn't in my toolbar."**
In Chrome-based browsers, click the puzzle-piece icon in the toolbar and pin Gallery Mode. In Firefox, right-click the toolbar and choose "Customize Toolbar" to drag it in.

**"I got a security warning when loading the extension."**
This is normal. Browsers warn about any extension not installed through their official stores. Gallery Mode only reads the web pages you visit to find ad slots and talks to the three museum APIs listed above — nothing else.

**"It's showing me [some painting] and I don't like it."**
Open the popup and turn off the source museum for that piece (each painting shows its museum on hover). Or click "Clear the cache" in settings to get a fresh rotation.

---

## Privacy

Gallery Mode does **not**:
- Collect or transmit any information about you
- Use analytics, tracking, or telemetry
- Send data to any server we run (we don't run any servers)

Gallery Mode **does**:
- Read the pages you visit, in your browser only, to find ad slots
- Fetch paintings directly from the three museums' public APIs

All of this happens in your browser. Nothing leaves your computer except the plain HTTPS requests to the museum APIs, which are the same kinds of requests your browser makes to load any website.

---

## Credits

All artwork comes from the open-access programs of:

- [The Art Institute of Chicago](https://www.artic.edu/open-access)
- [The Metropolitan Museum of Art](https://www.metmuseum.org/about-the-met/policies-and-documents/open-access)
- [The Cleveland Museum of Art](https://www.clevelandart.org/open-access)

Gallery Mode does not modify, reinterpret, or claim any ownership of these works. Every replacement links back to the source institution.

---

## For developers

Gallery Mode is built with TypeScript and packaged with esbuild. No framework, no bundler fuss.

```bash
git clone https://github.com/tbw875/gallery-mode.git
cd gallery-mode
npm install
npm run icons     # generate PNGs from the SVG logo
npm run build     # builds dist/chrome and dist/firefox
```

Then load `dist/chrome` or `dist/firefox/manifest.json` as an unpacked extension. See [CLAUDE.md](CLAUDE.md) for the architecture overview.

---

## License

[MIT](LICENSE) — use it, fork it, send PRs.
