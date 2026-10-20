const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function element(dataset={}) {
 const attrs={}, classes=new Set(), handlers={};
 return {dataset,attrs,handlers,textContent:'',focused:false,
 classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),toggle:(c,on)=>on?classes.add(c):classes.delete(c)},
 setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k],addEventListener:(k,v)=>handlers[k]=v,
 focus(){this.focused=true}};
}
const ids=['#nav','#menu','#slide-title','#slide-count','#prev','#next','.carousel'];
const nodes=Object.fromEntries(ids.map(id=>[id,element()]));
const pages=[0,1,2].map(page=>element({page:String(page)}));
let resize;
const document={documentElement:element(),querySelector:id=>nodes[id],querySelectorAll:()=>pages,addEventListener:(k,v)=>document[k]=v};
vm.runInNewContext(readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),{document,matchMedia:()=>({addEventListener:(k,v)=>resize=v})});
const click=id=>nodes[id].handlers.click();
click('#menu');assert.equal(nodes['#menu'].attrs['aria-expanded'],'true');
document.keydown({key:'Escape'});assert.equal(nodes['#menu'].attrs['aria-expanded'],'false');assert.ok(nodes['#menu'].focused);
click('#menu');nodes['#nav'].handlers.click({target:{closest:()=>true}});assert.equal(nodes['#menu'].attrs['aria-expanded'],'false');
click('#menu');resize();assert.equal(nodes['#menu'].attrs['aria-expanded'],'false');
click('#prev');assert.equal(nodes['#slide-count'].textContent,'3 de 3');
click('#next');assert.equal(nodes['#slide-count'].textContent,'1 de 3');
pages[1].handlers.click();assert.equal(nodes['#slide-count'].textContent,'2 de 3');assert.equal(pages[1].attrs['aria-current'],'true');
let prevented=false;nodes['.carousel'].handlers.keydown({key:'ArrowRight',preventDefault(){prevented=true}});assert.ok(prevented);assert.equal(nodes['#slide-count'].textContent,'3 de 3');
assert.equal(pages.filter(p=>p.attrs['aria-current']==='true').length,1);
console.log('PASS menu toggle/Escape/link/resize, carousel wrap/pagination/keyboard/current state (DOM simulation, not browser rendering)');
