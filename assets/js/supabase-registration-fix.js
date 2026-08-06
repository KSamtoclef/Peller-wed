(()=>{'use strict';
const originalFetch=window.fetch.bind(window);
window.fetch=async function(input,init={}){
  const url=typeof input==='string'?input:input?.url||'';
  const isRegistration=url.includes('/rest/v1/peller_wed_email_registration')&&String(init.method||'GET').toUpperCase()==='POST';
  if(!isRegistration)return originalFetch(input,init);

  const cleanUrl=url
    .replace(/([?&])on_conflict=email(&|$)/,'$1')
    .replace(/[?&]$/,'');

  const cleanHeaders=new Headers(init.headers||{});
  cleanHeaders.set('Prefer','return=minimal');

  const response=await originalFetch(cleanUrl,{...init,headers:cleanHeaders});

  if(response.status===409){
    return new Response(null,{status:204,statusText:'Already registered'});
  }

  return response;
};
})();
