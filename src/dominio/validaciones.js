// Validaciones puras del dominio: no dependen de Mongoose ni de la base de datos.
// Los mensajes coinciden con los del modelo Planta, que sigue como segunda barrera.

const { interpretarFecha, esFechaFutura } = require("./fechas");

const CAMPOS_TEXTO_PLANTA = [
  ["nombre", "El nombre es obligatorio"],
  ["especie", "La especie es obligatoria"],
  ["ubicacion", "La ubicación es obligatoria"],
];

function esTextoVacio(valor) {
  return typeof valor !== "string" || valor.trim() === "";
}

function validarIntervalo(valor) {
  if (valor === undefined || valor === null) {
    return "El intervalo de riego es obligatorio";
  }
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    return "El intervalo de riego debe ser un número entero de días";
  }
  if (valor < 1) {
    return "El intervalo de riego debe ser de al menos 1 día";
  }
  return null;
}

function validarPlanta(datos) {
  const planta = datos ?? {};
  const detalles = [];
  for (const [campo, mensaje] of CAMPOS_TEXTO_PLANTA) {
    if (esTextoVacio(planta[campo])) detalles.push({ campo, mensaje });
  }
  const errorIntervalo = validarIntervalo(planta.intervaloRiegoDias);
  if (errorIntervalo) {
    detalles.push({ campo: "intervaloRiegoDias", mensaje: errorIntervalo });
  }
  return detalles;
}

// --- Riego ---
// Los mensajes coinciden con los del modelo Riego. La regla «no anterior al registro
// de la planta» necesita la base de datos y se comprueba en la ruta.

const ID_PLANTA = /^[0-9a-f]{24}$/i;

function validarIdPlanta(valor) {
  if (valor === undefined || valor === null || esTextoVacioSiEsTexto(valor)) {
    return "La planta es obligatoria";
  }
  if (typeof valor !== "string" || !ID_PLANTA.test(valor)) {
    return "La planta no tiene un identificador válido";
  }
  return null;
}

function esTextoVacioSiEsTexto(valor) {
  return typeof valor === "string" && valor.trim() === "";
}

function validarCantidad(valor) {
  if (valor === undefined || valor === null) {
    return "La cantidad de agua es obligatoria";
  }
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    return "La cantidad de agua debe ser un número entero de mililitros";
  }
  if (valor < 1) {
    return "La cantidad de agua debe ser mayor que 0";
  }
  return null;
}

// Una fecha vacía es válida: el riego será de hoy.
function validarFechaRiego(valor, ahora) {
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }
  const interpretada = interpretarFecha(valor);
  const fecha =
    interpretada instanceof Date
      ? interpretada
      : typeof interpretada === "string" || typeof interpretada === "number"
        ? new Date(interpretada)
        : null;
  if (!fecha || Number.isNaN(fecha.getTime())) {
    return "La fecha no es válida";
  }
  if (esFechaFutura(fecha, ahora)) {
    return "Un riego no puede tener fecha futura";
  }
  return null;
}

function validarRiego(datos, ahora) {
  const riego = datos ?? {};
  const detalles = [];
  const reglas = [
    ["planta", validarIdPlanta(riego.planta)],
    ["cantidadMl", validarCantidad(riego.cantidadMl)],
    ["fecha", validarFechaRiego(riego.fecha, ahora)],
  ];
  for (const [campo, mensaje] of reglas) {
    if (mensaje) detalles.push({ campo, mensaje });
  }
  return detalles;
}

module.exports = { validarPlanta, validarRiego };
