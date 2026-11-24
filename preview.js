'use strict';
const byId = id => document.getElementById(id);
const formats = {split:'split',foco:'vertical',vertical:'vertical',blur:'blur',original:'original'};
let format = 'split', period = 30, elapsed = 0, count = 0, timer;
const official = 'https://github.com/gabrielworkspace/cortador-automatico';
function video(type, controls = true) {
  const v = document.createElement('video');
  v.src = 'formato-' + formats[type] + '.mp4';
  v.controls = controls; v.loop = true; v.muted = true; v.playsInline = true;
  v.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;border-radius:10px';
  return v;
}
function group(id, attr, initial, changed) {
  const buttons = [...byId(id).querySelectorAll('button')];
  function choose(value) {
    buttons.forEach(b => b.setAttribute('aria-pressed', b.getAttribute(attr) === value));
    changed(value);
  }
  buttons.forEach(b => b.onclick = () => choose(b.getAttribute(attr)));
  choose(initial);
}
function renderFrame() {
  if (byId('avPreparo').hidden) return;
  const target = byId('lugarEditorAoVivo');
  const player = video(format);
  player.style.maxHeight = '300px';
  target.replaceChildren(player);
}
group('avFormatos','data-av-formato','split', value => { format=value; renderFrame(); });
group('avDuracoes','data-av-dur','30', value => byId('avDuracoes').dataset.seconds=value);
group('avSens','data-av-sens','media', value => byId('avSens').dataset.level=value);
group('avClipDur','data-av-clip','30', value => period=Number(value));
byId('avAuto').checked=true; byId('avLerChat').checked=true;
function prepare() {
  byId('avPreparo').hidden=false;
  byId('avPrepCanal').textContent='Gravação de exemplo';
  byId('avPrepInfo').textContent='Confira o formato e comece a clipar.';
  byId('avEditorDica').textContent='Escolha um formato acima para comparar o enquadramento.';
  renderFrame();
  byId('avPreparo').scrollIntoView({block:'center'});
}
byId('btnAvComecar').onclick=prepare;
byId('btnAvCancelar').onclick=()=>location.reload();
byId('btnAvAjustar').onclick=()=>{clearInterval(timer);byId('avPainel').hidden=true;byId('avConfig').hidden=false;prepare();};
byId('btnAvParar').onclick=()=>{clearInterval(timer);byId('avEstado').textContent='PARADO';byId('btnClipar').disabled=true;byId('avQuadroPlayer')?.pause();};
function cut(auto=false) {
  if (byId('avPainel').hidden || byId('btnClipar').disabled) return;
  const card=document.createElement('article');
  card.className='cartao'; card.style.maxWidth='420px';
  const title=document.createElement('h3');
  title.textContent='Clipe '+(++count)+' · Gameplay';
  const info=document.createElement('p');
  info.textContent=(auto?'Automático':'Manual')+' · Exemplo de saída · #gameplay #shorts';
  const player=video(format);player.loop=false;player.style.maxHeight='260px';
  const save=document.createElement('a');save.href=player.src;save.download='exemplo-'+count+'.mp4';save.textContent='Baixar vídeo de exemplo';save.className='btn p';
  card.append(title,info,player,save);byId('avClipes').prepend(card);
  byId('avQtd').textContent=count;byId('avLog').textContent='Exemplo '+count+' criado. Janela configurada: '+(auto?byId('avDuracoes').dataset.seconds:period)+' s.';
}
byId('btnClipar').onclick=()=>cut();
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='c' && !e.repeat && !e.target.matches('input,textarea'))cut();});
byId('btnAvPasta').textContent='Ver clipes';byId('btnAvPasta').onclick=()=>byId('avClipes').scrollIntoView();
byId('btnAvClipar1').onclick=()=>{
  byId('avConfig').hidden=true;byId('avPainel').hidden=false;byId('btnClipar').disabled=false;
  byId('avEstado').textContent='EXEMPLO';byId('avCanal').textContent='Gameplay';byId('avTitulo').textContent='Gravação de demonstração';
  byId('avAuto2').checked=byId('avAuto').checked;byId('avChat').textContent='simulado';
  byId('avAutoTxt').textContent=document.querySelector('#avSens [aria-pressed=true]').textContent;
  const source=video('original');source.id='avQuadroPlayer';document.querySelector('.av-quadro').replaceChildren(source);source.play().catch(()=>{});
  const preview=video(format,false);preview.style.cssText+=';width:80px;height:130px';byId('avPrevia').replaceWith(preview);preview.id='avPrevia';preview.play().catch(()=>{});
  byId('avLog').textContent='Demonstração iniciada.';window.scrollTo(0,0);clearInterval(timer);
  timer=setInterval(()=>{elapsed++;byId('avTempo').textContent=Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0');
    const level=(Math.sin(elapsed*.65)+1)*42+8;byId('avTermo').style.width=level+'%';byId('avVol').textContent=Math.round(level)+'%';
    if(elapsed%Number(byId('avDuracoes').dataset.seconds)===0 && byId('avAuto2').checked)cut(true);
  },1000);
};
byId('formLinkTopo').onsubmit=e=>{e.preventDefault();byId('avUrl').value=byId('linkTopo').value;prepare();};
const tabs=document.querySelectorAll('[data-modo-corte]');
tabs.forEach(b=>b.setAttribute('aria-pressed',b.dataset.modoCorte==='aovivo'));
tabs[0].onclick=()=>showInfo('Vídeo gravado','A análise de vídeos e arquivos usa o programa local.');
tabs[1].onclick=()=>byId('aovivo').scrollIntoView();
function showInfo(title,body) {
  const dlg=document.createElement('dialog');dlg.className='cartao';dlg.style.cssText='margin:auto;color:inherit;max-width:420px;padding:24px';
  const h=document.createElement('h2');h.textContent=title;
  const p=document.createElement('p');p.textContent=body;p.style.margin='12px 0';
  const link=document.createElement('a');link.href='programa-original.zip';link.download='programa-original.zip';link.textContent='Baixar código do programa';link.className='btn';
  const close=document.createElement('button');close.className='btn';close.textContent='Fechar';close.onclick=()=>dlg.close();dlg.onclose=()=>dlg.remove();
  dlg.append(h,p,link,close);document.body.append(dlg);dlg.showModal();
}
byId('btnProjetos').onclick=()=>{if(count)byId('avClipes').scrollIntoView();else showInfo('Projetos','Os clipes de exemplo aparecem aqui durante a sessão.');};
byId('btnAjustes').onclick=()=>showInfo('Sobre esta prévia','Interface baseada no projeto de Gabriel Workspace. Para conectar uma live real e processar os cortes no seu PC, use o programa local.');
lucide.createIcons();
