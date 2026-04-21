import fondo2 from '../assets/fondo2.avif';
import fondo3 from '../assets/fondo3.avif';
import fondo4 from '../assets/fondo4.avif';
import fondo5 from '../assets/fondo5.avif';
import carlista from '../assets/Carlista2.avif';
import isabelino from '../assets/isabelino.png';
import alfonsoXIII from '../assets/alfonsoxiii.avif';
import milicianaCopia from '../assets/Miliciana copia.avif';
import miliciasUrbanas from '../assets/SXVII_2 copia (1).png';
import Rayadillo_34 from '../assets/Rayadillo_3.avif';
import republicanoSxx from '../assets/republicano.avif';
import soldado1808 from '../assets/1808.avif';
import soldado_Linea2 from '../assets/Soldado_Linea2.avif';
import sublevadoSxx from '../assets/sublevado.avif';
import uniformeEstandar from '../assets/uniformeEstandar.avif';
import regimiento4 from '../assets/4regimiento.png';
import cuartoPluma from '../assets/prendas_4Artilleria/pluma.png';
import cuartoChaleco from '../assets/prendas_4Artilleria/chaleco-detalle.png';
import soldado1808Botones from '../assets/prendas_1808/botones.png';
import soldado1808Camisa from '../assets/prendas_1808/camisa copia.png';
import soldado1808Panuelo from '../assets/prendas_1808/pañuelo negro.png';
import isabelinoGorro from '../assets/prendas_isabelinos/gorro.png';
import isabelinoPenacho from '../assets/prendas_isabelinos/penacho.png';
import isabelinoFlecos from '../assets/prendas_isabelinos/flecos traje.png';
import carlistaBoina from '../assets/prendas_carlistas/boina carlista.png';
import carlistaAlpargates from '../assets/prendas_carlistas/alpargates carlistas.png';
import prendaCamisa from '../assets/prendas_miliciasUrbanas/Camisa.png';
import prendaBandaRoja from '../assets/prendas_miliciasUrbanas/Banda_roja.png';
import prenda12Apostoles from '../assets/prendas_miliciasUrbanas/12 apostoles copia.png';
import capaBrazalete from '../assets/capa brazalete-lite.webp';
import fragmentoCamisa from '../assets/fragmento_camisa.png';
import soldadoLineaGorro from '../assets/prendas_SoldadoLinea/sombrero (1).png';
import soldadoLineaCasaca from '../assets/prendas_SoldadoLinea/trozo de paño.png';
import soldadoLineaZapatos from '../assets/prendas_SoldadoLinea/zapatos (2).png';

const makeHotspots = (...items) =>
  items.map(([label, detalle, top, left, imagen, extra = {}]) => ({
    label,
    detalle,
    estilo: { top, left },
    ...(imagen ? { imagen } : {}),
    ...extra,
  }));

export const HISTORIA = [
  {
    siglo: "S. XVII",
    etiqueta: "Siglo XVII",
    acento: "#bf8c6d",
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
          "Se artillaban los muelles y se patrullaba el Cantábrico con embarcaciones de pesca."
        ],
        bandos: [
          {
            nombre: "Milicias Urbanas",
            base: miliciasUrbanas,
            overlayHotspots: [
              {
                image: prendaBandaRoja,
                overlayImage: capaBrazalete,
                label: "Banda roja",
                detalle: "Era el principal distintivo de los Tercios españoles y de los ejércitos de la Monarquía Hispánica durante los siglos XVI y XVII. Los rangos más altos podían llevarla cruzada en el pecho.",
                estilo: { top: "30%", left: "62%" },
                overlayOffsetY: "0%",
              },
              {
                image: prendaCamisa,
                overlayImage: fragmentoCamisa,
                label: "jubón",
                detalle: " Este tipo de prenda se llamaba jubón, y empezó a utilizarse en el S.XV. En muchos casos era de este color,  y asomaba por encima del coleto (chaleco), de ahí la expresión “a buenas horas mangas verdes”. ",
                estilo: { top: "38%", left: "28%" },
                overlayOffsetY: "0%",
                overlayHit: { top: "37.8%", left: "39.6%", width: "11.8%", height: "26.0%", borderRadius: "12%" },
              }
            ],
            descripcion: "Las milicias urbanas estaban formadas por ciudadanos que se agrupaban según sus gremios, como alfareros, canteros o esparteros, para coordinar la defensa de la ciudad en caso de ataque.\n\n  Por su parte, la seguridad cotidiana dependía de los corchetes y alguaciles, precursores de los actuales agentes de policía. Estos empleos semiprofesionales se centraban en perseguir a los ladrones y maleantes que merodeaban por las calles.",
            hotspots: [
              {
                label: "12 apóstoles",
                detalle: "Estos frascos contenían la cantidad justa de pólvora necesaria para cada disparo por lo que hacía que las cargas fueran más rápidas que hacerlo desde un cuerno tradicional, que también llevaban para cuando se les acabaran los ‘apóstoles’.",
                estilo: { top: "36%", left: "48%" },
                arrowTarget: { x: "23%", y: "60%" },
                imagen: prenda12Apostoles
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
            base: soldado_Linea2,
            descripcion: "La llegada de los Borbones a España supuso la reorganización de los antiguos Tercios, que fueron sustituidos por Regimientos. Este cambio dio paso a ejércitos más reducidos, pero mejor adiestrados, remunerados, uniformados y alimentados.\n\n Bajo este nuevo modelo, todos los soldados vestían igual; una medida de la administración borbónica para fomentar el orgullo, la camaradería y la lealtad compartida, concepto conocido en francés como esprit de corps. En este contexto, el Regimiento de Infantería Asturias representado aquí, desempeñó un papel fundamental durante las campañas en Italia.",
            hotspots: makeHotspots(
              [
                'Gorro',
                'Cobertura de cabeza reglamentaria para distinguir la unidad y mantener la disciplina visual.',
                '17%',
                '50%',
                soldadoLineaGorro,
              ],
              [
                'Casaca',
                'Prenda principal de línea, con corte rígido y botones frontales para el servicio diario.',
                '43%',
                '50%',
                soldadoLineaCasaca,
              ],
              [
                'Zapatos',
                'Calzado resistente y cerrado, pensado para la marcha, la formación y el terreno irregular.',
                '77%',
                '49%',
                soldadoLineaZapatos,
              ],
            ),
          }
        ]
      }
    ]
  },
  {
    siglo: "S. XIX",
    etiqueta: "Siglo XIX",
    acento: "#6b7456",
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
            descripcion: "Hay un cambio significativo en cuanto a la indumentaria militar a principios de este siglo, ya que a finales del siglo anterior empiezan los cambios. Se eliminó el blanco borbónico y se usaba el paño pardo, al ser más económico y fácil de conseguir en la región. \n\nVestían casaca corta de paño pardo, con líneas en los puños que representaban el rango del militar."
            ,
            hotspots: makeHotspots(
              ['Pañuelo negro', 'Pañuelo de abrigo y sujeción usado como complemento ligero en campaña.', '14%', '50%', soldado1808Panuelo],
              ['Camisa', 'Prenda interior de lienzo, visible bajo la casaca parda y de uso cotidiano.', '40%', '50%', soldado1808Camisa, { imageScaleMultiplier: 1.9 }],
              ['Botones', 'Botonadura sencilla y funcional, clave para cerrar y ordenar la casaca.', '66%', '49%', soldado1808Botones],
            ),
          },
          {
            nombre: "Cuarto regimiento de artillería",
            base: regimiento4,
            descripcion: "De manera progresiva, el Ejército español adoptó el azul mediante un decreto de principios de 1800 que buscaba estandarizar la uniformidad. El estallido de la contienda sorprendió a muchos regimientos todavía vestidos de blanco, por lo que la unificación total no se alcanzó hasta los años 1809 a 1811.\n\n El motivo principal de este cambio fue la durabilidad. A diferencia del blanco, que se ensuciaba y desgastaba prematuramente en el campo de batalla, el paño teñido de azul resistía mucho mejor las condiciones extremas de la guerra.",
            alineacion: "right",
            hotspots: makeHotspots(
              ['Pluma', 'Penacho decorativo y distintivo que coronaba el gorro del artillero.', '14%', '50%', cuartoPluma],
              ['Chaleco', 'Prenda principal del regimiento, con el azul característico de la artillería.', '41%', '49%', cuartoChaleco],
            ),
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
            descripcion: "La 1ª Guerra Carlista llega a la ciudad de Gijón, y la ciudad se posicionó mayoritariamente de parte de las tropas isabelinas. Defendían la ciudad de la entrada de las tropas carlistas que llegaban desde el interior.\n\n Se crea la Milicia Nacional, y el shakó (el sombrero) se convierte en el elemento diferenciador de las tropas.",
            alineacion: "left",
            hotspots: makeHotspots(
              ['Shakó', 'Elemento de cabeza característico de la Milicia Nacional y de la estética isabelina.', '15%', '50%', isabelinoGorro],
              ['Casaca', 'Prenda de corte más europeo, asociada a la disciplina de las tropas regulares.', '41%', '49%', isabelinoFlecos],
              ['Galones', 'Detalles en puños y pecho que marcaban jerarquía y pertenencia.', '66%', '44%', isabelinoPenacho],
            ),
          },
          {
            nombre: "Carlistas",
            base: carlista,
            descripcion: "La uniformidad del bando carlista se desarrolló de manera irregular a medida que evolucionaba el conflicto, pero el uso de la gorra fue una constante.\n\n A Gijón no llegaron prácticamente la segunda ni la tercera guerra, por lo que la presencia de partidarios carlistas en la ciudad era casi clandestina. Para moverse con libertad, estos hombres a veces se quitaban la boina, eliminando así su único distintivo político y militar.",
            alineacion: "right",
            hotspots: makeHotspots(
              ['Boina', 'La boina era el distintivo más reconocible del bando carlista.', '16%', '50%', carlistaBoina],
              ['Alpargates', 'Calzado ligero y funcional, muy útil para moverse por terreno irregular.', '66%', '47%', carlistaAlpargates],
              ['Capote', 'Prenda amplia y funcional, pensada para el frío y el movimiento en montaña.', '42%', '51%', carlista],
            ),
          }
        ]
      },
      {
        id: "hispano-americana",
        nombre: "Guerra Hispano-Americana",
        subtitulo: "Rayadillo_34 vs Estándar",
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
            descripcion: "Estos son los uniformes de los soldados metropolitanos. La ciudad no era un campo de batalla, sino un puerto estratégico con miedo a un ataque de la armada estadounidense al Cantábrico.\n\nLas diferencias jerárquicas en los uniformes se marcaban visualmente mediante galones, detalles en las bocamangas y emblemas en el cuello, y este uniforme los diferenciaba de las tropas que iban al Caribe.",
            alineacion: "left",
            hotspots: makeHotspots(
              ['Cuello', 'El cuello y sus emblemas ayudaban a distinguir funciones y grado.', '15%', '50%', uniformeEstandar],
              ['Bocamanga', 'Las bocamangas marcaban jerarquía y remates del uniforme.', '41%', '49%', uniformeEstandar],
              ['Galones', 'Los galones concentraban el lenguaje visual del rango militar.', '66%', '52%', uniformeEstandar],
            ),
          },
          {
            nombre: "Rayadillo",
            base: Rayadillo_34,
            descripcion: "El rayadillo fue un uniforme militar de algodón con rayas azules y blancas, introducido aproximadamente en 1852 por el ejército español para sus tropas de ultramar en Cuba, Filipinas y Puerto Rico.\n\n  Diseñado para climas tropicales cálidos y húmedos, ofrecía comodidad y resistencia sustituyendo a la lana. En Gijón pudimos ver este atuendo en los reclutas que embarcaban en el puerto.",
            alineacion: "right",
            hotspots: makeHotspots(
              ['Rayas del tejido', 'El tejido rayado era la seña de identidad del uniforme colonial.', '15%', '50%', Rayadillo_34],
              ['Camisa ligera', 'Una prenda pensada para soportar mejor el calor y la humedad.', '41%', '49%', Rayadillo_34],
              ['Pantalón blanco', 'La parte inferior se aligeraba para mejorar la comodidad en ultramar.', '67%', '47%', Rayadillo_34],
            ),
          }
        ]
      }
    ]
  },
  {
    siglo: "S. XX",
    etiqueta: "Siglo XX",
    acento: "#c1a04d",
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
            alineacion: "left",
            hotspots: makeHotspots(
              ['Gorra de plato', 'La gorra de plato sustituye la estética más monárquica por una imagen republicana.', '15%', '50%', republicanoSxx],
              ['Guerrera caqui', 'La guerrera de cuatro bolsillos resume la sobriedad de la época.', '41%', '50%', republicanoSxx],
              ['Botas altas', 'El calzado alto reforzaba presencia y funcionalidad en servicio.', '67%', '48%', republicanoSxx],
            ),
          }
        ]
      },
      {
        id: "pre-guerra",
        nombre: "Antes de la Guerra",
        subtitulo: "Uniforme 1926",
        posicion: "top",
        descripcionBreve: "Tropas monárquicas con uniformes con galones dorados y boina.",
        detalles: [
          "Énfasis en guardias montadas y escoltas reales.",
          "Camisas de dril y cinturones con hebillas bruñidas."
        ],
        bandos: [
          {
            nombre: "Uniforme 1926",
            base: alfonsoXIII,
            descripcion: "Este es el uniforme reglamentario de 1926, que es el que llevaban todos los soldados independientemente de en qué bando se encuadraran al comenzar la Guerra Civil.\n\nBásicamente, el uniforme consta de 4 elementos: pantalón granadero, camisa caqui, guerrera y gorro isabelino, así como un complemento de cuero que eran las cartucheras. Iba acompañado de mantas, abrigos y otros elementos para el frío, y además los rangos más altos llevaban gorras como la de la imagen.",
            alineacion: "left",
            hotspots: makeHotspots(
              ['Gorro isabelino', 'Elemento de cabeza reglamentario, muy reconocible en la imagen.', '15%', '50%', alfonsoXIII],
              ['Guerrera', 'La guerrera define la silueta del uniforme reglamentario de 1926.', '41%', '49%', alfonsoXIII],
              ['Cartucheras', 'El cuero y el equipamiento rematan la dotación del soldado.', '67%', '48%', alfonsoXIII],
            ),
          }
        ]
      },
      {
        id: "guerra-civil",
        nombre: "Guerra Civil",
        subtitulo: "Milicianos",
        posicion: "bottom",
        descripcionBreve: "Movilización de milicias populares de Gijón con gorra simple y mono de trabajo.",
        destacado: true,
        movilizacion:
          "Milicias populares de Gijón organizaron columnas de emergencia para defender la ciudad junto a obreros ferroviarios y pescadores.",
        bandos: [
          {
            nombre: "Milicianos",
            base: milicianaCopia,
            descripcion: "El uniforme más icónico del miliciano republicano en Gijón no fue el uniforme anterior, sino el mono azul o caqui. La ropa de los obreros convertida en ropa de combate. Los soldados republicanos en Asturias usan el casco Trubia (fabricado aquí mismo, en la Fábrica de Trubia) o el casco checo/soviético que llegaba por el puerto de El Musel.\n\nEran personas de las calles que tomaron los fusiles y después fueron al frente con lo que tenían a mano. Cuando nos referimos a lo que tenían cercano no es solo ropa civil, sino una amalgama de ropas salidas de casas y cuarteles.",
            alineacion: "left",
            hotspots: makeHotspots(
              ['Casco Trubia', 'Uno de los cascos más reconocibles de la milicia republicana asturiana.', '15%', '50%', milicianaCopia],
              ['Mono de trabajo', 'La ropa obrera convertida en uniforme de combate.', '41%', '49%', milicianaCopia],
              ['Equipo y fusil', 'El armamento y los elementos colgados del cuerpo daban la imagen de urgencia.', '68%', '48%', milicianaCopia],
            ),
          },
          {
            nombre: "Bando Sublevado",
            base: sublevadoSxx,
            descripcion: "Los militares del bando sublevado vestían una guerrera de color caqui con cuello cerrado y el pantalón noruego con vendas en las pantorrillas y botas altas. Llevan el isabelino, un gorro con borla típico de las unidades de infantería de la época, que algunas milicianas usaron también colocando una estrella. Conservan una estética de ejército regular, a diferencia de las milicianas.",
            alineacion: "right",
            hotspots: makeHotspots(
              ['Isabelino', 'El gorro con borla remite a la infantería regular de la época.', '15%', '50%', sublevadoSxx],
              ['Guerrera caqui', 'La guerrera de cuello cerrado marca la estructura del uniforme.', '41%', '50%', sublevadoSxx],
              ['Vendas y botas', 'La parte inferior mezcla protección y apariencia de tropa regular.', '67%', '46%', sublevadoSxx],
            ),
          }
        ]
      }
    ]
  }
];


