// Referencias a los elementos del HTML
const galeria   = document.getElementById("galeria");
const btnCargar = document.getElementById("cargar");
const inputBuscar = document.getElementById("buscar");
async function cargarDatos() {
  galeria.innerHTML = "<p>Cargando...</p>";
  btnCargar.disabled = true;

  try {
    // 1. Pedir la lista de 151 pokémon
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    if (!res.ok) throw new Error("Error " + res.status);
    const datos = await res.json();

    // 2. Pedir todos los detalles EN PARALELO (no uno por uno)
    const promesas = datos.results.map(item => 
      fetch(item.url)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );
    const pokemones = await Promise.all(promesas);

    // 3. Renderizar tarjetas
    galeria.innerHTML = "";
    pokemones.forEach(poke => {
      if (!poke) return;
      const card = crearTarjeta(poke);
      if (card) galeria.appendChild(card);
    });

  } catch (error) {
    galeria.innerHTML = "<p>No se pudieron cargar los datos.</p>";
    console.error(error);
  } finally {
    btnCargar.disabled = false;
    btnCargar.textContent = "Recargar";
  }
}
function crearTarjeta(pokemon) {
  if (!pokemon || !pokemon.name || !pokemon.sprites) return null;

  const imagen = pokemon.sprites.other?.["official-artwork"]?.front_default
               || pokemon.sprites.front_default
               || "";

  const card = document.createElement("article");
  card.className = "tarjeta";
  card.dataset.nombre = pokemon.name;

  card.innerHTML = `
    <img src="${imagen}" alt="Imagen de ${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <button class="btn-fav" aria-label="Marcar como favorito">🤍</button>
  `;

  // Lógica del botón favorito
  const btnFav = card.querySelector(".btn-fav");
  btnFav.addEventListener("click", () => {
    const esFavorito = card.classList.toggle("favorito");
    btnFav.textContent = esFavorito ? "❤️" : "🤍";
  });

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
// ===== MODO OSCURO / CLARO =====
const btnTema = document.getElementById("toggle-tema");

btnTema.addEventListener("click", () => {
  document.body.classList.toggle("modo-claro");

  // Cambiar el texto del botón según el modo
  if (document.body.classList.contains("modo-claro")) {
    btnTema.textContent = "🌙 Modo oscuro";
  } else {
    btnTema.textContent = "☀️ Modo claro";
  }
});
// ===== CONFIGURACIÓN =====
const API_BASE = "https://pokeapi.co/api/v2/pokemon/";

// ===== PAGINACIÓN =====
let offset = 0;
const LIMITE = 20;

// ===== REFERENCIAS AL DOM =====
const galeria     = document.getElementById("galeria");
const btnCargar   = document.getElementById("cargar");
const btnCargarMas = document.getElementById("cargar-mas");
const inputBuscar = document.getElementById("buscar");

// ===== CREAR UNA TARJETA =====
function crearTarjeta(pokemon) {
  if (!pokemon || !pokemon.name || !pokemon.sprites) return null;

  const imagen = pokemon.sprites.other?.["official-artwork"]?.front_default
               || pokemon.sprites.front_default
               || "";

  const card = document.createElement("article");
  card.className = "tarjeta";
  card.dataset.nombre = pokemon.name;

  card.innerHTML = `
    <img src="${imagen}" alt="Imagen de ${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <button class="btn-fav" aria-label="Marcar como favorito">🤍</button>
  `;

  // Lógica del botón favorito
  const btnFav = card.querySelector(".btn-fav");
  btnFav.addEventListener("click", () => {
    const esFavorito = card.classList.toggle("favorito");
    btnFav.textContent = esFavorito ? "❤️" : "🤍";
  });

  return card;
}

// ===== CARGAR DATOS =====
async function cargarDatos(reset = true) {
  if (reset) {
    offset = 0;
    galeria.innerHTML = "<p>Cargando...</p>";
  }

  btnCargar.disabled = true;
  btnCargarMas.style.display = "none";

  try {
    // Primera carga: 151 de golpe. "Cargar más": de 20 en 20
    const cantidad = reset ? 151 : LIMITE;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${cantidad}&offset=${offset}`);
    if (!res.ok) throw new Error("Error " + res.status);
    const datos = await res.json();

    // Fetch paralelo de los detalles
    const promesas = datos.results.map(item =>
      fetch(item.url)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );
    const pokemones = await Promise.all(promesas);

    // Primera carga limpia; "cargar más" agrega al final
    if (reset) galeria.innerHTML = "";

    pokemones.forEach(poke => {
      if (!poke) return;
      const card = crearTarjeta(poke);
      if (card) galeria.appendChild(card);
    });

    // Actualizar offset
    offset += cantidad;

    // Mostrar botón "Cargar más" si quedan pokémon
    if (offset < 1025) {
      btnCargarMas.style.display = "inline-block";
    }

  } catch (error) {
    galeria.innerHTML = "<p>No se pudieron cargar los datos.</p>";
    console.error(error);
  } finally {
    btnCargar.disabled = false;
    btnCargar.textContent = "🔄 Recargar";
  }
}

// ===== BUSCADOR EN VIVO =====
inputBuscar.addEventListener("input", () => {
  const query = inputBuscar.value.trim().toLowerCase();
  const tarjetas = galeria.querySelectorAll(".tarjeta");

  tarjetas.forEach(card => {
    const nombre = card.dataset.nombre || "";
    card.style.display = nombre.includes(query) ? "" : "none";
  });
});

// ===== EVENTOS =====
btnCargar.addEventListener("click", () => cargarDatos(true));
btnCargarMas.addEventListener("click", () => cargarDatos(false));