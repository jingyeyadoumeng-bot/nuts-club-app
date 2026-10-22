/* NUTS CLUB member integration: original UI remains the presentation layer. */
const NC_API='https://ixjnfzgkohmkukxqsfts.supabase.co';
const NC_KEY='sb_publishable_A9lCkz5EUwXYsuFiiV-p3Q__yveeQQr';
let ncSession=null,ncProfile=null,ncTickets=[],ncTypes=[],ncRegister=false;
try{ncSession=JSON.parse(localStorage.getItem('nuts_session')||'null')}catch{}
async function ncFetch(path,method='GET',body){
 const res=await fetch(NC_API+path,{method,headers:{apikey:NC_KEY,'Content-Type':'application/json',...(ncSession?.access_token?{Authorization:'Bearer '+ncSession.access_token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await res.json();if(!res.ok)throw Error(data.message||data.msg||data.error_description||'接続エラー');return data;
}
function ncSave(s){ncSession=s;if(s)localStorage.setItem('nuts_session',JSON.stringify(s));else localStorage.removeItem('nuts_session')}
function ncLogin(){
 $('#view').innerHTML=card('MEMBER LOGIN','<p class="muted small">元のNUTS CLUB会員カードをアカウントで利用できます。</p><input class="field" id="nc-email" type="email" autocomplete="email" placeholder="メールアドレス"><input class="field" id="nc-password" type="password" placeholder="パスワード（6文字以上）"><input class="field" id="nc-name" maxlength="30" placeholder="表示名" style="display:none"><button class="btn" id="nc-submit">ログイン</button><button class="link" id="nc-switch">新規会員登録はこちら</button><p id="nc-message" class="notice" role="status"></p>');
 $('#nav').innerHTML='';
 $('#nc-switch').onclick=()=>{ncRegister=!ncRegister;$('#nc-name').style.display=ncRegister?'block':'none';$('#nc-submit').textContent=ncRegister?'会員登録':'ログイン';$('#nc-switch').textContent=ncRegister?'ログインへ戻る':'新規会員登録はこちら'};
 $('#nc-submit').onclick=async()=>{const btn=$('#nc-submit'),email=$('#nc-email').value.trim(),password=$('#nc-password').value;if(!email||password.length<6){$('#nc-message').textContent='メールと6文字以上のパスワードを入力してください';return}btn.disabled=true;try{if(ncRegister){let s=await ncFetch('/auth/v1/signup','POST',{email,password,data:{display_name:$('#nc-name').value.trim()||email.split('@')[0]}});if(!s.access_token){$('#nc-message').textContent='確認メールを開いてからログインしてください';return}ncSave(s)}else ncSave(await ncFetch('/auth/v1/token?grant_type=password','POST',{email,password}));await ncLoad()}catch(e){$('#nc-message').textContent=e.message}finally{btn.disabled=false}};
}
async function ncRefresh(){if(!ncSession?.refresh_token)return false;try{ncSave(await ncFetch('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:ncSession.refresh_token}));return true}catch{ncSave(null);return false}}
async function ncLoad(){
 if(!ncSession?.user?.id)return ncLogin();
 try{
  const id=encodeURIComponent(ncSession.user.id);
  const profiles=await ncFetch('/rest/v1/profiles?select=id,display_name,total_points,vip_tier_override&id=eq.'+id);
  ncProfile=profiles[0];if(!ncProfile)throw Error('会員プロフィールがありません');
  state.name=ncProfile.display_name||ncSession.user.email||'MEMBER';state.points=ncProfile.total_points||0;state.visits=0;
  const results=await Promise.allSettled([ncFetch('/rest/v1/member_tickets?select=id,ticket_type_id,status,expires_at&member_id=eq.'+id),ncFetch('/rest/v1/ticket_types?select=id,name,description')]);
  ncTickets=results[0].status==='fulfilled'?results[0].value:[];ncTypes=results[1].status==='fulfilled'?results[1].value:[];
  page='home';render();$('footer').textContent='NUTS CLUB · 会員ポイントとチケットはSupabase連携。イベント・来店QR・ランキング等はデモ表示です。';
 }catch(e){ncLogin();$('#nc-message').textContent=e.message}
}
function ncTicketPage(){
 return '<h1 class="h1">🎟 MY TICKETS</h1>'+card('保有チケット',ncTickets.length?ncTickets.map(t=>{let type=ncTypes.find(x=>x.id===t.ticket_type_id);return '<div class="item"><strong>'+esc(type?.name||'チケット')+'</strong><p class="muted small">'+esc(type?.description||'')+'</p><span class="pill">'+esc(t.status)+'</span>'+(t.expires_at?'<p class="muted small">有効期限 '+esc(new Date(t.expires_at).toLocaleDateString('ja-JP'))+'</p>':'')+'</div>'}).join(''):'<p class="muted">保有チケットはありません。</p>')+'<button class="btn secondary" onclick="ncLoad()">チケットを更新</button>');
}
const ncRender=render;
render=function(){
 if(!ncProfile)return ncLogin();
 if(page==='tickets'){page='home';ncRender();page='tickets';$('#view').innerHTML=ncTicketPage()}else ncRender();
 if(page==='player')$('#view').insertAdjacentHTML('beforeend',card('会員アカウント','<p class="muted small">会員ID: '+esc(ncSession.user.id)+'</p><button class="btn secondary" onclick="ncLogout()">ログアウト</button>'));
 $('#nav').insertAdjacentHTML('beforeend','<button class="tab '+(page==='tickets'?'active':'')+'" onclick="go(\'tickets\')"><b>🎟</b><span>TICKET</span></button>');
};
const ncTier=memberTier;
memberTier=function(){if(ncProfile?.vip_tier_override){return tiers.find(t=>t.name===ncProfile.vip_tier_override.toUpperCase())||tiers[0]}return ncProfile?tiers[0]:ncTier()};
const ncPlastic=vipPlastic;
vipPlastic=function(t,mini=false){let html=ncPlastic(t,mini);return ncProfile?html.replace('MEMBER · DEMO','MEMBER · '+esc(ncSession.user.id.slice(0,8).toUpperCase())):html};
async function ncLogout(){try{await ncFetch('/auth/v1/logout','POST')}catch{}ncSave(null);ncProfile=null;ncLogin()}
(async()=>{if(ncSession?.expires_at&&ncSession.expires_at*1000<Date.now())await ncRefresh();await ncLoad()})();
