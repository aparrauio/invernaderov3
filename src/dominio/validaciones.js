// Validaciones puras del dominio: no dependen de Mongoose ni de la base de datos.
// Los mensajes coinciden con los del modelo Planta, que sigue como segunda barrera.

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

// Identificador de MongoDB: 24 caracteres hexadecimales.
const ID_VALIDO = /^[0-9a-f]{24}$/i;

function esIdValido(valor) {
  return typeof valor === "string" && ID_VALIDO.test(valor);
}

module.exports = { validarPlanta, esIdValido };
