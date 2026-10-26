const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function setup(reduced=false){
 let pages=[],resize,motionChange,nextTimer=1;const timers=new Map();
 function element(dataset={}){const attrs={},classes=new Set(),handlers={};const node={dataset,attrs,handlers,textContent:'',focused:false,hidden:false,
  classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle:(c,on)=>on?classes.add(c):classes.delete(c)},
  setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k],addEventListener:(k,v)=>handlers[k]=v,
  contains:other=>other===node,focus(){this.focused=true},remove(){pages=pages.filter(p=>p!==node)}};return node;}
 const ids=['#nav','#menu','#slide','#slide-title','#slide-count','#slide-description','#carousel-photo','.photo-symbol','#prev','#next','#carousel-pause','.controls','.carousel'];
 const nodes=Object.fromEntries(ids.map(id=>[id,element()]));
 nodes['.controls'].querySelectorAll=()=>pages.slice();nodes['.controls'].insertBefore=b=>pages.push(b);
 const document={hidden:false,activeElement:null,documentElement:element(),querySelector:id=>nodes[id],querySelectorAll:()=>pages.slice(),createElement:()=>element(),addEventListener:(k,v)=>document[k]=v};
 const context={document,matchMedia:q=>({matches:q.includes('reduced-motion')&&reduced,addEventListener:(k,v)=>q.includes('reduced-motion')?motionChange=v:resize=v}),setInterval:(fn,ms)=>{assert.equal(ms,7000);const id=nextTimer++;timers.set(id,fn);return id;},clearInterval:id=>timers.delete(id)};
 vm.runInNewContext(readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),context);
 return {nodes,document,context,timers,resize:()=>resize(),motion:()=>motionChange({matches:true}),pages:()=>pages,tick:()=>[...timers.values()][0]?.(),click:id=>nodes[id].handlers.click()};
}
const s=setup(),{nodes,document,click}=s;
click('#menu');assert.equal(nodes['#menu'].attrs['aria-expanded'],'true');document.keydown({key:'Escape'});assert.equal(nodes['#menu'].attrs['aria-expanded'],'false');assert.ok(nodes['#menu'].focused);
click('#menu');nodes['#nav'].handlers.click({target:{closest:()=>true}});assert.equal(nodes['#menu'].attrs['aria-expanded'],'false');click('#menu');s.resize();assert.equal(nodes['#menu'].attrs['aria-expanded'],'false');
assert.equal(nodes['#slide-title'].textContent,'Mantenimiento de Áreas Verdes');assert.equal(nodes['#slide-count'].textContent,'1 de 4');assert.equal(nodes['#carousel-photo'].src,'assets/carrusel-mantenimiento-areas-verdes.png');assert.equal(s.pages().length,4);
assert.equal(s.timers.size,1);s.tick();assert.equal(nodes['#slide-count'].textContent,'2 de 4');assert.equal(nodes['#carousel-photo'].hidden,true);
click('#prev');assert.equal(nodes['#slide-count'].textContent,'1 de 4');assert.equal(s.timers.size,0);assert.equal(nodes['#carousel-photo'].hidden,false);
click('#prev');assert.equal(nodes['#slide-count'].textContent,'4 de 4');click('#next');assert.equal(nodes['#slide-count'].textContent,'1 de 4');
s.pages()[1].handlers.click();assert.equal(nodes['#slide-count'].textContent,'2 de 4');let prevented=false;nodes['.carousel'].handlers.keydown({key:'ArrowRight',preventDefault(){prevented=true}});assert.ok(prevented);assert.equal(nodes['#slide-count'].textContent,'3 de 4');assert.equal(s.pages().filter(p=>p.attrs['aria-current']==='true').length,1);
click('#carousel-pause');assert.equal(s.timers.size,1);nodes['.carousel'].handlers.mouseenter();assert.equal(s.timers.size,0);nodes['.carousel'].handlers.mouseleave();assert.equal(s.timers.size,1);document.hidden=true;document.visibilitychange();assert.equal(s.timers.size,0);document.hidden=false;document.visibilitychange();assert.equal(s.timers.size,1);s.motion();assert.equal(s.timers.size,0);
s.context.jcsCarousel([{title:'Foto A',image:'a',alt:'A',body:'Texto A'},{title:'Foto B',image:'b',alt:'B',body:'Texto B'}]);assert.equal(nodes['#slide-count'].textContent,'1 de 3');assert.equal(nodes['#carousel-photo'].src,'assets/carrusel-mantenimiento-areas-verdes.png');click('#next');assert.equal(nodes['#carousel-photo'].src,'/media/a');assert.equal(nodes['#slide-description'].textContent,'Texto A');click('#next');assert.equal(nodes['#carousel-photo'].src,'/media/b');
const quiet=setup(true);assert.equal(quiet.timers.size,0);assert.equal(quiet.nodes['#carousel-pause'].textContent,'Reanudar carrusel');
console.log('PASS menu; featured image and preserved slides; next/previous/pagination/keyboard; published photos; autoplay/pause/hover/visibility/reduced-motion (DOM simulation)');
