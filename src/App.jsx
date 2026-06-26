import React, { useState, useEffect } from 'react';

function App() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  
  // ESTADO PARA EL TEMA: 'claro', 'oscuro', 'verde'
  const [tema, setTema] = useState('claro');

  // ESTADO PARA EL BUSCADOR INTELIGENTE
  const [busqueda, setBusqueda] = useState('');

  // ESTADO PARA LA CATEGORÍA SELECCIONADA
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS');

  const TELEFONO_WHATSAPP = "59167411592"; 

  useEffect(() => {
    // 🚀 CONECTADO AL BACKEND REAL EN RENDER
    fetch('https://warastore-backend.onrender.com/api/productos')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error conectando al servidor backend en Render:", err);
        setCargando(false);
      });
  }, []);

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item._id === producto._id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item._id === producto._id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setCarritoAbierto(true);
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item._id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio_actual * item.cantidad), 0);
  };

  const enviarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;
    let mensaje = `⚡ *¡NUEVO PEDIDO EN WARA'STORE!* ⚡\n\n`;
    carrito.forEach((item, index) => {
      mensaje += `📦 *${index + 1}. ${item.nombre}*\n`;
      mensaje += `   • Cantidad: ${item.cantidad}\n`;
      mensaje += `   • Precio: Bs. ${item.precio_actual} c/u\n\n`;
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
    
    if (busqueda && !(nombreMatch || catTextoMatch)) {
      return false;
    }

    const catProd = normalizarTexto(producto.categoria);
    const nomProd = normalizarTexto(producto.nombre);
    
    const esSinGenero = catProd.includes("mochila") || catProd.includes("accesorio") || nomProd.includes("gorra");
    const esPrendaVestir = !esSinGenero;

    if (categoriaActiva === 'TODOS') return true;
    
    if (categoriaActiva === 'NUEVOS') {
      return producto.etiquetas && producto.etiquetas.some(e => normalizarTexto(e).includes("nuevo"));
    }
    
    if (categoriaActiva === 'OFERTAS') {
      return true; 
    }

    if (categoriaActiva === 'HOMBRE') {
      return catProd.includes("hombre") || esSinGenero;
    }

    if (categoriaActiva === 'MUJER') {
      return catProd.includes("mujer") || esSinGenero;
    }

    if (categoriaActiva === 'ACCESORIOS') {
      return esSinGenero;
    }

    if (categoriaActiva === 'ROPA') {
      return esPrendaVestir;
    }

    if (categoriaActiva === 'MOCHILAS') {
      return catProd.includes("mochila");
    }

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
      
      {/* BARRA DE NOTIFICACIÓN SUPERIOR */}
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
          
          {/* Menú Hamburguesa Móvil */}
          <button onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} className="md:hidden p-1 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuMovilAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* BUSCADOR */}
          <div className={`hidden md:flex items-center border rounded-md px-3 py-1.5 w-64 lg:w-80 ${clases.input} transition-colors`}>
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              placeholder="¿QUÉ ESTÁS BUSCANDO?" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="outline-none text-xs w-full tracking-wider font-semibold bg-transparent" 
            />
          </div>

          {/* MARCA + LOGO DE GATO */}
          <div className="flex items-center space-x-3 select-none cursor-pointer group">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center overflow-hidden border border-gray-700 shadow-sm">
              <img 
                src="/LOGO GATO.png" 
                alt="Logo Wara'Store" 
                className="w-full h-full object-cover scale-[1.1] transform group-hover:scale-[1.2] transition-transform duration-300"
              />
            </div>
            <span className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight">
              WARA'STORE
            </span>
          </div>

          {/* CONTROLES (SELECTOR TEMAS + BOLSA COMPRAS) */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="flex items-center bg-gray-200/50 p-1 rounded-lg border border-gray-300/30">
              {/* ✅ CORRECCIÓN AQUÍ: Ahora llama correctamente a setTema */}
              <button 
                onClick={() => setTema('claro')} 
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${tema === 'claro' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'}`}
              >
                Claro
              </button>
              <button 
                onClick={() => setTema('oscuro')} 
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${tema === 'oscuro' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-500 hover:text-white'}`}
              >
                Oscuro
              </button>
              <button 
                onClick={() => setTema('verde')} 
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${tema === 'verde' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'}`}
              >
                Verde
              </button>
            </div>

            {/* Icono de bolsa adaptable */}
            <button onClick={() => setCarritoAbierto(true)} className={`relative transition-colors cursor-pointer p-1 ${clases.icono}`}>
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

        {/* MENÚ DE CATEGORÍAS */}
        <nav className={`border-t border-gray-100/10 hidden md:block ${tema === 'claro' ? 'bg-white' : 'bg-transparent'}`}>
          <div className="max-w-5xl mx-auto flex justify-between items-center h-11 text-[11px] lg:text-xs font-bold tracking-widest opacity-80">
            {['TODOS', 'NUEVOS', 'MOCHILAS', 'ROPA', 'HOMBRE', 'MUJER', 'ACCESORIOS', 'OFERTAS'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => {
                  setCategoriaActiva(cat);
                  setBusqueda(''); 
                }}
                className={`hover:opacity-100 transition-all py-2 px-3 cursor-pointer uppercase tracking-widest border-b-2 ${
                  categoriaActiva === cat 
                    ? 'border-emerald-500 text-emerald-500 opacity-100 font-extrabold' 
                    : 'border-transparent opacity-60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* SECCIÓN PRINCIPAL DE PRODUCTOS */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 border-b border-gray-200/20 pb-4">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight uppercase">Nuestra Colección</h2>
          <p className={`text-xs md:text-sm ${clases.textoSecundario} mt-1`}>{productosFiltrados.length} prendas encontradas</p>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent"></div>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 px-4 border border-dashed border-gray-300/30 rounded-xl max-w-xl mx-auto">
            <p className="text-lg font-bold tracking-wide">Aun no contamos con ese producto,</p>
            <p className="text-md font-semibold text-emerald-500 mt-1">pronto tendremos novedades.</p>
            <p className="text-xs text-gray-400 mt-4 italic font-mono uppercase tracking-widest">se vienen cositas :) </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto._id} className={`${clases.card} rounded-md overflow-hidden border hover:shadow-xl transition-all duration-300 group flex flex-col justify-between`}>
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img src={producto.imagenes && producto.imagenes[0]} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    {(producto.etiquetas && producto.etiquetas[0]) || 'Nuevo'}
                  </span>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{producto.categoria}</p>
                    <h3 className="text-xs md:text-sm font-semibold mt-1 line-clamp-2 h-9 md:h-10">{producto.nombre}</h3>
                    <div className="flex gap-1 mt-1.5">
                      {producto.tallas && producto.tallas.map(talla => (
                        <span key={talla} className="text-[9px] font-bold border border-gray-300/40 rounded px-1.5 py-0.5 opacity-80">{talla}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm md:text-base font-black">Bs. {producto.precio_actual}</div>
                    <button 
                      onClick={() => agregarAlCarrito(producto)}
                      className="mt-2.5 w-full bg-black hover:bg-gray-800 text-white font-bold text-[11px] py-2 px-4 uppercase tracking-wider transition-colors cursor-pointer rounded-xs"
                    >
                      Añadir al Carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* SIDEBAR DEL CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="absolute inset-0" onClick={() => setCarritoAbierto(false)}></div>
          <div className="relative w-full max-w-md bg-white text-gray-900 h-full shadow-2xl flex flex-col justify-between z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-md font-bold uppercase tracking-wide">Bolsa de Compras ({carrito.reduce((acc, item) => acc + item.cantidad, 0)})</h3>
              <button onClick={() => setCarritoAbierto(false)} className="text-gray-400 hover:text-black p-2 cursor-pointer">✕</button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {carrito.length === 0 ? (
                <p className="text-center py-24 text-xs text-gray-400">Tu bolsa está vacía actualmente.</p>
              ) : (
                carrito.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                    <img src={item.imagenes[0]} alt={item.nombre} className="w-14 h-14 object-cover rounded bg-gray-50" />
                    <div className="flex-grow">
                      <h4 className="text-xs font-bold line-clamp-1">{item.nombre}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Cantidad: {item.cantidad}</p>
                      <p className="text-xs font-extrabold mt-0.5">Bs. {item.precio_actual * item.cantidad}</p>
                    </div>
                    <button onClick={() => eliminarDelCarrito(item._id)} className="text-red-500 text-xs p-2 cursor-pointer">Quitar</button>
                  </div>
                ))
              )}
            </div>
            {carrito.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Subtotal:</span>
                  <span className="text-lg font-black">Bs. {calcularTotal()}</span>
                </div>
                <button onClick={enviarPedidoWhatsApp} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded uppercase tracking-widest flex items-center justify-center space-x-2 cursor-pointer">
                  <span>Confirmar Pedido</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante de WhatsApp */}
      <a 
        href={`https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent("¡Hola Wara'Store! Deseo hacer una consulta sobre los productos.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all z-50 cursor-pointer"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.013-5.112-2.86-6.961C16.634 1.937 14.159 1.921 11.53 1.92c-5.438 0-9.863 4.42-9.866 9.862-.001 1.702.461 3.366 1.337 4.815l-.997 3.644 3.737-.981z"/></svg>
      </a>

    </div>
  );
}

export default App;