/* ============ COUNTDOWN ============ */
(function(){
  // total seconds: 29:43 = 1783
  let total = 29*60 + 43;
  const cdMin = document.getElementById('cdMin');
  const cdSec = document.getElementById('cdSec');
  const topTimer = document.getElementById('topTimer');

  function fmt(n){return String(n).padStart(2,'0')}

  function tick(){
    if(total <= 0){
      // reset back to 29:43 to keep urgency feel
      total = 29*60 + 43;
    }
    const m = Math.floor(total/60);
    const s = total % 60;
    if(cdMin) cdMin.textContent = fmt(m);
    if(cdSec) cdSec.textContent = fmt(s);
    if(topTimer) topTimer.textContent = fmt(m) + ':' + fmt(s);
    total--;
  }
  tick();
  setInterval(tick, 1000);
})();

/* carrossel agora é puro CSS marquee , sem JS necessário */

/* CTAs do checkout: deixar passar (links wiapy reais)
   Marca sessionStorage pra exit-intent saber que o user clicou */
document.querySelectorAll('[data-plan]').forEach(a=>{
  a.addEventListener('click',()=>{
    try { sessionStorage.setItem('clickedCheckout','1'); } catch(_){}
  });
});

/* Smooth scroll para âncoras internas (#premium, #pricing, etc.)
   IMPORTANTE: usa replaceState pra NÃO empilhar nada no history.
   Sem isso, no mobile o "voltar" acharia que o user tá saindo do site
   quando na verdade só rolou pra outra seção. */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var href = a.getAttribute('href');
    if(!href || href === '#') return;
    var target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:'smooth', block:'start'});
    // Atualiza URL sem polluir history stack
    try { history.replaceState(history.state, '', href); } catch(_){}
  });
});

/* ============ EXIT-INTENT MODAL ============ */
(function(){
  var modal = document.getElementById('exitModal');
  if(!modal) return;
  var closeBtn = modal.querySelector('.exit-close');
  var nopeBtn  = modal.querySelector('.exit-nope');
  var KEY = 'exitShown';

  function alreadyFired(){
    try { return sessionStorage.getItem(KEY) === '1'; } catch(_){ return false; }
  }
  function alreadyClicked(){
    try { return sessionStorage.getItem('clickedCheckout') === '1'; } catch(_){ return false; }
  }
  function open(){
    if(alreadyFired() || alreadyClicked()) return;
    try { sessionStorage.setItem(KEY,'1'); } catch(_){}
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  closeBtn && closeBtn.addEventListener('click', close);
  nopeBtn  && nopeBtn.addEventListener('click', function(e){ e.preventDefault(); close(); });
  modal.addEventListener('click', function(e){ if(e.target === modal) close(); });

  /* ----- DESKTOP: mouse saindo pela parte de cima da viewport (rumo à barra do browser) ----- */
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if(!isTouch){
    document.addEventListener('mouseleave', function(e){
      // Só conta saída pelo TOPO da viewport (rumo à address bar / botão X)
      // não conta sair pelos lados/baixo
      if(e.clientY <= 0){
        // pequena espera de 200ms — se voltar rápido (cursor flicker), cancela
        setTimeout(function(){
          if(!modal.classList.contains('open')) open();
        }, 200);
      }
    });
  }

  /* ----- MOBILE: intercepta o botão "voltar" real do navegador ----- */
  // Padrão pushState: empilhamos um estado extra ao carregar.
  // Quando user pressiona "voltar", popstate dispara — abrimos modal em vez de sair.
  if(isTouch){
    try {
      // Empilha estado dummy. O próximo "voltar" volta pra esse estado em vez de sair.
      history.pushState({exitTrap:true}, '', location.href);
      window.addEventListener('popstate', function(){
        if(alreadyFired() || alreadyClicked()) return;
        open();
        // Re-empilha pra futuras tentativas (caso fecharem o modal e tentarem voltar de novo)
        history.pushState({exitTrap:true}, '', location.href);
      });
    } catch(_){}
  }

  /* tecla ESC fecha */
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal.classList.contains('open')) close();
  });
})();
