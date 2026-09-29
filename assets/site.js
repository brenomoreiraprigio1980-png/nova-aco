
(() => {
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav-links');
  if(menu && nav){
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? 'FECHAR' : 'MENU';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      menu.textContent = 'MENU';
    }));
  }

  const heroVideo = document.querySelector('[data-hero-video]');
  if(heroVideo){
    const source = heroVideo.querySelector('source[data-src]');
    if(source){
      source.src = source.dataset.src;
      heroVideo.load();
      const play = () => heroVideo.play().catch(() => {});
      if('IntersectionObserver' in window){
        const io = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if(entry.isIntersecting){ play(); io.disconnect(); }
          });
        },{rootMargin:'180px'});
        io.observe(heroVideo);
      } else play();
    }
  }

  const form = document.querySelector('[data-review-form]');
  if(form){
    const supabaseUrl='https://ngqjbrdeycgsxdtkjhkb.supabase.co';
    const supabaseKey='sb_publishable_i_894OQ8vswfK8i3-7vXlA_SYY0Wo91';
    const buttons=[...form.querySelectorAll('[data-rating]')];
    const status=form.querySelector('.review-status');
    const submit=form.querySelector('button[type="submit"]');
    let rating=0;
    buttons.forEach(button => button.addEventListener('click', () => {
      rating=Number(button.dataset.rating);
      buttons.forEach(b => b.classList.toggle('active',Number(b.dataset.rating)<=rating));
      status.textContent='';
      status.className='review-status';
    }));
    const mountedAt=Date.now();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data=new FormData(form);
      const name=String(data.get('name')||'').trim();
      const comment=String(data.get('comment')||'').trim();
      status.className='review-status';
      if(data.get('website') || Date.now()-mountedAt<1500) return;
      if(!rating){status.textContent='Escolha uma nota de 1 a 5.';status.classList.add('error');return}
      if(name.length<2){status.textContent='Digite seu nome.';status.classList.add('error');return}
      if(comment.length<10){status.textContent='Escreva um comentário com pelo menos 10 caracteres.';status.classList.add('error');return}
      let last=0;
      try{last=Number(localStorage.getItem('novaAcoReviewLastSubmit')||0)}catch(e){}
      if(Date.now()-last<3600000){status.textContent='Sua avaliação já foi recebida. Aguarde antes de enviar outra.';status.classList.add('error');return}
      submit.disabled=true;submit.textContent='ENVIANDO';
      try{
        const response=await fetch(supabaseUrl+'/rest/v1/site_reviews',{
          method:'POST',
          headers:{apikey:supabaseKey,'Content-Type':'application/json',Prefer:'return=minimal'},
          body:JSON.stringify({name,rating,comment})
        });
        if(!response.ok) throw new Error('review_failed');
        try{localStorage.setItem('novaAcoReviewLastSubmit',String(Date.now()))}catch(e){}
        form.reset();rating=0;buttons.forEach(b=>b.classList.remove('active'));
        status.textContent='Obrigado. Sua avaliação foi enviada.';
        status.classList.add('success');
      }catch(e){
        status.textContent='Não foi possível enviar agora. Tente novamente.';
        status.classList.add('error');
      }finally{
        submit.disabled=false;submit.textContent='ENVIAR AVALIAÇÃO';
      }
    });
  }
})();
