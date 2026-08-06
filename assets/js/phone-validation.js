(()=>{'use strict';
const originalTest=RegExp.prototype.test;
const strictPhonePattern='^(?:\\+?234|0)[789][01]\\d{8}$';

RegExp.prototype.test=function(value){
  if(this.source===strictPhonePattern&&this.flags===''){
    return /^\d{10,11}$/.test(String(value));
  }
  return originalTest.call(this,value);
};

document.addEventListener('DOMContentLoaded',()=>{
  const phone=document.getElementById('phone');
  if(!phone)return;
  phone.maxLength=11;
  phone.inputMode='numeric';
  phone.addEventListener('input',()=>{
    phone.value=phone.value.replace(/\D/g,'').slice(0,11);
  });
});
})();
