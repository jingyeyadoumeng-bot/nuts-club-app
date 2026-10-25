(()=>{'use strict';
const PUBLIC_KEY='BAumbvoFOlxR9S3wL0Nns529c4Ia5GGpTSffCyOfRxEhB67hUNgcahPsaN6p-0CRE4L_hqp8YTZtvbHRaj_DgYw';
const API='https://ixjnfzgkohmkukxqsfts.supabase.co/rest/v1/',KEY='sb_publishable_A9lCkz5EUwXYsuFiiV-p3Q__yveeQQr';
const button=document.getElementById('nuts-push-enable'),status=document.getElementById('nuts-push-status');
if(!button)return;
const session=()=>{try{return JSON.parse(localStorage.getItem('nuts_session')||'{}')}catch{return {}}};
const msg=t=>{if(status)status.textContent=t};
msg('通知ボタンの準備OK。押して設定できます。');
const decode=s=>{const p=s.replace(/-/g,'+').replace(/_/g,'/');const raw=atob(p+'='.repeat((4-p.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0))};
async function saveSubscription(subscription){
 const s=session();if(!s.access_token||!s.user?.id)throw Error('ログインしてください');
 const data=subscription.toJSON();
 const r=await fetch(API+'nuts_push_subscriptions?on_conflict=endpoint',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+s.access_token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify({user_id:s.user.id,endpoint:data.endpoint,p256dh:data.keys.p256dh,auth:data.keys.auth})});
 if(!r.ok){const e=await r.json().catch(()=>({}));throw Error(e.message||'通知の登録に失敗しました')}
}
button.onclick=async()=>{
 button.disabled=true;
 try{
  if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)throw Error('この端末・ブラウザはプッシュ通知に対応していません');
  if(/iPhone|iPad|iPod/.test(navigator.userAgent)&&!(window.navigator.standalone||window.matchMedia('(display-mode: standalone)').matches))throw Error('iPhoneではSafariの共有メニューからホーム画面に追加し、そのアイコンから開いてください');
  msg('通知の準備をしています…');
  const registrationPromise=navigator.serviceWorker.register('/service-worker.js',{scope:'/'});
  const permission=await Notification.requestPermission();
  const registration=await registrationPromise;
  if(permission!=='granted')throw Error('通知が許可されていません。スマホの設定を確認してください');
  msg('スマホの通知を登録しています…');
  if(!registration.active)await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('通知の準備がタイムアウトしました。アプリを開き直してください')),12000))]);
  let subscription=await registration.pushManager.getSubscription();
  if(subscription){const old=subscription.options.applicationServerKey;if(old&&Array.from(new Uint8Array(old)).join(',')!==Array.from(decode(PUBLIC_KEY)).join(',')){await subscription.unsubscribe();subscription=null}}
  if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(PUBLIC_KEY)});
  await saveSubscription(subscription);
  msg('✓ このスマホのプッシュ通知を登録しました ♠');
 }catch(e){msg(e.message||'通知を登録できませんでした。もう一度お試しください')}finally{button.disabled=false}
};
})();