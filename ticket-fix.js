/* Ticket display uses the database's canonical statuses: available / used / cancelled. */
window.loadTickets = async function(){
 const host=document.getElementById('tickets');
 host.textContent='チケットを読み込み中…';
 try{
  const id=encodeURIComponent(session.user.id);
  const [owned,types]=await Promise.all([
   request('/rest/v1/member_tickets?select=id,ticket_type_id,status,expires_at,used_at&member_id=eq.'+id+'&order=issued_at.desc'),
   request('/rest/v1/ticket_types?select=id,name,description')
  ]);
  const labels=new Map(types.map(t=>[t.id,t.name]));
  const usable=owned.filter(t=>t.status==='available'&&(!t.expires_at||Date.parse(t.expires_at)>Date.now()));
  const used=owned.filter(t=>t.status==='used');
  host.replaceChildren();
  if(!usable.length){const p=document.createElement('p');p.textContent='現在利用できるチケットはありません';host.append(p)}
  for(const t of usable){
   const card=document.createElement('div');card.className='ticket';
   const name=document.createElement('strong');name.textContent=labels.get(t.ticket_type_id)||'チケット';
   const code=document.createElement('p');code.textContent='チケットID：#'+t.id;code.style.fontWeight='bold';
   const status=document.createElement('p');status.textContent='利用可能'+(t.expires_at?' · 期限：'+new Date(t.expires_at).toLocaleDateString('ja-JP'):'');
   card.append(name,code,status);host.append(card);
  }
  if(used.length){
   const heading=document.createElement('h3');heading.textContent='使用履歴';host.append(heading);
   for(const t of used){
    const row=document.createElement('p');
    row.textContent=(labels.get(t.ticket_type_id)||'チケット')+' #'+t.id+' · 使用済み'+(t.used_at?' · '+new Date(t.used_at).toLocaleString('ja-JP'):'');
    host.append(row);
   }
  }
 }catch(e){host.textContent='チケットを取得できませんでした：'+e.message}
};
document.getElementById('copyMemberId').addEventListener('click',async()=>{
 if(!session?.user?.id)return;
 try{await navigator.clipboard.writeText(session.user.id);message('会員IDをコピーしました')}
 catch{message('コピーできませんでした。会員カード内のIDを長押ししてコピーしてください')}
});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden&&session?.user?.id&&!document.getElementById('member').hidden)window.loadTickets();
});
if(session?.user?.id&&!document.getElementById('member').hidden)window.loadTickets();
