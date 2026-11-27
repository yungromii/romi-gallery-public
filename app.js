import {photoMarkup} from './photo-media.js';
import {initialLayout} from './layout.js';
const app=document.getElementById('app');let archive=null,galleryOrder=null;const editing=false,shotActions=()=>'',editedLayout=p=>initialLayout(p);
let homeCategory = 'daily';
let galleryPicks = null;
const gallerySettings = {randomOrder:false, randomOutfit:false};
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageUrl = f => './assets/' + f.split('/').map(encodeURIComponent).join('/');
const displayName = p => p.name.replace(' / nii',' / nii');
const mediaForFile=(p,file)=>[...(p.originalPhotos||[]),...p.images.flatMap(i=>[i,i.detailImage].filter(Boolean)),...(p.extraPoses||[])].find(i=>i.file===file)||{file};
const photo = image => image.hoverOriginal ? imageUrl(image.hoverOriginal.file) : null;
const plural = (n) => String(n).padStart(2,'0');
const homeTabs = [
  {id:'daily',category:'daily',label:'일상 코디'},
  {id:'favorite',category:'favorite',label:'가장 마음에 드는 코디'},
  {id:'original-daily',category:'daily',original:true,label:'일상 코디 원본 사진'},
  {id:'original-favorite',category:'favorite',original:true,label:'가장 마음에 드는 코디 원본 사진'},
];
function card(p, image, index, tab) {
  const originals=editedLayout(p)[tab.category+':original'];const matched=originals.includes(image.hoverOriginal?.file)?image.hoverOriginal.file:originals[0];
  const src = p.permissions?.photo!=='denied'&&matched?imageUrl(matched):null;
  const name=`<span class="tile-name">${escapeHtml(displayName(p))}</span>`;
  const character=`<img src="${imageUrl(image.file)}" alt="${escapeHtml(p.name)} 로미 캐릭터 ${index+1}" loading="lazy">`;
  const original=src?photoMarkup(mediaForFile(p,matched),p.name+'의 원본 사진'):'';
  const front=tab.original?original+name:character+(src?'':name);
  const back=src?`<div class="tile-face tile-back">${tab.original?character:original}${name}</div>`:'';
  return `<a data-person="${p.id}" class="tile ${src?'has-original':'no-original'}${tab.original?' is-original-view':''}" href="#/person/${p.id}/outfit/${index+1}" aria-label="${escapeHtml(p.name)} 상세 페이지, ${index+1}번째 이미지${tab.original&&!src?', 공개된 원본 사진 없음':''}"><div class="tile-inner"><div class="tile-face tile-front">${front}</div>${back}</div></a>`;
}
const categoryDot = category => `<span class="category-dot category-dot--${category}" aria-hidden="true"></span>`;
function home() {
  const categories=homeTabs;
  const selectedTab=categories.find(tab=>tab.id===homeCategory);
  if(!galleryOrder){
    galleryOrder=[...archive.people].sort((a,b)=>Number(a.id)-Number(b.id));
    if(gallerySettings.randomOrder)for(let i=galleryOrder.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [galleryOrder[i],galleryOrder[j]]=[galleryOrder[j],galleryOrder[i]];
    }
    galleryPicks=new Map(galleryOrder.map(p=>[p.id,Object.fromEntries(categories.filter(tab=>!tab.original).map(category=>{
      const slots=editedLayout(p);const choices=p.images.map((image,i)=>({image,i})).filter(item=>slots[category.id+':generated'].includes((item.image.detailImage||item.image).file)).sort((a,b)=>slots[category.id+':generated'].indexOf((a.image.detailImage||a.image).file)-slots[category.id+':generated'].indexOf((b.image.detailImage||b.image).file));
      return [category.id,choices.length?(gallerySettings.randomOutfit?choices[Math.floor(Math.random()*choices.length)]:choices[0]):null];
    }))]));
  }
  const tiles=galleryOrder.map(p=>{
    const picked=galleryPicks.get(p.id)[selectedTab.category];
    return picked?card(p,picked.image,picked.i,selectedTab):`<div class="tile tile-unavailable" data-person="${p.id}" aria-label="${escapeHtml(p.name)}: 이 분류의 코디 없음"></div>`;
  }).join('');
  app.innerHTML=`<div class="gallery-wrap"><div class="home-tabs" role="tablist" aria-label="코디 분류">${categories.map(category=>`<button id="home-tab-${category.id}" type="button" role="tab" aria-selected="${homeCategory===category.id}" aria-controls="home-gallery" tabindex="${homeCategory===category.id?0:-1}" data-category="${category.id}" aria-label="${category.label}">${categoryDot(category.id)}</button>`).join('')}</div><div id="home-gallery" class="gallery" role="tabpanel" aria-labelledby="home-tab-${homeCategory}">${tiles}</div></div>`;
  const selectCategory=category=>{homeCategory=category;home();document.getElementById(`home-tab-${category}`).focus()};
  document.querySelectorAll('.home-tabs button').forEach((button,index)=>{
    button.addEventListener('click',()=>selectCategory(button.dataset.category));
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?categories.length-1:(index+(event.key==='ArrowRight'?1:-1)+categories.length)%categories.length;
      selectCategory(categories[next].id);
    });
  });
  document.title='ROMI';
}
function detail(id) {
  const idx = archive.people.findIndex(p=>p.id===id);
  if(idx<0){home();return}
  const p=archive.people[idx];
  const outfits=p.outfits||[];
  const allImages=[...p.images.flatMap(image=>[image,image.detailImage].filter(Boolean)),...(p.extraPoses||[]),...(p.originalPhotos||[])];
  const byFile=new Map(allImages.map(image=>[image.file,image]));
  const baseFiles=new Set([...p.images.map(image=>(image.detailImage||image).file),...(p.extraPoses||[]).filter(image=>image.detailFraming==='base').map(image=>image.file)]);
  const renderShots=(files,original=false,key='')=>files.map(file=>byFile.get(file)).filter(Boolean).map((image,i)=>`<figure ${editing?`draggable="true" data-file="${escapeHtml(image.file)}" data-bucket="${key}"`:""} class="editorial-shot ${original?'is-original':baseFiles.has(image.file)?'is-base':''}" style="width:${original||baseFiles.has(image.file)?'100%':Math.round((image.width||1254)*.42)+'px'}">${photoMarkup(image,p.name+' '+(original?'원본 사진':'로미 이미지 '+(i+1)),i<2?'eager':'lazy')}${shotActions(image.file,key)}</figure>`).join('');
  const originalNotice=p.permissions?.photo==='denied'?'<div class="original-permission-note"><p>사진 사용 비동의로<br>공개하지 않습니다.</p></div>':'';
  const lookColumns=[{id:'daily',label:'일상 코디'},{id:'favorite',label:'가장 마음에 드는 코디'}].map(category=>{
    const looks=outfits.filter(outfit=>outfit.category===category.id);
    const slots=editedLayout(p);const originals=slots[category.id+':original'];
    const generated=slots[category.id+':generated'];
    const requests=p.photoRequests?.[category.id]||[];
    const requestCopy=requests.length?`<div class="photo-requests" aria-label="${category.label} 사진 요청사항">${requests.flatMap(note=>String(note).split(/\n\s*\n/).map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`)).join('')}</div>`:'';
    return `<section class="look-column" aria-label="${category.label}"><div class="look-images"><div class="look-originals" aria-label="${category.label} 원본 사진"><div class="editorial originals-editorial" ${editing&&!originalNotice?`data-drop="${category.id}:original"`:""}>${originalNotice||renderShots(originals,true,category.id+':original')}${editing&&!originalNotice?'<div class="drop-hint">원본 사진</div>':''}</div>${requestCopy}</div><div class="look-generated" aria-label="${category.label} 생성 이미지"><div class="editorial generated-editorial" ${editing?`data-drop="${category.id}:generated"`:""}>${renderShots(generated,false,category.id+':generated')}${editing?'<div class="drop-hint">생성 이미지</div>':''}</div></div></div></section>`;
  }).join('');
  const interviewStyle={
    '03':{quote:'제 관념 속에서 만들어낸 독일 디자이너인 거죠.',pull:{after:8,text:'저는 오히려 그 안경이 제 이미지에 더 잘 맞는다고 생각해요.'}},
    '05':{quote:'멜의 추구미는 멜입니다.',pull:{after:7,text:'사람들에게 다양한 매력을 가진 사람으로 보이고 싶어요.'}}
  }[p.id];
  const interviewStatus=p.permissions?.interview;
  const interviewNotice=interviewStatus==='declined'?'인터뷰 참여 비동의로<br>진행하지 않았습니다.':interviewStatus==='pending'?'인터뷰 참여 여부 확인 중':'인터뷰 준비 중';
  const interview=p.interviewHidden?'':p.interview && interviewStatus!=='declined'
    ? `<div class="interview-article"><header class="interview-intro">${interviewStyle?`<blockquote class="interview-lead">“${escapeHtml(interviewStyle.quote)}”</blockquote>`:''}</header><div class="interview-questions">${p.interview.items.map((item,i)=>`<section class="interview-qa"><h4><span class="question-mark" aria-hidden="true">Q.</span>${escapeHtml(item.question)}</h4>${item.answer.map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</section>${interviewStyle?.pull.after===i?`<blockquote class="interview-pull">“${escapeHtml(interviewStyle.pull.text)}”</blockquote>`:''}`).join('')}</div></div>`
    : `<p class="interview-status-note">${interviewNotice}</p>`;
  app.innerHTML=`<article class="detail detail-simultaneous"><div class="detail-nav"><a class="back-link" href="#/">← 전체 보기</a><h1>${escapeHtml(displayName(p))}</h1></div><div class="detail-board">${lookColumns}<aside class="interview-sidebar" aria-label="${escapeHtml(p.name)} 인터뷰"><div class="interview-sticky"><div class="interview-copy">${interview}</div></div></aside></div></article>`;
  document.title='ROMI';
}

function route(){if(!archive)return;const hash=decodeURIComponent(location.hash||'#/');document.body.classList.toggle('is-home',!hash.startsWith('#/person/'));if(hash.startsWith('#/person/'))detail(hash.split('/')[2]);else home();window.scrollTo({top:0,behavior:'instant'});}
fetch('./gallery.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{archive=data.archive;route();window.addEventListener('hashchange',route);}).catch(()=>{app.innerHTML='<p style="padding:48px 24px">이미지 목록을 불러오지 못했습니다. 잠시 후 다시 방문해 주세요.</p>';});
