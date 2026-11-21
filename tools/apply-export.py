"""Apply the private editor's sanitized public ZIP before committing to GitHub Pages."""
from pathlib import Path
from zipfile import ZipFile
import hashlib,json,re,shutil,sys
archive=Path(sys.argv[1]).resolve();root=Path(__file__).resolve().parents[1]
allowed={'index.html','app.js','photo-media.js','layout.js','style.css','gallery.json','.nojekyll'}
with ZipFile(archive) as z:
 if z.testzip():raise SystemExit('ZIP integrity check failed')
 for name in z.namelist():
  if name not in allowed and not re.fullmatch(r'assets/[a-f0-9]{64}\.webp',name):raise SystemExit('Unexpected export path: '+name)
 gallery=json.loads(z.read('gallery.json'))
 def verify(value):
  if isinstance(value,dict):
   if set(value)&{'sourceId','sourceName','sourceFolder','drive','known','layouts','owner_id','deleted_extras'}:raise SystemExit('Private metadata in public export')
   for child in value.values():verify(child)
  elif isinstance(value,list):
   for child in value:verify(child)
 verify(gallery)
 for name in z.namelist():
  if name.startswith('assets/') and hashlib.sha256(z.read(name)).hexdigest()!=Path(name).stem:raise SystemExit('Image hash mismatch')
 # Clear the previous visible release, preserving repository history and helper files.
 if (root/'assets').exists():shutil.rmtree(root/'assets')
 for name in allowed:
  if (root/name).exists():(root/name).unlink()
 z.extractall(root)
print('Applied verified public snapshot:',len(gallery['archive']['people']),'people,',len(list((root/'assets').glob('*.webp'))),'images.')
