(function(){'use strict';
function e(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x}
function score(v){const n=Number(v)||0;return (n>0?'+':'')+n.toLocaleString('ja-JP')+' 点'}
window.nutsRenderLuxuryRanking=function(rows,host){
const existing=host.querySelector('button');host.replaceChildren();
const scene=e('div','nuts-rank-scene');
const heading=e('div','nuts-rank-heading');heading.append(e('div','nuts-rank-brand','♠ NUTS CLUB'),e('h2','', 'MONTHLY RANKING'),e('p','', '月間チップ増加ランキング'));
const d=new Date();const japan=new Date(d.toLocaleString('en-US',{timeZone:'Asia/Tokyo'}));if(japan.getDate()===1&&japan.getHours()<6)japan.setMonth(japan.getMonth()-1);
heading.append(e('div','nuts-rank-month',japan.getFullYear()+'年'+(japan.getMonth()+1)+'月'));scene.append(heading);
const podium=e('div','nuts-rank-podium');
const positions=[{i:1,label:'2nd',cls:'silver',icon:'♛'},{i:0,label:'1st',cls:'gold',icon:'♛'},{i:2,label:'3rd',cls:'bronze',icon:'♛'}];
for(const p of positions){const r=rows[p.i];const block=e('div','nuts-rank-place '+p.cls+(r?'':' empty'));block.append(e('div','nuts-rank-crown',r?p.icon:'◇'));const portrait=e('div','nuts-rank-avatar',r?'♠':'—');block.append(portrait,e('div','nuts-rank-person',r?String(r.display_name||'MEMBER'):'---'),e('div','nuts-rank-score',r?score(r.monthly_change):'—'));block.append(e('div','nuts-rank-step',p.label));podium.append(block)}
scene.append(podium);
const table=e('div','nuts-rank-table');const head=e('div','nuts-rank-table-head');head.append(e('span','','順位'),e('span','','会員名'),e('span','','増加チップ数'));table.append(head);
rows.slice(3).forEach((r,j)=>{const line=e('div','nuts-rank-line');line.append(e('span','nuts-rank-number',String(j+4)),e('span','nuts-rank-user','♠  '+String(r.display_name||'MEMBER')),e('span','nuts-rank-value',score(r.monthly_change)));table.append(line)});
if(!rows.length)table.append(e('p','nuts-rank-empty','今月のランキング参加者はまだいません'));
else if(rows.length<=3)table.append(e('p','nuts-rank-empty','4位以降の参加者はまだいません'));
scene.append(table);host.append(scene);
const footer=e('div','nuts-rank-footer');footer.append(e('p','','先月末からの預かりチップ増減で集計 · 毎月1日 6:00更新'));if(existing){existing.classList.add('nuts-rank-settings');footer.append(existing)}host.append(footer)
};
})();