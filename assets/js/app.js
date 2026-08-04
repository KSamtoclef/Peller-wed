(()=>{'use strict';
const C=window.SITE_CONFIG,F=window.FAN_CONVERSATION;
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const GIFTS={
  cow:{title:'Cow Gift',icon:'🐄',claim:'VIEW COW GIFT LOCATION'},
  data:{title:'Data Up to 100GB',icon:'📶',claim:'CONTINUE WITH 100GB DATA'},
  cash:{title:'Cash Gift Up to ₦50,000',icon:'💵',claim:'CONTINUE WITH ₦50,000 CASH GIFT'},
  available:{title:'Any Available Gift',icon:'🎁',claim:'VIEW OTHER AVAILABLE GIFTS'}
};
let state={
  name:'',phone:'',gift:'',stage:'landing',shareProgress:0,shareComplete:false,
  liked:false,localLikes:0,localShares:0,userComments:[],liveComments:[],
  commentLikes:{},nextPerson:0,usedCommentSignatures:[],lastTopics:[]
};
let shareOpenedAt=0,shareWasOpened=false,lastShareTap=0,allowExit=false;
let commentTimer=null,typingTimer=null;
function load(){try{const x=JSON.parse(localStorage.getItem('pj_fan_gift_modular')||'null');if(x)state={...state,...x}}catch(e){}}
function save(){try{localStorage.setItem('pj_fan_gift_modular',JSON.stringify(state))}catch(e){}}
function firstName(){return state.name.trim().split(/\s+/)[0]||'Friend'}
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
  state.stage=id;save();$('stickyShare').style.display=id==='share'?'block':'none';
  scrollTo({top:0,behavior:'smooth'});if(id==='share')renderShare();if(id==='final')renderFinal();renderFeeds();
}
function submitForm(){
  const name=$('fullName').value.trim(),phone=$('phone').value.replace(/\s+/g,''),gift=$('giftSelect').value;
  const okName=name.length>=3,okPhone=/^(?:\+?234|0)[789][01]\d{8}$/.test(phone);
  $('nameError').classList.toggle('show',!okName);$('phoneError').classList.toggle('show',!okPhone);$('giftError').classList.toggle('show',!gift);
  if(!okName||!okPhone||!gift)return;Object.assign(state,{name,phone,gift});save();
  $('process').classList.add('show');setTimeout(()=>{$('process').classList.remove('show');show('share')},1600);
}
function renderShare(){
  const g=GIFTS[state.gift];$('shareTitle').textContent=`Complete Sharing for Your ${g.title}`;
  $('shareCopy').textContent=`${firstName()}, your gift page is still locked. Complete every required WhatsApp share action below.`;
  $('giftPill').textContent=`${g.icon} ${g.title}`;updateShare();
}
function updateShare(){
  const pct=Math.min(100,Math.round(state.shareProgress/C.requiredShares*100));state.shareComplete=state.shareProgress>=C.requiredShares;
  $('sharePercent').textContent=pct+'%';$('shareFill').style.width=pct+'%';
  $('shareCount').textContent=`${state.shareProgress} of ${C.requiredShares} share actions completed`;
  $('claimBtn').disabled=!state.shareComplete;$('claimBtn').textContent=state.shareComplete?'CONTINUE TO MY GIFT':'LOCKED — COMPLETE SHARING';
  $('feedback').textContent=state.shareComplete?'Verification complete. Your gift page is now unlocked.':pct>0?'Progress saved. Continue sharing and return here each time.':'No share action has been verified yet.';save();
}
function openWhatsApp(){
  const now=Date.now();if(now-lastShareTap<C.shareCooldownMs)return;lastShareTap=now;shareWasOpened=true;shareOpenedAt=now;
  location.href=`https://wa.me/?text=${encodeURIComponent(C.shareMessage+'\n'+location.href.split('#')[0])}`;
}
function handleReturn(){
  if(!shareWasOpened)return;const away=Date.now()-shareOpenedAt;shareWasOpened=false;
  if(away<C.minimumWhatsAppAwayMs){openMessage('⚠️','Share Not Counted','Stay in WhatsApp long enough to complete the share, then return.',false);return}
  if(state.shareProgress<C.requiredShares){state.shareProgress++;updateShare();openMessage(state.shareComplete?'✓':'↗',state.shareComplete?'Sharing Completed':'Progress Updated',state.shareComplete?'Your sharing stage is complete. Continue to your gift page.':`${state.shareProgress} of ${C.requiredShares} share actions completed.`,!state.shareComplete)}
}
function openMessage(icon,title,text,again){
  $('messageIcon').textContent=icon;$('messageTitle').textContent=title;$('messageText').textContent=text;
  $('messageAgain').style.display=again?'block':'none';$('messageContinue').textContent=state.shareComplete?'CONTINUE TO MY GIFT':'CONTINUE';$('messageModal').classList.add('show');
}
function renderFinal(){
  const selected=state.gift;$('finalCopy').textContent=`${firstName()}, your sharing stage is complete. Continue with your selected gift below.`;
  $('claimList').innerHTML=[selected,...Object.keys(GIFTS).filter(k=>k!==selected)].map(id=>{const g=GIFTS[id];return `<div class="claim-card ${id===selected?'selected':''}"><div class="claim-top"><div class="gift-icon">${g.icon}</div><div><h3>${esc(g.title)}</h3>${id===selected?'<small>YOUR SELECTED GIFT</small>':''}</div></div><p>Use the button below to continue with this gift option.</p><button class="gift-action" data-gift="${id}">${esc(g.claim)}</button><div id="note-${id}" class="small-note">This link will be added during setup.</div></div>`}).join('');
  document.querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>{const url=C.giftLinks[b.dataset.gift];if(url){location.href=url}else{const n=$(`note-${b.dataset.gift}`);n.classList.add('show');setTimeout(()=>n.classList.remove('show'),2500)}});
}
function nextPerson(){const person=F.people[state.nextPerson%F.people.length];state.nextPerson=(state.nextPerson+1)%F.people.length;return person}
function allTopicGroups(){return Object.entries(F.topics)}
function freshTopic(){
  const groups=allTopicGroups();
  for(let attempt=0;attempt<120;attempt++){
    const [group,list]=pick(groups);if(state.lastTopics.slice(-3).includes(group))continue;
    const text=pick(list),sig=`topic|${text}`;if(state.usedCommentSignatures.includes(sig))continue;
    state.lastTopics.push(group);state.lastTopics=state.lastTopics.slice(-8);state.usedCommentSignatures.push(sig);
    if(state.usedCommentSignatures.length>900)state.usedCommentSignatures=state.usedCommentSignatures.slice(-650);
    return text;
  }
  return pick(pick(groups)[1]);
}
function freshReply(){
  for(let attempt=0;attempt<80;attempt++){
    const text=pick(F.replies),sig=`reply|${text}`;if(!state.usedCommentSignatures.includes(sig)){
      state.usedCommentSignatures.push(sig);return text;
    }
  }
  return pick(F.replies);
}
function createLiveComment(){
  const recent=state.liveComments.find(c=>!c.replyTo),makeReply=recent&&Math.random()<.34;
  const text=makeReply?freshReply():freshTopic(),replyTo=makeReply?recent.n:'';
  const signature=`${text}|${replyTo}`;state.usedCommentSignatures.push(signature);
  if(state.usedCommentSignatures.length>900)state.usedCommentSignatures=state.usedCommentSignatures.slice(-650);
  return {id:'l'+Date.now()+Math.random().toString(36).slice(2,6),n:nextPerson(),t:text,replyTo,l:Math.floor(Math.random()*57)+2,ts:Date.now(),fresh:true};
}
function nextComment(){
  const c=createLiveComment();state.liveComments.forEach(x=>x.fresh=false);state.liveComments.unshift(c);
  state.liveComments=state.liveComments.slice(0,420);save();renderFeeds();scheduleComments();
}
function scheduleComments(){
  clearTimeout(commentTimer);clearTimeout(typingTimer);
  const delay=9000+Math.floor(Math.random()*18000);
  commentTimer=setTimeout(()=>{
    document.querySelectorAll('.typing').forEach(el=>el.textContent=`${nextPerson()} is typing…`);
    typingTimer=setTimeout(nextComment,1800+Math.floor(Math.random()*2600));
  },delay);
}
function age(ts){const s=Math.max(0,Math.floor((Date.now()-ts)/1000));if(s<50)return'now';const m=Math.floor(s/60);return m<60?m+'m':Math.floor(m/60)+'h'}
function comments(){return [...state.userComments,...state.liveComments].sort((a,b)=>b.ts-a.ts)}
function commentHtml(c){
  const liked=!!state.commentLikes[c.id];return `<div class="comment ${c.replyTo?'reply-row':''} ${c.fresh?'new-comment':''}"><div class="avatar">${esc(c.n.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><div class="bubble">${c.replyTo?`<small>Replying to ${esc(c.replyTo)}</small>`:''}<b>${esc(c.n)}</b><p>${esc(c.t)}</p></div><div class="meta"><button data-like-comment="${c.id}">${liked?'Liked':'Like'} · ${(c.l||0)+(liked?1:0)}</button><button data-reply="${esc(c.n)}">Reply</button><span>${age(c.ts)}</span></div></div></div>`;
}
function feedHtml(compact=false){
  const list=comments().slice(0,compact?12:180);
  return `<div class="feed"><div class="feed-head"><h3>Fan Conversation</h3><p>New wedding and gift messages keep appearing while this page remains open</p></div><div class="social"><span>👍 ❤️ ${(241000+state.localLikes).toLocaleString()}</span><span>${(7800+comments().length).toLocaleString()} comments · ${(68000+state.localShares).toLocaleString()} shares</span></div><div class="social-actions"><button class="like-main ${state.liked?'active':''}">Like</button><button class="focus-comment">Comment</button><button class="share-page">Share</button></div><div class="comments">${list.map(commentHtml).join('')}</div><div class="typing">Someone is typing…</div><div class="composer"><input class="comment-input" placeholder="Write a comment…"><button class="comment-send">➤</button></div></div>`;
}
function renderFeeds(){if($('landingFeed'))$('landingFeed').innerHTML=feedHtml(true);if($('finalFeed')&&state.stage==='final')$('finalFeed').innerHTML=feedHtml(false);bindFeed()}
function bindFeed(){
  document.querySelectorAll('.like-main').forEach(b=>b.onclick=()=>{state.liked=!state.liked;state.localLikes+=state.liked?1:-1;save();renderFeeds()});
  document.querySelectorAll('.focus-comment').forEach((b,i)=>b.onclick=()=>document.querySelectorAll('.comment-input')[i]?.focus());
  document.querySelectorAll('.share-page').forEach(b=>b.onclick=sharePage);
  document.querySelectorAll('.comment-send').forEach((b,i)=>b.onclick=()=>addComment(i));
  document.querySelectorAll('.comment-input').forEach((input,i)=>input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();addComment(i)}});
  document.querySelectorAll('[data-like-comment]').forEach(b=>b.onclick=()=>{state.commentLikes[b.dataset.likeComment]=!state.commentLikes[b.dataset.likeComment];save();renderFeeds()});
  document.querySelectorAll('[data-reply]').forEach(b=>b.onclick=()=>{const input=document.querySelector('.comment-input');if(input){input.value='@'+b.dataset.reply+' ';input.focus()}});
}
function addComment(index=0){
  const input=document.querySelectorAll('.comment-input')[index]||document.querySelector('.comment-input');if(!input||!input.value.trim())return;
  state.userComments.unshift({id:'u'+Date.now(),n:state.name||'Guest',t:input.value.trim(),replyTo:'',l:0,ts:Date.now(),fresh:true});save();renderFeeds();
}
async function sharePage(){state.localShares++;save();try{if(navigator.share)await navigator.share({title:'Peller & Jarvis Fans Gift Celebration',text:'Peller & Jarvis Fans Gift Celebration',url:location.href.split('#')[0]});else openWhatsApp()}catch(e){}renderFeeds()}
function showExit(){if(allowExit)return;$('exitModal').classList.add('show')}
function setupExitTrap(){history.pushState({stay:true},'',location.href);window.addEventListener('popstate',()=>{if(allowExit)return;history.pushState({stay:true},'',location.href);showExit()})}
function leavePage(){allowExit=true;const url=(C.facebookExitUrl||'').trim();if(url){location.href=url}else{history.go(-2)}}
document.addEventListener('click',e=>{const go=e.target.closest('[data-go]');if(go)show(go.dataset.go)});
$('demoBanner').textContent=C.demoBanner;$('demoBanner').style.display=C.demoBanner?'block':'none';
$('heroCta').onclick=()=>$('formCard').scrollIntoView({behavior:'smooth'});$('submitForm').onclick=submitForm;
$('shareBtnTop').onclick=openWhatsApp;$('stickyShareBtn').onclick=openWhatsApp;$('claimBtn').onclick=()=>state.shareComplete&&show('final');
$('messageContinue').onclick=()=>{$('messageModal').classList.remove('show');if(state.shareComplete)show('final')};
$('messageAgain').onclick=()=>{$('messageModal').classList.remove('show');openWhatsApp()};
$('exitStay').onclick=()=>$('exitModal').classList.remove('show');$('exitLeave').onclick=leavePage;
document.addEventListener('visibilitychange',()=>{if(!document.hidden)handleReturn()});window.addEventListener('focus',handleReturn);
load();
if(!state.liveComments.length){F.seed.forEach((x,i)=>state.liveComments.push({id:'s'+i,n:x[0],t:x[1],replyTo:x[2],l:6+i*4,ts:Date.now()-i*48000,fresh:false}));save()}
if(state.name){$('fullName').value=state.name;$('phone').value=state.phone;$('giftSelect').value=state.gift}
renderFeeds();scheduleComments();setInterval(()=>renderFeeds(),60000);setupExitTrap();show(state.shareComplete?'final':state.stage==='share'?'share':'landing');
window.resetPellerJarvisDemo=()=>{localStorage.removeItem('pj_fan_gift_modular');location.reload()};
})();
