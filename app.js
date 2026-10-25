const API='https://ixjnfzgkohmkukxqsfts.supabase.co';
const KEY='sb_publishable_A9lCkz5EUwXYsuFiiV-p3Q__yveeQQr';
let session=JSON.parse(localStorage.getItem('nuts_session')||'null'), register=false;
const el=id=>document.getElementById(id);
async function request(path,method='GET',data){const response=await fetch(API+path,{method,headers:{apikey:KEY,'Content-Type':'application/json',...(session?.access_token?{Authorization:'Bearer '+session.access_token}:{})},...(data?{body:JSON.stringify(data)}:{})});const result=await response.json();if(!response.ok)throw Error(result.msg||result.message||result.error_description||'通信に失敗しました');return result}
function message(text){el('message').textContent=text}
function store(s){session=s;if(s)localStorage.setItem('nuts_session',JSON.stringify(s));else localStorage.removeItem('nuts_session')}
async function refreshSession(){if(!session?.refresh_token)return false;try{store(await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}));return true}catch{store(null);return false}}
async function showMember(){el('login').hidden=true;el('member').hidden=false;try{let p=await request('/rest/v1/profiles?select=id,display_name,total_points,store_currency,vip_tier_override&id=eq.'+encodeURIComponent(session.user.id));let u=p[0];if(!u)throw Error('プロフィールがまだ作成されていません');let chips=0;try{let c=await request('/rest/v1/chip_accounts?select=deposited_chips&member_id=eq.'+encodeURIComponent(session.user.id));chips=c[0]?.deposited_chips||0}catch{}el('name').textContent=u.display_name||session.user.email;const vipTier=['BLACK VIP','PLATINUM','GOLD','SILVER','BRONZE'].includes(String(u.vip_tier_override||'').toUpperCase())?String(u.vip_tier_override).toUpperCase():'BRONZE';el('tier').textContent=vipTier;el('vip-card').dataset.tier=vipTier;el('points').textContent=Number(u.total_points||0).toLocaleString();el('chips').textContent=Number(chips).toLocaleString();el('store-currency').textContent=Number(u.store_currency||0).toLocaleString();el('uid').textContent='MEMBER ID '+session.user.id;await loadTickets().catch(e=>{el('tickets').textContent='チケットの取得に失敗しました: '+e.message});await loadChipHistory().catch(e=>{el('chip-history').textContent='履歴の取得に失敗しました: '+e.message});await loadStoreCurrencyHistory().catch(e=>{el('currency-history').textContent='店内通貨の履歴を取得できませんでした: '+e.message});message('')}catch(e){message(e.message)}}
el('switch').onclick=()=>{register=!register;el('ranking-notice').hidden=!register;el('displayName').hidden=!register;el('signup-gender-wrap').hidden=!register;el('submit').textContent=register?'会員登録':'ログイン';el('switch').textContent=register?'ログインに戻る':'新規会員登録はこちら';message('')};
el('submit').onclick=async()=>{let email=el('email').value.trim(),password=el('password').value;if(!email||password.length<6)return message('メールと6文字以上のパスワードを入力してください');el('submit').disabled=true;try{if(register){const gender=el('signup-gender').value;if(!['male','female'].includes(gender))return message('性別を選択してください');let d=await request('/auth/v1/signup','POST',{email,password,data:{display_name:el('displayName').value.trim()||email.split('@')[0],gender}});if(d.access_token){store(d);await showMember()}else message('確認メールを開いてからログインしてください')}else{store(await request('/auth/v1/token?grant_type=password','POST',{email,password}));await showMember()}}catch(e){message(e.message)}finally{el('submit').disabled=false}};
el('reload').onclick=showMember;el('logout').onclick=async()=>{try{await request('/auth/v1/logout','POST')}catch{}store(null);el('member').hidden=true;el('login').hidden=false;message('ログアウトしました')};
(async()=>{if(session){if(session.expires_at&&session.expires_at*1000<Date.now()&&!(await refreshSession()))return;await showMember()}})();
window.nutsRefreshChipHistory=()=>loadChipHistory().catch(e=>{el('chip-history').textContent='履歴の取得に失敗しました: '+e.message});
async function loadStoreCurrencyHistory(){const host=el('currency-history');if(!host)return;const rows=await request('/rest/v1/rpc/nuts_my_store_currency_history','POST',{p_limit:100});host.replaceChildren();if(!rows.length){host.textContent='店内通貨の利用・追加履歴はまだありません';return}for(const row of rows){const delta=Number(row.delta||0);const entry=document.createElement('div');entry.className='currency-history-entry'+(delta<0?' is-spent':'');const left=document.createElement('div');const label=document.createElement('div');label.textContent=delta<0?'店内通貨を使用':'店内通貨を追加';const time=document.createElement('time');time.dateTime=row.created_at;time.textContent=new Date(row.created_at).toLocaleString('ja-JP');left.append(label,time);const value=document.createElement('strong');value.textContent=(delta>0?'+':'')+delta.toLocaleString();entry.append(left,value);host.append(entry)}}
async function loadChipHistory(){const host=el('chip-history');const id=encodeURIComponent(session.user.id);const rows=await request('/rest/v1/chip_transactions?select=transaction_type,deposited_change,held_change,note,created_at&member_id=eq.'+id+'&order=created_at.desc&limit=50');host.replaceChildren();if(!rows.length){host.textContent='チップの預け入れ・引き出し履歴はまだありません';return}for(const row of rows){const card=document.createElement('div');card.className='ticket';const change=Number(row.deposited_change||0);const type=change>0?'預け入れ':change<0?'引き出し':(row.transaction_type||'チップ取引');const head=document.createElement('strong');head.textContent=type+'　'+(change>0?'+':'')+change.toLocaleString()+'点';const date=document.createElement('p');date.textContent=new Date(row.created_at).toLocaleString('ja-JP');card.append(head,date);if(row.note){const note=document.createElement('p');note.textContent=row.note;card.append(note)}host.append(card)}}
async function loadTickets(){
 const id=encodeURIComponent(session.user.id);
 const [owned,types]=await Promise.all([
 request('/rest/v1/member_tickets?select=id,ticket_type_id,status,expires_at,used_at,issued_at&member_id=eq.'+id+'&order=issued_at.desc'),
 request('/rest/v1/ticket_types?select=id,name,description')
 ]);
 const byId=new Map(types.map(t=>[t.id,t]));
 const host=el('tickets');host.replaceChildren();
 const available=owned.filter(t=>t.status==='available'&&(!t.expires_at||new Date(t.expires_at)>new Date()));
 const used=owned.filter(t=>t.status==='used');
 const makeTicket=(t,isUsed)=>{
  const kind=byId.get(t.ticket_type_id);
  const card=document.createElement('article');card.className='nuts-ticket-card'+(isUsed?' is-used':'');
  const top=document.createElement('div');top.className='nuts-ticket-top';
  const brand=document.createElement('span');brand.textContent='♠ NUTS CLUB  ·  EXCLUSIVE TICKET';
  const status=document.createElement('span');status.className='nuts-ticket-status';status.textContent=isUsed?'✓ 使用済み':'✦ 利用可能';top.append(brand,status);
  const title=document.createElement('h3');title.textContent=kind?.name||'SPECIAL TICKET';
  const detail=document.createElement('p');detail.className='nuts-ticket-detail';detail.textContent=kind?.description||'NUTS CLUB 会員限定チケット';
  const bottom=document.createElement('div');bottom.className='nuts-ticket-bottom';
  const number=document.createElement('span');number.textContent='TICKET NO. '+String(t.id).padStart(6,'0');
  const date=document.createElement('span');date.textContent=isUsed?(t.used_at?'使用日 '+new Date(t.used_at).toLocaleDateString('ja-JP'):'使用済み'):(t.expires_at?'期限 '+new Date(t.expires_at).toLocaleDateString('ja-JP'):'有効期限なし');bottom.append(number,date);
  card.append(top,title,detail,bottom);
  if(isUsed){const stamp=document.createElement('div');stamp.className='nuts-ticket-stamp';stamp.textContent='USED';card.append(stamp)}
  else{const btn=document.createElement('button');btn.className='nuts-ticket-use';btn.type='button';btn.textContent='このチケットを使用する';btn.onclick=async()=>{
   if(!confirm('店舗スタッフに確認してから使用してください。\n「'+(kind?.name||'チケット')+'」を使用済みにしますか？\nこの操作は取り消せません。'))return;
   btn.disabled=true;btn.textContent='処理中...';
   try{const result=await request('/rest/v1/rpc/nuts_use_my_ticket','POST',{p_ticket_id:t.id});if(result!==true)throw Error('使用できませんでした。使用済みまたは期限切れの可能性があります');await loadTickets()}catch(e){alert(e.message);btn.disabled=false;btn.textContent='このチケットを使用する'}
  };card.append(btn)}
  return card
 };
 const heading=document.createElement('div');heading.className='nuts-ticket-section-title';heading.textContent='AVAILABLE  /  利用可能 '+available.length+'枚';host.append(heading);
 if(!available.length){const p=document.createElement('p');p.className='nuts-ticket-empty';p.textContent='利用できるチケットはありません';host.append(p)}
 for(const t of available)host.append(makeTicket(t,false));
 if(used.length){const headingUsed=document.createElement('div');headingUsed.className='nuts-ticket-section-title';headingUsed.textContent='HISTORY  /  使用済み '+used.length+'枚';host.append(headingUsed);for(const t of used)host.append(makeTicket(t,true))}
}

setInterval(async()=>{if(!session?.refresh_token)return;if(!session.expires_at||session.expires_at*1000<Date.now()+5*60*1000)await refreshSession()},60000);
window.addEventListener('storage',async e=>{if(e.key!=='nuts_session')return;try{session=JSON.parse(e.newValue||'null')}catch{session=null}if(!session){el('member').hidden=true;el('login').hidden=false;return}if(!session.expires_at||session.expires_at*1000<Date.now()+60000){if(!(await refreshSession()))return}await showMember()});
