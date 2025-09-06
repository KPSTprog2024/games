# Data pack hash maintenance

The `manifest.json` file lists each pack along with a SHA‑256 hash to
protect against tampering. Whenever a file in `packs/` changes or a new
pack is added, regenerate the hashes and update the manifest.

## Regenerate hashes

From this directory run:

```bash
sha256sum packs/*.json
```

Copy each digest and replace the matching `hash` entry in
`manifest.json` using the `sha256-<hex>` format.

Commit both the modified pack files and `manifest.json` so the hashes
stay in sync.

