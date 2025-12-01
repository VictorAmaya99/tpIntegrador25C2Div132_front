
/* Variables DOM*/

let productos = [];

let contenedorProductos = document.getElementById("contenedorProductos")
let barraBusqueda = document.getElementById("barraBusqueda");
let contenedorCarrito = document.getElementById("contenedorCarrito");
let contenedorVaciarPrecioTotal = document.getElementById("contenedorVaciarPrecioTotal");
let contadorCarrito = document.getElementById("contadorCarrito");
let ordenarPorNombre = document.getElementById("ordenarPorNombre");
let ordenarPorPrecio = document.getElementById("ordenarPorPrecio");

let carrito = [];


/*==================
    FUNCIONES
====================*/
// Funcion para cargar los productos
async function cargarProductos() {
    try {
        let response = await fetch("json/productos.json");
        productos = await response.json();
        mostrarProductos(productos);
        console.table(productos);
    } catch (error) {
        console.error(error);
    }
}

// Funcion para mostrar los productos
function mostrarProductos(array){
    let cardProducto = "";
    array.forEach(a => {
        cardProducto += `
        <div class="card-producto">
            <img src="${a.rutaImg}" alt="${a.nombre}">
            <h3>${a.nombre}</h3>
            <p>$${a.precio}</p>
            <button class="botonera-agregar-carrito" onclick="agregarItemCarrito(${a.id})">Agregar al carrito</button>
        </div>
        `;
    });

    contenedorProductos.innerHTML = cardProducto;
}

// Funcion para manejar la busqueda y filtracion de productos

barraBusqueda.addEventListener("keyup", filtrarProd);

function filtrarProd(){
    let busqueda = barraBusqueda.value.trim().toLocaleLowerCase();

    prodFiltrados = productos.filter(p => p.nombre.toLocaleLowerCase().includes(busqueda));

    mostrarProductos(prodFiltrados);
}

/*========================================================
    Funcion para implementar al carrito
==========================================================*/

// Agregar item al carrito
function agregarItemCarrito(id){
    let prodSelected = productos.find(p => p.id === id);
    carrito.push(prodSelected);

    console.table(prodSelected);

    guardarLocalStorage();
    visualizarCarrito();
    vaciarPrecioTotal()
    contadorProd();
    
}

//Mostrar los productos seleccionados en el carrito

function visualizarCarrito(){
    let cardCarrito = "<ul>";    
    carrito.forEach((e, indice) =>{          
        cardCarrito += `        
        <li class="bloque-item">
            <img src="${e.rutaImg}" alt="${e.nombre}">
            <p class="nombre-item">${e.nombre} - ${e.precio}</p>
            <button class="boton-eliminar" onclick="eliminarProducto(${indice})">Eliminar</button>
        </li>
        `;
    });

    cardCarrito += "</ul>"
    contenedorCarrito.innerHTML = cardCarrito;

    vaciarPrecioTotal();
}

// Manejar el boton vaciar del carrito y el precio total

function vaciarPrecioTotal(){
    //usamos reduce para sumar el precio y presentar el total
    let total = carrito.reduce((acc, prod) => acc + prod.precio, 0);

    // inicialiamos en 0 para aparezca cuando hay un producto
    if(carrito.length > 0){
        let cardVaciarPrecioTotal = `
        <div class="vaciar-precioTotal">
            <button class="boton-vaciar" onclick="vaciarCarrito()">Vaciar carrito</button>
            <p class="total-precio">Total: ${total}</p>
        </div>
        `;

        contenedorVaciarPrecioTotal.innerHTML = cardVaciarPrecioTotal;
    } else{
        contenedorVaciarPrecioTotal.innerHTML = "";
    }
}    

//Eliminar el producto seleccionado

function eliminarProducto(indice){
    carrito.splice(indice, 1);

    guardarLocalStorage();
    visualizarCarrito();
    contadorProd();

}

// Funcion que sirve como contador de productos agregados al carrito

function contadorProd(){
    contadorCarrito.innerHTML = `Carrito: <span class="cantidadProductos">${carrito.length}</span> productos`;
}

// Vaciar carrito

function vaciarCarrito(){
    carrito = [];
    contenedorCarrito.innerHTML = "";
    
    guardarLocalStorage();
    contadorProd();
    vaciarPrecioTotal();
}

/*========================================================
    Funciones para manejar localStorage
==========================================================*/

// Guardar productos seleccionados al local storage

function guardarLocalStorage(){
    localStorage.setItem("carrito", JSON.stringify(carrito)); //"carrito", representan los productos agregados
    // Con JSON.stringify se convierte el array en una cadena Json.
}

// Cargar localStorage

function loadLocalStorage(){
    let datos = localStorage.getItem("carrito"); //Aca se trae el producto guardado

    // Si datos es verdadero entonces el carrito se convierte el json en un array de objetos, sino muestra un carrito vacio
    if(datos){
        carrito = JSON.parse(datos);
    } else {
        carrito = [];
    }
}

/*========================================================
    Funciones que manejan el ordenamiento de los 
    productos
==========================================================*/

ordenarPorNombre.addEventListener("click", ordenarNombre);
ordenarPorPrecio.addEventListener("click", ordenarPrecioDesc);

function ordenarPrecioDesc(){
    productos.sort((a, b) => a.precio - b.precio);
    mostrarProductos(productos);
}

function ordenarNombre(){
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    mostrarProductos(productos);
}

/*================== 
   DRAWER CARRITO 
====================*/

// botón en el header
let btnCarrito = document.getElementById("btnCarrito");

// aside lateral
let drawerCarrito = document.getElementById("drawerCarrito");

//cerrar el carrito
let cerrarDrawer = document.querySelector("#cerrarDrawer");

// abrir
btnCarrito.addEventListener("click", (e) => {
    e.preventDefault();
    drawerCarrito.classList.add("open");
});

// cerrar tocando afuera del drawer
cerrarDrawer.addEventListener("click", () => {
    drawerCarrito.classList.remove("open");
});



async function init() {
    loadLocalStorage();
    await cargarProductos();
    visualizarCarrito();
    contadorProd();
}

init();


// --- Saludo de usuario y botón Salir ---
document.addEventListener("DOMContentLoaded", () => {
    const bienvenidaEl = document.getElementById("bienvenidaUsuario");
    const btnSalir = document.getElementById("btnSalir");

    // Recupera el nombre guardado en index (sessionStorage)
    const nombre = sessionStorage.getItem("nombreUsuario");

    // Si no hay nombre, redirigir a index.html (comportamiento recomendado)
    if (!nombre) {
        // Si preferís NO redirigir, comentá la siguiente línea y descomentá la alternativa abajo.
        window.location.href = "index.html";
        // Alternativa: mostrar saludo genérico en vez de redirigir:
        // bienvenidaEl.textContent = "Bienvenido/a";
    } else {
        // Mostrar saludo
        bienvenidaEl.textContent = `Bienvenido, ${nombre}`;
    }

    // Botón salir: borra el nombre y vuelve al inicio
    btnSalir.addEventListener("click", () => {
        sessionStorage.removeItem("nombreUsuario");
        window.location.href = "index.html";
    });
});
