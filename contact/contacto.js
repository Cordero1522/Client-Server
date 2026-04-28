(function(){
    "use strict";

    // ⚠️ REEMPLAZAR CON TU URL DE GOOGLE APPS SCRIPT
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec';
    const GOOGLE_NEWSLETTER_URL = 'https://script.google.com/macros/s/OTRA_URL_AQUI/exec';

    // Catálogo de productos
    const catalogo = [
        { id:1, nombre:'Comedor Completo', categoria:'comedor', precio:18000, desc:'Comedor Talita, mesa de madera y 4 sillas color negro chocolate.', img:'/images/comedor_1.jpg' },
        { id:2, nombre:'Comedor Jurídico', categoria:'comedor', precio:72000, desc:'Comedor Jurídico de Cedro con 14 sillas estilo Beatriz.', img:'/images/comedor_2.jpg' },
        { id:3, nombre:'Desayunador', categoria:'cocina', precio:9500, desc:'Mesa desayunador Roy barra alta de cocina antecomedor 100% Nogal.', img:'/images/cocina_1.jpg' },
        { id:4, nombre:'Sala Hueso', categoria:'sala', precio:12000, desc:'Sala Devayne con acabados en madera, barnizado en color hueso.', img:'/images/sala_1.jpg' },
        { id:5, nombre:'Mesedora Clásica', categoria:'exterior', precio:9550, desc:'Mecedora vintage de Roble solido Mission Arts.', img:'/images/exterior_1.jpg' },
        { id:6, nombre:'Sala Providencial', categoria:'sala', precio:100000, desc:'Sala con mesa de centro Piamonte tallado a mano en Cedro Rojo.', img:'/images/sala_2.jpg' },
        { id:7, nombre:'Sala Amapola', categoria:'sala', precio:20000, desc:'Sala Clásica de Caoba con respaldo abotonado.', img:'/images/sala_3.jpg' },
        { id:8, nombre:'Tocador', categoria:'dormitorio', precio:7400, desc:'Tocador de madera de Roble con espejo estilo Frances.', img:'/images/dormitorio_1.jpg' },
        { id:9, nombre:'Chaise Pino', categoria:'dormitorio', precio:7500, desc:'Chaise longue grande tela de terciopelo, con madera de Pino.', img:'/images/dormitorio_2.jpg' },
        { id:10, nombre:'Cabecera King', categoria:'dormitorio', precio:12000, desc:'Cabecera de Parota con barniz oscuro para cama King Zise.', img:'/images/dormitorio_3.jpg' },
        { id:11, nombre:'Mesa 6', categoria:'comedor', precio:40000, desc:'Mesa de Roble macizo para 6 personas, con braniz Caoba.', img:'/images/comedor_3.jpg' },
        { id:12, nombre:'Recibidor', categoria:'sala', precio:2500, desc:'Mesa recibidor estio House Clásica madera Caoba Oscuro.', img:'/images/sala_4.jpg' },
        { id:13, nombre:'Consoleta', categoria:'dormitorio', precio:3500, desc:'Cosoleta semicircular de Pino estilo Norcastle.', img:'/images/dormitorio_4.jpg' },
        { id:14, nombre:'Mesa Redonda', categoria:'comedor', precio:20000, desc:'Mesa redonda de Parota con 4 sillas ergonómicas curvas.', img:'/images/comedor_4.jpg' },
        { id:15, nombre:'Cabecera Matrimonial', categoria:'dormitorio', precio:8000, desc:'Cabecera matrimonial estilo Texas, elaborada 100% en Nogal.', img:'/images/dormitorio_5.jpg' },
        { id:16, nombre:'Mesa Tronco', categoria:'exterior', precio:22000, desc:'Mesa artesanal de tronco de Parota con juego de 6 sillas.', img:'/images/exterior_2.jpg' }
    ];

    let carrito = JSON.parse(localStorage.getItem('carritoMaderarte')) || [];

    function guardarCarrito() {
        localStorage.setItem('carritoMaderarte', JSON.stringify(carrito));
    }

    // Elementos DOM
    const carritoOverlay = document.getElementById('carritoOverlay');
    const carritoPanel = document.getElementById('carritoPanel');
    const abrirBtn = document.getElementById('abrir-carrito-btn');
    const cerrarBtn = document.getElementById('cerrarCarritoBtn');
    const carritoItemsDiv = document.getElementById('carrito-lista-items');
    const totalSpan = document.getElementById('carrito-total');
    const badgeCount = document.getElementById('cart-count-badge');
    const vaciarBtn = document.getElementById('vaciarCarritoBtn');
    const finalizarBtn = document.getElementById('finalizarPedidoBtn');
    const mensajeDiv = document.getElementById('mensaje-envio');
    const nombreInput = document.getElementById('nombreCliente');
    const telefonoInput = document.getElementById('telefonoCliente');
    const correoInput = document.getElementById('correoCliente');
    const direccionInput = document.getElementById('direccionCliente');

    function calcularTotal() {
        return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    function renderCarritoItems() {
        if (carrito.length === 0) {
            carritoItemsDiv.innerHTML = '<p style="padding:20px;text-align:center;">Tu carrito está vacío.</p>';
            return;
        }
        let html = '';
        carrito.forEach(item => {
            const productoCompleto = catalogo.find(p => p.id === item.id);
            const imagenUrl = productoCompleto ? productoCompleto.img : '/images/default.jpg';
            html += `
                <div class="cart-item">
                    <div style="display: flex; gap: 15px; align-items: center; flex: 1;">
                        <img src="${imagenUrl}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 12px;">
                        <div class="cart-item-info">
                            <h4>${item.nombre}</h4>
                            <span class="cart-item-precio">$${item.precio.toLocaleString('es-MX')} c/u</span>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cantidad-control">
                            <button class="cantidad-btn" data-id="${item.id}" data-delta="-1">−</button>
                            <span>${item.cantidad}</span>
                            <button class="cantidad-btn" data-id="${item.id}" data-delta="1">+</button>
                        </div>
                        <button class="eliminar-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            `;
        });
        carritoItemsDiv.innerHTML = html;

        document.querySelectorAll('.cantidad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const delta = parseInt(btn.dataset.delta);
                cambiarCantidad(id, delta);
            });
        });
        document.querySelectorAll('.eliminar-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                eliminarItem(id);
            });
        });
    }

    function agregarAlCarrito(id) {
        const producto = catalogo.find(p => p.id === id);
        const itemEnCarrito = carrito.find(item => item.id === id);
        if (itemEnCarrito) {
            itemEnCarrito.cantidad += 1;
        } else {
            carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
        }
        guardarCarrito();
        actualizarUI();
        abrirCarrito();
    }

    function eliminarItem(id) {
        carrito = carrito.filter(item => item.id !== id);
        guardarCarrito();
        actualizarUI();
    }

    function cambiarCantidad(id, delta) {
        const item = carrito.find(i => i.id === id);
        if (!item) return;
        item.cantidad += delta;
        if (item.cantidad <= 0) {
            eliminarItem(id);
        } else {
            guardarCarrito();
            actualizarUI();
        }
    }

    function vaciarCarrito() {
        carrito = [];
        guardarCarrito();
        actualizarUI();
        if (mensajeDiv) mensajeDiv.innerHTML = '';
    }

    function actualizarUI() {
        renderCarritoItems();
        const total = calcularTotal();
        if (totalSpan) totalSpan.textContent = `$${total.toLocaleString('es-MX')}`;
        const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0);
        if (badgeCount) badgeCount.textContent = cantidadTotal;
    }

    function abrirCarrito() {
        if (carritoOverlay && carritoPanel) {
            carritoOverlay.classList.add('active');
            carritoPanel.classList.add('active');
        }
    }

    function cerrarCarrito() {
        if (carritoOverlay && carritoPanel) {
            carritoOverlay.classList.remove('active');
            carritoPanel.classList.remove('active');
        }
    }

    async function enviarPedidoASheets() {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
            if (mensajeDiv) mensajeDiv.innerHTML = '<span style="color:#b34a3c;">❌ Configura la URL de Google Apps Script.</span>';
            return;
        }
        if (carrito.length === 0) {
            if (mensajeDiv) mensajeDiv.innerHTML = '<span style="color:#b34a3c;">⚠️ El carrito está vacío.</span>';
            return;
        }
        const nombre = nombreInput?.value.trim() || '';
        const telefono = telefonoInput?.value.trim() || '';
        const correo = correoInput?.value.trim() || '';
        const direccion = direccionInput?.value.trim() || '';
        if (!nombre || !telefono || !correo || !direccion) {
            if (mensajeDiv) mensajeDiv.innerHTML = '<span style="color:#b34a3c;">❌ Completa todos los campos.</span>';
            return;
        }
        const total = calcularTotal();
        const productosDetalle = carrito.map(i => `${i.nombre} (x${i.cantidad})`).join('; ');
        const fecha = new Date().toLocaleString('es-MX');
        const payload = { nombre, telefono, correo, direccion, productos: productosDetalle, total, fecha };
        
        if (finalizarBtn) {
            finalizarBtn.innerHTML = 'Enviando... <span class="spinner"></span>';
            finalizarBtn.disabled = true;
        }
        if (mensajeDiv) mensajeDiv.innerHTML = '<span style="color:#1f4f3d;">⏳ Procesando pedido...</span>';
        
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(payload).toString()
            });
            if (mensajeDiv) mensajeDiv.innerHTML = '<span style="color:#1f4f3d;">✅ ¡Pedido enviado! Gracias.</span>';
            vaciarCarrito();
            if (nombreInput) nombreInput.value = '';
            if (telefonoInput) telefonoInput.value = '';
            if (correoInput) correoInput.value = '';
            if (direccionInput) direccionInput.value = '';
            setTimeout(() => { cerrarCarrito(); }, 1800);
        } catch (error) {
            if (mensajeDiv) mensajeDiv.innerHTML = '<span style="color:#b34a3c;">❌ Error de conexión.</span>';
        } finally {
            if (finalizarBtn) {
                finalizarBtn.innerHTML = 'Enviar pedido';
                finalizarBtn.disabled = false;
            }
        }
    }

    function mostrarMensajeNewsletter(contenedor, mensaje, esError = false) {
        if (!contenedor) return;
        contenedor.innerHTML = `<span style="color:${esError ? '#b34a3c' : '#1f4f3d'};">${mensaje}</span>`;
        setTimeout(() => { if(contenedor) contenedor.innerHTML = ''; }, 3000);
    }

    async function suscribirNewsletter(emailInputId, msgDivId, btnId) {
        const emailInput = document.getElementById(emailInputId);
        const email = emailInput?.value.trim();
        if (!email || !email.includes('@') || !email.includes('.')) {
            mostrarMensajeNewsletter(document.getElementById(msgDivId), '❌ Ingresa un correo válido.', true);
            return;
        }
        const btn = document.getElementById(btnId);
        if (btn) {
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '<span class="spinner"></span>';
            btn.disabled = true;
            try {
                const fecha = new Date().toLocaleString('es-MX');
                const payload = { email, fecha, origen: 'newsletter' };
                await fetch(GOOGLE_NEWSLETTER_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(payload).toString()
                });
                mostrarMensajeNewsletter(document.getElementById(msgDivId), '✅ ¡Suscripción exitosa!', false);
                if (emailInput) emailInput.value = '';
            } catch (error) {
                mostrarMensajeNewsletter(document.getElementById(msgDivId), '❌ Error al suscribir.', true);
            } finally {
                btn.innerHTML = textoOriginal;
                btn.disabled = false;
            }
        }
    }

    // Event listeners
    if (abrirBtn) abrirBtn.addEventListener('click', abrirCarrito);
    if (cerrarBtn) cerrarBtn.addEventListener('click', cerrarCarrito);
    if (carritoOverlay) {
        carritoOverlay.addEventListener('click', (e) => {
            if (e.target === carritoOverlay) cerrarCarrito();
        });
    }
    if (vaciarBtn) vaciarBtn.addEventListener('click', () => { vaciarCarrito(); });
    if (finalizarBtn) finalizarBtn.addEventListener('click', enviarPedidoASheets);

    // Newsletter footer
    const suscFooterBtn = document.getElementById('btnSuscribirFooter');
    if (suscFooterBtn) {
        suscFooterBtn.addEventListener('click', () => suscribirNewsletter('newsletterEmailFooter', 'newsletterMsgFooter', 'btnSuscribirFooter'));
    }

    // Scroll suave
    document.querySelectorAll('.footer-links a[href="#"], .btn-primary[href="#catalogo"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector('#catalogo');
            if(target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Inicializar
    actualizarUI();
})();