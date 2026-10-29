(async()=>{
  'use strict';
  const fallback=window.TATEMATSU_CONTENT?.message ?? {};
  let content=fallback;
  try { const res=await fetch('data/07-message.json', {cache:'no-store'}); if(res.ok){const v=await res.json(); content=v.message ?? fallback;} } catch (e) { /* file:// preview uses bundled fallback */ }
  const root=document.getElementById('full-message-sections');
  const toc=document.getElementById('message-toc');
  document.getElementById('full-message-title').textContent=String(content.title ?? '私の想い');
  (content.sections??[]).forEach((section,i)=>{
    const id='section-'+(i+1);
    const item=document.createElement('section'); item.id=id; item.className='message-chapter';
    const heading=document.createElement('h2'); heading.textContent=String(section.heading??''); item.append(heading);
    (section.paragraphs??[]).forEach(text=>{const p=document.createElement('p');p.textContent=String(text);item.append(p);});
    root.append(item);
    const link=document.createElement('a');link.href='#'+id;link.textContent=String(section.heading??'');toc.append(link);
  });
})();