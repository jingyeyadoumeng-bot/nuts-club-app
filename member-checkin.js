/* NUTS CLUB member-side QR scanner; camera permission only on tap. */
(function(){
 const start=document.getElementById('nuts-self-scan-start'),stop=document.getElementById('nuts-self-scan-stop'),reader=document.getElementById('nuts-self-scan-reader'),status=document.getElementById('nuts-self-scan-status');
 if(!start||!stop||!reader||!status)return;
 let scanner=null,busy=false,active=false;
 const setStatus=t=>{status.textContent=t};
 function getCode(raw){
  try{const u=new URL(raw);if(u.origin!==location.origin||u.pathname!=='/checkin.html')return null;return u.searchParams.get('code')}catch(e){return null}
 }
 async function loadScanner(){
  if(window.Html5Qrcode)return;
  await new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
   script.onload=resolve;script.onerror=()=>reject(new Error('QR読み取り機能を読み込めませんでした。通信環境を確認してください。'));
   document.head.appendChild(script);
  });
 }
 async function halt(){
  active=false;stop.hidden=true;start.hidden=false;
  if(scanner){try{await scanner.stop()}catch(e){}try{scanner.clear()}catch(e){}scanner=null}
  reader.style.display='none';
 }
 async function checkin(raw){
  if(busy)return;
  const code=getCode(raw);
  if(!code){setStatus('NUTS CLUB店内のチェックインQRコードを読み取ってください。');return}
  busy=true;setStatus('チェックイン中…');
  await halt();
  try{
   const session=JSON.parse(localStorage.getItem('nuts_session')||'{}');
   if(!session.access_token)throw Error('ログインが必要です。会員アプリでログインし直してください。');
   const res=await fetch('https://ixjnfzgkohmkukxqsfts.supabase.co/rest/v1/rpc/nuts_member_self_checkin',{method:'POST',headers:{apikey:'sb_publishable_A9lCkz5EUwXYsuFiiV-p3Q__yveeQQr',Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({p_code:code})});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw Error(res.status===401?'ログイン期限が切れています。再ログインしてください。':(data?.message||'来店登録に失敗しました'));
   setStatus(data==='checked_in'?'✓ チェックイン完了！ご来店ありがとうございます。':data==='already_checked_in'?'✓ すでにチェックイン済みです。':'チェックイン結果を確認できませんでした。');
  }catch(e){setStatus(e.message)}finally{busy=false}
 }
 start.addEventListener('click',async()=>{
  if(active||busy)return;
  active=true;start.hidden=true;stop.hidden=false;reader.style.display='block';setStatus('カメラを起動しています。許可を求められたら「許可」を選んでください。');
  try{
   await loadScanner();
   if(!active)return;
   scanner=new Html5Qrcode('nuts-self-scan-reader',{verbose:false});
   await scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:230,height:230}},text=>{if(active&&!busy)checkin(text)},()=>{});
   setStatus('店内POPのQRコードを枠内に映してください。');
  }catch(e){await halt();setStatus('カメラを起動できませんでした。iPhoneの設定でカメラのアクセスを許可してください。 '+e.message)}
 });
 stop.addEventListener('click',()=>{halt();setStatus('読み取りを終了しました。')});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)halt()});
})();
