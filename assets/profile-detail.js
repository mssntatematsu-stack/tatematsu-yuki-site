(async()=>{
  'use strict';
  const fallback = {"profileDetail":{"title":"プロフィール","subtitle":"立松ゆうき（たてまつ ゆうき）の経歴・資格・地域活動","sections":[{"heading":"立松ゆうき（たてまつ ゆうき）","lines":["武蔵野市生まれ、武蔵野市育ち。","学生時代は野球に打ち込み、社会人になってからは水泳指導者として、赤ちゃんから高齢者まで幅広い世代の健康づくりに携わってきました。","現在は桜堤で子育てをする一児の父。地域では消防団、スポーツ活動、商店会活動などに参加しています。"]},{"heading":"学歴","lines":["• 武蔵野市立第五小学校 卒業","• 武蔵野市立第一中学校 卒業","• 東京都立国分寺高等学校 卒業（野球部）","• 日本ウェルネススポーツ大学 中退","• 慶應義塾大学法学部 通信教育課程 在学中"]},{"heading":"職歴","lines":["【藤村水泳教室（学校法人井之頭学園）】","水泳指導者として、乳幼児から高齢者まで幅広い世代の指導に従事。","水泳技術の指導だけでなく、健康づくりや安全管理、競技力向上などに携わる。","また、広報活動や教室運営にも従事。労働組合委員長として、教室存続の道を模索し協議を行うと共に閉鎖に伴う雇用に関わる課題にも向き合った。","2026年3月、藤村水泳教室の閉鎖に伴い退職。","その後もスポーツ指導や教育・地域活動に携わる。"]},{"heading":"資格・専門分野","lines":["• 防災士","• 日本スポーツ協会公認 水泳上級教師","• 日本スポーツ協会公認 競泳コーチ3","• ITパスポート試験","専門分野：水泳指導、野球指導、健康づくり、運動習慣の形成"]},{"heading":"政治・地域活動","lines":["• 自由民主党 武蔵野総支部 青年部","• ダイナミック日本 地域の力フォーラム 幹事","• 消防団活動","• 地域運動コミュニティの運営","• 武蔵境プロギング活動","• 商店会・地域のお祭りへの参加","• 子育て世代の交流活動"]},{"heading":"大切にしていること","lines":["「現場に足を運び、自分の目で見ること」","地域の皆さんとのつながりを大切にしながら、武蔵野市の課題に向き合っていきます。"]}]}};
  let profile=fallback.profileDetail;
  try { const res=await fetch('data/08-profile-detail.json',{cache:'no-store'}); if (res.ok){const obj=await res.json();profile=obj.profileDetail ?? profile;} } catch(e) { /* local preview fallback */ }
  const root=document.getElementById('profile-full-sections');
  const toc=document.getElementById('profile-full-toc');
  document.getElementById('profile-full-title').textContent=String(profile.title ?? 'プロフィール');
  document.getElementById('profile-full-subtitle').textContent=String(profile.subtitle ?? '');
  (profile.sections ?? []).forEach((chapter,i)=>{
    const id='profile-chapter-'+(i+1);
    const section=document.createElement('section');section.id=id;section.className='message-chapter';
    const h=document.createElement('h2');h.textContent=String(chapter.heading ?? '');section.append(h);
    let ul=null;
    const flush=()=>{ if(ul){section.append(ul);ul=null;} };
    (chapter.lines ?? []).forEach(value=>{
      const text=String(value ?? '');
      if(text.startsWith('• ')){
        if(!ul){ul=document.createElement('ul');ul.className='profile-bullets';}
        const li=document.createElement('li');li.textContent=text.slice(2);ul.append(li);
      } else {
        flush();const p=document.createElement('p');p.textContent=text;
        if(text.startsWith('【')&&text.endsWith('】')){p.className='profile-employer';p.textContent=text.slice(1,-1);}
        section.append(p);
      }
    });flush();root.append(section);
    const link=document.createElement('a');link.href='#'+id;link.textContent=String(chapter.heading ?? '');toc.append(link);
  });
})();