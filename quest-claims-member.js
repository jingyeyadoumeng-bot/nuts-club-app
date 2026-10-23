(function(){
const API='https://ixjnfzgkohmkukxqsfts.supabase.co',KEY='sb_publishable_A9lCkz5EUwXYsuFiiV-p3Q__yveeQQr';
const host=document.getElementById('questList');if(!host)return;
async function load(){
 const session=JSON.parse(localStorage.getItem('nuts_session')||'{}');if(!session.access_token)return;
 const headers={apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'};
 try{
 const [quests,claims]=await Promise.all([fetch(API+'/rest/v1/club_quests?select=id,title,description,reward_points&is_published=eq.true&order=id.desc',{headers}).then(r=>r.json()),fetch(API+'/rest/v1/quest_claims?select=quest_id,status,reward_points&order=id.desc',{headers}).then(r=>r.json())]);
 if(!Array.isArray(quests)||!Array.isArray(claims))throw Error('取得に失敗しました');
 host.replaceChildren();
 if(!quests.length){host.textContent='公開中のクエストはありません';return}
 for(const q of quests){
 const claim=claims.find(c=>c.quest_id===q.id);
 const d=document.createElement('div');d.className='ticket';
 const title=document.createElement('strong');title.textContent=q.title;
 const detail=document.createElement('p');detail.textContent=(q.description||'')+' / 報酬 '+q.reward_points+'pt';
 const b=document.createElement('button');b.className='secondary';b.textContent=claim?({pending:'⏳ 承認待ち',approved:'✓ 達成済み',rejected:'却下済み'}[claim.status]||claim.status):'達成申請する';b.disabled=!!claim;
 b.onclick=async()=>{if(!confirm('「'+q.title+'」の達成を申請しますか？'))return;b.disabled=true;try{const r=await fetch(API+'/rest/v1/rpc/nuts_request_quest',{method:'POST',headers,body:JSON.stringify({p_quest_id:q.id})});if(!r.ok){const e=await r.json();throw Error(e.message||'申請できません')}await load()}catch(e){alert(e.message);b.disabled=false}};
 d.append(title,detail,b);host.append(d);
 }
 }catch(e){host.textContent='クエストを読み込めません: '+e.message}
}
document.addEventListener('click',e=>{if(e.target.closest('[data-tab="quests"]'))setTimeout(load,120)});
document.addEventListener('DOMContentLoaded',()=>setTimeout(load,1300));
window.nutsQuestClaimsLoad=load;
})();