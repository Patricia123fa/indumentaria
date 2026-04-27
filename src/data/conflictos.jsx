import fondo2 from '../assets/fondo2.avif';
import fondo3 from '../assets/fondo3.avif';
import fondo4 from '../assets/fondo4.avif';
import fondo5 from '../assets/fondo5.avif';
import carlista from '../assets/Carlista2.avif';
import isabelino from '../assets/isabelino.png';
import nacionalCopia from '../assets/nacional copia (1).png';
import miliciana2 from '../assets/miliciana_2.png';
import miliciasUrbanas from '../assets/SXVII_2 copia (1).png';
import Rayadillo_34 from '../assets/Rayadillo_3.avif';
import republicanoSxx from '../assets/segunda republica (1).png';
import soldado_1808 from '../assets/soldado_1808.png';
import soldado_Linea2 from '../assets/Soldado_Linea2.avif';
import sublevadoSxx from '../assets/soldado infanteria-verano (1).png';
import guerraHispanoAmericana from '../assets/guerra hispano-americana.png';
import regimiento4 from '../assets/4regimiento.png';
import cuartoPluma from '../assets/prendas_4Artilleria/pluma.png';
import cuartoPlumaFragmento from '../assets/prendas_4Artilleria/plumon_fragmento.png';
import cuartoChaleco from '../assets/prendas_4Artilleria/chaleco-detalle.png';
import cuartoChalecoFragmento from '../assets/prendas_4Artilleria/chaleco_fragmento.png';
import cuartoPantalon from '../assets/prendas_4Artilleria/Detalle pantalón.png';
import cuartoPantalonFragmento from '../assets/prendas_4Artilleria/pantalon_fragmento (1).png';
import soldado1808Botones from '../assets/prendas_1808/botones.png';
import soldado1808BotonesFragmento from '../assets/prendas_1808/botones_cacho.png';
import soldado1808Camisa from '../assets/prendas_1808/camisa copia.png';
import soldado1808CamisaFragmento from '../assets/prendas_1808/camisa_cacho.png';
import soldado1808Panuelo from '../assets/prendas_1808/pañuelo negro.png';
import soldado1808PanueloFragmento from '../assets/prendas_1808/pañuelo_cacho (1).png';
import isabelinoGorro from '../assets/prendas_isabelinos/gorro.png';
import isabelinoGorroCacho from '../assets/prendas_isabelinos/isabelain_fragmento gorro.png';
import isabelinoPenacho from '../assets/prendas_isabelinos/penacho.png';
import isabelinoPenachoCacho from '../assets/prendas_isabelinos/isabelain_fragmento pomponete.png';
import isabelinoFlecos from '../assets/prendas_isabelinos/flecos traje.png';
import isabelinoHombreraCacho from '../assets/prendas_isabelinos/isabelain-hombrera cacho.png';
import carlistaBoina from '../assets/prendas_carlistas/boina carlista.png';
import carlistaBoinaCacho from '../assets/prendas_carlistas/gorro_carlista_cacho.png';
import carlistaAlpargates from '../assets/prendas_carlistas/alpargates carlistas.png';
import carlistaAlpargatesCacho from '../assets/prendas_carlistas/alpargatas_carlistas_cacho.png';
import prendaCamisa from '../assets/prendas_miliciasUrbanas/Camisa.png';
import prendaBandaRoja from '../assets/prendas_miliciasUrbanas/Banda_roja.png';
import apostolesCacho from '../assets/apostoles_cacho.png';
import apostolesDetalle from '../assets/prendas_miliciasUrbanas/12 apostoles copia.png';
import capaBrazalete from '../assets/capa brazalete-lite.webp';
import fragmentoCamisa from '../assets/fragmento_camisa.png';
import soldadoLineaGorro from '../assets/prendas_SoldadoLinea/sombrero (1).png';
import soldadoLineaGorroCacho from '../assets/prendas_SoldadoLinea/gorrete_cacho (1).png';
import soldadoLineaPierna from '../assets/prendas_SoldadoLinea/cachito de pierna.png';
import soldadoLineaPiernaDetalle from '../assets/prendas_SoldadoLinea/trozo de paño.png';
import soldadoLineaZapatos from '../assets/prendas_SoldadoLinea/zapatos (2).png';
import soldadoLineaZapatosCacho from '../assets/prendas_SoldadoLinea/zapatos_cacho (1).png';
import estandarGorretuFragmento from '../assets/prendas_estandar/gorretu-fragmento.png';
import estandarGorrilloBotones from '../assets/prendas_estandar/Gorrillo botones.png';
import estandarPantalonCacho from '../assets/prendas_estandar/pantalon_cacho.png';
import estandarPantalonDetalle from '../assets/prendas_estandar/panatlón.png';
import rayadilloCuellosFragmento from '../assets/prendas_rayadillo/Rayadillo_cuellos-fragmento.png';
import rayadilloGorroFragmento from '../assets/prendas_rayadillo/Rayadillo_gorro-fragmento.png';
import rayadilloMangasFragmento from '../assets/prendas_rayadillo/Rayadillo_mangas-fragmento.png';
import rayadilloCuellosDetalle from '../assets/prendas_rayadillo/cuellos rayadillo.png';
import rayadilloGorroDetalle from '../assets/prendas_rayadillo/gorro rayadillo.png';
import rayadilloMangaDetalle from '../assets/prendas_rayadillo/manga rayadillo.png';
import republicaGorra from '../assets/prendas_republica/gorra.png';
import republicaBoticas from '../assets/prendas_republica/boticas.png';
import republicaPantalones from '../assets/prendas_republica/pantalones_2.png';
import republicaGorraCacho from '../assets/prendas_republica/segunda republica-cacho (1).png';
import republicaBoticasCacho from '../assets/prendas_republica/segunda republica botas fragmento.png';
import republicaPantalonesCacho from '../assets/prendas_republica/segunda republica_cacho pantalon.png';
import milicianaUniforme from '../assets/prendas_milicianas/miliciana_uniforme.png';
import milicianaUniformeCacho from '../assets/prendas_milicianas/miliciana_uniforme-cacho.png';
import milicianaCalzado from '../assets/prendas_milicianas/miliciana_calzado.png';
import milicianaCalzadoCacho from '../assets/prendas_milicianas/miliciana_calzado-cacho.png';
import milicianaGorro from '../assets/prendas_milicianas/miliciana-gorro (1).png';
import milicianaGorroCacho from '../assets/prendas_milicianas/miliciana_gorro cacho (1).png';

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
                estilo: { top: "29.4%", left: "72.8%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 1.3,
                overlayHit: { top: "26.8%", left: "66.5%", width: "12.6%", height: "5.1%", borderRadius: "50%" },
              },
              {
                image: prendaCamisa,
                overlayImage: fragmentoCamisa,
                label: "jubón",
                detalle: " Este tipo de prenda se llamaba jubón, y empezó a utilizarse en el S.XV. En muchos casos era de este color,  y asomaba por encima del coleto (chaleco), de ahí la expresión “a buenas horas mangas verdes”. ",
                estilo: { top: "35.4%", left: "27.3%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 1.3,
                overlayHit: { top: "23.1%", left: "20.3%", width: "14.1%", height: "24.6%", borderRadius: "12%" },
              },
              {
                image: apostolesCacho,
                detailImage: apostolesDetalle,
                label: "12 apóstoles",
                detalle: "Estos frascos contenían la cantidad justa de pólvora necesaria para cada disparo por lo que hacía que las cargas fueran más rápidas que hacerlo desde un cuerno tradicional, que también llevaban para cuando se les acabaran los ‘apóstoles’.",
                estilo: { top: "30.4%", left: "49.7%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 2.4,
                overlayHit: { top: "17.2%", left: "33.4%", width: "32.7%", height: "26.6%", borderRadius: "50%" },
                arrowTarget: { x: "23%", y: "60%" },
              }
            ],
            descripcion: "Las milicias urbanas estaban formadas por ciudadanos que se agrupaban según sus gremios, como alfareros, canteros o esparteros, para coordinar la defensa de la ciudad en caso de ataque.\n\n  Por su parte, la seguridad cotidiana dependía de los corchetes y alguaciles, precursores de los actuales agentes de policía. Estos empleos semiprofesionales se centraban en perseguir a los ladrones y maleantes que merodeaban por las calles.",
            hotspots: []
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
            overlayHotspots: [
              {
                image: soldadoLineaGorro,
                overlayImage: soldadoLineaGorroCacho,
                detailImage: soldadoLineaGorro,
                label: "Tricornio y escarapela",
                detalle: " Fue la evolución natural de la cinta roja que se colocaba en el hombro con la aparición de los uniformes estandarizados. Se traslada este distintivo a la zona más visible durante la batalla, la cabeza. Al principio, era como este en forma de lazo, evolucionando posteriormente a una forma más redondeada.",
                estilo: { top: "9%", left: "44.4%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 1.45,
                overlayHit: { top: "4.8%", left: "29.8%", width: "29.4%", height: "8.4%", borderRadius: "50%" },
              },
              {
                image: soldadoLineaPierna,
                overlayImage: soldadoLineaPierna,
                detailImage: soldadoLineaPiernaDetalle,
                label: "Trozo de paño",
                detalle: "La tela de paño está compuesta de lana tupida, un aislante térmico natural, impermeable y resistente. Este color además, era barato ya que dejaban el paño de su color natural y lo dejaban blanqueando al sol.",
                estilo: { top: "45.6%", left: "46.1%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 1.7,
                overlayHit: { top: "4.2%", left: "2.1%", width: "88.1%", height: "82.9%", borderRadius: "14%" },
              },
              {
                image: soldadoLineaZapatos,
                overlayImage: soldadoLineaZapatosCacho,
                label: "Zapatos",
                detalle: " Los zapatos no tenían una horma diferenciada para cada uno de los pies, sino que tenían una horma recta. No tenían cordones, sino que se ajustaban con una hebilla metálica y la suela se realizaba con capas de cuero prensado o madera.",
                estilo: { top: "91.4%", left: "48.5%" },
                overlayOffsetY: "0%",
                overlayHit: { top: "86.0%", left: "25.1%", width: "46.9%", height: "10.6%", borderRadius: "16%" },
              },
            ],
            hotspots: [],
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
            base: soldado_1808,
            descripcion: "Hay un cambio significativo en cuanto a la indumentaria militar a principios de este siglo, ya que a finales del siglo anterior empiezan los cambios. Se eliminó el blanco borbónico y se usaba el paño pardo, al ser más económico y fácil de conseguir en la región. \n\nVestían casaca corta de paño pardo, con líneas en los puños que representaban el rango del militar."
            ,
            overlayHotspots: [
              {
                image: soldado_1808,
                overlayImage: soldado1808PanueloFragmento,
                detailImage: soldado1808Panuelo,
                label: 'Pañuelo negro',
                detalle: 'Era una banda o tela cuya función era proteger el cuello de la camisa del cuello áspero de la casaca, absorbiendo también el sudor y actuando como barrera higiénica, ya que si el sudor llegaba a la casaca, esta no se podía lavar por ser de lana.',
                estilo: { top: '28.2%', left: '45.9%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.55,
                overlayHit: { top: '25.2%', left: '42.8%', width: '6.2%', height: '6.0%', borderRadius: '50%' },
              },
              {
                image: soldado_1808,
                overlayImage: soldado1808CamisaFragmento,
                detailImage: soldado1808Camisa,
                label: 'Camisola',
                detalle: 'La ropa interior era la de más uso del soldado. Eran camisas de lino, que es un material muy resistente, que absorbe el sudor y que se puede hervir, no como la lana, por lo que podía higienizarse de una manera más segura. Eran largas y grandes, ya que servían también como calzoncillo, protegiendo los genitales del roce de la lana del calzón. No se abrían completamente, sino unos pocos botones para permitir ponerse por la cabeza.',
                estilo: { top: '34.5%', left: '45.1%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 2.05,
                overlayHit: { top: '19.6%', left: '32.3%', width: '25.6%', height: '29.8%', borderRadius: '18%' },
              },
              {
                image: soldado_1808,
                overlayImage: soldado1808BotonesFragmento,
                detailImage: soldado1808Botones,
                label: 'Botón',
                detalle: 'Estos botones pertenece al Regimiento de Nobles de Asturias, creado en 1794. Como su nombre indica, estaba formado por miembros de la hidalguía y familias nobles. Los botones en este siglo, eran identificadores del regimiento, pero en el espacio de un botón con las prensas de la época, era necesario usar abreviaturas, ya que no entraba la palabra entera.',
                estilo: { top: '35.2%', left: '54.0%' },
                overlayOffsetY: '0%',
                overlayHit: { top: '34.1%', left: '52.4%', width: '3.3%', height: '2.2%', borderRadius: '50%' },
              },
            ],
            hotspots: [],
          },
          {
            nombre: "Cuarto regimiento de artillería",
            base: regimiento4,
            descripcion: "De manera progresiva, el Ejército español adoptó el azul mediante un decreto de principios de 1800 que buscaba estandarizar la uniformidad. El estallido de la contienda sorprendió a muchos regimientos todavía vestidos de blanco, por lo que la unificación total no se alcanzó hasta los años 1809 a 1811.\n\n El motivo principal de este cambio fue la durabilidad. A diferencia del blanco, que se ensuciaba y desgastaba prematuramente en el campo de batalla, el paño teñido de azul resistía mucho mejor las condiciones extremas de la guerra.",
            alineacion: "right",
            overlayHotspots: [
              {
                image: cuartoPluma,
                overlayImage: cuartoPlumaFragmento,
                detailImage: cuartoPluma,
                label: "Penacho",
                detalle: "Es un elemento con funciones vitales en el combate. Solían ser los granaderos los que lo vestían en rojo, pero había varios colores reservados según la compañía. La intimidación visual era fundamental, y este elemento hacía que un soldado pareciera mucho más grande entre la altura del sombrero y la del penacho. En las marchas rutinarias, los soldados podían desmontarlo, ya que resultaba incómodo.",
                estilo: { top: "9.7%", left: "51.8%" },
                overlayOffsetY: "0%",
                overlayHit: { top: "6.2%", left: "47.7%", width: "8.4%", height: "7.1%", borderRadius: "50%" },
              },
              {
                image: cuartoChaleco,
                overlayImage: cuartoChalecoFragmento,
                detailImage: cuartoChaleco,
                label: "Chupa",
                detalle: "El chaleco interior, que se llamaba chupa tiene doble botonadura, y permitía la posibilidad de añadir mangas para hacer el conjunto más abrigado. Las mangas no se abotonaban, sino que se unían mediante cintas o cordones, dejando la zona de la axila libre para permitir el movimiento de los brazos.",
                estilo: { top: "44.8%", left: "45.8%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 0.72,
                overlayHit: { top: "39.9%", left: "36.7%", width: "18.3%", height: "9.8%", borderRadius: "18%" },
              },
              {
                image: cuartoPantalon,
                overlayImage: cuartoPantalonFragmento,
                detailImage: cuartoPantalon,
                label: "Pantalón",
                detalle: "El pantalón completaba la silueta del uniforme y caía de forma recta para acompañar las botas altas. En artillería, esta parte inferior del conjunto era clave para mantener una apariencia limpia y disciplinada, además de soportar mejor el uso diario en campaña.",
                estilo: { top: "61.2%", left: "48.8%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 0.86,
                overlayHit: { top: "48.9%", left: "33.3%", width: "31.3%", height: "24.9%", borderRadius: "18%" },
              },
            ],
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
            overlayHotspots: [
              {
                image: isabelinoGorro,
                overlayImage: isabelinoGorroCacho,
                detailImage: isabelinoGorro,
                label: "Shakó",
                detalle: "Este fue el tocado militar por excelencia del S.XIX. Esta forma, servía para proteger la cabeza, ya que llevaban refuerzos interiores, además de hacer al soldado más alto e imponente. la escarapela roja, ya se mantiene plana y colocada en la zona superior, y la placa de latón lleva el escudo de armas. Las carrilleras, eran cuerdas de latón escamado, que servían para atar el chacó y proteger las mejillas.",
                estilo: { top: "13.3%", left: "45.7%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 1.16,
                overlayHit: { top: "1.3%", left: "33.7%", width: "24.0%", height: "24.0%", borderRadius: "50%" },
              },
              {
                image: isabelinoFlecos,
                overlayImage: isabelinoHombreraCacho,
                detailImage: isabelinoFlecos,
                label: "Charreteras",
                detalle: " Los soldados llevaban pesadas correas de cuero blanco cruzadas sobre el pecho. De una colgaba la bayoneta, y de la otra la munición. Para evitar que resbalasen durante la marcha, la solución era la charretera (hombrera con flecos) con presilla. Mantener los correajes blancos era difícil, y tenían que frotarlos constantemente.",
                estilo: { top: "27.9%", left: "66.5%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 1.72,
                overlayHit: { top: "23.2%", left: "54.7%", width: "23.5%", height: "8.0%", borderRadius: "18%" },
              },
              {
                image: isabelinoPenacho,
                overlayImage: isabelinoPenachoCacho,
                detailImage: isabelinoPenacho,
                label: "Borla",
                detalle: "Tiene forma de brocha, y era realzado de cerdas duras o lana tupida, por lo que aguantaba bastante bien la lluvia. El color en este caso indica que pertenecía a un granadero.",
                estilo: { top: "5.7%", left: "44.8%" },
                overlayOffsetY: "0%",
                overlayHit: { top: "1.3%", left: "34.5%", width: "20.7%", height: "8.7%", borderRadius: "50%" },
              },
            ],
            hotspots: [],
          },
          {
            nombre: "Carlistas",
            base: carlista,
            descripcion: "La uniformidad del bando carlista se desarrolló de manera irregular a medida que evolucionaba el conflicto, pero el uso de la gorra fue una constante.\n\n A Gijón no llegaron prácticamente la segunda ni la tercera guerra, por lo que la presencia de partidarios carlistas en la ciudad era casi clandestina. Para moverse con libertad, estos hombres a veces se quitaban la boina, eliminando así su único distintivo político y militar.",
            alineacion: "right",
            overlayHotspots: [
              {
                image: carlistaBoina,
                overlayImage: carlistaBoinaCacho,
                detailImage: carlistaBoina,
                label: "Boina",
                detalle: "Al principio, los primeros ejércitos carlistas no llevaban la boina roja, sino que podía ser azul o blanca. Se fomentó el uso de la boina porque era barata, protegía de la lluvia y del sol. Muchos metían una chapa metálica o una almohadilla gruesa por dentro para hacer de amortiguador de los golpes.",
                estilo: { top: "7.2%", left: "51.9%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 2,
                imageOffsetX: "5%",
                overlayHit: { top: "2.3%", left: "40.3%", width: "23.2%", height: "9.8%", borderRadius: "50%" },
              },
              {
                image: carlistaAlpargates,
                overlayImage: carlistaAlpargatesCacho,
                detailImage: carlistaAlpargates,
                label: "Alpargatas",
                detalle: "Las alpargatas estaban hechas de lona gruesa y una suela de esparto o cáñamo. Este tipo de calzado era ligero, silencioso y perfecto para los terrenos escarpados. La gran debilidad de las alpargatas era el agua.",
                estilo: { top: "91.9%", left: "57.2%" },
                overlayOffsetY: "0%",
                imageScaleMultiplier: 1.8,
                overlayHit: { top: "87.1%", left: "36.4%", width: "41.7%", height: "9.7%", borderRadius: "18%" },
              },
            ],
            hotspots: [],
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
            base: guerraHispanoAmericana,
            descripcion: "Estos son los uniformes de los soldados metropolitanos. La ciudad no era un campo de batalla, sino un puerto estratégico con miedo a un ataque de la armada estadounidense al Cantábrico.\n\nLas diferencias jerárquicas en los uniformes se marcaban visualmente mediante galones, detalles en las bocamangas y emblemas en el cuello, y este uniforme los diferenciaba de las tropas que iban al Caribe.",
            alineacion: "left",
            overlayHotspots: [
              {
                image: estandarGorrilloBotones,
                overlayImage: estandarGorretuFragmento,
                detailImage: estandarGorrilloBotones,
                label: 'Gorro',
                detalle: 'El cuello y sus emblemas ayudaban a distinguir funciones y grado.',
                estilo: { top: '14.4%', left: '49.8%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.35,
              },
              {
                image: estandarPantalonCacho,
                overlayImage: estandarPantalonCacho,
                detailImage: estandarPantalonDetalle,
                label: 'pantalón',
                detalle: 'La traba obligaba a que la tela del pantalón cayera de forma completamente recta y tensa hacia el zapato, sin hacer arrugas sobre el empeine ni abolsarse. Esto daba una silueta mucho más esbelta, limpia y disciplinada. estaba diseñado específicamente para llevarse con zapatos de cordones o botines.',
                estilo: { top: '66%', left: '52%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.45,
              },
            ],
            hotspots: [],
          },
          {
            nombre: "Rayadillo",
            base: Rayadillo_34,
            descripcion: "El rayadillo fue un uniforme militar de algodón con rayas azules y blancas, introducido aproximadamente en 1852 por el ejército español para sus tropas de ultramar en Cuba, Filipinas y Puerto Rico.\n\n  Diseñado para climas tropicales cálidos y húmedos, ofrecía comodidad y resistencia sustituyendo a la lana. En Gijón pudimos ver este atuendo en los reclutas que embarcaban en el puerto.",
            alineacion: "right",
            overlayHotspots: [
              {
                image: rayadilloGorroFragmento,
                overlayImage: rayadilloGorroFragmento,
                detailImage: rayadilloGorroDetalle,
                label: 'Gorro cuartelero',
                detalle: 'El tejido rayado era la seña de identidad del uniforme colonial.',
                estilo: { top: '15%', left: '50%' },
                overlayOffsetY: '0%',
              },
              {
                image: rayadilloCuellosFragmento,
                overlayImage: rayadilloCuellosFragmento,
                detailImage: rayadilloCuellosDetalle,
                label: 'Cuellos',
                detalle: 'Una prenda pensada para soportar mejor el calor y la humedad.',
                estilo: { top: '34%', left: '50%' },
                overlayOffsetY: '0%',
              },
              {
                image: rayadilloMangasFragmento,
                overlayImage: rayadilloMangasFragmento,
                detailImage: rayadilloMangaDetalle,
                label: 'Mangas',
                detalle: 'La parte inferior se aligeraba para mejorar la comodidad en ultramar.',
                estilo: { top: '56%', left: '49%' },
                overlayOffsetY: '0%',
              },
            ],
            hotspots: [],
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
            overlayHotspots: [
              {
                image: republicaGorra,
                overlayImage: republicaGorraCacho,
                detailImage: republicaGorra,
                label: 'Gorra de plato',
                detalle: 'La gorra de plato sustituye la estética más monárquica por una imagen republicana.',
                estilo: { top: '14%', left: '50%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.45,
              },
              {
                image: republicaPantalones,
                overlayImage: republicaPantalonesCacho,
                detailImage: republicaPantalones,
                label: 'Pantalones',
                detalle: 'El pantalón caqui mantenía una silueta sobria y funcional en campaña.',
                estilo: { top: '67%', left: '50%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.45,
              },
              {
                image: republicaBoticas,
                overlayImage: republicaBoticasCacho,
                detailImage: republicaBoticas,
                label: 'Boticas',
                detalle: 'El calzado alto reforzaba presencia y funcionalidad en servicio.',
                estilo: { top: '87%', left: '49%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.45,
              },
            ],
            hotspots: [],
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
            base: nacionalCopia,
            descripcion: "Este es el uniforme reglamentario de 1926, que es el que llevaban todos los soldados independientemente de en qué bando se encuadraran al comenzar la Guerra Civil.\n\nBásicamente, el uniforme consta de 4 elementos: pantalón granadero, camisa caqui, guerrera y gorro isabelino, así como un complemento de cuero que eran las cartucheras. Iba acompañado de mantas, abrigos y otros elementos para el frío, y además los rangos más altos llevaban gorras como la de la imagen.",
            alineacion: "left",
            hotspots: makeHotspots(
              ['Gorro isabelino', 'Elemento de cabeza reglamentario, muy reconocible en la imagen.', '15%', '50%', nacionalCopia],
              ['Guerrera', 'La guerrera define la silueta del uniforme reglamentario de 1926.', '41%', '49%', nacionalCopia],
              ['Cartucheras', 'El cuero y el equipamiento rematan la dotación del soldado.', '67%', '48%', nacionalCopia],
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
            base: miliciana2,
            descripcion: "El uniforme más icónico del miliciano republicano en Gijón no fue el uniforme anterior, sino el mono azul o caqui. La ropa de los obreros convertida en ropa de combate. Los soldados republicanos en Asturias usan el casco Trubia (fabricado aquí mismo, en la Fábrica de Trubia) o el casco checo/soviético que llegaba por el puerto de El Musel.\n\nEran personas de las calles que tomaron los fusiles y después fueron al frente con lo que tenían a mano. Cuando nos referimos a lo que tenían cercano no es solo ropa civil, sino una amalgama de ropas salidas de casas y cuarteles.",
            alineacion: "left",
            overlayHotspots: [
              {
                image: milicianaGorro,
                overlayImage: milicianaGorroCacho,
                detailImage: milicianaGorro,
                label: 'Gorro',
                detalle: 'El gorro completaba una indumentaria improvisada, adaptada a la urgencia de la movilización.',
                estilo: { top: '13%', left: '49%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.4,
              },
              {
                image: milicianaUniforme,
                overlayImage: milicianaUniformeCacho,
                detailImage: milicianaUniforme,
                label: 'Mono de trabajo',
                detalle: 'La ropa obrera convertida en uniforme de combate define la imagen de las milicianas.',
                estilo: { top: '46%', left: '48%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.4,
              },
              {
                image: milicianaCalzado,
                overlayImage: milicianaCalzadoCacho,
                detailImage: milicianaCalzado,
                label: 'Calzado',
                detalle: 'El calzado se adaptaba a la urgencia del frente y a los recursos disponibles en cada momento.',
                estilo: { top: '83%', left: '50%' },
                overlayOffsetY: '0%',
                imageScaleMultiplier: 1.8,
                imageOffsetX: '18%',
              },
            ],
            hotspots: [],
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
