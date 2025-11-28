let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.querySelectorAll('.agregar-carrito').forEach(btn => {
    btn.addEventListener('click', () =>{
        const producto = {
            nombre: btn.parentElement.querySelector('h3').innerText,
            precio: parseInt(btn.parentElement.querySelector('p').innerText.replace('$', ''))
        };
        carrito.push(producto)
        localStorage.setItem('carrito', JSON.stringify(carrito));
        alert(`${producto.nombre} agregado al carrito`);
        actualizarCarrito();
    });
})

function actualizarCarrito(){
    const carritoDiv = document.getElementById('carrito-items');
    const totalSpan = document.getElementById('total');
    if(!carritoDiv) return;

    carritoDiv.innerHTML = '';
    let total = 0;
    carrito.forEach(p => {
        carritoDiv.innerHTML += `<p>${p.nombre} - $${p.precio}</p>`;
        total += p.precio;
    });
    totalSpan.innerText = total;
}

actualizarCarrito();

document.addEventListener("DOMContentLoaded", () => {
    //cargar header
    fetch('./header.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('header-container').innerHTML = data;
    });

    //cargar footer
    fetch('./footer.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('footer-container').innerHTML = data;
    });
});
