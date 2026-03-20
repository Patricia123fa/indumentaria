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
import prendaCamisaChaleco from '../assets/prendas_miliciasUrbanas/Camisa_chaleco.png';
import prendaPantalones from '../assets/prendas_miliciasUrbanas/pantalones.png';
import prendaSombrero from '../assets/prendas_miliciasUrbanas/sombrero.png';

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
            descripcion: "Los soldados de provincia solian vestir con colores sobrios, muchas veces con su indumentaria de diario. En torno al 90% eran vecinos, pescadores y artesanos que tenían que defender la ciudad.\n\nSolían usar camisa de lino, chaleco de cuero oscuro, pantalon gris de lana por la rodilla y botas, ya que las condiciones ambientales eran duras. También llevaban un sombrero de ala, normalmente sin pluma; pero quienes tenían mas recursos podían anadirla. Para que los vigías del cerro no dispararan a los vecinos que defendían la ciudad, se usaba una banda roja de tafetan o lana.",
            hotspots: [
              {
                label: "Sombrero",
                detalle: "Sombrero civil usado por milicianos en patrullas y defensa costera.",
                estilo: { top: "17%", left: "52%" },
                imagen: prendaSombrero
              },
              {
                label: "Camisa y chaleco",
                detalle: "Prenda superior de uso civil adaptada para servicio defensivo.",
                estilo: { top: "50%", left: "60%" },
                imagen: prendaCamisaChaleco
              },
              {
                label: "Pantalones",
                detalle: "Pantalones de trabajo resistentes para desplazamientos en terreno urbano.",
                estilo: { top: "74%", left: "38%" },
                arrowTarget: { x: "23%", y: "60%" },
                imagen: prendaPantalones
              }
            ]
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
            descripcion: "En este momento, el rey de España Felipe V era nieto del Rey Sol francés, Luis XIV. Esto hizo que unificara los ejércitos y trajera de Francia sus fábricas textiles.\n\nEl uniforme no era solo ropa: era propaganda, y hacía que los ejércitos en España parecieran profesionales y modernos.\n\nEn Asturias, se formaron regimientos que vestían ese color blanco que se menciona. Un ejemplo notable fue el Regimiento de Infantería de Asturias, que participó en batallas clave de la península."
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
            descripcion: "Hay un cambio significativo en cuanto a la indumentaria militar a principios de este siglo, ya que a finales del siglo anterior empiezan los cambios. Debido a la falta de fondos, se eliminó el blanco borbónico y se usaba el paño pardo, al ser más económico y fácil de conseguir sin teñir.\n\nVestían casaca corta de paño pardo, calzón largo hasta debajo de la espinilla del mismo paño, poncho, chaleco de paño blanco, botín pequeño de paño negro y sombrero redondo con algo más de 3 pulgadas de ala."
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
          {
            nombre: "Isabelinos",
            base: isabelino,
            descripcion: "En Gijón, la ciudad fue mayoritariamente isabelina (liberal). El ambiente cambió: ya no era la lucha heroica y desastrosa contra Napoleón, sino una guerra civil profesionalizada.\n\nSe crea la Milicia Nacional, y el gobierno de Isabel busca la uniformidad política creando reglamentos estrictos para que todos los soldados de España vistieran igual.\n\nSe introduce el shakó: era más bajo y ancho que el francés de Napoleón, con una placa de latón con el número del regimiento y un pompón rojo.",
            alineacion: "left"
          },
          {
            nombre: "Carlistas",
            base: carlista,
            descripcion: "En esta guerra, la prenda de cabeza lo decía todo. La boina era el símbolo absoluto de los carlistas. En Gijón intentaban pasar desapercibidos sin usar la boina.\n\nEn las tropas se usaban boinas de diferentes colores; al principio más grandes y luego fueron reduciendo su tamaño. Usaban alpargatas por ser más prácticas que las botas.",
            alineacion: "right"
          }
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
          {
            nombre: "Uniforme Estándar",
            base: uniformeEstandar,
            descripcion: "La ciudad no era un campo de batalla, sino un puerto estratégico en alerta roja por miedo a un ataque de la armada estadounidense al Cantábrico.\n\nVestían la guerrera azul oscuro de paño con cuello rojo y el icónico pantalón colorado (rojo). Había variaciones según el rango. En la cabeza llevaban el Ros, ese gorro de fieltro gris con visera, muy típico de la península y que los diferenciaba de las tropas que iban al Caribe.",
            alineacion: "left"
          },
          {
            nombre: "Rayadillo",
            base: rayadillo,
            descripcion: "El rayadillo fue un uniforme militar de algodón con rayas azules y blancas, introducido aproximadamente en 1852 por el ejército español para sus tropas de ultramar en Cuba, Filipinas y Puerto Rico. Diseñado para climas tropicales cálidos y húmedos, ofrecía comodidad y resistencia, sustituyendo a la lana. Aquí pudimos verlo en los reclutas que embarcaban en el puerto.\n\nLos soldados ya llevaban la guerrera y el pantalón de rayadillo con su sombrero de paja durante 1898.",
            alineacion: "right"
          }
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
            descripcion: "El uniforme de la Segunda República se mantiene casi igual, pero con cambios en los símbolos políticos. Se eliminan todas las coronas reales que pudiera llevar el uniforme. Se fue eliminando el uniforme rojo y azul de diario poco a poco para quedarse solo con el caqui.\n\nLos oficiales llevaban gorra de plato, habitualmente sin armar, botas altas y una guerrera de cuatro bolsillos, aunque no fue altamente distribuido por las limitaciones del gobierno en producirlo.",
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
            descripcion: "Este es el uniforme reglamentario de 1926, que es el que llevaban todos los soldados independientemente de en qué bando se encuadraran al comenzar la Guerra Civil.\n\nBásicamente, el uniforme consta de 4 elementos: pantalón granadero, camisa caqui, guerrera y gorro isabelino, así como un complemento de cuero que eran las cartucheras. Iba acompañado de mantas, abrigos y otros elementos para el frío, y además los rangos más altos llevaban gorras como la de la imagen.",
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
            descripcion: "El uniforme más icónico del miliciano republicano en Gijón no fue el uniforme anterior, sino el mono azul o caqui. La ropa de los obreros convertida en ropa de combate. Los soldados republicanos en Asturias usan el casco Trubia (fabricado aquí mismo, en la Fábrica de Trubia) o el casco checo/soviético que llegaba por el puerto de El Musel.\n\nEran personas de las calles que tomaron los fusiles y después fueron al frente con lo que tenían a mano. Cuando nos referimos a lo que tenían cercano no es solo ropa civil, sino una amalgama de ropas salidas de casas y cuarteles.",
            alineacion: "left"
          },
          {
            nombre: "Bando Sublevado",
            base: sublevadoSxx,
            descripcion: "Los militares del bando sublevado vestían una guerrera de color caqui con cuello cerrado y el pantalón noruego con vendas en las pantorrillas y botas altas. Llevan el isabelino, un gorro con borla típico de las unidades de infantería de la época, que algunos milicianos usaron también colocando una estrella. Conservan una estética de ejército regular, a diferencia de los milicianos.",
            alineacion: "right",
          }
        ]
      }
    ]
  }
];
