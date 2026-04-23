// lib/mlChileEngine.ts
// Motor de cálculo de fees MercadoLibre Chile
// Comisiones vigentes + IVA 19% + estimados de envío

export type MLChileCategoria =
  | 'computacion'
  | 'celulares'
  | 'electrodomesticos'
  | 'ropa_accesorios'
  | 'deportes'
  | 'bebes'
  | 'herramientas'
  | 'hogar_muebles'
  | 'musica_juegos'
  | 'alimentos'
  | 'automotor'
  | 'otros';

export type MLChileTipoPublicacion = 'clasica' | 'premium';

export type MLChileCategoriaConfig = {
  label: string;
  comisionClasica: number;
  comisionPremium: number;
};

export const ML_CATEGORIAS: Record<MLChileCategoria, MLChileCategoriaConfig> = {
  computacion:       { label: 'Computación y electrónica',      comisionClasica: 0.13, comisionPremium: 0.16 },
  celulares:         { label: 'Celulares y telefonía',           comisionClasica: 0.13, comisionPremium: 0.16 },
  electrodomesticos: { label: 'Electrodomésticos',               comisionClasica: 0.13, comisionPremium: 0.16 },
  ropa_accesorios:   { label: 'Ropa, calzado y accesorios',     comisionClasica: 0.17, comisionPremium: 0.20 },
  deportes:          { label: 'Deportes y fitness',              comisionClasica: 0.17, comisionPremium: 0.20 },
  bebes:             { label: 'Bebés',                           comisionClasica: 0.15, comisionPremium: 0.18 },
  herramientas:      { label: 'Herramientas y construcción',    comisionClasica: 0.13, comisionPremium: 0.16 },
  hogar_muebles:     { label: 'Hogar, jardín y muebles',        comisionClasica: 0.15, comisionPremium: 0.18 },
  musica_juegos:     { label: 'Música, películas y videojuegos', comisionClasica: 0.17, comisionPremium: 0.20 },
  alimentos:         { label: 'Alimentos y bebidas',             comisionClasica: 0.17, comisionPremium: 0.20 },
  automotor:         { label: 'Autos, motos y repuestos',        comisionClasica: 0.03, comisionPremium: 0.05 },
  otros:             { label: 'Otras categorías',                comisionClasica: 0.15, comisionPremium: 0.18 },
};

// Estimados de envío ML Chile (CLP). El vendedor asume este costo en Premium.
export const ESTIMADOS_ENVIO_CLP = {
  chico:    { label: 'Paquete chico (hasta 1 kg)',   valor: 2990 },
  mediano:  { label: 'Paquete mediano (hasta 5 kg)', valor: 3990 },
  grande:   { label: 'Paquete grande (hasta 10 kg)', valor: 5990 },
  pesado:   { label: 'Paquete pesado (más de 10 kg)', valor: 8990 },
  cero:     { label: 'No incluye envío (comprador paga)', valor: 0 },
} as const;

export type EstimadoEnvioKey = keyof typeof ESTIMADOS_ENVIO_CLP;

const IVA_CHILE = 0.19;

export type MLChileInputs = {
  costoCLP: number;
  precioVenta: number;
  categoria: MLChileCategoria;
  tipoPublicacion: MLChileTipoPublicacion;
  costoEnvio: number;
};

export type MLChileResult = {
  precioVenta: number;
  comisionPct: number;
  comisionML: number;
  ivaComision: number;
  totalDeducidoML: number;
  costoEnvio: number;
  costoProducto: number;
  ingresosNetos: number;
  gananciaAbsoluta: number;
  margenPct: number;
  margenSobreCosto: number;
  esCosteable: boolean;
  precioMinimoRentable: number;
};

export function calcularML(inputs: MLChileInputs): MLChileResult {
  const { costoCLP, precioVenta, categoria, tipoPublicacion, costoEnvio } = inputs;
  const cat = ML_CATEGORIAS[categoria];
  const comisionPct = tipoPublicacion === 'premium' ? cat.comisionPremium : cat.comisionClasica;

  const comisionML = precioVenta * comisionPct;
  const ivaComision = comisionML * IVA_CHILE;
  const totalDeducidoML = comisionML + ivaComision;

  const ingresosNetos = precioVenta - totalDeducidoML - costoEnvio;
  const gananciaAbsoluta = ingresosNetos - costoCLP;
  const margenPct = precioVenta > 0 ? (gananciaAbsoluta / precioVenta) * 100 : 0;
  const margenSobreCosto = costoCLP > 0 ? (gananciaAbsoluta / costoCLP) * 100 : 0;
  const esCosteable = gananciaAbsoluta > 0;

  // Precio mínimo: (costo + envío) / (1 - comisionPct * (1 + IVA))
  const divisor = 1 - comisionPct * (1 + IVA_CHILE);
  const precioMinimoRentable = divisor > 0 ? (costoCLP + costoEnvio) / divisor : 0;

  return {
    precioVenta,
    comisionPct,
    comisionML,
    ivaComision,
    totalDeducidoML,
    costoEnvio,
    costoProducto: costoCLP,
    ingresosNetos,
    gananciaAbsoluta,
    margenPct,
    margenSobreCosto,
    esCosteable,
    precioMinimoRentable,
  };
}

export function precioParaMargenObjetivo(
  costoCLP: number,
  costoEnvio: number,
  categoria: MLChileCategoria,
  tipoPublicacion: MLChileTipoPublicacion,
  margenObjetivoPct: number,
): number {
  const cat = ML_CATEGORIAS[categoria];
  const comisionPct = tipoPublicacion === 'premium' ? cat.comisionPremium : cat.comisionClasica;
  const m = margenObjetivoPct / 100;
  // precio = (costo + envío) / (1 - comisionPct*(1+IVA) - m)
  const divisor = 1 - comisionPct * (1 + IVA_CHILE) - m;
  return divisor > 0 ? (costoCLP + costoEnvio) / divisor : 0;
}
