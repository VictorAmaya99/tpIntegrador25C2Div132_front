// Redireccion a inicio////////////////////
let nombreUsuario = sessionStorage.getItem("nombreUsuario");

// Redirige si no existe un nombre de usuario
if(!nombreUsuario){
	window.location.href = "index.html";
}



/* Variables DOM*/

let productos = [];

let contenedorProductos = document.getElementById("contenedorProductos")
let barraBusqueda = document.getElementById("barraBusqueda");

let contenedorCarrito = document.getElementById("contenedorCarrito");
let contenedorVaciarPrecioTotal = document.getElementById("contenedorVaciarPrecioTotal");
let contadorCarrito = document.getElementById("contadorCarrito");
let ordenarPorNombre = document.getElementById("ordenarPorNombre");
let ordenarPorPrecio = document.getElementById("ordenarPorPrecio");

let boton_imprimir = document.getElementById("btn-imprimir");

let carrito = [];

const url = "http://localhost:3000/api/productos";


/*==================
    FUNCIONES
====================*/
// Funcion para cargar los productos
async function cargarProductos() {
    try {
        // let response = await fetch("json/productos.json");
        let response = await fetch(url);

        let data = await response.json();

        console.log(data);

        productos = data.payload;

        mostrarProductos(productos);
        // console.table(productos);
    } catch (error) {
        console.error(error);
    }
}

// Funcion para mostrar los productos
function mostrarProductos(array){
    let cardProducto = "";

    for(let i = 0; i < array.length; i++) {
        cardProducto += `
        <div class="card-producto">
            <img src="${array[i].imagen}" alt="${array[i].nombre}">
            <h3>${array[i].nombre}</h3>
            <p>$${array[i].precio}</p>
            <button class="botonera-agregar-carrito" onclick="agregarItemCarrito(${array[i].id})">Agregar al carrito</button>
        </div>
        `;
    }      

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
    Funcion para imprimir tickets pdf
==========================================================*/

boton_imprimir.addEventListener("click", imprimirTicket);

function imprimirTicket() {
    console.table(carrito);
    
    // Para registrar las ventas a posteriori, guardamos los ids de los productos del carrito
    let idProductos = []; // Array vacío de ids de productos

    // Gracias al CDN extraemos la clase jspdf del objeto global window  
    const { jsPDF } = window.jspdf;

    // Creamos una nueva instancia del documento pdf usando al clase jsPDF
    const doc = new jsPDF(); // Ahora doc tendrá todos los métodos que le provee la herramienta jsPDF

    // Definimos el margen superior de 20px en el eje y -> eje vertical, el eje x será el eje horizontal
    let y = 20;

    // Establecemos el tamaño de 18px para el primer texto
    doc.setFontSize(18);

    // Escribimos el texto "Ticket compra" en la posicion x=10, y=10 del pdf
    doc.text("ticket de compra:", 20, y);


    // Aumentamos el espacio despues del titulo
    y += 20;

      // Cambiamos el tamaño de la fuente a 12px para los productos del ticket
    doc.setFontSize(12);

    // Iteramos el carrito e imprimimos nombre y precio
    carrito.forEach(producto => {

        idProductos.push(producto.id); // Llenamos el array de ids de productos (necesario para la venta despues)

        doc.text(`${producto.nombre} - $${producto.precio}`, 30, y); // Creamos el texto por cada producto: nombre = $precio

        // Incrementamos la posicion vertical para evitar solapamiento
        y += 10;
    });

     // Calculamos el total del ticket usando reduce
    const precioTotal = carrito.reduce((total, producto) => total + parseInt(producto.precio), 0);

     // Añadimos otro espacio de 5px en el eje vertical para separar el precio total de los productos
    y += 5;

    // Establecemos el tamaño de 15px para el precio total
    doc.setFontSize(14);

    // Escribimos el total del ticket en el PDF, despues del listado de productos
    doc.text(`Total: $${precioTotal}`, 20, y);

    // Imprimimos el ticket de venta
    doc.save("ticket.pdf");

    //Lamado a registrar ventas y que haga la redirección -> fetch POST /api/sales -> luego crearemos este endpoint app.post("/api/sales")
    registrarVenta(precioTotal, idProductos); 

}

// Registrar venta ////////////////////////////////////////
/* Que datos debemos enviar a nuestra API?

Nuestro endpoint esperará algo equivalente a los campos de la tabla sales
    - date          nueva fecha
    - total_price   precio total
    - user_name     nombreUsuario

Además nuestra tabla product_sales vincula los productos a la venta, por tanto enviaremos los ids de los produtos vendidos
    - products      array de ids de productos -> vinculamos los productos a una venta


Ejemplo del JSON
    {
        "date": "2025-12-03T10:00",
        "total_price" : "6500",
        "user_name" : "Gricel",
        "products" : [29, 27]
    }

Que tendra que hacer ahora nuestra API?

    1. Insertar la venta en la tabla sales
    2. Despues de esta insercion, obtendremos el id de la venta
    3. Insertamos los productos en product_sales
*/

async function registrarVenta(precioTotal, idProductos) {

     /* toLocaleString vs toISOString

        - Los métodos `toLocaleString()` y `toISOString()` de JavaScript tienen diferentes propósitos a la hora de convertir un objeto Date en una cadena. El método `toISOString()` siempre devuelve una cadena en formato ISO 8601, que representa la fecha y la hora en UTC (tiempo universal coordinado) e incluye una «Z» al final para indicar UTC. Este formato está estandarizado y es coherente independientemente de la configuración del sistema del usuario.

        - Por el contrario, `toLocaleString()` devuelve una cadena formateada según la configuración regional y la zona horaria del sistema del usuario o según lo especificado por los parámetros del método. Esto significa que el resultado puede variar significativamente en función de la ubicación del usuario, por ejemplo, utilizando diferentes separadores de fecha, formatos de hora o incluso diferentes nombres de días y meses. Por ejemplo, si se utiliza la configuración regional «de» (alemán), la fecha se formateará como «29.5.2020, 18:04:24», mientras que «fr» (francés) utilizará «29/05/2020, 18:04:24».

        - Una solución habitual para obtener la hora local en formato ISO 8601 (sin la «Z») es ajustar la fecha según la diferencia horaria antes de llamar a «toISOString()». Esto se puede hacer restando la diferencia horaria en milisegundos (obtenida mediante «getTimezoneOffset () * 60000») del valor de la hora de la fecha. A continuación, la cadena resultante se puede modificar para eliminar la «Z» final si es necesario. Alternativamente, el uso de una configuración regional como «sv» (Suecia) con «toLocaleString()» produce un formato similar al ISO 8601, aunque utiliza un espacio en lugar de «T» entre la fecha y la hora, lo que sigue siendo válido según la RFC 3339.
    */

    // Ya que el formato fecha no es valido para timestamp en SQL, tenemos que formatearlo    
    const fecha = new Date()
    .toLocaleString("sv-SE", { hour12: false })  
    .replace("T", " ");

    console.log(fecha);

     // Construimos el objeto con informacion para mandarle al endpoint (previo parseo a JSON)
    const data = {
        // date: fecha, // Recordar que si en su BBDD tienen un valor generado automaticamente, no hace falta enviar esto}
        precio_total: precioTotal,
        nombre_usuario: nombreUsuario,
        productos: idProductos
    }

    // Endpoint ventas
    const response = await fetch("http://localhost:3000/api/ventas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

     const result = await response.json();

      if(response.ok) {
        console.log(response);
        alert(result.message);

        // Limpieza de variables en sesion y redireccion para resetear la app
        sessionStorage.removeItem("nombreUsuario");
        // sessionStorage.removeItem("carrito"); // Si guardamos el carrito en session
        window.location.href = "index.html"
    } else {
        alert(result.message);
    }



     /*
    // Una vez que terminasemos de registrar la venta -> ORDEN IDEAL 1. Venta -> 2. Ticket
    alert("Venta creada con exito");
    sessionStorage.removeItem("nombreUsuario");
    // sessionStorage.removeItem("carrito"); // Si guardamos el carrito en session
    window.location.href = "index.html"
    */
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
            <img src="${e.imagen}" alt="${e.nombre}">
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



function init() {
    loadLocalStorage();
    cargarProductos();
    visualizarCarrito();
    contadorProd();
}

init();
