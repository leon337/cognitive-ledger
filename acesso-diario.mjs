import { scryptSync, timingSafeEqual } from "node:crypto";

const salt = Buffer.from("2c2594889e50ba5a7bfe7e0acc3d19f4", "hex");
const esperado = Buffer.from("df044f86d7513af885a252caad2f76c4ad9bc64f11b744560931c16e4ebd44f0c195f59b9ac9c1f4402f209acd44cdb47a90958952a2d502922957d68ba80331", "hex");

export function validarAcesso(valor) {
  const calculado = scryptSync(valor, salt, esperado.length);
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
}
