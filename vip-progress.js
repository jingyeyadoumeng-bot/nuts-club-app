const vipRanks=[['BRONZE',0],['SILVER',5000],['GOLD',15000],['PLATINUM',30000],['BLACK VIP',50000]];
async function refreshVipRank(){
 if(!session?.user?.id||document.getElementById('member')?.hidden)return;
 try{
  const rows=await request('/rest/v1/profiles?select=total_points,vip_tier_override&id=eq.'+encodeURIComponent(session.user.id));
  const profile=rows[0];if(!profile)return;
  const points=Math.max(0,Number(profile.total_points)||0);
  const current=vipRanks.filter(rank=>points>=rank[1]).at(-1);
  const next=vipRanks.find(rank=>rank[1]>points);
  const override=vipRanks.find(rank=>rank[0]===profile.vip_tier_override);
  const tier=(override||current)[0];
  document.getElementById('tier').textContent=tier;
  document.getElementById('vip-card').dataset.tier=tier;
  document.getElementById('vip-current-rank').textContent=tier;
  const progress=next?Math.min(100,Math.round((points-current[1])/(next[1]-current[1])*100)):100;
  document.getElementById('vip-progress-fill').style.width=progress+'%';
  document.getElementById('vip-progress-track').setAttribute('aria-valuenow',String(progress));
  document.getElementById('vip-progress-label').textContent=next?'NEXT RANK · '+next[0]:'MAX RANK · BLACK VIP';
  document.getElementById('vip-progress-detail').textContent=next?'あと '+(next[1]-points).toLocaleString()+' pt で '+next[0]+' に昇格':'最高ランクに到達しています ✦';
  if(override&&override[0]!==current[0])document.getElementById('vip-progress-detail').textContent+='（スタッフ設定ランク適用中）';
  document.querySelectorAll('.vip-tier-row').forEach(row=>row.classList.toggle('active',row.dataset.rank===tier));
 }catch(e){console.warn('VIP rank:',e.message)}
}
document.addEventListener('DOMContentLoaded',()=>{
 const member=document.getElementById('member');
 if(!member)return;
 const observer=new MutationObserver(()=>{if(!member.hidden)refreshVipRank()});
 observer.observe(member,{attributes:true,attributeFilter:['hidden']});
 document.getElementById('reload')?.addEventListener('click',()=>setTimeout(refreshVipRank,400));
 setTimeout(refreshVipRank,1200);
});
