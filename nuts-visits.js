(()=>{'use strict';const $=id=>document.getElementById(id);let stream=null,scanning=false;
const status=t=>{$('nutsVisitMessage').textContent=t};
const uuid=value=>{const v=String(value||'').trim().replace(/^NUTS:/i,'');return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)?v:null};
async function refresh(){if(!session?.access_token)return;const host=$('nutsVisitList');host.textContent='読み込み中...';try{const rows=await rpc('nuts_staff_active_visits',{});host.replaceChildren();const count=document.createElement('p');count.textContent='現在 '+rows.length+'名 来店中';count.style.color='#e6c57c';host.append(count);if(!rows.length){host.append(document.createTextNode('現在来店中のお客様はいません'));return}for(const m of rows){const card=item(host,[m.display_name||'名前未登録','来店 '+new Date(m.checked_in_at).toLocaleString('ja-JP'),'ポイント '+Number(m.total_points||0).toLocaleString()]);card.append(btn('このお客様を管理',async()=>{await selectMember({id:m.member_id,display_name:m.display_name,total_points:m.total_points});status('お客様を選択しました。チケット・チップ・ポイント・店内通貨のタブで操作できます。')}));card.append(btn('退店処理',async()=>{if(!confirm((m.display_name||'この会員')+'を退店にしますか？'))return;try{await rpc('nuts_staff_visit',{p_member_id:m.member_id,p_action:'checkout'});status('退店処理が完了しました');await refresh()}catch(e){status(e.message)}}))}}catch(e){host.textContent='来店一覧の取得に失敗: '+e.message}}
async function checkin(raw){const id=uuid(raw);if(!id){status('有効なNUTS会員QRまたは会員IDを入力してください');return}try{const result=await rpc('nuts_staff_visit',{p_member_id:id,p_action:'checkin'});status(result==='already_checked_in'?'このお客様はすでに来店登録済みです':'来店登録しました ♠');$('nutsVisitCode').value='';stop();await refresh()}catch(e){status('来店登録失敗: '+e.message)}}
function stop(){scanning=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}$('nutsScanVideo').srcObject=null;$('nutsScanVideo').style.display='none';$('nutsScanStop').hidden=true;$('nutsScanStart').hidden=false}
async function start(){
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){status('カメラを利用できません。HTTPSで開き、ブラウザのカメラ許可を確認してください');return}
 if(typeof jsQR!=='function'&&typeof BarcodeDetector==='undefined'){status('QR読み取り機能を読み込めませんでした。ページを再読み込みしてください');return}
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false});
  const video=$('nutsScanVideo');video.srcObject=stream;video.style.display='block';$('nutsScanStart').hidden=true;$('nutsScanStop').hidden=false;scanning=true;
  await video.play();status('カメラが起動しました。会員QRを枠内に映してください');
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
  const detector=typeof BarcodeDetector!=='undefined'?new BarcodeDetector({formats:['qr_code']}):null;
  while(scanning){
   if(video.readyState>=2&&video.videoWidth>0){
    let found=null;
    if(typeof jsQR==='function'){
     canvas.width=video.videoWidth;canvas.height=video.videoHeight;
     ctx.drawImage(video,0,0,canvas.width,canvas.height);
     const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
     const result=jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'attemptBoth'});
     if(result&&uuid(result.data))found=result.data;
    }else if(detector){try{const codes=await detector.detect(video);found=codes.find(c=>uuid(c.rawValue))?.rawValue||null}catch{}}
    if(found){stop();await checkin(found);break}
   }
   await new Promise(r=>setTimeout(r,180))
  }
 }catch(e){
  stop();
  const hint=e.name==='NotAllowedError'?'カメラの利用が拒否されています。ブラウザのサイト設定からカメラを許可してください':e.name==='NotFoundError'?'カメラが見つかりません':e.message;
  status('カメラ起動エラー: '+hint)
 }
}
$('nutsScanStart').onclick=start;$('nutsScanStop').onclick=stop;$('nutsVisitCheckin').onclick=()=>checkin($('nutsVisitCode').value);$('nutsVisitReload').onclick=refresh;
const nav=document.querySelector('[data-tab="visits"]');nav.addEventListener('click',()=>{stop();refresh()});
const signout=$('signout');signout.addEventListener('click',stop);
})();