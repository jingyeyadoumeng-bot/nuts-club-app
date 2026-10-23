const API='https://ixjnfzgkohmkukxqsfts.supabase.co';
const KEY='sb_publishable_A9lCkz5EUwXYsuFiiV-p3Q__yveeQQr';
let session=JSON.parse(localStorage.getItem('nuts_session')||'null'), register=false;
const el=id=>document.getElementById(id);
async function request(path,method='GET',data){const response=await fetch(API+path,{method,headers:{apikey:KEY,'Content-Type':'application/json',...(session?.access_token?{Authorization:'Bearer '+session.access_token}:{})},...(data?{body:JSON.stringify(data)}:{})});const result=await response.json();if(!response.ok)throw Error(result.msg||result.message||result.error_description||'通信に失敗しました');return result}
function message(text){el('message').textContent=text}
function store(s){session=s;if(s)localStorage.setItem('nuts_session',JSON.stringify(s));else localStorage.removeItem('nuts_session')}
async function refreshSession(){if(!session?.refresh_token)return false;try{store(await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}));return true}catch{store(null);return false}}
async function showMember(){el('login').hidden=true;el('member').hidden=false;try{let p=await request('/rest/v1/profiles?select=id,display_name,total_points,vip_tier_override&id=eq.'+encodeURIComponent(session.user.id));let u=p[0];if(!u)throw Error('プロフィールがまだ作成されていません');let chips=0;try{let c=await request('/rest/v1/chip_accounts?select=deposited_chips&member_id=eq.'+encodeURIComponent(session.user.id));chips=c[0]?.deposited_chips||0}catch{}el('name').textContent=u.display_name||session.user.email;el('tier').textContent=u.vip_tier_override||'BRONZE';el('points').textContent=Number(u.total_points||0).toLocaleString();el('chips').textContent=Number(chips).toLocaleString();el('uid').textContent='MEMBER ID '+session.user.id;await loadTickets().catch(e=>{el('tickets').textContent='チケットの取得に失敗しました: '+e.message});message('')}catch(e){message(e.message)}}
el('switch').onclick=()=>{register=!register;el('displayName').hidden=!register;el('submit').textContent=register?'会員登録':'ログイン';el('switch').textContent=register?'ログインに戻る':'新規会員登録はこちら';message('')};
el('submit').onclick=async()=>{let email=el('email').value.trim(),password=el('password').value;if(!email||password.length<6)return message('メールと6文字以上のパスワードを入力してください');el('submit').disabled=true;try{if(register){let d=await request('/auth/v1/signup','POST',{email,password,data:{display_name:el('displayName').value.trim()||email.split('@')[0]}});if(d.access_token){store(d);await showMember()}else message('確認メールを開いてからログインしてください')}else{store(await request('/auth/v1/token?grant_type=password','POST',{email,password}));await showMember()}}catch(e){message(e.message)}finally{el('submit').disabled=false}};
el('reload').onclick=showMember;el('logout').onclick=async()=>{try{await request('/auth/v1/logout','POST')}catch{}store(null);el('member').hidden=true;el('login').hidden=false;message('ログアウトしました')};
(async()=>{if(session){if(session.expires_at&&session.expires_at*1000<Date.now()&&!(await refreshSession()))return;await showMember()}})();
async function loadTickets(){
 const id=encodeURIComponent(session.user.id);
 const [owned,types]=await Promise.all([
 request('/rest/v1/member_tickets?select=id,ticket_type_id,status,expires_at&member_id=eq.'+id),
 request('/rest/v1/ticket_types?select=id,name,description')
 ]);
 const byId=new Map(types.map(t=>[t.id,t]));
 const host=document.getElementById('tickets');
 host.replaceChildren();
 if(!owned.some(t=>t.status==='available'&&(!t.expires_at||new Date(t.expires_at)>new Date()))){host.textContent='利用できるチケットはありません'}
 for(const t of owned.filter(t=>t.status==='available'&&(!t.expires_at||new Date(t.expires_at)>new Date()))){const card=document.createElement('div');card.className='ticket';const label=document.createElement('strong');label.textContent=byId.get(t.ticket_type_id)?.name||'チケット';const code=document.createElement('p');code.textContent='チケットID: #'+t.id;code.style.fontWeight='bold';const detail=document.createElement('p');detail.textContent='状態: '+t.status+(t.expires_at?' / 有効期限: '+new Date(t.expires_at).toLocaleDateString('ja-JP'):'');card.append(label,code,detail);host.append(card)}const used=owned.filter(t=>t.status==='used');if(used.length){const h=document.createElement('h3');h.textContent='使用履歴';host.append(h);for(const t of used){const p=document.createElement('p');p.textContent='チケット #'+t.id+' · 使用済み';host.append(p)}}
}
