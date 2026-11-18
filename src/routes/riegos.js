const express = require("express");
const Planta = require("../models/planta");
const Riego = require("../models/riego");
const { esFechaRiegoValida } = require("../dominio/fechas");
const { validarRiego } = require("../dominio/validaciones");

const router = express.Router();

router.post("/", async (req, res) => {
  const { planta: plantaId, fecha, cantidadMl, cuidador } = req.body ?? {};

  // Primero el formato (400), después la existencia de la planta (404).
  const detalles = validarRiego(
    { planta: plantaId, fecha, cantidadMl },
    new Date(),
  );
  if (detalles.length > 0) {
    return res.status(400).json({ error: "Datos no válidos", detalles });
  }

  // El modelo sigue como segunda barrera.
  const riego = new Riego({ planta: plantaId, fecha, cantidadMl, cuidador });
  await riego.validate();

  const planta = await Planta.findById(riego.planta);
  if (!planta) {
    return res.status(404).json({ error: "Planta no encontrada" });
  }

  if (!esFechaRiegoValida(riego.fecha, planta.createdAt, new Date())) {
    return res.status(400).json({
      error: "Datos no válidos",
      detalles: [
        {
          campo: "fecha",
          mensaje:
            "Un riego no puede ser anterior a la fecha de registro de la planta",
        },
      ],
    });
  }

  await riego.save();
  res.status(201).json(riego);
});

module.exports = router;
