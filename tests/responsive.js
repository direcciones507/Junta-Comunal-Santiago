for(const button of document.querySelectorAll('button[data-width]'))button.onclick=()=>document.querySelector('iframe').width=button.dataset.width;
