"""Read-only checks for a sanitized, complete GitHub Pages release."""
from pathlib import Path
import hashlib,json,re

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'gallery.json').read_text())
forbidden={'sourceId','sourceName','sourceFolder','drive','known','layouts','owner_id','deleted_extras'}
def private_check(value):
    if isinstance(value,dict):
        assert not (set(value)&forbidden),'Private metadata in public gallery'
        for child in value.values():private_check(child)
    elif isinstance(value,list):
        for child in value:private_check(child)
private_check(data)
required=set();people=data['archive']['people']
assert len({p['id'] for p in people})==len(people),'Duplicate person IDs'
for p in people:
    media=[*p.get('originalPhotos',[]),*p.get('extraPoses',[])]
    for image in p['images']:
        media.append(image)
        for key in ['detailImage','hoverOriginal']:
            if image.get(key):media.append(image[key])
    files={m['file'] for m in media};required.update(files)
    for outfit in p['outfits']:
        for key in ['originalFiles','generatedFiles']:
            assert set(outfit[key])<=files,('Unknown image reference',p['id'])
    if p.get('permissions',{}).get('photo')=='denied':
        assert not p.get('originalPhotos'),('Nonconsenting photos',p['id'])
        assert not any(i.get('hoverOriginal') for i in p['images'])
        assert not any(o['originalFiles'] for o in p['outfits'])
    if p.get('permissions',{}).get('interview')=='declined':assert not p.get('interview')
    if p.get('interviewHidden'):assert not p.get('interview'),'Hidden interview text in public payload'
for file in required:
    assert re.fullmatch(r'[a-f0-9]{64}\.webp',file),'Invalid public image filename'
    assert hashlib.sha256((root/'assets'/file).read_bytes()).hexdigest()==Path(file).stem,('Missing/corrupt image',file)
actual={p.name for p in (root/'assets').glob('*.webp')}
assert actual==required,'Unreferenced or missing public image files'
print(f'Valid public release: {len(people)} people, {len(required)} images; consent, references and hashes verified.')
