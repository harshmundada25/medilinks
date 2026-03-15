const EARLY_ACCESS_BASE_COUNT=400;
const EARLY_ACCESS_STORAGE_KEY='medilinks-early-access-count';
const GOOGLE_SHEETS_WEBAPP_URL='https://script.google.com/macros/s/AKfycbxYTYuzqBuy0RsLWAUdp9Y-6tGxhgi7F7alXXDIv6oNz9uVxP-q-YRH_T156IhRIhU8/exec';

function getStoredEarlyAccessCount(){
  const storedValue=window.localStorage.getItem(EARLY_ACCESS_STORAGE_KEY);
  const parsedValue=storedValue?parseInt(storedValue,10):NaN;

  if(Number.isNaN(parsedValue) || parsedValue<EARLY_ACCESS_BASE_COUNT){
    return EARLY_ACCESS_BASE_COUNT;
  }

  return parsedValue;
}

function updateEarlyAccessCounter(count){
  const safeCount=Math.max(EARLY_ACCESS_BASE_COUNT,parseInt(count,10)||EARLY_ACCESS_BASE_COUNT);
  const countNum=document.getElementById('countNum');
  const barFill=document.getElementById('barFill');

  window.localStorage.setItem(EARLY_ACCESS_STORAGE_KEY,String(safeCount));
  countNum.textContent=safeCount;
  barFill.style.width=(safeCount/10)+'%';
}

async function fetchGlobalEarlyAccessCount(){
  if(!GOOGLE_SHEETS_WEBAPP_URL){
    return null;
  }

  try{
    const response=await fetch(`${GOOGLE_SHEETS_WEBAPP_URL}?action=count`,{method:'GET'});
    if(!response.ok){
      return null;
    }

    const data=await response.json();
    const parsedCount=parseInt(data.count,10);
    if(Number.isNaN(parsedCount)){
      return null;
    }

    return Math.max(EARLY_ACCESS_BASE_COUNT,parsedCount);
  }catch(error){
    return null;
  }
}

// animate bar
window.addEventListener('load',()=>{
  setTimeout(()=>{
    updateEarlyAccessCounter(getStoredEarlyAccessCount());
  },800);

  setTimeout(async()=>{
    const globalCount=await fetchGlobalEarlyAccessCount();
    if(globalCount!==null){
      updateEarlyAccessCounter(globalCount);
    }
  },950);
});

// ticker build
(function(){
  const states=['Maharashtra','Delhi NCR','Karnataka','Tamil Nadu','Gujarat','Rajasthan','Uttar Pradesh','West Bengal','Kerala','Telangana','Andhra Pradesh','Madhya Pradesh','Punjab','Haryana','Bihar','Odisha','Assam','Jharkhand','Uttarakhand','Himachal Pradesh','Goa','Chhattisgarh','Chandigarh','Jammu & Kashmir','Ladakh','Puducherry','Manipur','Meghalaya','Sikkim'];
  const belt=document.getElementById('belt');
  [...states,...states].forEach(s=>{
    const el=document.createElement('span');
    el.className='ti';
    el.innerHTML=`<span class="ti-pip"></span>${s}`;
    belt.appendChild(el);
  });
})();

// form progress + investor checkbox behavior
(function(){
  const requiredIds=['f-name','f-phone','f-email','f-degree','f-spec','f-role','f-thoughts','f-challenges'];
  const progressValue=document.getElementById('formProgressValue');
  const progressFill=document.getElementById('formProgressFill');
  const investRow=document.getElementById('investRow');
  const investCheckbox=document.getElementById('f-invest');
  const submitBtn=document.getElementById('submitBtn');

  function updateProgress(){
    let filled=0;
    requiredIds.forEach((id)=>{
      const el=document.getElementById(id);
      if(el && el.value && el.value.trim()!==''){
        filled++;
      }
    });
    if(investCheckbox.checked){
      filled++;
    }
    const totalFields=requiredIds.length+1;
    const percent=Math.round((filled/totalFields)*100);
    if(progressValue){
      progressValue.textContent=percent+'%';
    }
    if(progressFill){
      progressFill.style.width=percent+'%';
    }
    submitBtn.disabled=percent<100;
  }

  requiredIds.forEach((id)=>{
    const el=document.getElementById(id);
    if(el){
      el.addEventListener('input',updateProgress);
      el.addEventListener('change',updateProgress);
    }
  });

  function syncInvestorState(){
    investRow.classList.toggle('active',investCheckbox.checked);
    updateProgress();
  }

  investCheckbox.addEventListener('change',syncInvestorState);

  updateProgress();
  syncInvestorState();
  setTimeout(updateProgress,200);
})();

async function postToGoogleSheets(payload){
  if(!GOOGLE_SHEETS_WEBAPP_URL){
    return {ok:false,reason:'missing-url'};
  }

  try{
    await fetch(GOOGLE_SHEETS_WEBAPP_URL,{
      method:'POST',
      mode:'no-cors',
      headers:{
        'Content-Type':'text/plain;charset=utf-8'
      },
      body:JSON.stringify(payload)
    });
    return {ok:true};
  }catch(error){
    return {ok:false,reason:'network-error',error};
  }
}

async function handleSubmit(){
  const v={
    name:document.getElementById('f-name').value.trim(),
    email:document.getElementById('f-email').value.trim(),
    phone:document.getElementById('f-phone').value.trim(),
    degree:document.getElementById('f-degree').value,
    spec:document.getElementById('f-spec').value.trim(),
    role:document.getElementById('f-role').value,
    thoughts:document.getElementById('f-thoughts').value.trim(),
    challenges:document.getElementById('f-challenges').value.trim(),
    invest:document.getElementById('f-invest').checked
  };
  const btn=document.querySelector('.submit-btn');
  const originalText='Request Early Access →';
  if(btn.disabled){
    return;
  }
  if(!v.name||!v.email||!v.phone||!v.degree||!v.spec||!v.role||!v.thoughts||!v.challenges||!v.invest){
    btn.style.background='linear-gradient(135deg,#d63031,#b02020)';
    btn.style.boxShadow='0 4px 14px rgba(214,48,49,0.3)';
    btn.textContent='Please fill all required fields';
    setTimeout(()=>{btn.style.background='';btn.style.boxShadow='';btn.textContent=originalText;},2800);
    return;
  }

  btn.disabled=true;
  btn.textContent='Submitting...';

  const payload={
    timestamp:new Date().toISOString(),
    source:'medilinks-early-access-form',
    ...v
  };

  const result=await postToGoogleSheets(payload);
  if(!result.ok){
    btn.disabled=false;
    btn.style.background='linear-gradient(135deg,#d63031,#b02020)';
    btn.style.boxShadow='0 4px 14px rgba(214,48,49,0.3)';
    btn.textContent=result.reason==='missing-url'
      ? 'Google Sheets URL not configured'
      : 'Submission failed. Try again';
    setTimeout(()=>{
      btn.style.background='';
      btn.style.boxShadow='';
      btn.textContent=originalText;
    },3000);
    return;
  }

  const num=parseInt(document.getElementById('countNum').textContent,10)+1;
  document.getElementById('memberNum').textContent=num;
  updateEarlyAccessCounter(num);

  const globalCount=await fetchGlobalEarlyAccessCount();
  if(globalCount!==null){
    document.getElementById('memberNum').textContent=globalCount;
    updateEarlyAccessCounter(globalCount);
  }

  document.getElementById('formInner').style.display='none';
  const s=document.getElementById('successDiv');
  s.style.display='flex';
  s.scrollIntoView({behavior:'smooth',block:'center'});
}
