import { scryptSync, timingSafeEqual } from "node:crypto";

const salt = Buffer.from("2c2594889e50ba5a7bfe7e0acc3d19f4", "hex");
const esperado = Buffer.from("b01e3d4cef9fa99dac33179fff11e49182993256da3692ffc2d131df6eb2e79c1b2b65ac0b758cad6644200577a499292982d9473123b00eec85ad2d932ac68b", "hex");

export function validarAcesso(valor) {
  const calculado = scryptSync(valor, salt, esperado.length);
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
}
