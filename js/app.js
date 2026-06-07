// ===== PAGINACIÓN =====
let offset = 0;
const LIMITE = 20;

// ===== FAVORITOS (se guardan en memoria de sesión) =====
const favoritos = new Set(); // guarda los nombres de pokémon favoritos

// ===== REFERENCIAS AL DOM =====
const galeria      = document.getElementById("galeria");
const btnCargar    = document.getElementById("cargar");
const btnCargarMas = document.getElementById("cargar-mas");
const inputBuscar  = document.getElementById("buscar");
const btnTema      = document.getElementById("toggle-tema");

// ===== MODO OSCURO / CLARO =====
btnTema.addEventListener("click", () => {
  document.body.classList.toggle("modo-claro");
  btnTema.textContent = document.body.classList.contains("modo-claro")
    ? "🌙 Modo oscuro"
    : "☀️ Modo claro";
});

// ===== ORDENAR TARJETAS (favoritos primero) =====
function ordenarTarjetas() {
  const tarjetas = Array.from(galeria.querySelectorAll(".tarjeta"));

  // Separar favoritos y no favoritos
  const favs   = tarjetas.filter(c => favoritos.has(c.dataset.nombre));
  const noFavs = tarjetas.filter(c => !favoritos.has(c.dataset.nombre));

  // Reordenar en el DOM: primero favoritos, luego el resto
  [...favs, ...noFavs].forEach(card => galeria.appendChild(card));
}

// ===== CREAR UNA TARJETA =====
function crearTarjeta(pokemon) {
  if (!pokemon || !pokemon.name || !pokemon.sprites) return null;

  const imagen = pokemon.sprites.other?.["official-artwork"]?.front_default
               || pokemon.sprites.front_default
               || "";

  const card = document.createElement("article");
  card.className = "tarjeta";
  card.dataset.nombre = pokemon.name;
  card.style.animationDelay = `${(pokemon.id % 20) * 40}ms`;

  // Si ya era favorito antes de recargar, marcarlo
  const yaEsFavorito = favoritos.has(pokemon.name);

  card.innerHTML = `
    <img src="${imagen}" alt="Imagen de ${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <button class="btn-fav" aria-label="Marcar como favorito">${yaEsFavorito ? "❤️" : "🤍"}</button>
  `;

  if (yaEsFavorito) card.classList.add("favorito");

  // Lógica del botón favorito
  const btnFav = card.querySelector(".btn-fav");
  btnFav.addEventListener("click", () => {
    const esFavorito = card.classList.toggle("favorito");

    if (esFavorito) {
      favoritos.add(pokemon.name);
      btnFav.textContent = "❤️";
    } else {
      favoritos.delete(pokemon.name);
      btnFav.textContent = "🤍";
    }

    // Reordenar: el recién marcado sube al inicio
    ordenarTarjetas();
  });

  return card;
}

// ===== BUSCADOR EN VIVO =====
// Los favoritos NUNCA se ocultan al buscar
inputBuscar.addEventListener("input", () => {
  const query = inputBuscar.value.trim().toLowerCase();
  galeria.querySelectorAll(".tarjeta").forEach(card => {
    const nombre = card.dataset.nombre || "";
    const esFavorito = favoritos.has(nombre);

    // Si es favorito, siempre visible. Si no, filtrar por búsqueda
    if (esFavorito || nombre.includes(query)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
});

// ===== CARGAR DATOS =====
async function cargarDatos(reset = true) {
  if (reset) {
    offset = 0;
    galeria.innerHTML = "<p>Cargando...</p>";
  }

  btnCargar.disabled = true;
  btnCargarMas.style.display = "none";

  try {
    const cantidad = reset ? 151 : LIMITE;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${cantidad}&offset=${offset}`);
    if (!res.ok) throw new Error("Error " + res.status);
    const datos = await res.json();

    const promesas = datos.results.map(item =>
      fetch(item.url)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );
    const pokemones = await Promise.all(promesas);

    if (reset) galeria.innerHTML = "";

    pokemones.forEach(poke => {
      if (!poke) return;
      const card = crearTarjeta(poke);
      if (card) galeria.appendChild(card);
    });

    // Ordenar: favoritos al inicio después de cada carga
    ordenarTarjetas();

    offset += cantidad;

    if (offset < 1025) {
      btnCargarMas.style.display = "block";
    }

  } catch (error) {
    galeria.innerHTML = "<p>No se pudieron cargar los datos.</p>";
    console.error(error);
  } finally {
    btnCargar.disabled = false;
    btnCargar.textContent = "🔄 Recargar";
  }
}

// ===== EVENTOS =====
btnCargar.addEventListener("click", () => cargarDatos(true));
btnCargarMas.addEventListener("click", () => cargarDatos(false));