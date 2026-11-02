const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function lvl(r){return r>=60?['High risk','bad']:r>=30?['Medium risk','warn']:['Low risk','ok']}
function meter(v,label,cls,invert){const off=251*(1-v/100);return `<svg viewBox="0 0 200 110" role="img" aria-label="${label} ${v} out of 100"><path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="var(--line)" stroke-width="14" stroke-linecap="round"/><path class="v" d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="var(--${cls})" stroke-width="14" stroke-linecap="round" stroke-dasharray="251" stroke-dashoffset="${off}"/></svg><b class="${cls}">${v}</b><div class="muted">${label}</div>`}
function show(res){const o=$('#out');let h='';
 if(res.risk!=null){const [t,c]=lvl(res.risk);h+=`<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><div style="flex:1;min-width:150px">${meter(res.risk,'Offer risk',c)}</div>${res.ready!=null?`<div style="flex:1;min-width:150px">${meter(res.ready,'Deal readiness',res.ready>=70?'ok':res.ready>=40?'warn':'bad')}</div>`:''}</div><span class="stamp ${c}">${t}</span>`}
 if(res.big)h+=`<div style="margin:30px 0 8px"><b class="${res.big[1]}" style="font:800 3rem 'Bricolage Grotesque'">${res.big[0]}</b><div class="muted">${res.bigl}</div></div>`;
 h+=`<div style="text-align:left;margin-top:22px">`+(res.flags.length?res.flags.map(f=>`<div class="flag"><i class="${f[2]||'warn'}">${f[3]||'Flag'}</i><div>${f[0]}<small>${f[1]}</small></div></div>`).join(''):'<p class="ok">No warning signs found by the current rules.</p>')+`</div>`;
 if(res.list)h+=`<div style="text-align:left;margin-top:14px"><h3>Your safe-deal checklist</h3>${res.list.map(x=>`<label style="font-weight:400;display:flex;gap:10px;margin:8px 0"><input type="checkbox" style="width:auto"> ${x}</label>`).join('')}</div>`;
 o.innerHTML=h}
/* ---- Analyzer page ---- */
if($('#tabs')){
const names={offer:'Offer and payment',contract:'Contract check',scope:'Scope creep',exposure:'Payment exposure',client:'Client check'};let cur='offer';
$('#tabs').innerHTML=Object.keys(names).map(k=>`<button role="tab" data-k="${k}" class="${k==cur?'on':''}">${names[k]}</button>`).join('');
$('#tabs').onclick=e=>{const k=e.target.dataset.k;if(!k)return;cur=k;$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.k==k));$$('.pane').forEach(p=>p.classList.toggle('on',p.dataset.t==k))};
const ENDPOINT={offer:'/api/analyze-offer'};
const PAYLOAD={
 offer:()=>({offer_text:$('#o1').value,payment_terms:$('#o2').value}),
 contract:()=>({contract_text:$('#c1').value}),
 scope:()=>({original:$('#s1').value,new_request:$('#s2').value}),
 exposure:()=>({total:$('#x1').value,percent:$('#x2').value,paid:$('#x3').value}),
 client:()=>({name:$('#k1').value,company:$('#k2').value,email:$('#k3').value,website:$('#k4').value,age_months:$('#k5').value})};
$('#run').onclick=async()=>{
 try{
  const r=await fetch(ENDPOINT[cur]||'/api/analyze/'+cur,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(PAYLOAD[cur]())});
  const d=await r.json();
  if(!r.ok){alert(d.error||'Could not run this check.');return}
  show(d);
 }catch(e){alert('Could not reach the server. Please sign in again and retry.')}
};
}
/* ---- Login page ---- */
if($('#sw')){
let reg=false;$('#sw').onclick=e=>{e.preventDefault();reg=!reg;$('#nm').hidden=!reg;$('#n').required=reg;$('#lf').action=reg?e.target.dataset.register:e.target.dataset.login;$('#p').autocomplete=reg?'new-password':'current-password';$('#lt').textContent=$('#lb').textContent=reg?'Create account':'Sign in';e.target.textContent=reg?'Have an account? Sign in':'New here? Create an account'};
}
/* ---- Home page ---- */
if($('#demo')){
$('#demo').innerHTML=meter(72,'Offer risk','bad')+'<span class="stamp bad">High risk</span><div style="text-align:left;margin-top:18px"><div class="flag"><i class="bad">Risk</i><div>Asks you to pay first<small>Real clients do not charge freelancers to start work.</small></div></div><div class="flag"><i class="warn">Gap</i><div>No deadline stated<small>Agree on this in writing before starting.</small></div></div></div>';
}
/* ---- Dashboard page (Chart.js) ---- */
function charts(){const D=window.DASH;if(!D||!window.Chart)return;
 new Chart($('#c1x'),{type:'line',data:{labels:D.labels,datasets:[{label:'Offer risk',data:D.scores,borderColor:'#2457E6',tension:.3}]},options:{scales:{y:{min:0,max:100}}}});
 new Chart($('#c2x'),{type:'doughnut',data:{labels:['Low','Medium','High'],datasets:[{data:D.levels,backgroundColor:['#1B8A5A','#C98200','#C4352B']}]}})}
if($('#c1x'))charts();
