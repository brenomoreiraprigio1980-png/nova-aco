(() => {
  document.documentElement.classList.add('js');
  const WA = '5511984531598';

  /* Menu mobile */
  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav-links');
  if(menu && nav){
    const label = menu.querySelector('span');
    const setOpen = open => {
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      if(label) label.textContent = open ? 'Fechar' : 'Menu';
    };
    menu.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') setOpen(false); });
  }

  /* Cabeçalho com sombra ao rolar */
  const header = document.querySelector('[data-header]');
  if(header){
    const setH = () => document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    setH(); window.addEventListener('resize', setH);
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* Vídeo do topo carregado sob demanda */
  const heroVideo = document.querySelector('[data-hero-video]');
  if(heroVideo){
    const source = heroVideo.querySelector('source[data-src]');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(source && !reduce){
      source.src = source.dataset.src;
      heroVideo.load();
      const play = () => heroVideo.play().catch(() => {});
      if('IntersectionObserver' in window){
        const io = new IntersectionObserver(entries => {
          entries.forEach(entry => { if(entry.isIntersecting){ play(); io.disconnect(); } });
        },{rootMargin:'180px'});
        io.observe(heroVideo);
      } else play();
    }
  }

  /* Animação de entrada */
  document.querySelectorAll('.stagger').forEach(g => [...g.children].forEach((el,i) => el.style.setProperty('--i', i % 8)));
  const reveals = document.querySelectorAll('.reveal, .stagger > .tile');
  if('IntersectionObserver' in window){
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); } });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    reveals.forEach(el => ro.observe(el));
  } else reveals.forEach(el => el.classList.add('in'));

  /* Carrossel de avaliações */
  document.querySelectorAll('[data-carousel]').forEach(track => {
    const section = track.closest('section');
    const step = () => {
      const card = track.querySelector('.review');
      return card ? card.getBoundingClientRect().width + 22 : track.clientWidth;
    };
    section.querySelector('[data-carousel-prev]')?.addEventListener('click', () => track.scrollBy({left:-step(),behavior:'smooth'}));
    section.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
      const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({left:end ? 0 : track.scrollLeft + step(),behavior:'smooth'});
    });
  });

  /* Galeria de fotos dos produtos */
  document.querySelectorAll('[data-gallery]').forEach(g => {
    const main = g.querySelector('[data-gallery-main]');
    const thumbs = g.querySelectorAll('[data-thumb]');
    thumbs.forEach(t => t.addEventListener('click', () => {
      thumbs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      main.style.opacity = '.3';
      const img = new Image();
      img.onload = () => {
        main.srcset = t.dataset.srcset; main.src = t.dataset.src; main.alt = t.dataset.alt;
        main.style.opacity = '1';
      };
      img.src = t.dataset.src;
    }));
  });

  /* Navegação por produto: destaca o item visível */
  const chipNav = document.querySelector('[data-chip-nav]');
  if(chipNav && 'IntersectionObserver' in window){
    const links = [...chipNav.querySelectorAll('a')];
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(!e.isIntersecting) return;
        const a = map.get(e.target.id);
        if(!a) return;
        links.forEach(l => l.classList.remove('active'));
        a.classList.add('active');
        const box = a.parentElement;
        const left = a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2;
        box.scrollTo({left:Math.max(0,left),behavior:'smooth'});
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    map.forEach((_, id) => { const el = document.getElementById(id); if(el) io.observe(el); });
  }

  /* Orçamento rápido: monta a mensagem e abre o WhatsApp */
  document.querySelectorAll('[data-quote-form]').forEach(form => {
    const status = form.querySelector('.quote-status');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const nome = String(d.get('nome') || '').trim();
      const cidade = String(d.get('cidade') || '').trim();
      const itens = d.getAll('itens');
      const detalhes = String(d.get('detalhes') || '').trim();
      status.className = 'quote-status';
      if(nome.length < 2){ status.textContent = 'Digite seu nome.'; status.classList.add('error'); form.nome.focus(); return; }
      if(!cidade){ status.textContent = 'Selecione a cidade da obra.'; status.classList.add('error'); form.cidade.focus(); return; }
      status.textContent = '';
      let msg = `Olá Nova Aço! Meu nome é ${nome}. Gostaria de solicitar um orçamento.\n\nCidade da obra: ${cidade}`;
      if(itens.length) msg += `\nPreciso de: ${itens.join(', ')}`;
      if(detalhes) msg += `\nDetalhes: ${detalhes}`;
      msg += '\n\nVou enviar o projeto ou a lista de ferros em seguida.';
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  });

  /* Formulário de avaliação (Supabase) - lógica original preservada */
  const form = document.querySelector('[data-review-form]');
  if(form){
    const supabaseUrl='https://ngqjbrdeycgsxdtkjhkb.supabase.co';
    const supabaseKey='sb_publishable_i_894OQ8vswfK8i3-7vXlA_SYY0Wo91';
    const buttons=[...form.querySelectorAll('[data-rating]')];
    const status=form.querySelector('.review-status');
    const submit=form.querySelector('button[type="submit"]');
    const submitLabel=submit.textContent;
    let rating=0;
    buttons.forEach(button => button.addEventListener('click', () => {
      rating=Number(button.dataset.rating);
      buttons.forEach(b => {
        const on=Number(b.dataset.rating)<=rating;
        b.classList.toggle('active',on);
        b.setAttribute('aria-pressed',String(Number(b.dataset.rating)===rating));
      });
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
      submit.disabled=true;submit.textContent='Enviando...';
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
        submit.disabled=false;submit.textContent=submitLabel;
      }
    });
  }
})();
