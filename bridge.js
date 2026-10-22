/* Visible tickets in the original NUTS CLUB interface. Real account tickets are available from member.html. */
const originalRender=render;
function ticketPage(){
 return '<h1 class="h1">🎟 MY TICKETS</h1>'+
 card('MEMBER TICKETS','<p class="muted small">チケットを確認するには会員ログインしてください。</p><a class="btn" href="/member.html" style="display:inline-block;text-decoration:none">会員ログインして確認 →</a>')+
 card('TICKET INFORMATION','<p class="muted small">チケットは店舗から会員アカウントへ発行されます。未発行の場合、ログイン後も保有チケットは0枚です。</p>');
}
render=function(){
 if(page==='tickets'){page='home';originalRender();page='tickets';document.querySelector('#view').innerHTML=ticketPage()}
 else originalRender();
 const nav=document.querySelector('#nav');
 nav.style.gridTemplateColumns='repeat(6,minmax(0,1fr))';
 nav.insertAdjacentHTML('beforeend','<button class="tab '+(page==='tickets'?'active':'')+'" onclick="go(\'tickets\')"><b>🎟</b><span>TICKET</span></button>');
};
render();
