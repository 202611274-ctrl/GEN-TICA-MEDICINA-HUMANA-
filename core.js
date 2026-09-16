/* Lógica de estudio compartida por la interfaz y las verificaciones. Sin dependencias. */
(function(root){
  'use strict';
  const DAY=86400000, KEY='genetica-urp.v1';
  function fresh(){return {version:1,created:new Date().toISOString(),reviews:{},history:[],custom:[],overrides:{},notes:{},bookmarks:[],planDone:[],settings:{dailyGoal:15,context:true,sheetUrl:''},session:null};}
  function dayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function shuffle(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function grade(correct,selected){return correct.length===selected.length && correct.every(i=>selected.includes(i));}
  function schedule(prev={},rating,now=Date.now()){
    const before=Math.max(0,prev.interval||0); let days=0,minutes=0;
    if(rating==='again')minutes=10;
    if(rating==='hard')days=before<1?1:Math.max(1,Math.round(before*1.2));
    if(rating==='good')days=before<1?1:before<3?3:before<7?7:Math.min(90,Math.round(before*2));
    if(rating==='easy')days=before<3?3:Math.min(120,Math.round(before*2.6));
    return {...prev,interval:days,due:now+(days*DAY||minutes*60000),last:now,reps:(prev.reps||0)+1,lapses:(prev.lapses||0)+(rating==='again'?1:0),streak:rating==='again'?0:(prev.streak||0)+1,rating};
  }
  function mastered(p){return !!p && p.interval>=7 && p.streak>=2;}
  function due(p,now=Date.now()){return !!p && p.due<=now;}
  function validateQuestions(input){
    const list=Array.isArray(input)?input:input.questions;
    if(!Array.isArray(list)||!list.length)throw Error('El archivo debe contener una lista de preguntas o un objeto con questions.');
    if(list.length>5000)throw Error('Importa hasta 5000 preguntas por archivo.');
    const ids=new Set();
    return list.map((q,i)=>{
      if(!q||typeof q!=='object')throw Error(`Pregunta ${i+1}: formato incorrecto.`);
      if(typeof q.id!=='string'||!/^[\w-]{1,80}$/.test(q.id)||['__proto__','constructor','prototype'].includes(q.id))throw Error(`Pregunta ${i+1}: ID inválido; usa letras, números y guiones.`);
      if(ids.has(q.id))throw Error(`ID repetido en el archivo: ${q.id}`);ids.add(q.id);
      if(!['teoria','laboratorio'].includes(q.module))throw Error(`${q.id}: module debe ser teoria o laboratorio.`);
      if(!Number.isInteger(Number(q.week))||Number(q.week)<0||Number(q.week)>7)throw Error(`${q.id}: week debe estar entre 0 y 7.`);
      if(typeof q.stem!=='string'||!q.stem.trim()||q.stem.length>12000)throw Error(`${q.id}: falta un enunciado válido.`);
      const status=['active','pending','annex'].includes(q.status)?q.status:'active';
      const type=q.type||'single';
      if(!['single','multi','recall','pending'].includes(type))throw Error(`${q.id}: type inválido.`);
      if(type==='pending' && status!=='pending')throw Error(`${q.id}: una pregunta sin clave debe tener status pending.`);
      const options=Array.isArray(q.options)?q.options.map(String):[], correct=Array.isArray(q.correct)?q.correct:[];
      if(status!=='pending' && ['single','multi'].includes(type)){
        if(options.length<2||options.length>8||options.some(o=>!o.trim()||o.length>4000))throw Error(`${q.id}: incluye entre 2 y 8 opciones válidas.`);
        if(!correct.length||new Set(correct).size!==correct.length||correct.some(x=>!Number.isInteger(x)||x<0||x>=options.length))throw Error(`${q.id}: índices correct fuera de rango. Empiezan en 0.`);
        if(type==='single'&&correct.length!==1)throw Error(`${q.id}: single requiere exactamente una respuesta.`);
      }
      if(status!=='pending'&&type==='recall'&&!(typeof q.answer==='string'&&q.answer.trim()))throw Error(`${q.id}: falta la respuesta modelo.`);
      if(status!=='pending'&&!(typeof q.explanation==='string'&&q.explanation.trim()))throw Error(`${q.id}: añade la explicación de la respuesta.`);
      const str=k=>typeof q[k]==='string'?q[k].slice(0,15000):'';
      return {id:q.id,module:q.module,week:Number(q.week),topic:str('topic')||'Pregunta añadida',type,stem:str('stem'),options,correct,answer:str('answer')||correct.map(j=>options[j]).join(' · '),explanation:str('explanation'),trap:str('trap'),note:str('note'),source:str('source')||'Añadida por el estudiante',status,context:str('context'),reviewReason:str('reviewReason'),origin:str('origin')||'Mi banco',years:Array.isArray(q.years)?q.years.map(String):[],refs:Array.isArray(q.refs)?q.refs.filter(r=>r&&typeof r.title==='string'&&typeof r.url==='string'&&/^https:\/\//.test(r.url)).slice(0,12):[]};
    });
  }
  function csvParse(text){
    text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}else field+=c;}
    if(quoted)throw Error('CSV con comillas sin cerrar.');row.push(field);if(row.some(x=>x.trim()))rows.push(row);
    const headers=rows.shift();if(!headers)throw Error('CSV vacío.');
    return rows.map((r,i)=>{
      if(r.length!==headers.length)throw Error(`CSV fila ${i+2}: número de columnas incorrecto.`);
      const q=Object.fromEntries(headers.map((h,j)=>[h.trim(),r[j]]));
      q.week=Number(q.week);q.options=q.options?JSON.parse(q.options):[];q.correct=q.correct?JSON.parse(q.correct):[];return q;
    });
  }
  function restoreBackup(input){
    if(!input||input.app!=='genetica-urp'||input.version!==1||!input.state)throw Error('No es un respaldo compatible de Genética.');
    const s=input.state,clean=fresh();
    if(!Array.isArray(s.history)||s.history.length>100000||!s.reviews||typeof s.reviews!=='object')throw Error('Respaldo incompleto o demasiado grande.');
    clean.custom=s.custom&&s.custom.length?validateQuestions(s.custom):[];
    const entries=Object.entries(s.overrides||{});if(entries.length){for(const q of validateQuestions(entries.map(([,q])=>q)))clean.overrides[q.id]=q;}
    for(const [id,p]of Object.entries(s.reviews)){if(!/^[\w-]{1,80}$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!p||!Number.isFinite(p.due)||!Number.isFinite(p.interval)||p.interval<0)throw Error('Hay un repaso inválido en el respaldo.');clean.reviews[id]={...p};}
    clean.history=s.history.filter(h=>h&&typeof h.id==='string'&&Number.isFinite(h.at)&&typeof h.correct==='boolean').map(h=>({...h}));
    for(const [id,n]of Object.entries(s.notes||{})){if(typeof n==='string'&&/^[\w-]{1,80}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id))clean.notes[id]=n.slice(0,15000);}
    clean.bookmarks=Array.isArray(s.bookmarks)?s.bookmarks.filter(x=>typeof x==='string'):[];
    clean.planDone=Array.isArray(s.planDone)?s.planDone.filter(x=>Number.isInteger(x)&&x>=1&&x<=21):[];
    clean.settings={dailyGoal:Math.min(100,Math.max(5,Number(s.settings?.dailyGoal)||15)),context:s.settings?.context!==false,sheetUrl:typeof s.settings?.sheetUrl==='string'?s.settings.sheetUrl:''};
    clean.created=typeof s.created==='string'?s.created:clean.created;return clean;
  }
  const api={DAY,KEY,fresh,dayKey,shuffle,grade,schedule,mastered,due,validateQuestions,csvParse,restoreBackup};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.StudyCore=api;
})(typeof window==='undefined'?globalThis:window);
