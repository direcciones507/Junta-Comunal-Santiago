document.documentElement.classList.add('js');
const nav = document.querySelector('#nav');
const menu = document.querySelector('#menu');
function closeMenu(returnFocus = false) {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
});
matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
let page = 0;
let labels = [
  'Fotografía institucional pendiente de aprobación',
  'Fotografía de la comunidad pendiente de aprobación',
  'Fotografía de servicios pendiente de aprobación'
];
function show(index) {
  page = (index + labels.length) % labels.length;
  document.querySelector('#slide-title').textContent = labels[page];
  document.querySelector('#slide-count').textContent = `${page + 1} de ${labels.length}`;
  document.querySelectorAll('[data-page]').forEach(button => {
    const active = Number(button.dataset.page) === page;
    button.setAttribute('aria-current', String(active));
    button.setAttribute('aria-label', `Diapositiva ${Number(button.dataset.page) + 1}${active ? ', actual' : ''}`);
  });
}
document.querySelector('#prev').addEventListener('click', () => show(page - 1));
document.querySelector('#next').addEventListener('click', () => show(page + 1));
document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => show(Number(button.dataset.page)));
});
document.querySelector('.carousel').addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    show(page + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
show(0);

// Keep the approved carousel controls while loading only published snapshots.
globalThis.jcsCarousel = items => {
  if (!items.length) return;
  labels = items.map(item => item.title);
  const slide = document.querySelector('#slide');
  const photo = document.createElement('img');
  photo.id = 'carousel-photo';
  slide.prepend(photo);
  const caption = document.createElement('p');
  caption.id = 'slide-description';
  slide.append(caption);
  const symbol = slide.querySelector('.photo-symbol');
  if (symbol) symbol.hidden = true;
  const controls = document.querySelector('.controls');
  controls.querySelectorAll('[data-page]').forEach(button => button.remove());
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.dataset.page = String(index);
    button.textContent = String(index + 1);
    button.addEventListener('click', () => show(index));
    controls.insertBefore(button, document.querySelector('#next'));
  });
  const updatePhoto = () => { photo.src = '/media/' + items[page].image; photo.alt = items[page].alt; caption.textContent = items[page].body; caption.hidden = !items[page].body; };
  const originalShow = show;
  show = index => { originalShow(index); updatePhoto(); };
  show(0);
};

// A shared publication link opens its full content, including on initial navigation.
function openLinkedNews(){if(['#curso-sistemas-fotovoltaicos','#apoyo-ayuda-sona'].includes(location.hash)){const publication=document.getElementById(location.hash.slice(1));const full=publication?.querySelector('details');if(full)full.open=true;}}
if(typeof location!=='undefined'){openLinkedNews();window.addEventListener('hashchange',openLinkedNews);}
