const products = window.PRICEPILOT_PRODUCTS || [];
const $ = (id) => document.getElementById(id);
let currentFilter = 'all';
function money(n){return '$' + Number(n).toLocaleString();}
function productText(p){return `${p.name} ${p.brand} ${p.category} ${p.bestFor} ${p.price} ${p.ram} ${p.storage} ${p.processor}`.toLowerCase();}
function getFiltered(){
  const q = ($('searchInput')?.value || '').toLowerCase().trim();
  let list = products.filter(p => currentFilter === 'all' || p.category.includes(currentFilter));
  if(q){
    const under = q.match(/under\s*\$?(\d+)/);
    if(under) list = list.filter(p => p.price <= Number(under[1]));
    list = list.filter(p => productText(p).includes(q) || (under && p.price <= Number(under[1])));
  }
  const sort = $('sortSelect')?.value || 'score';
  return list.sort((a,b)=> sort==='priceLow'?a.price-b.price:sort==='priceHigh'?b.price-a.price:sort==='rating'?b.rating-a.rating:b.score-a.score);
}
function render(){
  const list = getFiltered();
  $('productCount').textContent = products.length;
  $('productGrid').innerHTML = list.map(p => `<article class="card"><div class="badge">${p.badge}</div><h3>${p.name}</h3><p>${p.summary}</p><div class="price">${money(p.price)}</div><ul><li>${p.bestFor}</li><li>${p.ram} RAM · ${p.storage}</li><li>${p.processor}</li><li>${p.store}</li></ul><a class="buy" href="${p.link}" target="_blank" rel="nofollow sponsored noopener">Check prices</a></article>`).join('');
  $('compareRows').innerHTML = list.map(p => `<tr><td>${p.name}</td><td>${p.bestFor}</td><td>${money(p.price)}</td><td>${p.ram}</td><td>${p.storage}</td><td>${p.score}</td></tr>`).join('');
  $('emptyState').classList.toggle('hidden', list.length > 0);
  const top = [...products].sort((a,b)=>b.score-a.score)[0];
  if(top){$('topPickName').textContent = top.name; $('topPickSummary').textContent = top.summary; $('topPickScore').textContent = `${top.score}/100 value score`;}
}
function init(){
  $('year').textContent = new Date().getFullYear();
  $('searchInput').addEventListener('input', render);
  $('sortSelect').addEventListener('change', render);
  $('clearBtn').addEventListener('click', ()=>{$('searchInput').value=''; currentFilter='all'; document.querySelectorAll('.filters button').forEach(b=>b.classList.toggle('active', b.dataset.filter==='all')); render();});
  document.querySelectorAll('.filters button').forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render();}));
  render();
}
document.addEventListener('DOMContentLoaded', init);
