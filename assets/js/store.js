const products = [
  { id: 1, name: 'Minimal 02', category: 'Relojes', price: 349, badge: 'NUEVO', kind: 'watch', image: 'img/store/minimal-watch.jpg', bg: '#d8d2c8', accent: '#e95d2a', code: 'NM-W02', description: 'Caja de acero mate, cristal mineral y una esfera sin distracciones. Resistente al agua hasta 5 ATM.', colors: ['#d9d5cc', '#222321', '#8f7059'] },
  { id: 2, name: 'Studio Air', category: 'Audio', price: 429, badge: 'MÁS ELEGIDO', kind: 'audio', image: 'img/store/studio-headphones.jpg', bg: '#dfe4df', accent: '#789080', code: 'NM-A11', description: 'Audio equilibrado, cancelación pasiva y almohadillas suaves para sesiones largas sin fatiga.', colors: ['#20211f', '#dedbd2', '#756a5f'] },
  { id: 3, name: 'Transit Pack', category: 'Accesorios', price: 219, badge: '', kind: 'bag', image: 'img/store/transit-backpack.jpg', bg: '#dfd0c0', accent: '#ba7b4f', code: 'NM-B07', description: 'Mochila compacta con espacio para laptop de 15 pulgadas y organización interior discreta.', colors: ['#654835', '#1d2923', '#c7baa7'] },
  { id: 4, name: 'Classic 01', category: 'Relojes', price: 299, badge: 'ÚLTIMAS PIEZAS', kind: 'watch', image: 'img/store/classic-watch.jpg', bg: '#d7d9d4', accent: '#66766b', code: 'NM-W01', description: 'Perfil delgado, correa intercambiable y una lectura clara inspirada en instrumentos clásicos.', colors: ['#c8c4bb', '#1d1e1c', '#6f4c38'] },
  { id: 5, name: 'Pocket Sound', category: 'Audio', price: 189, badge: 'EDICIÓN 06', kind: 'speaker', image: 'img/store/pocket-speaker.jpg', bg: '#d8cec2', accent: '#da793f', code: 'NM-S06', description: 'Parlante portátil de sonido cálido, doce horas de autonomía y cuerpo resistente a salpicaduras.', colors: ['#252622', '#d46e38', '#d4cabe'] },
  { id: 6, name: 'Fold Wallet', category: 'Accesorios', price: 129, badge: '', kind: 'wallet', image: 'img/store/fold-wallet.jpg', bg: '#ced8d0', accent: '#516b5a', code: 'NM-L03', description: 'Billetera delgada en cuero vegetal con cuatro espacios y cierre magnético invisible.', colors: ['#24382e', '#784e37', '#171715'] }
];

const STORAGE_KEY = 'nomada-store-demo-v1';
const defaultState = { cart: [], favorites: [], promo: false };
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && Array.isArray(saved.cart) ? { ...defaultState, ...saved } : { ...defaultState, cart: [], favorites: [] };
  } catch { return { ...defaultState, cart: [], favorites: [] }; }
}

let state = loadState();
let currentCategory = 'all';
let activeProductId = 1;
const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function notify(message) {
  const toast = $('#storeToast');
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function findProduct(productId) { return products.find(product => product.id === Number(productId)); }
function cartSubtotal() { return state.cart.reduce((sum, item) => sum + findProduct(item.id).price * item.quantity, 0); }
function cartTotals(delivery = 'standard') {
  const subtotal = cartSubtotal();
  const discount = state.promo ? subtotal * .1 : 0;
  const shipping = delivery === 'pickup' || subtotal >= 500 || subtotal === 0 ? 0 : 18;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
function lockBody() { document.body.classList.add('locked'); }
function unlockBodyIfClear() {
  if (!$('.cart.open') && !$('.favorites-drawer.open') && !$('.search-panel.open') && !$('.checkout-modal.open')) document.body.classList.remove('locked');
}
function openBackdrop() { $('#backdrop').classList.add('open'); lockBody(); }
function closePanels() {
  $('#cart').classList.remove('open'); $('#favoritesDrawer').classList.remove('open'); $('#searchPanel').classList.remove('open'); $('#mainNav').classList.remove('open');
  $('#cart').setAttribute('aria-hidden', 'true'); $('#favoritesDrawer').setAttribute('aria-hidden', 'true'); $('#searchPanel').setAttribute('aria-hidden', 'true');
  $('#backdrop').classList.remove('open'); unlockBodyIfClear();
}

function renderProducts() {
  const query = $('#storeSearch').value.trim().toLowerCase();
  const sort = $('#sortProducts').value;
  let result = products.filter(product => (currentCategory === 'all' || product.category === currentCategory) && `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query));
  if (sort === 'low') result.sort((a, b) => a.price - b.price);
  if (sort === 'high') result.sort((a, b) => b.price - a.price);
  if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
  $('#resultCount').textContent = `${result.length} ${result.length === 1 ? 'producto' : 'productos'}`;
  $('#productGrid').dataset.count = result.length;
  $('#productGrid').innerHTML = result.length ? result.map((product, index) => `<article class="product" data-kind="${product.kind}"><div class="product-visual">${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}<button class="favorite-button ${state.favorites.includes(product.id) ? 'active' : ''}" data-favorite="${product.id}" aria-label="${state.favorites.includes(product.id) ? 'Quitar' : 'Guardar'} ${product.name}">${state.favorites.includes(product.id) ? '♥' : '♡'}</button><img class="product-photo" src="${product.image}" alt="Fotografía de ${product.name}" loading="lazy"><button class="quick-view" data-quick-view="${product.id}">VER DETALLES</button></div><div class="product-info"><div><span>${product.category.toUpperCase()} / ${String(index + 1).padStart(2, '0')}</span><span>${product.code}</span></div><h3>${product.name}</h3><p>${product.description}</p><div class="product-footer"><strong>${money.format(product.price)}</strong><button data-add="${product.id}">Agregar +</button></div></div></article>`).join('') : '<div class="empty-products">No encontramos una pieza con esos criterios.</div>';
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totals = cartTotals();
  $('#cartCount').textContent = count; $('#cartTitleCount').textContent = `(${count})`;
  $('#cartItems').innerHTML = state.cart.length ? state.cart.map(item => { const product = findProduct(item.id); return `<article class="cart-item"><div class="cart-item-art"><img src="${product.image}" alt=""></div><div><b>${product.name}</b><small>${money.format(product.price)} · ${product.category}</small></div><div class="qty-control"><button data-quantity="${product.id}" data-change="-1" aria-label="Restar uno">−</button><span>${item.quantity}</span><button data-quantity="${product.id}" data-change="1" aria-label="Sumar uno">+</button></div></article>`; }).join('') : '<div class="cart-empty">Tu bolsa está vacía.<br>Elige una pieza de la colección.</div>';
  $('#cartSubtotal').textContent = money.format(totals.subtotal);
  $('#discountRow').hidden = !state.promo; $('#cartDiscount').textContent = `− ${money.format(totals.discount)}`;
  $('#shippingCost').textContent = totals.shipping ? money.format(totals.shipping) : 'Gratis';
  $('#cartTotal').textContent = money.format(totals.total); $('#checkout').disabled = !state.cart.length;
  const percent = Math.min(100, totals.subtotal / 500 * 100);
  $('#shippingBar').style.width = `${percent}%`; $('#shippingPercent').textContent = `${Math.round(percent)}%`;
  $('#shippingMessage').textContent = totals.subtotal >= 500 ? 'Tu envío ahora es gratuito.' : totals.subtotal ? `Te faltan ${money.format(500 - totals.subtotal)} para envío gratis.` : 'Agrega productos para obtener envío gratis.';
}

function renderFavorites() {
  $('#favoriteCount').textContent = state.favorites.length;
  const favorites = state.favorites.map(findProduct).filter(Boolean);
  $('#favoriteItems').innerHTML = favorites.length ? favorites.map(product => `<article class="favorite-item"><span><img src="${product.image}" alt=""></span><div><b>${product.name}</b><small>${money.format(product.price)}</small></div><button data-favorite-add="${product.id}">Agregar</button></article>`).join('') : '<div class="cart-empty">Aún no guardaste favoritos.<br>Usa el corazón de cada producto.</div>';
}
function renderAll() { renderProducts(); renderCart(); renderFavorites(); }

function setCategory(category) {
  currentCategory = category;
  $$('#categoryTabs [data-category]').forEach(button => button.classList.toggle('active', button.dataset.category === category));
  renderProducts(); document.querySelector('#catalogo').scrollIntoView({ behavior: 'smooth' }); closePanels();
}
function addToCart(productId, open = false) {
  const product = findProduct(productId); if (!product) return;
  const existing = state.cart.find(item => item.id === product.id);
  if (existing) existing.quantity += 1; else state.cart.push({ id: product.id, quantity: 1 });
  save(); renderCart(); notify(`${product.name} se agregó a tu bolsa.`); if (open) openCart();
}
function toggleFavorite(productId) {
  const product = findProduct(productId); if (!product) return;
  if (state.favorites.includes(product.id)) { state.favorites = state.favorites.filter(id => id !== product.id); notify(`${product.name} se quitó de favoritos.`); }
  else { state.favorites.push(product.id); notify(`${product.name} se guardó en favoritos.`); }
  save(); renderProducts(); renderFavorites(); updateDialogFavorite();
}
function openCart() { closePanels(); $('#cart').classList.add('open'); $('#cart').setAttribute('aria-hidden', 'false'); openBackdrop(); }
function openFavorites() { closePanels(); renderFavorites(); $('#favoritesDrawer').classList.add('open'); $('#favoritesDrawer').setAttribute('aria-hidden', 'false'); openBackdrop(); }
function openSearch() { closePanels(); $('#searchPanel').classList.add('open'); $('#searchPanel').setAttribute('aria-hidden', 'false'); openBackdrop(); setTimeout(() => $('#globalSearch').focus(), 200); }

function openProduct(productId) {
  const product = findProduct(productId); if (!product) return;
  activeProductId = product.id;
  $('#dialogArt').style.setProperty('--dialog-bg', product.bg); $('#dialogArt').dataset.kind = product.kind;
  $('#dialogArt').innerHTML = `<img src="${product.image}" alt="Fotografía ampliada de ${product.name}">`;
  $('#dialogCategory').textContent = `${product.category.toUpperCase()} / ${product.code}`;
  $('#dialogName').textContent = product.name; $('#dialogPrice').textContent = money.format(product.price); $('#dialogDescription').textContent = product.description;
  $('#dialogColors').innerHTML = product.colors.map((color, index) => `<button class="${index === 0 ? 'active' : ''}" style="--color:${color}" aria-label="Seleccionar acabado ${index + 1}"></button>`).join('');
  updateDialogFavorite(); $('#productDialog').showModal();
}
function updateDialogFavorite() { const product = findProduct(activeProductId); if (product) $('#dialogFavorite').textContent = state.favorites.includes(product.id) ? '♥ Guardado en favoritos' : '♡ Guardar en favoritos'; }

$('#productGrid').addEventListener('click', event => {
  const add = event.target.closest('[data-add]'); const favorite = event.target.closest('[data-favorite]'); const quick = event.target.closest('[data-quick-view]');
  if (add) addToCart(add.dataset.add); if (favorite) toggleFavorite(favorite.dataset.favorite); if (quick) openProduct(quick.dataset.quickView);
});
$('#categoryTabs').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (button) setCategory(button.dataset.category); });
$$('[data-category-link]').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.categoryLink)));
$('#storeSearch').addEventListener('input', renderProducts); $('#sortProducts').addEventListener('change', renderProducts);
$('#openCart').addEventListener('click', openCart); $('#footerCart').addEventListener('click', openCart); $('#closeCart').addEventListener('click', closePanels);
$('#favoritesTrigger').addEventListener('click', openFavorites); $('#closeFavorites').addEventListener('click', closePanels);
$('#searchTrigger').addEventListener('click', openSearch); $('#closeSearch').addEventListener('click', closePanels); $('#backdrop').addEventListener('click', closePanels);
$('#menuTrigger').addEventListener('click', () => { closePanels(); $('#mainNav').classList.add('open'); openBackdrop(); });
$('#closeAnnouncement').addEventListener('click', event => event.currentTarget.closest('.announcement').remove());
$('#heroQuickView').addEventListener('click', () => openProduct(1));

$('#cartItems').addEventListener('click', event => {
  const button = event.target.closest('[data-quantity]'); if (!button) return;
  const item = state.cart.find(entry => entry.id === Number(button.dataset.quantity)); if (!item) return;
  item.quantity += Number(button.dataset.change); if (item.quantity <= 0) state.cart = state.cart.filter(entry => entry !== item);
  save(); renderCart();
});
$('#clearCart').addEventListener('click', () => { state.cart = []; state.promo = false; save(); renderCart(); notify('Tu bolsa quedó vacía.'); });
$('#promoForm').addEventListener('submit', event => {
  event.preventDefault();
  if ($('#promoInput').value.trim().toUpperCase() !== 'LIMA10') return notify('Ese código no es válido. Prueba LIMA10.');
  state.promo = true; save(); renderCart(); notify('Código LIMA10 aplicado: 10% de descuento.');
});
$('#favoriteItems').addEventListener('click', event => { const button = event.target.closest('[data-favorite-add]'); if (button) addToCart(button.dataset.favoriteAdd); });
$('#dialogAdd').addEventListener('click', () => { $('#productDialog').close(); addToCart(activeProductId, true); });
$('#dialogFavorite').addEventListener('click', () => toggleFavorite(activeProductId)); $('#closeProduct').addEventListener('click', () => $('#productDialog').close());
$('#dialogColors').addEventListener('click', event => { const button = event.target.closest('button'); if (!button) return; $$('#dialogColors button').forEach(item => item.classList.toggle('active', item === button)); notify('Acabado seleccionado.'); });

function openCheckout() {
  if (!state.cart.length) return;
  closePanels(); $('#checkoutModal').classList.add('open'); $('#checkoutModal').setAttribute('aria-hidden', 'false'); lockBody(); showCheckoutStep(1);
}
function closeCheckout() { $('#checkoutModal').classList.remove('open'); $('#checkoutModal').setAttribute('aria-hidden', 'true'); unlockBodyIfClear(); }
function showCheckoutStep(step) {
  $$('.checkout-step').forEach(item => item.classList.toggle('active', Number(item.dataset.checkoutStep) === step));
  $$('[data-step-indicator]').forEach(item => item.classList.toggle('active', Number(item.dataset.stepIndicator) <= step));
  if (step === 3) {
    const delivery = document.querySelector('input[name="delivery"]:checked').value;
    $('#checkoutFinalTotal').textContent = money.format(cartTotals(delivery).total);
    $('#orderNumber').textContent = `NM-${new Date().toISOString().slice(2, 10).replaceAll('-', '')}-${String(Math.floor(Math.random() * 900) + 100)}`;
  }
}
$('#checkout').addEventListener('click', openCheckout); $('#closeCheckout').addEventListener('click', closeCheckout);
$$('[data-next-step]').forEach(button => button.addEventListener('click', () => {
  const step = Number(button.dataset.nextStep);
  if (step === 2 && !['checkoutName', 'checkoutEmail', 'checkoutPhone', 'checkoutDocument'].every(name => $(`#${name}`).value.trim())) return notify('Completa tus datos antes de continuar.');
  if (step === 3 && !$('#checkoutAddress').value.trim() && document.querySelector('input[name="delivery"]:checked').value === 'standard') return notify('Ingresa una dirección de entrega.');
  showCheckoutStep(step);
}));
$$('[data-prev-step]').forEach(button => button.addEventListener('click', () => showCheckoutStep(Number(button.dataset.prevStep))));
document.querySelectorAll('input[name="delivery"]').forEach(input => input.addEventListener('change', () => { $('#checkoutAddress').disabled = input.value === 'pickup' && input.checked; }));
$('#finishCheckout').addEventListener('click', () => { state.cart = []; state.promo = false; save(); renderAll(); closeCheckout(); notify('Demostración completada. Gracias por explorar NÓMADA.'); });

$('#globalSearch').addEventListener('input', event => {
  const query = event.currentTarget.value.trim();
  if (!query) return;
  $('#storeSearch').value = query; currentCategory = 'all'; renderProducts();
});
$('#globalSearch').addEventListener('keydown', event => { if (event.key === 'Enter') { closePanels(); document.querySelector('#catalogo').scrollIntoView({ behavior: 'smooth' }); } });
$$('[data-search-term]').forEach(button => button.addEventListener('click', () => { $('#globalSearch').value = button.dataset.searchTerm; $('#globalSearch').dispatchEvent(new Event('input')); }));
$('#newsletterForm').addEventListener('submit', event => { event.preventDefault(); notify(`Gracias. Enviaremos la próxima carta a ${$('#newsletterEmail').value}.`); event.currentTarget.reset(); });
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
  if (event.key === 'Escape') { closePanels(); closeCheckout(); }
});

renderAll();
