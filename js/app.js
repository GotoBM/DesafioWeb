// ===== PAGINACIÓN =====
let offset = 0;
const LIMITE = 20;

// ===== FAVORITOS =====
const favoritos = new Set();

// ===== REFERENCIAS AL DOM =====
const galeria          = document.getElementById("galeria");
const btnCargar        = document.getElementById("cargar");
const btnCargarMas     = document.getElementById("cargar-mas");
const inputBuscar      = document.getElementById("buscar");
const btnTema          = document.getElementById("toggle-tema");
const btnToggleResena  = document.getElementById("btn-toggle-resena");
const seccionPost      = document.getElementById("seccion-post");
const btnEnviar        = document.getElementById("btn-enviar");
const postTitulo       = document.getElementById("post-titulo");
const postCuerpo       = document.getElementById("post-cuerpo");
const postRespuesta    = document.getElementById("post-respuesta");

// ===== MODO OSCURO / CLARO =====
btnTema.addEventListener("click", () => {
  document.body.classList.toggle("modo-claro");
  btnTema.textContent = document.body.classList.contains("modo-claro")
    ? "🌙 Modo oscuro"
    : "☀️ Modo claro";
});

// ===== TOGGLE SECCIÓN RESEÑA =====
btnToggleResena.addEventListener("click", () => {
  const visible = seccionPost.style.display === "block";
  seccionPost.style.display = visible ? "none" : "block";
  btnToggleResena.textContent = visible ? "📝 Dejar reseña" : "✖️ Cerrar reseña";
});

// ===== ORDENAR TARJETAS (favoritos primero) =====
function ordenarTarjetas() {
  const tarjetas = Array.from(galeria.querySelectorAll(".tarjeta"));
  const favs   = tarjetas.filter(c => favoritos.has(c.dataset.nombre));
  const noFavs = tarjetas.filter(c => !favoritos.has(c.dataset.nombre));
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

  const yaEsFavorito = favoritos.has(pokemon.name);

  card.innerHTML = `
    <img src="${imagen}" alt="Imagen de ${pokemon.name}">
    <h3>${pokemon.name}</h3>
    <button class="btn-fav" aria-label="Marcar como favorito">${yaEsFavorito ? "❤️" : "🤍"}</button>
  `;

  if (yaEsFavorito) card.classList.add("favorito");

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
    ordenarTarjetas();
  });

  return card;
}

// ===== BUSCADOR EN VIVO =====
inputBuscar.addEventListener("input", () => {
  const query = inputBuscar.value.trim().toLowerCase();
  galeria.querySelectorAll(".tarjeta").forEach(card => {
    const nombre = card.dataset.nombre || "";
    const esFavorito = favoritos.has(nombre);
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

// ===== SEGUNDO ENDPOINT: POST =====
async function enviarResena() {
  const titulo = postTitulo.value.trim();
  const cuerpo = postCuerpo.value.trim();

  if (!titulo || !cuerpo) {
    postRespuesta.style.color = "#f94144";
    postRespuesta.textContent = "⚠️ Completa ambos campos antes de enviar.";
    return;
  }

  btnEnviar.disabled = true;
  postRespuesta.style.color = "#8b949e"; // ✅ corregido
  postRespuesta.textContent = "Enviando...";

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titulo,
        body: cuerpo,
        userId: 1
      })
    });

    if (!res.ok) throw new Error("Error " + res.status);

    const datos = await res.json();

    postRespuesta.style.color = "#52b788";
    postRespuesta.textContent = `✅ Reseña enviada con ID #${datos.id} — ¡Gracias!`;

    postTitulo.value = "";
    postCuerpo.value = "";

  } catch (error) {
    postRespuesta.style.color = "#f94144";
    postRespuesta.textContent = "❌ No se pudo enviar la reseña.";
    console.error(error);
  } finally {
    btnEnviar.disabled = false;
  }
}

// ===== EVENTOS =====
btnCargar.addEventListener("click", () => cargarDatos(true));
btnCargarMas.addEventListener("click", () => cargarDatos(false));
btnEnviar.addEventListener("click", enviarResena);