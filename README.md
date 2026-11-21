# ROMI

Public read-only ROMI gallery: https://yungromii.github.io/romi-gallery-public/

The private management website remains the editing source. The public website contains only the saved, visible images and interviews; it has no editing or save functionality. Hidden/deleted media and private Drive metadata are excluded from exported releases.

## Updating this public copy

Ask the maintaining chat to update both the private Site and this GitHub repository. Save any changes made in the private editor first. The maintainer exports the current visible release from the authenticated editor, then applies it here:

```sh
python3 tools/apply-export.py /absolute/path/to/romi-public.zip
git add .
git commit -m "Update published ROMI gallery"
git push origin main
```

GitHub Pages publishes the repository root on `main`. Private editor saves do not automatically change the public website. No account passwords, provider credentials or private editor database belong in this repository.
