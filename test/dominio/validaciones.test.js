const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { validarPlanta } = require("../../src/dominio/validaciones");

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
