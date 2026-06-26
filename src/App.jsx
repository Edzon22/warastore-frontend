import React, { useState, useEffect } from 'react';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  
  // ESTADO PARA EL TEMA: 'claro', 'oscuro', 'verde'
  const [tema, setTema] = useState('claro');

  // ESTADO PARA EL BUSCADOR INTELIGENTE
  const [busqueda, setBusqueda] = useState('');

  // ESTADO PARA LA CATEGORÍA SELECCIONADA
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS');

  // ESTADOS LOCALES PARA LA SELECCIÓN EN CADA PRODUCTO
  const [coloresSeleccionados, setColoresSeleccionados] = useState({});
  const [tiposCantidadSeleccionados, setTiposCantidadSeleccionados] = useState({});

  const TELEFONO_WHATSAPP = "59167411592"; 

  // Colores por defecto solicitados
  const COLORES_DISPONIBLES = ["Blanco", "Negro", "Rojo", "Azul", "Amarillo"];

  useEffect(() => {
    // 🚀 CONECTADO AL BACKEND REAL EN RENDER
    fetch('https://warastore-backend.onrender.com/api/productos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductos(data);
        }
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error conectando al servidor backend en Render:", err);
        setCargando(false);
      });
  }, []);

  // Función para obtener el precio dinámico adaptado temporalmente
  const obtenerPrecioActual = (producto, tipo) => {
    const precioBase = producto.precio_actual || 0;
    if (tipo === 'cuarta') {
      return producto.precio_cuarta ? producto.precio_cuarta : (precioBase * 3); 
    }
    if (tipo === 'docena') {
      return producto.precio_docena ? producto.precio_docena : (precioBase * 10);
    }
    return precioBase; // Unidad
  };

  const agregarAlCarrito = (producto) => {
    const colorSel = coloresSeleccionados[producto._id] || COLORES_DISPONIBLES[0];
    const tipoSel = tiposCantidadSeleccionados[producto._id] || 'unidad';
    const precioUnitarioSel = obtenerPrecioActual(producto, tipoSel);

    const comboId = `${producto._id}-${colorSel}-${tipoSel}`;

    const existe = carrito.find(item => item.comboId === comboId);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.comboId === comboId ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { 
        ...producto, 
        comboId, 
        colorElegido: colorSel, 
        tipoElegido: tipoSel,
        precioAplicado: precioUnitarioSel,
        cantidad: 1 
      }]);
    }
    setCarritoAbierto(true);
  };

  const eliminarDelCarrito = (comboId) => {
    setCarrito(carrito.filter(item => item.comboId !== comboId));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precioAplicado * item.cantidad), 0);
  };

  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;
    let mensaje = `⚡ *¡NUEVO PEDIDO EN WARA'STORE!* ⚡\n\n`;
    carrito.forEach((item, index) => {
      mensaje += `📦 *${index + 1}. ${item.nombre}*\n`;
      mensaje += `   • Color: ${item.colorElegido}\n`;
      mensaje += `   • Modalidad: ${item.tipoElegido.toUpperCase()}\n`;
      mensaje += `   • Cantidad: ${item.cantidad}\n`;
      mensaje += `   • Precio: Bs. ${item.precioAplicado} c/u\n\n`;
    });
    mensaje += `💵 *TOTAL A PAGAR:* Bs. ${calcularTotal()}\n\n`;
    mensaje += `¿Me confirman la disponibilidad para coordinar el envío? ✨`;

    const urlFinal = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlFinal, '_blank');
  };

  // LÓGICA DE FILTRADO COMBINADO
  const normalizarTexto = (texto) => {
    return texto ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  };

  const productosFiltrados = productos.filter((producto) => {
    const termino = normalizarTexto(busqueda);
    const nombreMatch = normalizarTexto(producto.nombre).includes(termino);
    const catTextoMatch = normalizarTexto(producto.categoria).includes(termino);
    
    if (busqueda && !(nombreMatch || catTextoMatch)) return false;

    const catProd = normalizarTexto(producto.categoria);
    const nomProd = normalizarTexto(producto.nombre);
    const esSinGenero = catProd.includes("mochila") || catProd.includes("accesorio") || nomProd.includes("gorra");
    const esPrendaVestir = !esSinGenero;

    if (categoriaActiva === 'TODOS') return true;
    if (categoriaActiva === 'NUEVOS') return producto.etiquetas && producto.etiquetas.some(e => normalizarTexto(e).includes("nuevo"));
    if (categoriaActiva === 'OFERTAS') return true;
    if (categoriaActiva === 'HOMBRE') return catProd.includes("hombre") || esSinGenero;
    if (categoriaActiva === 'MUJER') return catProd.includes("mujer") || esSinGenero;
    if (categoriaActiva === 'ACCESORIOS') return esSinGenero;
    if (categoriaActiva === 'ROPA') return esPrendaVestir;
    if (categoriaActiva === 'MOCHILAS') return catProd.includes("mochila");

    return catProd === normalizarTexto(categoriaActiva);
  });

  const obtenerClasesTema = () => {
    if (tema === 'oscuro') {
      return {
        bg: 'bg-gray-900 text-gray-100',
        card: 'bg-gray-800 border-gray-700 text-white',
        header: 'bg-gray-950 border-gray-800 text-white',
        textoSecundario: 'text-gray-400',
        input: 'bg-gray-800 border-gray-700 text-white',
        icono: 'text-white'
      };
    }
    if (tema === 'verde') {
      return {
        bg: 'bg-emerald-950 text-emerald-50',
        card: 'bg-emerald-900 border-emerald-800 text-white',
        header: 'bg-emerald-950 border-emerald-800 text-white',
        textoSecundario: 'text-emerald-300',
        input: 'bg-emerald-900 border-emerald-700 text-white',
        icono: 'text-white'
      };
    }
    return {
      bg: 'bg-gray-50 text-gray-800',
      card: 'bg-white border-gray-200 text-gray-800',
      header: 'bg-white border-gray-200 text-black',
      textoSecundario: 'text-gray-500',
      input: 'bg-gray-50 border-gray-300 text-gray-800',
      icono: 'text-black'
    };
  };

  const clases = obtenerClasesTema();

  return (
    <div className={`min-h-screen ${clases.bg} font-sans relative antialiased transition-colors duration-300`}>
      
      {/* 🐈‍⬛ BARRA DE NOTIFICACIÓN SUPERIOR (EL GATO PERSIGUE AL MOSQUITO) */}
      <div className="bg-black text-white text-[10px] md:text-xs py-2 text-center font-semibold tracking-wider uppercase px-4 relative overflow-hidden h-12 flex items-center justify-center">
        <span className="relative z-10 select-none">
          Envíos a todo el país • Tu confianza es nuestra prioridad
        </span>
        <div className="absolute inset-0 flex items-center animate-[marquee_15s_linear_infinite] pointer-events-none whitespace-nowrap">
          <div className="flex items-center space-x-6">
            <span className="text-3xl select-none inline-block transform -scale-x-100">🐈‍⬛</span>
            <span className="text-[10px] opacity-90 animate-pulse inline-block transform -scale-x-100">🦟</span>
          </div>
        </div>
      </div>

      {/* NAVBAR PRINCIPAL */}
      <header className={`border-b ${clases.header} sticky top-0 z-40 shadow-xs transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 select-none cursor-pointer group">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
              <img src="/LOGO GATO.png" alt="Logo Wara'Store" className="w-full h-full object-cover scale-[1.1]" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tight">WARA'STORE</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-200/50 p-1 rounded-lg border border-gray-300/30">
              <button onClick={() => setTema('claro')} className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer ${tema === 'claro' ? 'bg-white text-black shadow-xs' : 'text-gray-500'}`}>Claro</button>
              <button onClick={() => setTema('oscuro')} className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer ${tema === 'oscuro' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-500'}`}>Oscuro</button>
              <button onClick={() => setTema('verde')} className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer ${tema === 'verde' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'}`}>Verde</button>
            </div>

            <button onClick={() => setCarritoAbierto(true)} className={`relative p-1 ${clases.icono}`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              {carrito.reduce((acc, item) => acc + item.cantidad, 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN PRINCIPAL DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 border-b border-gray-200/20 pb-2">
          <h2 className="text-lg font-extrabold uppercase tracking-tight">Nuestra Colección</h2>
          <p className={`text-xs ${clases.textoSecundario}`}>{productosFiltrados.length} prendas encontradas</p>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent"></div>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-gray-300/30 rounded-xl max-w-xl mx-auto">
            <p className="text-base font-bold">Aún no contamos con ese producto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((producto) => {
              const tipoSel = tiposCantidadSeleccionados[producto._id] || 'unidad';
              const precioMostrado = obtenerPrecioActual(producto, tipoSel);
              const colorSel = coloresSeleccionados[producto._id] || COLORES_DISPONIBLES[0];

              return (
                <div key={producto._id} className={`${clases.card} rounded-md overflow-hidden border hover:shadow-md transition-all duration-300 flex flex-col justify-between`}>
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img src={(producto.imagenes && producto.imagenes[0]) || 'https://via.placeholder.com/300'} alt={producto.nombre} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">{producto.categoria || 'General'}</p>
                      <h3 className="text-xs font-bold mt-0.5 line-clamp-2 h-8">{producto.nombre}</h3>
                      
                      {/* 🎨 MENÚ DESPLEGABLE DE COLORES */}
                      <div className="mt-2">
                        <label className="text-[10px] font-bold block text-gray-400 uppercase mb-1">Color disponible:</label>
                        <select 
                          value={colorSel}
                          onChange={(e) => setColoresSeleccionados({ ...coloresSeleccionados, [producto._id]: e.target.value })}
                          className={`w-full text-xs font-semibold p-1.5 rounded border ${clases.input} outline-none cursor-pointer`}
                        >
                          {COLORES_DISPONIBLES.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>

                      {/* 📦 MENÚ DESPLEGABLE DE CANTIDAD/MODALIDAD */}
                      <div className="mt-3">
                        <label className="text-[10px] font-bold block text-gray-400 uppercase mb-1">Precio por cantidad:</label>
                        <select 
                          value={tipoSel}
                          onChange={(e) => setTiposCantidadSeleccionados({ ...tiposCantidadSeleccionados, [producto._id]: e.target.value })}
                          className={`w-full text-xs font-semibold p-1.5 rounded border ${clases.input} outline-none cursor-pointer`}
                        >
                          <option value="unidad">Por Unidad</option>
                          <option value="cuarta">Por Cuarta</option>
                          <option value="docena">Por Docena</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100/10">
                      <div className="text-sm font-black text-emerald-500">Bs. {precioMostrado}</div>
                      <button 
                        onClick={() => agregarAlCarrito(producto)}
                        className="mt-2 w-full bg-black hover:bg-gray-900 text-white font-bold text-[10px] py-2 px-3 uppercase tracking-wider rounded-xs cursor-pointer"
                      >
                        Añadir al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 📍 SECCIÓN DE UBICACIÓN, HORARIOS Y VISTA PREVIA DEL MAPA (ABAJO DE LA COLECCIÓN) */}
      <section className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200/20">
        <div className={`p-5 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-6 text-xs shadow-xs ${clases.card}`}>
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-extrabold text-sm uppercase text-emerald-500 mb-2">
                📍 Puesto Físico y Referencia
              </h4>
              <p className="font-bold text-sm">Puesto 46</p>
              <p className="text-gray-400 mt-0.5 font-semibold">Frente a la Galería San Antonio</p>
            </div>

            <div>
              <h4 className="font-extrabold text-sm uppercase text-emerald-500 mb-2">
                ⏰ Horarios de Atención (6:00 AM - 10:00 PM)
              </h4>
              <p><span className="font-bold">Días de Feria en Puesto:</span> Miércoles y Sábados</p>
              <p className="mt-1"><span className="font-bold">Entregas coordinadas:</span> En el <span className="underline font-bold text-amber-500">Correo</span>, previo acuerdo por WhatsApp cualquier otro día.</p>
            </div>

            <div>
              <a 
                href="https://maps.app.goo.gl/1PKiQH6AnM3Uo3gX6" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded uppercase tracking-wider transition-colors"
              >
                Abrir en la App de Maps →
              </a>
            </div>
          </div>

          {/* 🗺️ VISTA PREVIA EN VIVO DE GOOGLE MAPS */}
          <div className="w-full h-60 md:h-full min-h-[240px] rounded-lg overflow-hidden border border-gray-300/30 shadow-xs relative">
            <iframe 
              title="Mapa de Ubicación Wara'Store"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.568461713481!2d-66.1557008!3d-17.4325068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDI1JzU3LjAiUyA2NsKwMDknMjAuNSJX!5e0!3m2!1ses!2sbo!4v1700000000000!5m2!1ses!2sbo" 
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* SIDEBAR DEL CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="absolute inset-0" onClick={() => setCarritoAbierto(false)}></div>
          <div className="relative w-full max-w-md bg-white text-gray-900 h-full shadow-2xl flex flex-col justify-between z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide">Bolsa de Compras ({carrito.reduce((acc, item) => acc + item.cantidad, 0)})</h3>
              <button onClick={() => setCarritoAbierto(false)} className="text-gray-400 p-2 cursor-pointer">✕</button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {carrito.length === 0 ? (
                <p className="text-center py-16 text-xs text-gray-400">Tu bolsa está vacía actualmente.</p>
              ) : (
                carrito.map((item) => (
                  <div key={item.comboId} className="flex items-center space-x-3 border-b border-gray-100 pb-3">
                    <img src={item.imagenes[0]} alt={item.nombre} className="w-12 h-12 object-cover rounded bg-gray-50" />
                    <div className="flex-grow">
                      <h4 className="text-xs font-bold line-clamp-1">{item.nombre}</h4>
                      <p className="text-[10px] text-gray-500">Color: {item.colorElegido} | Tipo: <span className="font-bold uppercase text-emerald-600">{item.tipoElegido}</span></p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Cantidad: {item.cantidad}</p>
                      <p className="text-xs font-extrabold">Bs. {item.precioAplicado * item.cantidad}</p>
                    </div>
                    <button onClick={() => eliminarDelCarrito(item.comboId)} className="text-red-500 text-xs p-2 cursor-pointer">Quitar</button>
                  </div>
                ))
              )}
            </div>
            {carrito.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Subtotal:</span>
                  <span className="text-base font-black">Bs. {calcularTotal()}</span>
                </div>
                <button onClick={enviarPedidoWhatsApp} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded uppercase tracking-widest cursor-pointer">
                  Confirmar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante de WhatsApp */}
      <a 
        href={`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent("¡Hola Wara'Store! Deseo hacer una consulta.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl z-50 cursor-pointer"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.013-5.112-2.86-6.961C16.634 1.937 14.159 1.921 11.53 1.92c-5.438 0-9.863 4.42-9.866 9.862-.001 1.702.461 3.366 1.337 4.815l-.997 3.644 3.737-.981z"/></svg>
      </a>

    </div>
  );
}

export default App;