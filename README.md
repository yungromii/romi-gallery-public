# ROMI

Public read-only gallery: https://yungromii.github.io/romi-gallery-public/

Since 2026-11-26 this repository is the sole operating website. GitHub Pages publishes `main` from the repository root. The previous private management site is retained as an archive and is no longer the editing or release source. There are no public editing or save controls.

## Maintenance

Update this repository directly through the maintenance workspace. Its private `romi-maintenance/README.md` documents the preserved placements, source identity mapping and exclusion records. Never publish those private records. Existing hidden/deleted images must remain absent during Drive synchronization; only an explicit restoration request can reintroduce one.

Keep the current public image order, outfit assignments, permissions and placements when updating unrelated content. Text-only changes should not replace image records. Edit frontend files here, without regenerating them from the archived management site. Change the JS/CSS query version in `index.html` when those files change.

The landing page has four paired tabs: red/lime show daily/favorite characters; blue/magenta show the corresponding approved original photos. Both views share the same chosen character, matching photo, person order and detail link. Original-photo views flip back to characters. Missing/unapproved photos retain an empty person slot. A fresh page load always starts on the red daily-character tab.

Before committing:

```sh
python3 tools/check-release.py
git diff --stat
```

Commit and push intended changes to `main`, then verify the live page. Git history retains previous releases. Never commit private Drive IDs/links, hidden-file inventories, credentials or editor database state. `tools/apply-export.py` intentionally rejects old management-site ZIPs to prevent accidental rollback of placements or exclusions.
