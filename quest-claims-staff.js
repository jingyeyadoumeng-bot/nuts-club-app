(function(){
const host=document.getElementById('questClaimsStaff');if(!host)return;
async function load(){
host.textContent='申請を取得中…';
try{
 const claims=await api('/rest/v1/quest_claims?select=id,quest_id,member_id,status,requested_at&status=eq.pending&order=requested_at.asc&limit=100');
 const [quests,profiles]=await Promise.all([api('/rest/v1/club_quests?select=id,title,reward_points'),api('/rest/v1/profiles?select=id,display_name')]);
 host.replaceChildren();if(!claims.length){host.textContent='承認待ちの申請はありません';return}
 for(const c of claims){
 const q=quests.find(x=>x.id===c.quest_id),p=profiles.find(x=>x.id===c.member_id);
 const d=document.createElement('div');d.className='item';
 const info=document.createElement('p');info.textContent=(p?.display_name||c.member_id)+' ／ '+(q?.title||'クエスト')+' ／ +'+(q?.reward_points??'?')+' pt';d.append(info);
 for(const approve of [true,false]){
 const b=document.createElement('button');b.textContent=approve?'✓ 承認してポイント付与':'× 却下';b.className=approve?'':'secondary';
 b.onclick=async()=>{if(!confirm((approve?'承認してポイントを付与':'申請を却下')+'しますか？'))return;b.disabled=true;try{await rpc('nuts_review_quest',{p_claim_id:c.id,p_approve:approve});msg(approve?'承認してポイントを付与しました':'申請を却下しました');await load()}catch(e){msg(e.message);b.disabled=false}};d.append(b);
 }
 host.append(d);
 }
}catch(e){host.textContent='申請取得エラー: '+e.message}
}
document.querySelector('[data-tab="quests"]')?.addEventListener('click',()=>setTimeout(load,100));
document.addEventListener('DOMContentLoaded',()=>setTimeout(load,1000));
window.nutsQuestStaffReload=load;
})();