import fondo2 from '../assets/fondo2.avif';
import fondo3 from '../assets/fondo3.avif';
import fondo4 from '../assets/fondo4.avif';
import fondo5 from '../assets/fondo5.avif';
import carlista from '../assets/Carlista2.avif';
import isabelino from '../assets/isabelino2.avif';
import alfonsoXIII from '../assets/alfonsoxiii.avif';
import milicianaCopia from '../assets/Miliciana copia.avif';
import miliciasUrbanas from '../assets/SXVII.avif';
import Rayadillo_34 from '../assets/Rayadillo_3.avif';
import republicanoSxx from '../assets/republicano.avif';
import soldado1808 from '../assets/1808.avif';
import soldado_Linea2 from '../assets/Soldado_Linea2.avif';
import sublevadoSxx from '../assets/sublevado.avif';
import uniformeEstandar from '../assets/uniformeEstandar.avif';
import cuarto from '../assets/cuarto.avif';
import prendaCamisa from '../assets/prendas_miliciasUrbanas/Camisa.png';
import prendaBandaRoja from '../assets/prendas_miliciasUrbanas/Banda_roja.png';
import prenda12Apostoles from '../assets/prendas_miliciasUrbanas/12 apostoles copia.png';

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
          "Se artillaban los muelles y se patrullaba el cantábrico con embarcaciones de pesca."
        ],
        bandos: [
          {
            nombre: "Milicias Urbanas",
            base: miliciasUrbanas,
            descripcion: "Las milicias urbanas estaban formadas por ciudadanos que se agrupaban según sus gremios, como alfareros, canteros o esparteros, para coordinar la defensa de la ciudad en caso de ataque.\n\n  Por su parte, la seguridad cotidiana dependía de los corchetes y alguaciles, precursores de los actuales agentes de policía. Estos empleos semiprofesionales se centraban en perseguir a los ladrones y maleantes que merodeaban por las calles.",
            hotspots: [
              {
                label: "jubón",
                detalle: " Este tipo de prenda se llamaba jubón, y empezó a utilizarse en el S.XV. En muchos casos era de este color,  y asomaba por encima del coleto (chaleco), de ahí la expresión “a buenas horas mangas verdes”. ",
                estilo: { top: "46%", left: "62%" },
                imagen: prendaCamisa
              },
              {
                label: "Banda roja",
                detalle: "Era el principal distintivo de los Tercios españoles y de los ejércitos de la Monarquía Hispánica durante los siglos XVI y XVII. Los rangos más altos podían llevarla cruzada en el pecho.",
                estilo: { top: "30%", left: "62%" },
                imagen: prendaBandaRoja
              },
              {
                label: "12 apóstoles",
                detalle: "Estos frascos contenían la cantidad justa de pólvora necesaria para cada disparo por lo que hacía que las cargas fueran más rápidas que hacerlo desde un cuerno tradicional, que también llevaban para cuando se les acabaran los ‘apóstoles‘.",
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
          },
          {
            nombre: "Cuarto regimiento de artillería",
            base: cuarto,
            descripcion: "De manera progresiva, el Ejército español adoptó el azul mediante un decreto de principios de 1800 que buscaba estandarizar la uniformidad. El estallido de la contienda sorprendió a muchos regimientos todavía vestidos de blanco, por lo que la unificación total no se alcanzó hasta los años 1809 a 1811.\n\n El motivo principal de este cambio fue la durabilidad. A diferencia del blanco, que se ensuciaba y desgastaba prematuramente en el campo de batalla, el paño teñido de azul resistía mucho mejor las condiciones extremas de la guerra.",
            alineacion: "right"
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
            descripcion: "La 1ª Guerra Carlista, llega a la ciudad de Gijón, y la ciudad se posicionó mayoritariamente de parte de las tropas isabelinas. Defendían la ciudad de la entrada de las tropas carlistas que llegaban desde el interior.\n\n Se crea la Milicia Nacional, y el shakó (el sombrero) se convierte en el elemento diferenciador de las tropas.",
            alineacion: "left"
          },
          {
            nombre: "Carlistas",
            base: carlista,
            descripcion: "La uniformidad del bando carlista se desarrolló de manera irregular a medida que evolucionaba el conflicto, pero el uso de la gorra fue una constante.\n\n A Gijón no llegaron prácticamente la segunda ni la tercera guerra, por lo que la presencia de partidarios carlistas en la ciudad era casi clandestina. Para moverse con libertad, estos hombres a veces se quitaban la boina, eliminando así su único distintivo político y militar.",
            alineacion: "right"
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
            alineacion: "left"
          },
          {
            nombre: "Rayadillo",
            base: Rayadillo_34,
            descripcion: "El rayadillo fue un uniforme militar de algodón con rayas azules y blancas, introducido aproximadamente en 1852 por el ejército español para sus tropas de ultramar en Cuba, Filipinas y Puerto Rico.\n\n  Diseñado para climas tropicales cálidos y húmedos, ofrecía comodidad y resistencia sustituyendo a la lana. En Gijón pudimos ver este atuendo en los reclutas que embarcaban en el puerto.",
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
            alineacion: "left"
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
            alineacion: "left"
          },
          {
            nombre: "Bando Sublevado",
            base: sublevadoSxx,
            descripcion: "Los militares del bando sublevado vestían una guerrera de color caqui con cuello cerrado y el pantalón noruego con vendas en las pantorrillas y botas altas. Llevan el isabelino, un gorro con borla típico de las unidades de infantería de la época, que algunas milicianas usaron también colocando una estrella. Conservan una estética de ejército regular, a diferencia de las milicianas.",
            alineacion: "right",
          }
        ]
      }
    ]
  }
];
