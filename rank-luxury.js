(function(){'use strict';
function e(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x}
function score(v){const n=Number(v)||0;return (n>0?'+':'')+n.toLocaleString('ja-JP')+' 点'}
window.nutsRenderLuxuryRanking=function(rows,host){
const existing=host.querySelector('button');host.replaceChildren();
const scene=e('div','nuts-rank-scene');
const heading=e('div','nuts-rank-heading');heading.append(e('div','nuts-rank-brand','♠ NUTS CLUB'),e('h2','', 'MONTHLY RANKING'),e('p','', '月間チップ増加ランキング'));
const d=new Date();const japan=new Date(d.toLocaleString('en-US',{timeZone:'Asia/Tokyo'}));if(japan.getDate()===1&&japan.getHours()<6)japan.setMonth(japan.getMonth()-1);
heading.append(e('div','nuts-rank-month',japan.getFullYear()+'年'+(japan.getMonth()+1)+'月'));scene.append(heading);
const podium=e('div','nuts-rank-showcase');const champion=rows[0];const hero=e('div','nuts-rank-champion');hero.append(e('div','nuts-rank-champion-eyebrow','♛  THE MONTHLY CHAMPION  ♛'),e('div','nuts-rank-champion-medal','Ⅰ'),e('div','nuts-rank-champion-name',champion?String(champion.display_name||'MEMBER'):'NO CHAMPION YET'),e('div','nuts-rank-champion-score',champion?score(champion.monthly_change):'—'),e('div','nuts-rank-champion-caption','MONTHLY CHIP GROWTH'));podium.append(hero);const runners=e('div','nuts-rank-runners');for(const [i,medal,label] of [[1,'Ⅱ','SILVER'],[2,'Ⅲ','BRONZE']]){const r=rows[i],card=e('div','nuts-rank-runner '+label.toLowerCase());card.append(e('span','nuts-rank-runner-label',label+' / '+(i+1)+'位'),e('div','nuts-rank-runner-medal',medal),e('strong','nuts-rank-runner-name',r?String(r.display_name||'MEMBER'):'---'),e('div','nuts-rank-runner-score',r?score(r.monthly_change):'—'));runners.append(card)}podium.append(runners);scene.append(podium);
const table=e('div','nuts-rank-table');const head=e('div','nuts-rank-table-head');head.append(e('span','','順位'),e('span','','会員名'),e('span','','増加チップ数'));table.append(head);
rows.slice(3).forEach((r,j)=>{const line=e('div','nuts-rank-line');line.append(e('span','nuts-rank-number',String(j+4)),e('span','nuts-rank-user','♠  '+String(r.display_name||'MEMBER')),e('span','nuts-rank-value',score(r.monthly_change)));table.append(line)});
if(!rows.length)table.append(e('p','nuts-rank-empty','今月のランキング参加者はまだいません'));
else if(rows.length<=3)table.append(e('p','nuts-rank-empty','4位以降の参加者はまだいません'));
scene.append(table);host.append(scene);
const footer=e('div','nuts-rank-footer');footer.append(e('p','','先月末からの預かりチップ増減で集計 · 毎月1日 6:00更新'));if(existing){existing.classList.add('nuts-rank-settings');footer.append(existing)}host.append(footer)
};
})();