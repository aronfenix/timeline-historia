// ============================================================
//  DATA.JS - Timeline Historia v2
//  Eventos historicos con metadata enriquecida
// ============================================================

window.TIMELINE_DATA = (() => {
  'use strict';

  // --- Iconos y paletas por era ---
  const MODERN_ICONS = ['crown','sword','shield','ship','map','castle','scroll','palette','church','compass'];
  const CONTEMP_ICONS = ['vote','scale','factory','train','newspaper','dove','parliament','satellite','euro','flask'];

  const MODERN_PALETTES = [
    ['#6f3f1f','#c88c45'], ['#4c325f','#9f73c3'],
    ['#274f5f','#60a9c0'], ['#4e4128','#d4b173'],
    ['#5a2d2d','#c47a6a'], ['#3a4a2a','#8ab870']
  ];
  const CONTEMP_PALETTES = [
    ['#334f72','#7ba4d4'], ['#3f5558','#89b8ad'],
    ['#5c435f','#b793c3'], ['#614033','#cf9783'],
    ['#2d4a5a','#6db8c9'], ['#5a4a2a','#c4a86a']
  ];

  // --- Recursos visuales generados ---
  const VISUALS = {
    backgrounds: {
      menu: { key: 'bg_menu', src: 'assets/images/backgrounds/menu-hero.png' },
      moderna: { key: 'bg_moderna', src: 'assets/images/backgrounds/era-moderna.png' },
      contemporanea: { key: 'bg_contemporanea', src: 'assets/images/backgrounds/era-contemporanea.png' },
      collection: { key: 'bg_collection', src: 'assets/images/backgrounds/collection-hall.png' }
    },
    avatars: {
      knight:   { key: 'avatar_knight', src: 'assets/images/avatars/knight.png' },
      queen:    { key: 'avatar_queen', src: 'assets/images/avatars/queen.png' },
      explorer: { key: 'avatar_explorer', src: 'assets/images/avatars/explorer.png' },
      scholar:  { key: 'avatar_scholar', src: 'assets/images/avatars/scholar.png' },
      artist:   { key: 'avatar_artist', src: 'assets/images/avatars/artist.png' },
      captain:  { key: 'avatar_captain', src: 'assets/images/avatars/captain.png' },
      sage:     { key: 'avatar_sage', src: 'assets/images/avatars/sage.png' },
      scribe:   { key: 'avatar_scribe', src: 'assets/images/avatars/scribe.png' }
    },
    events: {
      M01: { key: 'event_M01', src: 'assets/images/events/M01-imprenta-gutenberg.png' },
      M05: { key: 'event_M05', src: 'assets/images/events/M05-primer-viaje-colon.png' },
      M20: { key: 'event_M20', src: 'assets/images/events/M20-primera-vuelta-mundo.png' },
      M26: { key: 'event_M26', src: 'assets/images/events/M26-batalla-lepanto.png' },
      C02: { key: 'event_C02', src: 'assets/images/events/C02-constitucion-cadiz.png' },
      C23: { key: 'event_C23', src: 'assets/images/events/C23-segunda-republica.png' },
      C28: { key: 'event_C28', src: 'assets/images/events/C28-bombardeo-guernica.png' },
      C36: { key: 'event_C36', src: 'assets/images/events/C36-constitucion-1978.png' },
      C48: { key: 'event_C48', src: 'assets/images/events/C48-pandemia-covid.png' }
    }
  };

  // --- Eventos Edad Moderna ---
  const EDAD_MODERNA = {
    id: 'edad_moderna',
    title: 'Edad Moderna',
    subtitle: '1440 - 1789',
    era: 'moderna',
    color: '#c88c45',
    colorDark: '#6f3f1f',
    emoji: '\u{1F451}',
    events: [
      { id:'M01', year:1440, title:'Imprenta de Gutenberg', description:'La imprenta acelera la difusion de ideas en Europa.', hint:'Mitad del siglo XV', category:'cultura', funFact:'Antes de la imprenta, copiar un libro a mano podia tardar meses o incluso años enteros.', quizQuestion: { question:'Que invento Gutenberg que cambio la historia?', options:['El telescopio','La imprenta de tipos moviles','La brujula','El papel'], correct:1 } },
      { id:'M02', year:1469, title:'Matrimonio de Isabel y Fernando', description:'Union dinastica de Castilla y Aragon.', hint:'Segunda mitad del XV', category:'politica', funFact:'Isabel y Fernando se casaron en secreto porque el rey de Castilla no aprobaba la boda.', quizQuestion: { question:'Que reinos se unieron con el matrimonio de Isabel y Fernando?', options:['Castilla y Navarra','Aragon y Portugal','Castilla y Aragon','Leon y Galicia'], correct:2 } },
      { id:'M03', year:1478, title:'Tribunal de la Inquisicion', description:'Se crea la Inquisicion en Castilla.', hint:'Antes de 1492', category:'religion', funFact:'La Inquisicion espanola llego a durar mas de 350 años, hasta que fue abolida definitivamente en 1834.', quizQuestion: { question:'En que reino se creo primero el Tribunal de la Inquisicion?', options:['Aragon','Navarra','Portugal','Castilla'], correct:3 } },
      { id:'M04', year:1492, title:'Toma de Granada', description:'Fin del ultimo reino musulman peninsular.', hint:'Mismo año de Colon', category:'militar', funFact:'El ultimo rey moro de Granada, Boabdil, lloro al marcharse y su madre le dijo que no llorase como nino.', quizQuestion: { question:'Que supuso la toma de Granada en 1492?', options:['El inicio de la Reconquista','El fin del ultimo reino musulman en la peninsula','La union con Portugal','El descubrimiento de America'], correct:1 } },
      { id:'M05', year:1492, title:'Primer viaje de Colon', description:'La expedicion llega a San Salvador.', hint:'Final del siglo XV', category:'exploracion', funFact:'Colon murio creyendo que habia llegado a Asia y nunca supo que habia encontrado un continente nuevo.', quizQuestion: { question:'A donde creia Colon que habia llegado en su primer viaje?', options:['A Africa','A las Indias (Asia)','A Australia','A la Antartida'], correct:1 } },
      { id:'M06', year:1492, title:'Expulsion de los judios', description:'Los no convertidos deben abandonar los reinos.', hint:'Mismo año de Granada', category:'sociedad', funFact:'Se calcula que entre 50.000 y 200.000 judios tuvieron que abandonar Espana llevandose solo lo que podian cargar.', quizQuestion: { question:'Que debian hacer los judios que no querian abandonar Espana en 1492?', options:['Pagar un impuesto','Convertirse al cristianismo','Irse a Portugal','Vivir en guetos'], correct:1 } },
      { id:'M07', year:1493, title:'Segundo viaje de Colon', description:'Comienza una exploracion mas amplia de America.', hint:'Justo despues de 1492', category:'exploracion', funFact:'En el segundo viaje, Colon llevo 17 barcos y mas de 1.200 personas para fundar colonias permanentes.', quizQuestion: { question:'Cuantos barcos llevo Colon en su segundo viaje aproximadamente?', options:['3 barcos','10 barcos','17 barcos','25 barcos'], correct:2 } },
      { id:'M08', year:1494, title:'Tratado de Tordesillas', description:'Castilla y Portugal reparten zonas de expansion.', hint:'Final del siglo XV', category:'politica', funFact:'El tratado dibujo una linea imaginaria en el mapa que dividiria el mundo entre Espana y Portugal.', quizQuestion: { question:'Que paises firmaron el Tratado de Tordesillas?', options:['Espana y Francia','Espana e Inglaterra','Castilla y Portugal','Aragon y Navarra'], correct:2 } },
      { id:'M09', year:1496, title:'Conquista de Canarias completada', description:'La Corona culmina su control del archipielago.', hint:'Muy cerca de 1500', category:'militar', funFact:'Los guanches, pueblo aborigen de Canarias, tenian una lengua silbada llamada silbo gomero que aun se conserva.', quizQuestion: { question:'Como se llamaba el pueblo aborigen de las islas Canarias?', options:['Iberos','Guanches','Celtiberos','Tartesios'], correct:1 } },
      { id:'M10', year:1502, title:'Conversion forzosa en Castilla', description:'Musulmanes castellanos deben convertirse.', hint:'Comienzos del XVI', category:'religion', funFact:'Los musulmanes convertidos recibieron el nombre de moriscos y muchos seguian practicando su religion en secreto.', quizQuestion: { question:'Como se llamaba a los musulmanes convertidos al cristianismo?', options:['Mudejares','Mozarabes','Moriscos','Sefardies'], correct:2 } },
      { id:'M11', year:1512, title:'Conquista de Navarra', description:'Navarra se incorpora a la monarquia hispanica.', hint:'Primeros años del XVI', category:'militar', funFact:'Navarra fue el ultimo reino peninsular en unirse a la corona espanola y conservo sus propias leyes durante siglos.', quizQuestion: { question:'Que reino peninsular fue el ultimo en incorporarse a la monarquia hispanica?', options:['Granada','Portugal','Navarra','Aragon'], correct:2 } },
      { id:'M12', year:1513, title:'Balboa llega al Pacifico', description:'Cruza el istmo de Panama y avista un nuevo oceano.', hint:'Antes de 1519', category:'exploracion', funFact:'Balboa llamo al Pacifico "Mar del Sur" porque lo vio desde el norte, mirando hacia abajo en el mapa.', quizQuestion: { question:'Que territorio cruzo Balboa para llegar al oceano Pacifico?', options:['Mexico','El istmo de Panama','Peru','Cuba'], correct:1 } },
      { id:'M13', year:1516, title:'Carlos I rey de Espana', description:'Comienza el reinado del primer Austria.', hint:'Decada de 1510', category:'politica', funFact:'Carlos I llego a Espana sin saber hablar castellano porque se habia criado en Flandes hablando frances.', quizQuestion: { question:'De que dinastia era Carlos I de Espana?', options:['Borbon','Trastamara','Austria (Habsburgo)','Valois'], correct:2 } },
      { id:'M14', year:1517, title:'Inicio de la Reforma', description:'Lutero cuestiona la Iglesia en Europa.', hint:'Muy cerca de 1516', category:'religion', funFact:'Lutero clavo sus 95 tesis en la puerta de una iglesia de Wittenberg, un gesto que cambio Europa para siempre.', quizQuestion: { question:'Quien inicio la Reforma protestante en 1517?', options:['Calvino','Enrique VIII','Martin Lutero','Erasmo de Rotterdam'], correct:2 } },
      { id:'M15', year:1519, title:'Sale la expedicion de Magallanes', description:'Busca llegar a Asia por el oeste.', hint:'Final de la decada de 1510', category:'exploracion', funFact:'Magallanes murio en Filipinas en una batalla y nunca completo la vuelta al mundo que el mismo habia iniciado.', quizQuestion: { question:'Cual era el objetivo de la expedicion de Magallanes?', options:['Conquistar Brasil','Llegar a Asia navegando hacia el oeste','Explorar Africa','Encontrar la Antartida'], correct:1 } },
      { id:'M16', year:1520, title:'Carlos V emperador', description:'Carlos I obtiene la dignidad imperial.', hint:'Inmediatamente tras 1519', category:'politica', funFact:'Carlos V gobernaba tantos territorios que se decia que en sus dominios nunca se ponia el sol.', quizQuestion: { question:'Que titulo obtuvo Carlos I de Espana al convertirse en Carlos V?', options:['Rey de Francia','Papa de Roma','Emperador del Sacro Imperio','Sultan del Mediterraneo'], correct:2 } },
      { id:'M17', year:1520, title:'Comienza la revuelta comunera', description:'Castilla se levanta contra decisiones del rey.', hint:'Mismo año que Carlos V', category:'sociedad', funFact:'Los comuneros pedian que el rey respetase las leyes castellanas y no diera cargos importantes a extranjeros.', quizQuestion: { question:'Contra quien se rebelaron los comuneros de Castilla?', options:['Contra los musulmanes','Contra las decisiones de Carlos I','Contra la Iglesia','Contra Portugal'], correct:1 } },
      { id:'M18', year:1521, title:'Batalla de Villalar', description:'Derrota decisiva de los comuneros.', hint:'Año siguiente a 1520', category:'militar', funFact:'Los lideres comuneros Padilla, Bravo y Maldonado fueron ejecutados al dia siguiente de perder la batalla.', quizQuestion: { question:'Que ocurrio en la batalla de Villalar?', options:['Victoria de los comuneros','Derrota definitiva de los comuneros','Victoria contra Francia','Derrota de los moriscos'], correct:1 } },
      { id:'M19', year:1521, title:'Caida de Tenochtitlan', description:'Fin del poder azteca ante Cortes.', hint:'Primer cuarto del XVI', category:'militar', funFact:'Tenochtitlan tenia mas habitantes que la mayoria de ciudades europeas de la epoca, con unos 200.000 pobladores.', quizQuestion: { question:'Quien dirigio la conquista de Tenochtitlan?', options:['Pizarro','Balboa','Hernan Cortes','Magallanes'], correct:2 } },
      { id:'M20', year:1522, title:'Primera vuelta al mundo', description:'Elcano culmina la expedicion iniciada por Magallanes.', hint:'Muy cerca de 1521', category:'exploracion', funFact:'De los 239 marineros que partieron con Magallanes, solo 18 regresaron con Elcano a bordo de la nao Victoria.', quizQuestion: { question:'Quien completo la primera vuelta al mundo tras morir Magallanes?', options:['Hernan Cortes','Juan Sebastian Elcano','Vasco de Gama','Francis Drake'], correct:1 } },
      { id:'M21', year:1533, title:'Conquista del Imperio inca', description:'Pizarro consolida el dominio espanol en Peru.', hint:'Decada de 1530', category:'militar', funFact:'Pizarro capturo al emperador inca Atahualpa y este ofrecio llenar una habitacion de oro como rescate.', quizQuestion: { question:'Quien lidero la conquista del Imperio inca?', options:['Hernan Cortes','Vasco Nunez de Balboa','Francisco Pizarro','Diego de Almagro'], correct:2 } },
      { id:'M22', year:1545, title:'Explotacion de Potosi', description:'La plata americana impulsa la economia imperial.', hint:'Mitad del siglo XVI', category:'economia', funFact:'El cerro de Potosi produjo tanta plata que se decia que con ella se podria construir un puente hasta Espana.', quizQuestion: { question:'Que mineral se extraia principalmente en Potosi?', options:['Oro','Cobre','Plata','Hierro'], correct:2 } },
      { id:'M23', year:1556, title:'Felipe II inicia su reinado', description:'Carlos I abdica y divide herencia.', hint:'Segunda mitad del XVI', category:'politica', funFact:'Felipe II construyo El Escorial, un enorme palacio-monasterio con mas de 4.000 habitaciones cerca de Madrid.', quizQuestion: { question:'Quien abdico para que Felipe II fuera rey?', options:['Felipe I','Fernando el Catolico','Carlos I','Carlos II'], correct:2 } },
      { id:'M24', year:1565, title:'Conquista de Filipinas', description:'Nueva expansion espanola en Asia.', hint:'Antes de 1571', category:'exploracion', funFact:'Las islas Filipinas recibieron su nombre en honor al futuro rey Felipe II cuando aun era principe.', quizQuestion: { question:'Por que las Filipinas se llaman asi?', options:['Por un explorador llamado Filipo','En honor a Felipe II','Por una palabra local','Por San Felipe'], correct:1 } },
      { id:'M25', year:1568, title:'Rebelion de las Alpujarras', description:'Sublevacion morisca en Granada.', hint:'Decada de 1560', category:'sociedad', funFact:'Los moriscos de las Alpujarras eligieron un rey propio llamado Aben Humeya para liderar su rebelion.', quizQuestion: { question:'Quienes protagonizaron la rebelion de las Alpujarras?', options:['Los judios','Los comuneros','Los moriscos','Los catalanes'], correct:2 } },
      { id:'M26', year:1571, title:'Batalla de Lepanto', description:'La Liga Santa derrota a la armada otomana.', hint:'Inicio de la decada de 1570', category:'militar', funFact:'El escritor Miguel de Cervantes lucho en Lepanto y perdio el uso de su mano izquierda por las heridas.', quizQuestion: { question:'Que famoso escritor espanol lucho en la batalla de Lepanto?', options:['Lope de Vega','Quevedo','Cervantes','Calderon de la Barca'], correct:2 } },
      { id:'M27', year:1580, title:'Felipe II rey de Portugal', description:'Se unen las coronas ibericas bajo un mismo rey.', hint:'Antes de 1588', category:'politica', funFact:'Con Portugal, Felipe II controlaba territorios en todos los continentes conocidos, el mayor imperio de la epoca.', quizQuestion: { question:'En que año Felipe II se convirtio tambien en rey de Portugal?', options:['1556','1571','1580','1588'], correct:2 } },
      { id:'M28', year:1588, title:'Fracaso de la Armada Invencible', description:'No prospera la invasion de Inglaterra.', hint:'Final del siglo XVI', category:'militar', funFact:'Las tormentas del Atlantico destruyeron mas barcos espanoles que los propios canones ingleses.', quizQuestion: { question:'Contra que pais envio Felipe II la Armada Invencible?', options:['Francia','Holanda','Inglaterra','Portugal'], correct:2 } },
      { id:'M29', year:1598, title:'Comienza Felipe III', description:'Empieza una etapa de validos y crisis creciente.', hint:'Cambio de siglo', category:'politica', funFact:'Felipe III delegaba tanto en su valido, el Duque de Lerma, que se decia que el duque gobernaba mas que el rey.', quizQuestion: { question:'Que eran los "validos" en la monarquia espanola?', options:['Generales militares','Consejeros favoritos que gobernaban en nombre del rey','Jueces supremos','Embajadores reales'], correct:1 } },
      { id:'M30', year:1605, title:'Primera parte del Quijote', description:'Cervantes publica una obra clave del Siglo de Oro.', hint:'Comienzos del XVII', category:'cultura', funFact:'Don Quijote es el libro mas traducido del mundo despues de la Biblia, con versiones en mas de 50 idiomas.', quizQuestion: { question:'Quien escribio Don Quijote de la Mancha?', options:['Lope de Vega','Miguel de Cervantes','Francisco de Quevedo','Tirso de Molina'], correct:1 } },
      { id:'M31', year:1609, title:'Expulsion de los moriscos', description:'Salida forzada de una parte importante de poblacion.', hint:'Primer tercio del XVII', category:'sociedad', funFact:'Se estima que unos 300.000 moriscos fueron expulsados, lo que dejo zonas de Valencia casi despobladas.', quizQuestion: { question:'Que region espanola quedo especialmente despoblada tras la expulsion de los moriscos?', options:['Castilla','Andalucia','Valencia','Galicia'], correct:2 } },
      { id:'M32', year:1618, title:'Empieza la Guerra de los Treinta Años', description:'Gran conflicto europeo de religion y poder.', hint:'Primera mitad del XVII', category:'militar', funFact:'La guerra comenzo cuando unos nobles protestantes tiraron a dos enviados del emperador por una ventana en Praga.', quizQuestion: { question:'Cuantos años duro la Guerra de los Treinta Años?', options:['20 años','25 años','30 años','35 años'], correct:2 } },
      { id:'M33', year:1621, title:'Felipe IV al trono', description:'Gobierno marcado por Olivares y guerras largas.', hint:'Tras Felipe III', category:'politica', funFact:'Felipe IV fue un gran aficionado al arte y su pintor favorito, Velazquez, vivia en el propio Palacio Real.', quizQuestion: { question:'Quien fue el valido mas conocido de Felipe IV?', options:['El Duque de Lerma','El Conde-Duque de Olivares','El Duque de Alba','El Marques de la Ensenada'], correct:1 } },
      { id:'M34', year:1640, title:'Rebeliones de Cataluna y Portugal', description:'Se agrava la crisis interna de la monarquia.', hint:'Decada de 1640', category:'sociedad', funFact:'La rebelion catalana se conoce como "Guerra dels Segadors" y su himno se convirtio en el himno de Cataluna.', quizQuestion: { question:'Que dos territorios se rebelaron contra la monarquia espanola en 1640?', options:['Navarra y Aragon','Cataluna y Portugal','Valencia y Galicia','Andalucia y Extremadura'], correct:1 } },
      { id:'M35', year:1643, title:'Derrota de Rocroi', description:'Golpe simbolico al prestigio militar hispanico.', hint:'Tres años despues de 1640', category:'militar', funFact:'Los tercios espanoles eran considerados invencibles desde hacia mas de un siglo hasta que cayeron en Rocroi.', quizQuestion: { question:'Que unidad militar espanola fue derrotada simbolicamente en Rocroi?', options:['La Armada','Los tercios','La caballeria','La guardia real'], correct:1 } },
      { id:'M36', year:1648, title:'Paz de Westfalia', description:'Termina la Guerra de los Treinta Años.', hint:'Mitad del XVII', category:'politica', funFact:'La Paz de Westfalia reconocio la independencia de los Paises Bajos tras 80 años de lucha contra Espana.', quizQuestion: { question:'Que conflicto termino con la Paz de Westfalia de 1648?', options:['La Guerra de los Cien Años','La Guerra de Sucesion','La Guerra de los Treinta Años','Las guerras de Italia'], correct:2 } },
      { id:'M37', year:1656, title:'Velazquez pinta Las Meninas', description:'Obra cumbre del barroco espanol.', hint:'Segunda mitad del XVII', category:'cultura', funFact:'Velazquez se pinto a si mismo dentro del cuadro, trabajando frente a un enorme lienzo que no podemos ver.', quizQuestion: { question:'Que famoso pintor espanol creo Las Meninas?', options:['Goya','El Greco','Murillo','Velazquez'], correct:3 } },
      { id:'M38', year:1665, title:'Carlos II rey', description:'Ultimo Austria en Espana.', hint:'Ultimo tercio del XVII', category:'politica', funFact:'Carlos II fue apodado "el Hechizado" porque su debil salud se atribuia a supuestos embrujos y maldiciones.', quizQuestion: { question:'Que apodo recibio Carlos II de Espana?', options:['El Prudente','El Sabio','El Hechizado','El Grande'], correct:2 } },
      { id:'M39', year:1668, title:'Portugal reconocido independiente', description:'Se confirma la separacion iniciada en 1640.', hint:'Muy cerca de 1665', category:'politica', funFact:'Portugal habia estado unido a la corona espanola durante 60 años, desde 1580 hasta su rebelion en 1640.', quizQuestion: { question:'Cuantos años estuvo Portugal unido a la corona espanola aproximadamente?', options:['20 años','40 años','60 años','100 años'], correct:2 } },
      { id:'M40', year:1700, title:'Muerte de Carlos II', description:'Fin de los Austrias espanoles.', hint:'Cambio de siglo XVII-XVIII', category:'politica', funFact:'Carlos II no tuvo hijos y su muerte provoco una guerra enorme en toda Europa por decidir quien seria el nuevo rey.', quizQuestion: { question:'Que problema causo la muerte de Carlos II sin herederos?', options:['Una revolucion popular','Una guerra de sucesion europea','La invasion musulmana','La independencia de America'], correct:1 } },
      { id:'M41', year:1701, title:'Comienza la Guerra de Sucesion', description:'Conflicto europeo y civil por la corona.', hint:'Justo despues de 1700', category:'militar', funFact:'La Guerra de Sucesion enfrento a media Europa: Francia y Espana contra Austria, Inglaterra y Holanda.', quizQuestion: { question:'Que dos candidatos se disputaban el trono de Espana en la Guerra de Sucesion?', options:['Un Borbon y un Habsburgo','Un Tudor y un Borbon','Un Habsburgo y un Trastamara','Un Valois y un Borbon'], correct:0 } },
      { id:'M42', year:1707, title:'Batalla de Almansa', description:'Victoria borbonica decisiva en la guerra.', hint:'Primer cuarto del XVIII', category:'militar', funFact:'Curiosamente, el ejercito borbonico frances fue dirigido por un ingles y el ejercito aliado por un frances.', quizQuestion: { question:'Quien gano la batalla de Almansa?', options:['Los austriacos','Los ingleses','Los borbonicos','Los catalanes'], correct:2 } },
      { id:'M43', year:1713, title:'Tratado de Utrecht', description:'Fin internacional de la Guerra de Sucesion.', hint:'Muy cerca de 1714', category:'politica', funFact:'Por el Tratado de Utrecht, Espana perdio Gibraltar, que sigue bajo control britanico mas de 300 años despues.', quizQuestion: { question:'Que territorio perdio Espana por el Tratado de Utrecht que aun no ha recuperado?', options:['Menorca','Gibraltar','Ceuta','Las Canarias'], correct:1 } },
      { id:'M44', year:1714, title:'Caida de Barcelona', description:'Fin militar del conflicto en la Corona de Aragon.', hint:'Un año despues de Utrecht', category:'militar', funFact:'Cada 11 de septiembre, Cataluna conmemora la caida de Barcelona de 1714, su fiesta llamada la Diada.', quizQuestion: { question:'Que se conmemora en Cataluna el 11 de septiembre?', options:['La independencia','La Constitucion','La caida de Barcelona en 1714','El fin de la Guerra Civil'], correct:2 } },
      { id:'M45', year:1716, title:'Decretos de Nueva Planta', description:'Centralizacion politica borbonica.', hint:'Segunda decada del XVIII', category:'politica', funFact:'Los Decretos de Nueva Planta eliminaron las leyes propias de Aragon, Valencia y Cataluna imponiendoles las castellanas.', quizQuestion: { question:'Que efecto tuvieron los Decretos de Nueva Planta?', options:['Descentralizar el poder','Crear nuevos reinos','Centralizar el gobierno siguiendo el modelo castellano','Dar mas poder a la Iglesia'], correct:2 } },
      { id:'M46', year:1746, title:'Reinado de Fernando VI', description:'Etapa de paz y reformas administrativas.', hint:'Mitad del XVIII', category:'politica', funFact:'Fernando VI amaba tanto la musica que el famoso cantante Farinelli daba conciertos privados para el cada noche.', quizQuestion: { question:'Que caracterizo principalmente el reinado de Fernando VI?', options:['Muchas guerras','Paz y reformas','Grandes exploraciones','Revoluciones internas'], correct:1 } },
      { id:'M47', year:1752, title:'Real Academia de San Fernando', description:'Impulso institucional a las bellas artes.', hint:'Antes de Carlos III', category:'cultura', funFact:'La Academia sigue existiendo hoy y conserva obras de Goya, Velazquez y otros grandes maestros espanoles.', quizQuestion: { question:'A que campo se dedica la Real Academia de San Fernando?', options:['Las ciencias','Las bellas artes','La lengua espanola','La historia'], correct:1 } },
      { id:'M48', year:1759, title:'Carlos III rey', description:'Reformas del despotismo ilustrado.', hint:'Segunda mitad del XVIII', category:'politica', funFact:'Carlos III fue llamado "el mejor alcalde de Madrid" porque modernizo la ciudad con alumbrado, alcantarillado y paseos.', quizQuestion: { question:'Que apodo recibio Carlos III por sus mejoras en Madrid?', options:['El Sabio','El mejor alcalde de Madrid','El Reformador','El Ilustrado'], correct:1 } },
      { id:'M49', year:1766, title:'Motin de Esquilache', description:'Conflicto urbano durante las reformas.', hint:'Decada de 1760', category:'sociedad', funFact:'El motin empezo porque Esquilache prohibio las capas largas y los sombreros de ala ancha en Madrid.', quizQuestion: { question:'Que prohibicion provoco el Motin de Esquilache?', options:['Prohibir las fiestas','Prohibir capas largas y sombreros anchos','Subir los impuestos','Cerrar los mercados'], correct:1 } },
      { id:'M50', year:1767, title:'Expulsion de los jesuitas', description:'Medida politica y religiosa de gran impacto.', hint:'Muy cerca de 1766', category:'religion', funFact:'Los jesuitas tenian colegios y misiones en todo el mundo, y su expulsion afecto a miles de personas en America.', quizQuestion: { question:'Que rey ordeno la expulsion de los jesuitas de Espana?', options:['Felipe V','Fernando VI','Carlos III','Carlos IV'], correct:2 } },
      { id:'M51', year:1776, title:'Independencia de EE. UU.', description:'Nuevo contexto internacional para las monarquias europeas.', hint:'Ultimo cuarto del XVIII', category:'politica', funFact:'Espana ayudo en secreto a los colonos americanos contra Inglaterra enviando armas, dinero y soldados.', quizQuestion: { question:'Contra que pais lucharon las colonias americanas para independizarse?', options:['Francia','Espana','Inglaterra','Holanda'], correct:2 } },
      { id:'M52', year:1788, title:'Comienza Carlos IV', description:'Fin de la etapa de Carlos III.', hint:'Justo antes de 1789', category:'politica', funFact:'Carlos IV preferia cazar y hacer relojes a gobernar, dejando el poder en manos de su valido Manuel Godoy.', quizQuestion: { question:'Quien fue el valido mas influyente de Carlos IV?', options:['El Conde de Aranda','Manuel Godoy','El Duque de Alba','Floridablanca'], correct:1 } },
      { id:'M53', year:1789, title:'Revolucion francesa', description:'Cambio profundo en la politica europea.', hint:'Final del siglo XVIII', category:'politica', funFact:'La Revolucion francesa asusto tanto a los reyes europeos que Carlos IV prohibio hablar de ella en Espana.', quizQuestion: { question:'Que edificio fue asaltado al inicio de la Revolucion francesa?', options:['El Louvre','Notre Dame','La Bastilla','Versalles'], correct:2 } }
    ]
  };

  // --- Eventos Edad Contemporanea ---
  const EDAD_CONTEMPORANEA = {
    id: 'edad_contemporanea',
    title: 'Edad Contemporanea',
    subtitle: 'Desde 1808 hasta hoy',
    era: 'contemporanea',
    color: '#7ba4d4',
    colorDark: '#334f72',
    emoji: '\u{1F3DB}',
    events: [
      { id:'C01', year:1808, title:'Levantamiento del 2 de mayo', description:'Comienza la resistencia popular a la invasion francesa.', hint:'Comienzos del XIX', category:'militar', funFact:'Goya pinto los famosos cuadros del 2 y 3 de mayo para inmortalizar la resistencia y la represion francesa.', quizQuestion: { question:'Contra que pais se levanto el pueblo espanol el 2 de mayo de 1808?', options:['Inglaterra','Portugal','Francia','Austria'], correct:2 } },
      { id:'C02', year:1812, title:'Constitucion de Cadiz', description:'Primera constitucion espanola.', hint:'Durante la guerra', category:'politica', funFact:'La Constitucion de Cadiz se aprobo mientras la ciudad estaba sitiada por el ejercito de Napoleon.', quizQuestion: { question:'Que apodo recibio la Constitucion de Cadiz de 1812?', options:['La Gloriosa','La Pepa','La Grande','La Justa'], correct:1 } },
      { id:'C03', year:1814, title:'Vuelve Fernando VII', description:'Restaura el absolutismo y deroga la constitucion.', hint:'Dos años tras 1812', category:'politica', funFact:'Fernando VII fue apodado "el Deseado" cuando estaba preso, pero "el rey Felon" cuando mostro su verdadero caracter.', quizQuestion: { question:'Que hizo Fernando VII al volver a Espana en 1814?', options:['Aprobar una nueva constitucion','Restaurar el absolutismo','Declarar la guerra a Francia','Dar independencia a America'], correct:1 } },
      { id:'C04', year:1820, title:'Comienza el Trienio Liberal', description:'Golpe de Riego y etapa constitucional.', hint:'Decada de 1820', category:'politica', funFact:'El coronel Riego obligo a Fernando VII a jurar la Constitucion con una famosa frase: "Marchemos todos juntos por la senda constitucional".', quizQuestion: { question:'Quien lidero el pronunciamiento que dio inicio al Trienio Liberal?', options:['Espartero','Narvaez','Riego','O Donnell'], correct:2 } },
      { id:'C05', year:1823, title:'Fin del Trienio Liberal', description:'Regresa el absolutismo con apoyo frances.', hint:'Tres años despues de 1820', category:'politica', funFact:'Francia envio un ejercito de 100.000 hombres llamado "los Cien Mil Hijos de San Luis" para restaurar a Fernando VII.', quizQuestion: { question:'Que ejercito extranjero ayudo a Fernando VII a acabar con el Trienio Liberal?', options:['Los Cien Mil Hijos de San Luis','La Gran Armada inglesa','El ejercito prusiano','Las tropas austriacas'], correct:0 } },
      { id:'C06', year:1833, title:'Muerte de Fernando VII', description:'Comienza la Primera Guerra Carlista.', hint:'Decada de 1830', category:'politica', funFact:'La guerra empezo porque el hermano del rey, Carlos, no aceptaba que una mujer, Isabel, heredara el trono.', quizQuestion: { question:'Que conflicto estallo tras la muerte de Fernando VII?', options:['La Guerra de Africa','La Primera Guerra Carlista','La Revolucion Gloriosa','La Guerra de Cuba'], correct:1 } },
      { id:'C07', year:1837, title:'Constitucion de 1837', description:'Consolida el liberalismo en plena regencia.', hint:'Mitad de la decada de 1830', category:'politica', funFact:'Esta constitucion establecio por primera vez la libertad de imprenta en Espana de forma estable.', quizQuestion: { question:'Que tipo de gobierno consolido la Constitucion de 1837?', options:['El absolutismo','El liberalismo','La republica','La dictadura'], correct:1 } },
      { id:'C08', year:1843, title:'Isabel II asume el trono', description:'Termina la regencia y comienza su reinado efectivo.', hint:'Mitad del XIX', category:'politica', funFact:'Isabel II fue declarada mayor de edad con solo 13 años para que pudiera reinar sin regente.', quizQuestion: { question:'Con que edad fue declarada mayor de edad Isabel II para poder reinar?', options:['15 años','16 años','13 años','18 años'], correct:2 } },
      { id:'C09', year:1848, title:'Primer ferrocarril peninsular', description:'Se inaugura Barcelona-Mataro.', hint:'Antes de 1850', category:'economia', funFact:'El primer tren espanol recorria solo 28 km entre Barcelona y Mataro y la gente acudia asombrada a verlo pasar.', quizQuestion: { question:'Cual fue la primera linea de ferrocarril en la Espana peninsular?', options:['Madrid-Aranjuez','Barcelona-Mataro','Sevilla-Cordoba','Valencia-Jativa'], correct:1 } },
      { id:'C10', year:1868, title:'Revolucion Gloriosa', description:'Isabel II marcha al exilio.', hint:'Segunda mitad del XIX', category:'politica', funFact:'Isabel II se entero de la revolucion mientras veraneaba en San Sebastian y huyo a Francia en tren.', quizQuestion: { question:'Que reina fue destronada por la Revolucion Gloriosa de 1868?', options:['Maria Cristina','Isabel I','Isabel II','Juana la Loca'], correct:2 } },
      { id:'C11', year:1870, title:'Amadeo de Saboya elegido rey', description:'Intento de nueva monarquia constitucional.', hint:'Despues de la Gloriosa', category:'politica', funFact:'Amadeo de Saboya era italiano y apenas hablaba espanol; al llegar a Madrid casi nadie fue a recibirlo.', quizQuestion: { question:'De que pais venia Amadeo de Saboya?', options:['Francia','Alemania','Italia','Austria'], correct:2 } },
      { id:'C12', year:1873, title:'Primera Republica', description:'Experiencia republicana de corta duracion.', hint:'Decada de 1870', category:'politica', funFact:'La Primera Republica duro menos de dos años y tuvo cuatro presidentes distintos en ese breve periodo.', quizQuestion: { question:'Cuantos presidentes tuvo la Primera Republica espanola?', options:['Uno','Dos','Tres','Cuatro'], correct:3 } },
      { id:'C13', year:1874, title:'Restauracion borbonica', description:'Alfonso XII recupera la corona.', hint:'Un año despues de 1873', category:'politica', funFact:'Alfonso XII era hijo de Isabel II y tenia solo 17 años cuando fue proclamado rey de Espana.', quizQuestion: { question:'Que dinastia volvio al trono con la Restauracion de 1874?', options:['Los Habsburgo','Los Saboya','Los Borbones','Los Trastamara'], correct:2 } },
      { id:'C14', year:1876, title:'Constitucion de 1876', description:'Marco legal de la Restauracion.', hint:'Final de la decada de 1870', category:'politica', funFact:'Canovas del Castillo diseno un sistema de turnos donde liberales y conservadores se alternaban en el poder.', quizQuestion: { question:'Quien fue el principal articulador del sistema politico de la Restauracion?', options:['Sagasta','Canovas del Castillo','Espartero','Prim'], correct:1 } },
      { id:'C15', year:1885, title:'Muere Alfonso XII', description:'Se abre la regencia de Maria Cristina.', hint:'Final del XIX', category:'politica', funFact:'Alfonso XII murio de tuberculosis con solo 27 años y su hijo Alfonso XIII nacio seis meses despues.', quizQuestion: { question:'Quien ejercio la regencia tras la muerte de Alfonso XII?', options:['Isabel II','Maria Cristina','Espartero','Canovas'], correct:1 } },
      { id:'C16', year:1898, title:'Desastre colonial', description:'Perdida de Cuba, Puerto Rico y Filipinas.', hint:'Cambio de siglo', category:'militar', funFact:'Espana perdio sus ultimas colonias tras una guerra contra Estados Unidos que duro solo cuatro meses.', quizQuestion: { question:'Contra que pais perdio Espana Cuba, Puerto Rico y Filipinas en 1898?', options:['Inglaterra','Francia','Alemania','Estados Unidos'], correct:3 } },
      { id:'C17', year:1902, title:'Alfonso XIII reina en plenitud', description:'Fin de la regencia.', hint:'Comienzos del XX', category:'politica', funFact:'El dia de su boda, Alfonso XIII sobrevivio a un atentado con bomba mientras su carroza recorria Madrid.', quizQuestion: { question:'Con que edad comenzo a reinar Alfonso XIII de forma efectiva?', options:['14 años','16 años','18 años','21 años'], correct:1 } },
      { id:'C18', year:1909, title:'Semana Tragica', description:'Crisis social y politica en Barcelona.', hint:'Antes de 1914', category:'sociedad', funFact:'La Semana Tragica empezo porque se obligaba a reservistas pobres a ir a la guerra de Marruecos mientras los ricos podian pagar para no ir.', quizQuestion: { question:'En que ciudad ocurrio la Semana Tragica de 1909?', options:['Madrid','Sevilla','Barcelona','Valencia'], correct:2 } },
      { id:'C19', year:1914, title:'Primera Guerra Mundial', description:'Espana se mantiene neutral.', hint:'Decada de 1910', category:'militar', funFact:'Gracias a su neutralidad, Espana se enriquecio vendiendo productos a ambos bandos durante la Gran Guerra.', quizQuestion: { question:'Que posicion adopto Espana durante la Primera Guerra Mundial?', options:['Se alio con Alemania','Se alio con Francia','Se mantuvo neutral','Cambio de bando'], correct:2 } },
      { id:'C20', year:1921, title:'Desastre de Annual', description:'Grave derrota en Marruecos.', hint:'Antes de Primo de Rivera', category:'militar', funFact:'En Annual murieron mas de 8.000 soldados espanoles en pocos dias, lo que provoco una enorme crisis en el pais.', quizQuestion: { question:'En que territorio se produjo el Desastre de Annual?', options:['Cuba','Filipinas','Marruecos','Guinea'], correct:2 } },
      { id:'C21', year:1923, title:'Dictadura de Primo de Rivera', description:'Golpe militar con apoyo del rey.', hint:'Decada de 1920', category:'politica', funFact:'Primo de Rivera prometio gobernar solo 90 dias para arreglar Espana, pero se quedo siete años en el poder.', quizQuestion: { question:'Quien dio el golpe de Estado en 1923?', options:['Franco','Primo de Rivera','Sanjurjo','Mola'], correct:1 } },
      { id:'C22', year:1930, title:'Caida de la dictadura', description:'Se hunde el sistema previo a la Republica.', hint:'Justo antes de 1931', category:'politica', funFact:'Primo de Rivera dimedio y se exilio a Paris, donde murio solo dos meses despues en un modesto hotel.', quizQuestion: { question:'Que ocurrio tras la caida de la dictadura de Primo de Rivera?', options:['Volvio la monarquia absoluta','Se preparo el camino a la Republica','Empezo la Guerra Civil','Espana se unio a Francia'], correct:1 } },
      { id:'C23', year:1931, title:'Proclamacion de la Segunda Republica', description:'Nuevo regimen democratico.', hint:'Primer tercio del XX', category:'politica', funFact:'La Republica se proclamo tras unas simples elecciones municipales en las que ganaron los partidos republicanos.', quizQuestion: { question:'Que tipo de elecciones dieron paso a la proclamacion de la Republica en 1931?', options:['Generales','Municipales','Un referendum','Un plebiscito'], correct:1 } },
      { id:'C24', year:1931, title:'Constitucion republicana', description:'Amplia derechos y fija un nuevo marco politico.', hint:'Mismo año de la Republica', category:'politica', funFact:'La constitucion de 1931 fue una de las mas avanzadas de Europa, reconociendo el divorcio y el voto femenino.', quizQuestion: { question:'Que derechos novedosos reconocia la Constitucion de 1931?', options:['Solo el derecho al trabajo','El divorcio y el voto femenino','La propiedad privada','El servicio militar obligatorio'], correct:1 } },
      { id:'C25', year:1933, title:'Primer voto femenino', description:'Las mujeres votan en elecciones generales.', hint:'Dos años despues de 1931', category:'sociedad', funFact:'Clara Campoamor lucho casi sola en el Congreso para conseguir el voto femenino, incluso contra companeras de partido.', quizQuestion: { question:'Quien fue la principal defensora del voto femenino en Espana?', options:['Dolores Ibarruri','Clara Campoamor','Victoria Kent','Margarita Nelken'], correct:1 } },
      { id:'C26', year:1936, title:'Victoria del Frente Popular', description:'Elecciones en un clima politico muy polarizado.', hint:'Mismo año de la guerra', category:'politica', funFact:'Las elecciones de febrero de 1936 fueron tan renidas que la diferencia de votos entre los dos bloques fue minima.', quizQuestion: { question:'Que coalicion gano las elecciones de febrero de 1936?', options:['La CEDA','El Frente Popular','La Falange','El Bloque Nacional'], correct:1 } },
      { id:'C27', year:1936, title:'Inicio de la Guerra Civil', description:'Golpe militar fallido y division del pais.', hint:'Julio de 1936', category:'militar', funFact:'El golpe militar fracaso en las grandes ciudades como Madrid y Barcelona, lo que convirtio el golpe en guerra.', quizQuestion: { question:'En que mes de 1936 comenzo la Guerra Civil espanola?', options:['Febrero','Abril','Julio','Octubre'], correct:2 } },
      { id:'C28', year:1937, title:'Bombardeo de Guernica', description:'Ataque simbolo de la guerra sobre poblacion civil.', hint:'En plena Guerra Civil', category:'militar', funFact:'Picasso pinto su famoso cuadro Guernica en solo un mes para denunciar el bombardeo ante el mundo entero.', quizQuestion: { question:'Que famoso artista pinto un cuadro sobre el bombardeo de Guernica?', options:['Dali','Miro','Picasso','Goya'], correct:2 } },
      { id:'C29', year:1939, title:'Fin de la Guerra Civil', description:'Comienza la dictadura franquista.', hint:'Tres años tras 1936', category:'militar', funFact:'Franco emitio su ultimo parte de guerra el 1 de abril de 1939 con la famosa frase: "La guerra ha terminado".', quizQuestion: { question:'Cuantos años duro la Guerra Civil espanola?', options:['Dos años','Tres años','Cuatro años','Cinco años'], correct:1 } },
      { id:'C30', year:1945, title:'Fin de la Segunda Guerra Mundial', description:'Nuevo orden internacional.', hint:'Mitad del siglo XX', category:'militar', funFact:'Aunque Espana no participo oficialmente, envio la Division Azul a luchar junto a Alemania en el frente ruso.', quizQuestion: { question:'Que posicion tuvo Espana oficialmente durante la Segunda Guerra Mundial?', options:['Aliada de Alemania','Aliada de los Aliados','Neutral pero simpatizante del Eje','Totalmente neutral'], correct:2 } },
      { id:'C31', year:1955, title:'Ingreso de Espana en la ONU', description:'Fin del aislamiento internacional inicial.', hint:'Decada de 1950', category:'politica', funFact:'Espana habia sido rechazada de la ONU durante años por ser una dictadura, pero la Guerra Fria cambio las cosas.', quizQuestion: { question:'Por que fue admitida finalmente Espana en la ONU en 1955?', options:['Se convirtio en democracia','Por el contexto de la Guerra Fria','Gano una guerra','Por presion de Francia'], correct:1 } },
      { id:'C32', year:1959, title:'Plan de Estabilizacion', description:'Cambio economico que abre etapa de crecimiento.', hint:'Final de la decada de 1950', category:'economia', funFact:'Antes del plan, Espana estaba tan cerrada economicamente que era dificil encontrar productos extranjeros en las tiendas.', quizQuestion: { question:'Que busco el Plan de Estabilizacion de 1959?', options:['Cerrar fronteras','Abrir la economia espanola al exterior','Nacionalizar las industrias','Repartir tierras'], correct:1 } },
      { id:'C33', year:1969, title:'Juan Carlos designado sucesor', description:'Franco fija la sucesion en la jefatura del Estado.', hint:'Final de los 60', category:'politica', funFact:'Franco eligio a Juan Carlos saltandose a su padre, Don Juan de Borbon, que nunca llego a ser rey de Espana.', quizQuestion: { question:'Quien designo a Juan Carlos como sucesor en la jefatura del Estado?', options:['Las Cortes','El pueblo en referendum','Franco','Don Juan de Borbon'], correct:2 } },
      { id:'C34', year:1975, title:'Muerte de Franco', description:'Fin de la dictadura.', hint:'Ultimo cuarto del XX', category:'politica', funFact:'La dictadura de Franco duro casi 40 años, una de las mas largas de la Europa del siglo XX.', quizQuestion: { question:'Cuantos años duro aproximadamente la dictadura de Franco?', options:['20 años','30 años','40 años','50 años'], correct:2 } },
      { id:'C35', year:1977, title:'Primeras elecciones democraticas', description:'Primeras desde la Segunda Republica.', hint:'En plena Transicion', category:'politica', funFact:'Millones de espanoles votaron por primera vez en su vida, ya que llevaban mas de 40 años sin elecciones libres.', quizQuestion: { question:'Quien gano las primeras elecciones democraticas de 1977?', options:['El PSOE','Alianza Popular','UCD de Adolfo Suarez','El Partido Comunista'], correct:2 } },
      { id:'C36', year:1978, title:'Constitucion de 1978', description:'Base de la democracia actual.', hint:'Un año despues de 1977', category:'politica', funFact:'La Constitucion fue aprobada en referendum el 6 de diciembre, por eso ese dia es festivo en toda Espana.', quizQuestion: { question:'Que dia se celebra en Espana la fiesta de la Constitucion?', options:['12 de octubre','6 de diciembre','1 de mayo','15 de agosto'], correct:1 } },
      { id:'C37', year:1981, title:'Intento de golpe del 23-F', description:'La democracia supera una grave amenaza.', hint:'Inicio de los 80', category:'politica', funFact:'El teniente coronel Tejero entro en el Congreso disparando al techo y retuvo a todos los diputados varias horas.', quizQuestion: { question:'Quien lidero el intento de golpe de Estado del 23-F?', options:['Milans del Bosch','Tejero','Armada','Suarez'], correct:1 } },
      { id:'C38', year:1982, title:'Nuevo ciclo politico', description:'Comienza una larga etapa de gobiernos socialistas.', hint:'Muy cerca del 23-F', category:'politica', funFact:'El PSOE de Felipe Gonzalez gano con mas de 10 millones de votos, la mayor victoria electoral de la democracia espanola.', quizQuestion: { question:'Que partido gano las elecciones de 1982 con mayoria absoluta?', options:['UCD','Alianza Popular','PSOE','PCE'], correct:2 } },
      { id:'C39', year:1986, title:'Ingreso en la CEE', description:'Espana se integra en el proyecto europeo.', hint:'Decada de 1980', category:'politica', funFact:'Espana llego a entrar en la Comunidad Europea el 1 de enero de 1986 junto con Portugal, su vecino peninsular.', quizQuestion: { question:'En que organismo europeo ingreso Espana en 1986?', options:['La OTAN','La Comunidad Economica Europea','El Consejo de Europa','La ONU'], correct:1 } },
      { id:'C40', year:1992, title:'Barcelona 92 y Expo Sevilla', description:'Año simbolo de proyeccion internacional.', hint:'Comienzos de los 90', category:'sociedad', funFact:'La mascota de los Juegos Olimpicos de Barcelona fue Cobi, un perro cubista disenado por Javier Mariscal.', quizQuestion: { question:'Que dos grandes eventos internacionales celebro Espana en 1992?', options:['Mundial de futbol y Expo','Olimpiadas y Expo','Euroliga y Festival de cine','Copa America y Juegos Paralimpicos'], correct:1 } },
      { id:'C41', year:1999, title:'Euro en operaciones financieras', description:'Primera fase de la moneda unica.', hint:'Final del siglo XX', category:'economia', funFact:'Antes del euro, Espana usaba la peseta, y un euro equivalia a 166,386 pesetas exactamente.', quizQuestion: { question:'Que moneda usaba Espana antes del euro?', options:['El real','El escudo','La peseta','El duro'], correct:2 } },
      { id:'C42', year:2002, title:'Euro en billetes y monedas', description:'Entrada del euro en la vida diaria.', hint:'Inicio del siglo XXI', category:'economia', funFact:'Durante dos meses las tiendas aceptaban tanto pesetas como euros para facilitar la transicion a la nueva moneda.', quizQuestion: { question:'En que año empezaron a circular los billetes y monedas de euro?', options:['1999','2000','2001','2002'], correct:3 } },
      { id:'C43', year:2004, title:'Atentados del 11-M', description:'Mayor atentado terrorista en la historia de Espana.', hint:'Dos años despues del euro', category:'sociedad', funFact:'Casi 200 personas murieron y mas de 1.500 resultaron heridas en los trenes de cercanias de Madrid.', quizQuestion: { question:'En que medio de transporte ocurrieron los atentados del 11-M?', options:['Autobuses','Aviones','Trenes de cercanias','Metro'], correct:2 } },
      { id:'C44', year:2008, title:'Crisis economica', description:'Fuerte impacto en empleo y vivienda.', hint:'Final de la primera decada del XXI', category:'economia', funFact:'El desempleo en Espana llego a superar el 26%, y entre los jovenes supero el 55%, cifras historicas.', quizQuestion: { question:'Que sector se vio especialmente afectado por la crisis de 2008 en Espana?', options:['La tecnologia','La construccion y la vivienda','La agricultura','El turismo'], correct:1 } },
      { id:'C45', year:2011, title:'Movimiento 15-M', description:'Protestas ciudadanas contra la crisis y la corrupcion.', hint:'Inicio de la segunda decada del XXI', category:'sociedad', funFact:'Miles de personas acamparon en la Puerta del Sol de Madrid durante semanas pidiendo una democracia mas real.', quizQuestion: { question:'Donde se concentraron las protestas del 15-M en Madrid?', options:['Plaza de Cibeles','Puerta del Sol','Plaza Mayor','El Retiro'], correct:1 } },
      { id:'C46', year:2014, title:'Felipe VI rey', description:'Abdicacion de Juan Carlos I.', hint:'Mitad de la decada de 2010', category:'politica', funFact:'Juan Carlos I fue el primer rey espanol en abdicar voluntariamente desde Carlos I en el siglo XVI.', quizQuestion: { question:'Quien abdico para que Felipe VI se convirtiera en rey?', options:['Franco','Juan de Borbon','Juan Carlos I','Alfonso XIII'], correct:2 } },
      { id:'C47', year:2018, title:'Disolucion de ETA', description:'Fin definitivo de la organizacion terrorista.', hint:'Final de la decada de 2010', category:'sociedad', funFact:'ETA habia actuado durante mas de 50 años causando 853 victimas mortales antes de su disolucion definitiva.', quizQuestion: { question:'Cuantos años aproximadamente estuvo activa la organizacion terrorista ETA?', options:['20 años','30 años','40 años','Mas de 50 años'], correct:3 } },
      { id:'C48', year:2020, title:'Pandemia de COVID-19', description:'Emergencia sanitaria global con gran impacto social.', hint:'Año reciente', category:'sociedad', funFact:'Durante el confinamiento, los espanoles salian a aplaudir a los sanitarios desde sus balcones cada dia a las 20:00.', quizQuestion: { question:'Que medida excepcional se tomo en Espana durante la pandemia de 2020?', options:['Se cerraron las fronteras con Francia','Se decreto un estado de alarma y confinamiento','Se cancelaron las elecciones','Se prohibio internet'], correct:1 } }
    ]
  };

  // --- Categorias con colores ---
  const CATEGORIES = {
    politica:    { label: 'Politica',    color: '#7ba4d4', icon: 'scroll' },
    militar:     { label: 'Militar',     color: '#d47b7b', icon: 'sword' },
    exploracion: { label: 'Exploracion', color: '#7bc4d4', icon: 'compass' },
    religion:    { label: 'Religion',    color: '#b793c3', icon: 'church' },
    cultura:     { label: 'Cultura',     color: '#d4a87b', icon: 'palette' },
    economia:    { label: 'Economia',    color: '#8ab870', icon: 'euro' },
    sociedad:    { label: 'Sociedad',    color: '#c4a86a', icon: 'vote' }
  };

  // --- Mensajes motivacionales ---
  const MESSAGES = {
    correct: [
      'Perfecto!', 'Exacto!', 'Asi se hace!', 'Genial!',
      'Correcto!', 'Bien hecho!', 'Increible!', 'Fantastico!'
    ],
    wrong: [
      'Casi!', 'No era ahi...', 'Sigue intentando!', 'La proxima!',
      'Uy, fallaste!', 'No del todo...', 'Piensa mejor!'
    ],
    timeout: [
      'Se acabo el tiempo!', 'Demasiado lento!', 'Hay que ser mas rapido!',
      'El reloj no espera!'
    ],
    combo: [
      'Racha de {n}!', 'x{n} Combo!', 'Imparable! x{n}!',
      'En llamas! x{n}!', 'Leyenda! x{n}!'
    ],
    finalGood: [
      'Eres un maestro del tiempo!', 'Historiador legendario!',
      'Dominas la cronologia!', 'Impresionante resultado!'
    ],
    finalBad: [
      'Sigue practicando!', 'La historia se aprende paso a paso!',
      'Cada error te hace mas sabio!', 'No te rindas, mejorara!'
    ]
  };

  // --- Decorar eventos con icon/palette ---
  function decorateEvents(pack) {
    const iconSet = pack.era === 'moderna' ? MODERN_ICONS : CONTEMP_ICONS;
    const paletteSet = pack.era === 'moderna' ? MODERN_PALETTES : CONTEMP_PALETTES;
    return pack.events.map((ev, idx) => ({
      ...ev,
      era: pack.era,
      icon: iconSet[idx % iconSet.length],
      palette: paletteSet[idx % paletteSet.length],
      visual: VISUALS.events[ev.id] || null
    }));
  }

  // --- Obtener pack ---
  function getPack(packId) {
    const moderna = { ...EDAD_MODERNA, events: decorateEvents(EDAD_MODERNA) };
    const contemp = { ...EDAD_CONTEMPORANEA, events: decorateEvents(EDAD_CONTEMPORANEA) };

    if (packId === 'mixto') {
      return {
        id: 'mixto', title: 'Mixto: Moderna + Contemporanea',
        subtitle: 'Maximo reto cronologico', era: 'mixto',
        color: '#d4a87b', colorDark: '#5a4020', emoji: '\u{1F30D}',
        events: [...moderna.events, ...contemp.events].sort((a, b) => a.year - b.year)
      };
    }
    if (packId === 'edad_contemporanea') return contemp;
    return moderna;
  }

  // --- Utilidades ---
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randomMsg(type, replacements) {
    const pool = MESSAGES[type] || MESSAGES.correct;
    let msg = pool[Math.floor(Math.random() * pool.length)];
    if (replacements) {
      Object.keys(replacements).forEach(k => {
        msg = msg.replace(`{${k}}`, replacements[k]);
      });
    }
    return msg;
  }

  // --- Difficulty settings ---
  const DIFFICULTY = {
    facil:   { cardsPerRound: 6,  turnTime: 30, lives: 5, label: 'Facil' },
    normal:  { cardsPerRound: 10, turnTime: 22, lives: 3, label: 'Normal' },
    dificil: { cardsPerRound: 14, turnTime: 15, lives: 2, label: 'Dificil' },
    extremo: { cardsPerRound: 18, turnTime: 12, lives: 1, label: 'Extremo' }
  };

  // --- Pack options for menu ---
  const PACK_OPTIONS = [
    { id: 'edad_moderna', label: 'Edad Moderna', emoji: '\u{1F451}' },
    { id: 'edad_contemporanea', label: 'Edad Contemporanea', emoji: '\u{1F3DB}' },
    { id: 'mixto', label: 'Mixto', emoji: '\u{1F30D}' }
  ];

  // --- Power-ups ---
  const POWERUPS = {
    hint:       { id: 'hint',       label: 'Pista',          icon: 'hint',    description: 'Muestra la pista temporal del evento', maxUses: 3 },
    freeze:     { id: 'freeze',     label: 'Congelar tiempo', icon: 'freeze',  description: 'Detiene el cronometro 10 segundos',  maxUses: 2 },
    secondLife: { id: 'secondLife', label: '2a oportunidad',  icon: 'heart',   description: 'No pierdes vida si fallas',          maxUses: 1 },
    doublePoints: { id: 'doublePoints', label: 'Doble puntos', icon: 'star', description: 'Siguiente acierto vale doble', maxUses: 2 }
  };

  // --- Achievements ---
  const ACHIEVEMENTS = [
    { id: 'first_win',     title: 'Primera victoria',   description: 'Completa tu primera partida',         icon: 'trophy',  condition: s => s.gamesCompleted >= 1 },
    { id: 'combo_3',       title: 'Racha de 3',         description: 'Consigue un combo de 3 aciertos',     icon: 'fire',    condition: s => s.bestCombo >= 3 },
    { id: 'combo_5',       title: 'En llamas',          description: 'Consigue un combo de 5 aciertos',     icon: 'fire',    condition: s => s.bestCombo >= 5 },
    { id: 'combo_10',      title: 'Leyenda',            description: 'Consigue un combo de 10 aciertos',    icon: 'fire',    condition: s => s.bestCombo >= 10 },
    { id: 'perfect_round', title: 'Ronda perfecta',     description: 'Completa una ronda sin errores',      icon: 'star',    condition: s => s.perfectRounds >= 1 },
    { id: 'historian',     title: 'Historiador',        description: 'Coloca 50 eventos correctamente',     icon: 'scroll',  condition: s => s.totalCorrect >= 50 },
    { id: 'master',        title: 'Maestro del tiempo', description: 'Coloca 100 eventos correctamente',    icon: 'crown',   condition: s => s.totalCorrect >= 100 },
    { id: 'speedster',     title: 'Rayo',               description: 'Coloca un evento en menos de 3s',     icon: 'compass', condition: s => s.fastestPlacement < 3 },
    { id: 'all_packs',     title: 'Explorador total',   description: 'Juega con los 3 packs',               icon: 'map',     condition: s => s.packsPlayed.size >= 3 },
    { id: 'no_powerups',   title: 'Sin ayuda',          description: 'Gana una partida sin usar power-ups', icon: 'shield',  condition: s => s.winsNoPowerups >= 1 }
  ];

  // --- Levels ---
  const LEVELS = [
    { level: 1, title: 'Aprendiz', xpNeeded: 0 },
    { level: 2, title: 'Cronista', xpNeeded: 100 },
    { level: 3, title: 'Escribano', xpNeeded: 300 },
    { level: 4, title: 'Archivero', xpNeeded: 600 },
    { level: 5, title: 'Historiador', xpNeeded: 1000 },
    { level: 6, title: 'Catedratico', xpNeeded: 1500 },
    { level: 7, title: 'Sabio', xpNeeded: 2200 },
    { level: 8, title: 'Maestro del Tiempo', xpNeeded: 3000 },
    { level: 9, title: 'Leyenda Historica', xpNeeded: 4000 },
    { level: 10, title: 'Gran Archivero Imperial', xpNeeded: 5500 }
  ];

  // --- Avatars ---
  const AVATARS = [
    { id: 'knight', emoji: '\u{1F6E1}\uFE0F', name: 'Caballero', visual: VISUALS.avatars.knight },
    { id: 'queen', emoji: '\u{1F451}', name: 'Reina', visual: VISUALS.avatars.queen },
    { id: 'explorer', emoji: '\u{1F9ED}', name: 'Explorador', visual: VISUALS.avatars.explorer },
    { id: 'scholar', emoji: '\u{1F4DA}', name: 'Erudito', visual: VISUALS.avatars.scholar },
    { id: 'artist', emoji: '\u{1F3A8}', name: 'Artista', visual: VISUALS.avatars.artist },
    { id: 'captain', emoji: '\u2693', name: 'Capitan', visual: VISUALS.avatars.captain },
    { id: 'sage', emoji: '\u{1F52E}', name: 'Sabio', visual: VISUALS.avatars.sage },
    { id: 'scribe', emoji: '\u270F\uFE0F', name: 'Escribano', visual: VISUALS.avatars.scribe }
  ];

  return {
    EDAD_MODERNA, EDAD_CONTEMPORANEA, CATEGORIES, MESSAGES,
    DIFFICULTY, PACK_OPTIONS, POWERUPS, ACHIEVEMENTS,
    MODERN_ICONS, CONTEMP_ICONS, MODERN_PALETTES, CONTEMP_PALETTES,
    LEVELS, AVATARS, VISUALS,
    getPack, shuffle, randomMsg, decorateEvents
  };
})();
