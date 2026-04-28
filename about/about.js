(function(){
    "use strict";

    // CONFIGURACIÓN DE URLS (cambia según corresponda)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec';
    const GOOGLE_NEWSLETTER_URL = 'https://script.google.com/macros/s/OTRA_URL_AQUI/exec';

    // Catálogo completo
    const catalogo = [
        { id:1, nombre:'Comedor Completo', categoria:'comedor', precio:18000, img:'/images/comedor_1.jpg' },
        { id:2, nombre:'Comedor Jurídico', categoria:'comedor', precio:72000, img:'/images/comedor_2.jpg' },
        { id:3, nombre:'Desayunador', categoria:'cocina', precio:9500, img:'/images/cocina_1.jpg' },
        { id:4, nombre:'Sala Hueso', categoria:'sala', precio:12000, img:'/images/sala_1.jpg' },
        { id:5, nombre:'Mesedora Clásica', categoria:'exterior', precio:9550, img:'/images/exterior_1.jpg' },
        { id:6, nombre:'Sala Providencial', categoria:'sala', precio:100000, img:'/images/sala_2.jpg' },
        { id:7, nombre:'Sala Amapola', categoria:'sala', precio:20000, img:'/images/sala_3.jpg' },
        { id:8, nombre:'Tocador', categoria:'dormitorio', precio:7400, img:'/images/dormitorio_1.jpg' },
        { id:9, nombre:'Chaise Pino', categoria:'dormitorio', precio:7500, img:'/images/dormitorio_2.jpg' },
        { id:10, nombre:'Cabecera King', categoria:'dormitorio', precio:12000, img:'/images/dormitorio_3.jpg' },
        { id:11, nombre:'Mesa 6', categoria:'comedor', precio:40000, img:'/images/comedor_3.jpg' },
        { id:12, nombre:'Recibidor', categoria:'sala', precio:2500, img:'/images/sala_4.jpg' },
        { id:13, nombre:'Consoleta', categoria:'dormitorio', precio:3500, img:'/images/dormitorio_4.jpg' },
        { id:14, nombre:'Mesa Redonda', categoria:'comedor', precio:20000, img:'/images/comedor_4.jpg' },
        { id:15, nombre:'Cabecera Matrimonial', categoria:'dormitorio', precio:8000, img:'/images/dormitorio_5.jpg' },
        { id:16, nombre:'Mesa Tronco', categoria:'exterior', precio:22000, img:'/images/exterior_2.jpg' }
    ];

    // Estado del carrito
    let carrito = JSON.parse(localStorage.getItem('carritoMaderarte')) || [];

    function guardarCarrito() {
        localStorage.setItem('carritoMaderarte', JSON.stringify(carrito));
    }

    // Elementos DOM del carrito
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

    function actualizarUI() {
        renderCarritoItems();
        totalSpan.textContent = `$${calcularTotal().toLocaleString('es-MX')}`;
        const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0);
        badgeCount.textContent = cantidadTotal;
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
                            <span>$${item.precio.toLocaleString('es-MX')} c/u</span>
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
                const item = carrito.find(i => i.id === id);
                if(item) {
                    item.cantidad += delta;
                    if(item.cantidad <= 0) {
                        carrito = carrito.filter(i => i.id !== id);
                    }
                    guardarCarrito();
                    actualizarUI();
                }
            });
        });
        
        document.querySelectorAll('.eliminar-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                carrito = carrito.filter(i => i.id !== id);
                guardarCarrito();
                actualizarUI();
            });
        });
    }

    function vaciarCarrito() {
        carrito = [];
        guardarCarrito();
        actualizarUI();
        if(mensajeDiv) mensajeDiv.innerHTML = '';
    }

    function abrirCarrito() { 
        carritoOverlay.classList.add('active'); 
        carritoPanel.classList.add('active'); 
    }
    
    function cerrarCarrito() { 
        carritoOverlay.classList.remove('active'); 
        carritoPanel.classList.remove('active'); 
    }

    async function enviarPedidoASheets() {
        if (carrito.length === 0) { 
            mensajeDiv.innerHTML = '<span style="color:#b34a3c;">Carrito vacío.</span>'; 
            return; 
        }
        
        const nombre = nombreInput.value.trim();
        const telefono = telefonoInput.value.trim();
        const correo = correoInput.value.trim();
        const direccion = direccionInput.value.trim();
        
        if (!nombre || !telefono || !correo || !direccion) {
            mensajeDiv.innerHTML = '<span style="color:#b34a3c;">Completa todos los campos.</span>';
            return;
        }
        
        const total = calcularTotal();
        const productosDetalle = carrito.map(i => `${i.nombre} (x${i.cantidad})`).join('; ');
        const fecha = new Date().toLocaleString('es-MX');
        const payload = { nombre, telefono, correo, direccion, productos: productosDetalle, total, fecha };
        
        finalizarBtn.innerHTML = 'Enviando... <span class="spinner"></span>';
        finalizarBtn.disabled = true;
        
        try {
            await fetch(GOOGLE_SCRIPT_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: new URLSearchParams(payload).toString() 
            });
            mensajeDiv.innerHTML = '<span style="color:#1f4f3d;">Pedido enviado. Gracias.</span>';
            vaciarCarrito();
            nombreInput.value = telefonoInput.value = correoInput.value = direccionInput.value = '';
            setTimeout(() => cerrarCarrito(), 1800);
        } catch(error) {
            mensajeDiv.innerHTML = '<span style="color:#b34a3c;">Error de conexión.</span>';
        } finally {
            finalizarBtn.innerHTML = 'Enviar pedido';
            finalizarBtn.disabled = false;
        }
    }

    async function suscribirNewsletter() {
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim();
        if (!email || !email.includes('@')) {
            const msgDiv = document.getElementById('newsletterMsg');
            msgDiv.innerHTML = 'Correo inválido.';
            setTimeout(() => msgDiv.innerHTML = '', 3000);
            return;
        }
        
        const btn = document.getElementById('btnSuscribir');
        btn.innerHTML = '<span class="spinner"></span>';
        btn.disabled = true;
        
        try {
            await fetch(GOOGLE_NEWSLETTER_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: new URLSearchParams({ email, fecha: new Date().toLocaleString() }).toString() 
            });
            document.getElementById('newsletterMsg').innerHTML = 'Suscripción exitosa.';
            emailInput.value = '';
        } catch(e) {
            document.getElementById('newsletterMsg').innerHTML = 'Error.';
        } finally {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            btn.disabled = false;
            setTimeout(() => document.getElementById('newsletterMsg').innerHTML = '', 3000);
        }
    }

    // Event Listeners
    abrirBtn.addEventListener('click', abrirCarrito);
    cerrarBtn.addEventListener('click', cerrarCarrito);
    carritoOverlay.addEventListener('click', (e) => { 
        if(e.target === carritoOverlay) cerrarCarrito(); 
    });
    vaciarBtn.addEventListener('click', () => { 
        vaciarCarrito(); 
        if(mensajeDiv) mensajeDiv.innerHTML = ''; 
    });
    finalizarBtn.addEventListener('click', enviarPedidoASheets);
    
    const suscribirBtn = document.getElementById('btnSuscribir');
    if(suscribirBtn) {
        suscribirBtn.addEventListener('click', suscribirNewsletter);
    }

    actualizarUI();
})();