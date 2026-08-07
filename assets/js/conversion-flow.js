(()=>{'use strict';
const $=id=>document.getElementById(id);
const labels={cow:'Cow Gift',data:'Data Up to 100GB',cash:'Cash Gift Up to ₦50,000',available:'Other Gifts'};

function selectGift(gift,scroll=true){
  const select=$('giftSelect');
  const form=$('formCard');
  if(!select||!form||!labels[gift])return;

  select.value=gift;
  document.querySelectorAll('[data-gift-choice]').forEach(btn=>{
    btn.classList.toggle('selected',btn.dataset.giftChoice===gift);
    btn.setAttribute('aria-pressed',btn.dataset.giftChoice===gift?'true':'false');
  });

  const summary=$('selectedGiftSummary');
  if(summary)summary.textContent=`Selected: ${labels[gift]}`;
  form.hidden=false;
  if(scroll)requestAnimationFrame(()=>form.scrollIntoView({behavior:'smooth',block:'start'}));
}

function keepSubmitLabel(){
  const btn=$('submitForm');
  if(!btn)return;
  const desired='CONTINUE TO MY GIFT';
  if(!btn.disabled)btn.textContent=desired;
  new MutationObserver(()=>{
    if(!btn.disabled&&btn.textContent!=='SAVING…')btn.textContent=desired;
  }).observe(btn,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled']});
}

document.addEventListener('DOMContentLoaded',()=>{
  const form=$('formCard');
  const giftSelect=$('giftSelect');

  document.querySelectorAll('[data-gift-choice]').forEach(btn=>{
    btn.addEventListener('click',()=>selectGift(btn.dataset.giftChoice,true));
  });

  const heroCta=$('heroCta');
  if(heroCta){
    heroCta.onclick=()=>$('giftChoices')?.scrollIntoView({behavior:'smooth',block:'center'});
  }

  if(giftSelect?.value){
    selectGift(giftSelect.value,false);
  }else if(form){
    form.hidden=true;
  }

  keepSubmitLabel();
});
})();
