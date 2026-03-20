import fondo2 from '../assets/fondo2.png';
import fondo3 from '../assets/fondo3.png';
import fondo4 from '../assets/fondo4.png';
import fondo5 from '../assets/fondo5.png';
import carlista from '../assets/Carlista.png';
import isabelino from '../assets/isabelino.png';
import alfonsoXIII from '../assets/alfonsoxiii.png';
import milicianoSxx from '../assets/milicianos.png';
import miliciasUrbanas from '../assets/milicias_urbanas.png';
import rayadillo from '../assets/rayadillo.png';
import republicanoSxx from '../assets/republicano.png';
import soldado1808 from '../assets/soldado_1808.png';
import soldadoLinea from '../assets/soldado_linea.png';
import sublevadoSxx from '../assets/sublevado.png';
import uniformeEstandar from '../assets/uniforme_estandar.png';

export const HISTORIA = [
  {
    siglo: "S. XVII",
    etiqueta: "Siglo XVII",
    acento: "#bf8c6d",
    circuloImagen: "/assets/S-XVII/base.png",
    fondo: fondo4,
    conflictos: [
      {
        id: "defensa-gijon",
        nombre: "Defensa de Gijón",
        subtitulo: "Milicias Urbanas con ropa civil reforzada",
        posicion: "top",
        descripcionBreve: "Milicias obreras y marítimas que improvisaban protecciones para defender la costa.",
        detalles: [
          "Se organizaron grupos ciudadanos liderados por oficiales locales.",
          "Se artillaban los muelles y se patrullaba el cantábrico con embarcaciones de pesca."
        ],
        bandos: [
          {
            nombre: "Milicias Urbanas",
            base: miliciasUrbanas,
            descripcion: "Esta infantería gijonesa se armaba con ropa civil reforzada y se especializaba en defensa litoral."
          }
        ]
      }
    ]
  },
  {
    siglo: "S. XVIII",
    etiqueta: "Siglo XVIII",
    acento: "#7fa9d6",
    circuloImagen: "/assets/S-XVIII/base.png",
    fondo: fondo3,
    conflictos: [
      {
        id: "sucesion",
        nombre: "Guerra de Sucesión",
        subtitulo: "Soldado de Línea",
        posicion: "bottom",
        descripcionBreve: "Uniformes rígidos, bayonetas largas y orden cerrada para imponerse en Europa.",
        detalles: [
          "Despliegue de fogueo en batallones de infantería de línea.",
          "La corona centralizó la producción de casacas y fusiles."
        ],
        bandos: [
          {
            nombre: "Soldado de Línea",
            base: soldadoLinea,
            descripcion: "Fuerte adiestramiento, gorra de placa y fusil de avancarga para mantener la línea."
          }
        ]
      }
    ]
  },
  {
    siglo: "S. XIX",
    etiqueta: "Siglo XIX",
    acento: "#6b7456",
    circuloImagen: isabelino,
    fondo: fondo5,
    conflictos: [
      {
        id: "independencia",
        nombre: "Guerra de Independencia",
        subtitulo: "Soldado 1808",
        posicion: "top",
        descripcionBreve: "Resistencia urbana y guerrilla contra las tropas napoleónicas.",
        detalles: [
          "Se reorganizaron las milicias provinciales y se movilizaron voluntarios.",
          "Soldado con botonaduras sencillas y casco continental reempleado."
        ],
        bandos: [
          {
            nombre: "Soldado 1808",
            base: soldado1808,
            descripcion: "Uniforme recogido, botas altas y fusil de mecha adaptado para partidas rápidas."
          }
        ]
      },
      {
        id: "carlistas",
        nombre: "Guerras Carlistas",
        subtitulo: "Isabelinos vs Carlistas",
        posicion: "bottom",
        descripcionBreve: "Lucha fratricida con pronunciamientos y líneas montañosas.",
        detalles: [
          "Los carlistas usaban capotes y bocas estrechas para camuflarse en la sierra.",
          "Los isabelinos adoptaron uniformes más europeos para inspirar disciplina."
        ],
        bandos: [
          { nombre: "Isabelinos", base: isabelino, alineacion: "left" },
          { nombre: "Carlistas", base: carlista, alineacion: "right" }
        ]
      },
      {
        id: "hispano-americana",
        nombre: "Guerra Hispano-Americana",
        subtitulo: "Rayadillo vs Estándar",
        posicion: "bottom",
        descripcionBreve: "Tropas tropicales con prendas ligeras, rayadillo azul y uniformes estándar.",
        detalles: [
          "Rayadillo de algodón con pantalón blanco para el calor caribeño.",
          "Uniformes estándar para oficiales y unidades desde la península."
        ],
        bandos: [
          { nombre: "Uniforme Estándar", base: uniformeEstandar, alineacion: "left" },
          { nombre: "Rayadillo", base: rayadillo, alineacion: "right" }
        ]
      }
    ]
  },
  {
    siglo: "S. XX",
    etiqueta: "Siglo XX",
    acento: "#c1a04d",
    circuloImagen: milicianoSxx,
    fondo: fondo2,
    conflictos: [
      {
        id: "republica",
        nombre: "Segunda República",
        subtitulo: "Soldado Republicano",
        posicion: "top",
        descripcionBreve: "Repúblicas reformistas con uniformes nuevos y brigadas urbanas.",
        detalles: [
          "Modernización de cadenas de mando y fajines azules.",
          "Aparición de unidades mixtas con campesinos y obreros."
        ],
        bandos: [
          {
            nombre: "Soldado Republicano",
            base: republicanoSxx,
            descripcion: "Equipamiento más ligero, botas de tela y gorra visera.",
            alineacion: "left"
          }
        ]
      },
      {
        id: "pre-guerra",
        nombre: "Antes de la Guerra",
        subtitulo: "Soldado Alfonso XIII",
        posicion: "top",
        descripcionBreve: "Tropas monárquicas con uniformes con galones dorados y boina.",
        detalles: [
          "Énfasis en guardias montadas y escoltas reales.",
          "Camisas de dril y cinturones con hebillas bruñidas."
        ],
        bandos: [
          {
            nombre: "Soldado Alfonso XIII",
            base: alfonsoXIII,
            descripcion: "Uniforme ceremonial con charreteras doradas y botas altas.",
            alineacion: "left"
          }
        ]
      },
      {
        id: "guerra-civil",
        nombre: "Guerra Civil",
        subtitulo: "Milicianos Populares",
        posicion: "bottom",
        descripcionBreve: "Movilización de milicias populares de Gijón con gorra simple y mono de trabajo.",
        destacado: true,
        movilizacion:
          "Milicias populares de Gijón organizaron columnas de emergencia para defender la ciudad junto a obreros ferroviarios y pescadores.",
        bandos: [
          {
            nombre: "Milicianos",
            base: milicianoSxx,
            descripcion: "Vestimenta improvisada: gorra de lona, mono de trabajo y correajes rudimentarios.",
            alineacion: "left",
          },
          {
            nombre: "Bando Sublevado",
            base: sublevadoSxx,
            descripcion: "Uniformes más estructurados con cascos y equipo de infantería clásico.",
            alineacion: "right",
          }
        ],
        hotspots: [
          {
            label: "Gorra simple",
            detalle: "Gorra de lona con visera pequeña, símbolo de identificación popular.",
            estilo: { top: "14%", left: "46%" }
          },
          {
            label: "Mono de trabajo",
            detalle: "Pantalón enterizo con refuerzos en rodillas y bolsillos laterales.",
            estilo: { top: "50%", left: "60%" }
          },
          {
            label: "Correajes",
            detalle: "Tirantes de cuero sujetaban cartucheras, cantimplora y granadas improvisadas.",
            estilo: { top: "74%", left: "38%" }
          }
        ]
      }
    ]
  }
];

