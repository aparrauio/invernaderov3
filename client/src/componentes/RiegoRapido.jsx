import { useEffect, useRef, useState } from "react";
import { registrarRiego, repartirErrores } from "../api.js";
import Campo from "./Campo.jsx";
import Mensaje from "./Mensaje.jsx";

// Panel de riego rápido (spec 07): 500 ml sugeridos, fecha de hoy y sin cuidador.
const CANTIDAD_SUGERIDA = "500";
const SIN_ERRORES = { porCampo: {}, generales: [] };

// "2,5" se envía como 2.5 para que la API responda con su mensaje de «entero».
// Un texto que no es un número se envía tal cual y la API lo rechaza.
function leerCantidad(texto) {
  const limpio = texto.trim();
  if (limpio === "") return undefined;
  const numero = Number(limpio.replace(",", "."));
  return Number.isFinite(numero) ? numero : limpio;
}

export default function RiegoRapido({ planta, alGuardar, alCancelar }) {
  const [cantidad, setCantidad] = useState(CANTIDAD_SUGERIDA);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState(SIN_ERRORES);
  const [fallo, setFallo] = useState(null); // null | "conexion" | "no-existe"
  const campo = useRef(null);
  // Corta una segunda pulsación antes de que React desactive el botón.
  const enCurso = useRef(false);

  useEffect(() => {
    campo.current?.focus();
  }, []);

  async function guardar(evento) {
    evento.preventDefault();
    if (enCurso.current) return;
    enCurso.current = true;
    setEnviando(true);
    setErrores(SIN_ERRORES);
    setFallo(null);
    try {
      const riego = await registrarRiego({
        planta: planta._id,
        cantidadMl: leerCantidad(cantidad),
      });
      alGuardar(riego);
    } catch (error) {
      if (error.estado === 400) {
        setErrores(repartirErrores(error, ["cantidadMl"]));
      } else if (error.estado === 404) {
        setFallo("no-existe");
      } else {
        setFallo("conexion");
      }
    } finally {
      enCurso.current = false;
      setEnviando(false);
    }
  }

  const idCampo = `riego-rapido-${planta._id}`;

  return (
    <form
      className="panel-riego"
      onSubmit={guardar}
      noValidate
      aria-labelledby={`${idCampo}-titulo`}
    >
      <h3 id={`${idCampo}-titulo`} className="panel-riego-titulo">
        Riego para {planta.nombre}
      </h3>
      <div className="panel-riego-campo">
        <Campo
          id={idCampo}
          etiqueta="Cantidad (ml)"
          ayuda="Se anota con la fecha de hoy."
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={cantidad}
          onChange={(evento) => setCantidad(evento.target.value)}
          error={errores.porCampo.cantidadMl}
          disabled={enviando}
          ref={campo}
        />
      </div>
      {(errores.generales.length > 0 || fallo) && (
        <div className="panel-riego-mensajes">
          {errores.generales.map((mensaje) => (
            <Mensaje key={mensaje} tipo="error">
              {mensaje}
            </Mensaje>
          ))}
          {fallo === "conexion" && (
            <Mensaje tipo="error">
              No pudimos guardar el riego. Revisa tu conexión y vuelve a
              intentarlo.
            </Mensaje>
          )}
          {fallo === "no-existe" && (
            <Mensaje tipo="error">
              No encontramos esa planta. Puede que se haya borrado.
            </Mensaje>
          )}
        </div>
      )}
      <div className="panel-riego-acciones">
        {fallo !== "no-existe" && (
          <button
            type="submit"
            className="boton-secundario"
            disabled={enviando}
          >
            {enviando ? "Guardando…" : "Guardar riego"}
          </button>
        )}
        <button
          type="button"
          className="boton-enlace"
          onClick={alCancelar}
          disabled={enviando}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
