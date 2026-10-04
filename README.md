# フワ — Footed Whale

Landing page for Footed Whale, an AI engineering studio that evolves prompt pipelines and explores them with tree search.

It's a single static `index.html`. There's no build step and no dependencies apart from Google Fonts, and it's served by GitHub Pages from this repo.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## What's on the page

- **MCTS background:** a real Monte Carlo tree search drawn on a canvas. It repeatedly picks a branch by UCB1, grows the tree, runs a playout and feeds the score back up. The best path is acid, the latest playout magenta. When the tree hits 300 nodes it settles, fades out and starts the next generation. The HUD counters come from the live search.
  - **Hover** a node to highlight its path back to the root (with a short chromatic glitch). The highlight sticks while the cursor stays near the node.
  - **Click** a node to fork from it: about 16 extra searches run from that node, and everything they grow is drawn in cyan.
- **Transmissions:** the cycling blurb, which scrambles through katakana into each new line. Hover pauses it, click skips ahead. The lines are the `lines` array in the script.
- **Contact:** the address scrambles in and out on its own, and stays readable once someone hovers, focuses or taps it.
- **Footer code:** a canvas barcode that glitches every 7–16 seconds. Each glitch permanently changes one bar.
- If the visitor's system asks for reduced motion, everything renders still.

## Contact address

The email address is never stored as plain text in the source. Scrapers would otherwise pick it up. It lives in `index.html` as XOR-encoded character codes (key `0x5a`) and is only decoded in the browser.

To change it, generate the new codes and replace the array in `const addr = …`:

```sh
python3 -c "print(', '.join(hex(ord(c) ^ 0x5a) for c in input('address: ')))"
```

The address box is sized in `ch` units to the address length (`.contact .addr { width: …ch }`), so update that number too.

## Agents

- **WebMCP:** if the browser supports `navigator.modelContext`, the page registers a read-only tool, `get_contact_email`, that returns the contact address. When an agent calls it, the address is also revealed on the page.
- **`llms.txt`:** a short description of the site for LLMs. It points agents to the WebMCP tool rather than including the address.

To check both, run Lighthouse's agentic browsing category:

```sh
npx lighthouse http://localhost:8000/ --only-categories=agentic-browsing,accessibility --view
```
