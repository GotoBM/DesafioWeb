// Referencias a los elementos del HTML
const galeria   = document.getElementById("galeria");
const btnCargar = document.getElementById("cargar");
const inputBuscar = document.getElementById("buscar");
async function cargarDatos() {
  // Mostrar estado de carga
  galeria.innerHTML = "<p>Cargando...</p>";
  btnCargar.disabled = true;

  try {
    // 1. Pedir la lista de los primeros 20 pokémon
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");

    // 2. Verificar que la respuesta fue exitosa
    if (!res.ok) throw new Error("Error " + res.status);

    // 3. Convertir la respuesta a JSON
    const datos = await res.json();

    // 4. Limpiar el contenedor
    galeria.innerHTML = "";

    // 5. Por cada pokémon, pedir sus detalles y crear una tarjeta
    for (const item of datos.results) {
      const resPoke = await fetch(item.url);
      if (!resPoke.ok) continue; // si uno falla, saltar al siguiente

      const poke = await resPoke.json();
      const card = crearTarjeta(poke);
      if (card) galeria.appendChild(card);
    }S

  } catch (error) {
    galeria.innerHTML = "<p>No se pudieron cargar los datos.</p>";
    console.error(error);
  } finally {
    btnCargar.disabled = false;
    btnCargar.textContent = "Recargar";
  }
}
function crearTarjeta(pokemon) {
  // Validar que existan los datos necesarios
  if (!pokemon || !pokemon.name || !pokemon.sprites) return null;

  // Obtener la imagen (la oficial o la básica como respaldo)
  const imagen = pokemon.sprites.other?.["official-artwork"]?.front_default
               || pokemon.sprites.front_default
               || "";

  // Crear el elemento HTML
  const card = document.createElement("article");
  card.className = "tarjeta";
  card.dataset.nombre = pokemon.name; // para el buscador

  card.innerHTML = `
    <img src="${imagen}" alt="Imagen de ${pokemon.name}">
    <h3>${pokemon.name}</h3>
  `;

  return card;
}
btnCargar.addEventListener("click", cargarDatos);

inputBuscar.addEventListener("input", () => {
  const query = inputBuscar.value.trim().toLowerCase();
  const tarjetas = galeria.querySelectorAll(".tarjeta");

  tarjetas.forEach(card => {
    const nombre = card.dataset.nombre || "";
    if (nombre.includes(query)) {
      card.style.display = "";    // mostrar
    } else {
      card.style.display = "none"; // ocultar
    }
  });
});
inputBuscar.addEventListener("input", () => {
  const query = inputBuscar.value.trim().toLowerCase();
  const tarjetas = galeria.querySelectorAll(".tarjeta");

  tarjetas.forEach(card => {
    const nombre = card.dataset.nombre || "";
    if (nombre.includes(query)) {
      card.style.display = "";    // mostrar
    } else {
      card.style.display = "none"; // ocultar
    }
  });
});