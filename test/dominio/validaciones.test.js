const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validarPlanta,
  validarRiego,
} = require("../../src/dominio/validaciones");

const ENTERO = "El intervalo de riego debe ser un número entero de días";

function plantaValida(cambios = {}) {
  return {
    nombre: "Helecho lunar",
    especie: "Nephrolepis selenica",
    ubicacion: "Invernadero norte",
    intervaloRiegoDias: 3,
    ...cambios,
  };
}

const mensajes = (detalles) => detalles.map((d) => d.mensaje);

describe("validarPlanta", () => {
  test("CA-04.1: una planta completa con intervalo 3 no tiene errores", () => {
    assert.deepEqual(validarPlanta(plantaValida()), []);
  });

  test("CA-04.2: sin especie e intervalo 0 devuelve dos detalles en orden", () => {
    const datos = plantaValida({ intervaloRiegoDias: 0 });
    delete datos.especie;
    assert.deepEqual(validarPlanta(datos), [
      { campo: "especie", mensaje: "La especie es obligatoria" },
      {
        campo: "intervaloRiegoDias",
        mensaje: "El intervalo de riego debe ser de al menos 1 día",
      },
    ]);
  });

  test("CA-04.3: un nombre con solo espacios es obligatorio", () => {
    assert.deepEqual(validarPlanta(plantaValida({ nombre: "   " })), [
      { campo: "nombre", mensaje: "El nombre es obligatorio" },
    ]);
  });

  test("CA-04.4: un intervalo de 2.5 no es entero", () => {
    assert.deepEqual(
      mensajes(validarPlanta(plantaValida({ intervaloRiegoDias: 2.5 }))),
      [ENTERO],
    );
  });

  test("CA-04.4: un intervalo «tres» no es entero", () => {
    assert.deepEqual(
      mensajes(validarPlanta(plantaValida({ intervaloRiegoDias: "tres" }))),
      [ENTERO],
    );
  });

  test("un intervalo numérico en texto («3») no es entero", () => {
    assert.deepEqual(
      mensajes(validarPlanta(plantaValida({ intervaloRiegoDias: "3" }))),
      [ENTERO],
    );
  });

  test("un intervalo negativo es menor que 1", () => {
    assert.deepEqual(
      mensajes(validarPlanta(plantaValida({ intervaloRiegoDias: -2 }))),
      ["El intervalo de riego debe ser de al menos 1 día"],
    );
  });

  test("un intervalo que falta o es null es obligatorio", () => {
    for (const intervaloRiegoDias of [undefined, null]) {
      assert.deepEqual(
        mensajes(validarPlanta(plantaValida({ intervaloRiegoDias }))),
        ["El intervalo de riego es obligatorio"],
      );
    }
  });

  test("Infinity y NaN no son enteros", () => {
    for (const intervaloRiegoDias of [Infinity, NaN]) {
      assert.deepEqual(
        mensajes(validarPlanta(plantaValida({ intervaloRiegoDias }))),
        [ENTERO],
      );
    }
  });

  test("un texto que no es string cuenta como vacío", () => {
    assert.deepEqual(
      validarPlanta(plantaValida({ ubicacion: 42, nombre: ["Helecho"] })),
      [
        { campo: "nombre", mensaje: "El nombre es obligatorio" },
        { campo: "ubicacion", mensaje: "La ubicación es obligatoria" },
      ],
    );
  });

  test("sin datos devuelve los cuatro errores en orden", () => {
    for (const datos of [undefined, null, {}]) {
      assert.deepEqual(
        validarPlanta(datos).map((d) => d.campo),
        ["nombre", "especie", "ubicacion", "intervaloRiegoDias"],
      );
    }
  });
});

describe("validarRiego", () => {
  // 18 nov 2026 a las 00:01, hora local: «ahora» fijo para todos los tests.
  const AHORA = new Date(2026, 10, 18, 0, 1);
  const CANTIDAD_ENTERA =
    "La cantidad de agua debe ser un número entero de mililitros";
  const CANTIDAD_MAYOR = "La cantidad de agua debe ser mayor que 0";

  function riegoValido(cambios = {}) {
    return { planta: "665f1c2a9b1e8a0012345678", cantidadMl: 500, ...cambios };
  }

  test("CA-05.1: una planta válida y 500 ml sin fecha no tienen errores", () => {
    assert.deepEqual(validarRiego(riegoValido(), AHORA), []);
  });

  test("CA-05.1: una fecha vacía o null cuenta como sin fecha", () => {
    for (const fecha of ["", null, undefined]) {
      assert.deepEqual(validarRiego(riegoValido({ fecha }), AHORA), []);
    }
  });

  test("CA-05.2: una cantidad de 0 debe ser mayor que 0", () => {
    assert.deepEqual(validarRiego(riegoValido({ cantidadMl: 0 }), AHORA), [
      { campo: "cantidadMl", mensaje: CANTIDAD_MAYOR },
    ]);
  });

  test("CA-05.2: una cantidad de -5 debe ser mayor que 0", () => {
    assert.deepEqual(
      mensajes(validarRiego(riegoValido({ cantidadMl: -5 }), AHORA)),
      [CANTIDAD_MAYOR],
    );
  });

  test("CA-05.2: una cantidad de 2.5 no es entera", () => {
    assert.deepEqual(
      mensajes(validarRiego(riegoValido({ cantidadMl: 2.5 }), AHORA)),
      [CANTIDAD_ENTERA],
    );
  });

  test("una cantidad en texto («500»), NaN o Infinity no es entera", () => {
    for (const cantidadMl of ["500", "quinientos", NaN, Infinity]) {
      assert.deepEqual(
        mensajes(validarRiego(riegoValido({ cantidadMl }), AHORA)),
        [CANTIDAD_ENTERA],
      );
    }
  });

  test("una cantidad que falta o es null es obligatoria", () => {
    for (const cantidadMl of [undefined, null]) {
      assert.deepEqual(
        mensajes(validarRiego(riegoValido({ cantidadMl }), AHORA)),
        ["La cantidad de agua es obligatoria"],
      );
    }
  });

  test("CA-05.3: la fecha de mañana es futura", () => {
    assert.deepEqual(
      validarRiego(riegoValido({ fecha: "2026-11-19" }), AHORA),
      [{ campo: "fecha", mensaje: "Un riego no puede tener fecha futura" }],
    );
  });

  test("CA-05.4: hoy a las 23:59 con ahora a las 00:01 no es futura", () => {
    for (const fecha of [
      new Date(2026, 10, 18, 23, 59),
      "2026-11-18T23:59:00",
      "2026-11-18",
    ]) {
      assert.deepEqual(validarRiego(riegoValido({ fecha }), AHORA), []);
    }
  });

  test("una fecha pasada es válida (la regla 6.4 sigue en la ruta)", () => {
    assert.deepEqual(
      validarRiego(riegoValido({ fecha: "2020-01-01" }), AHORA),
      [],
    );
  });

  test("una fecha que no se entiende no es válida", () => {
    for (const fecha of ["no-es-fecha", "2026-13-45T00:00", true, {}]) {
      assert.deepEqual(validarRiego(riegoValido({ fecha }), AHORA), [
        { campo: "fecha", mensaje: "La fecha no es válida" },
      ]);
    }
  });

  test("CA-05.5: la planta «123» no tiene un identificador válido", () => {
    assert.deepEqual(validarRiego(riegoValido({ planta: "123" }), AHORA), [
      {
        campo: "planta",
        mensaje: "La planta no tiene un identificador válido",
      },
    ]);
  });

  test("un identificador que no es texto hexadecimal de 24 no es válido", () => {
    for (const planta of [
      "665f1c2a9b1e8a001234567z",
      "665f1c2a9b1e8a00123456789",
      123,
      { $gt: "" },
    ]) {
      assert.deepEqual(mensajes(validarRiego(riegoValido({ planta }), AHORA)), [
        "La planta no tiene un identificador válido",
      ]);
    }
  });

  test("una planta que falta, null o vacía es obligatoria", () => {
    for (const planta of [undefined, null, "", "   "]) {
      assert.deepEqual(mensajes(validarRiego(riegoValido({ planta }), AHORA)), [
        "La planta es obligatoria",
      ]);
    }
  });

  test("sin datos devuelve planta y cantidad en orden", () => {
    for (const datos of [undefined, null, {}]) {
      assert.deepEqual(
        validarRiego(datos, AHORA).map((d) => d.campo),
        ["planta", "cantidadMl"],
      );
    }
  });
});
