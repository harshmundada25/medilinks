// animate bar
window.addEventListener('load',()=>{
  setTimeout(()=>{
    document.getElementById('barFill').style.width='43.2%';
  },800);
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

// live counter
(function(){
  let n=432;
  setInterval(()=>{
    if(n<999&&Math.random()<0.28){
      n++;
      document.getElementById('countNum').textContent=n;
      document.getElementById('barFill').style.width=(n/10)+'%';
    }
  },7500);
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

// submit
function handleSubmit(){
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
  if(btn.disabled){
    return;
  }
  if(!v.name||!v.email||!v.phone||!v.degree||!v.spec||!v.role||!v.thoughts||!v.challenges||!v.invest){
    const orig=btn.textContent;
    btn.style.background='linear-gradient(135deg,#d63031,#b02020)';
    btn.style.boxShadow='0 4px 14px rgba(214,48,49,0.3)';
    btn.textContent='Please fill all required fields';
    setTimeout(()=>{btn.style.background='';btn.style.boxShadow='';btn.textContent=orig;},2800);
    return;
  }
  const num=parseInt(document.getElementById('countNum').textContent)+1;
  document.getElementById('memberNum').textContent=num;
  document.getElementById('countNum').textContent=num;
  document.getElementById('formInner').style.display='none';
  const s=document.getElementById('successDiv');
  s.style.display='flex';
  s.scrollIntoView({behavior:'smooth',block:'center'});
}
