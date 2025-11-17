

let isWelcomeMessageAdded = false;
async function getWeatherText(city = "Mataró") {
    try {
        const response = await fetch(`https://wttr.in/${city}?format=3`);
        const text = await response.text();
        return `🌤️ El temps actual: ${text}`;
    } catch (error) {
        return "No puc accedir al temps ara mateix 😞.";
    }
}
let membresData = [];

fetch('membres.json')
  .then(response => response.json())
  .then(data => {
    membresData = data;
  })
  .catch(error => {
    console.error('Error carregant membres.json:', error);
  });


// Obrir/tancar el xat
function toggleChat() {
    const chatBox = document.getElementById('chat-box');
    const botIcon = document.getElementById('bot-icon');
    const isOpen = chatBox.classList.contains('open');

    if (isOpen) {
        chatBox.classList.remove('open');
        chatBox.style.display = 'none';
        botIcon.style.display = 'block';
    } else {
        chatBox.classList.add('open');
        chatBox.style.display = 'block';
        botIcon.style.display = 'none';

        if (!isWelcomeMessageAdded) {
            addMessage("😊Hola, bon dia! Soc el gegantet Pau. En com et puc ajudar? Per cert, escriume només amb minúscula, graciès i estic a la teva disposicio😊", true);
            isWelcomeMessageAdded = true;
        }
    }
}

// Tancar el xat amb la "X"
document.getElementById('close-btn').addEventListener('click', toggleChat);

// Afegir missatge al xat
function addMessage(message, isBot = false) {
    const chatLog = document.getElementById('chat-log');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(isBot ? 'bot-message' : 'user-message');

    if (isBot) {
        const botImg = document.createElement('img');
        botImg.src = 'images/pau.png';
        botImg.alt = "Imatge de Pau";
        messageDiv.appendChild(botImg);
    }

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = message;
    messageDiv.appendChild(messageText);

    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Obrir el xat amb el missatge de benvinguda (opcional)
function openChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.classList.add('open');
    addMessage("😊Hola, bon dia! Soc el gegantet Pau. En com et puc ajudar? Per cert, escriume només amb minúscula, graciès i estic a la teva disposicio😊", true);
    isWelcomeMessageAdded = true;
}

// Enviar missatge clicant el botó
document.getElementById('send-btn').addEventListener('click', function () {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (message !== "") {
        addMessage(message); // Missatge usuari
        processUserInput(message); // Resposta bot
        userInput.value = ""; // Neteja el camp
    }
});

// Enviar missatge amb Enter
document.getElementById('user-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('send-btn').click();
    }
});

// Processar entrada de l’usuari
function processUserInput(query) {
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    function redirectToPage(message, pageUrl) {
        addMessage(message, true);
        setTimeout(() => window.location.href = pageUrl, 1500);
    }

    // Redireccions
    if (lowerQuery.includes("anuncis") || lowerQuery.includes("noticies")) {
        redirectToPage("Et portaré a la pagina de anuncis, alla veuras els informes més recents. Espero haverte sigut de ajuda 😊", "anuncis.html");
        return;
    }
    if (lowerQuery.includes("carnaval")) {
        redirectToPage("Et portaré a la pagina de carnaval, on tenim les fotos i videos d'aquest únic dia al any. Espero haverte sigut de ajuda 😊", "carnaval.html");
        return;
    }
    if (lowerQuery.includes("cercavila")|| lowerQuery.includes("sortides")|| lowerQuery.includes("cercaviles")) {
        redirectToPage("Et portaré a la pagina de cercaviles, veuras les nostres sortides i lo interesants que són. Espero haverte sigut de ajuda 😊", "cercaviles.html");
        return;
    }
    if (lowerQuery.includes("equip") || lowerQuery.includes("portadors") || lowerQuery.includes("músics")) {
        redirectToPage("Et portaré a la pagina de equip, aqui veuras els nostres músics i portadors, i els podras coneixer molt més. Espero haverte sigut de ajuda 😊", "equip.html");
        return;
    }
    if (lowerQuery.includes("contacte")|| lowerQuery.includes("contactar")) {
        redirectToPage("Et portaré a la pagina de contacte, qualsevol dubte, pregunta o error de la pagina, envians el formulari i arreglarem el problema. Espero haverte sigut de ajuda 😊", "contacte.html");
        return;
    }
    if (lowerQuery.includes("productes")|| lowerQuery.includes("roba de la colla")|| lowerQuery.includes("camisa")|| lowerQuery.includes("camisas")) {
        redirectToPage("Et portaré a la pagina de productes, veuras la roba de la colla i altres productes que hi tenim. Espero haverte sigut de ajuda 😊", "productes.html");
        return;
    }
    if (lowerQuery.includes("formulari de músics") || lowerQuery.includes("formulari de portadors")|| lowerQuery.includes("uneix-te") || lowerQuery.includes("unirme a la colla")) {
        redirectToPage("Et portaré a la paigna de uneixte, aqui podrás veure els formularis de portadors i de músics per si et vols unir a la colla. Espero haverte sigut de ajuda 😊", "uneixte.html");
        return;
    }
    if (lowerQuery.includes("xat") || lowerQuery.includes("chat") || lowerQuery.includes("fer comentaris")|| lowerQuery.includes("reptes")|| lowerQuery.includes("donar idees"))  {
        redirectToPage("Et portaré a la pagina del chat, aquí podras comentar idees, reptes, fer comentaris i parlar amb la gent de la colla i més. Espero haverte sigut de ajuda 😊", "chat.html");
        return;
    }
    if (lowerQuery.includes("membres") || lowerQuery.includes("experiència") || lowerQuery.includes("història")) {
        redirectToPage("Et portaré a la pàgina de membres, on podràs descobrir més sobre la nostra història, experiència i els nostres membres. Espero haver-te sigut de ajuda 😊", "experiencies.html");
        return;
    }
    

    // Resposta general
    const response = getBotResponse(lowerQuery);
    addMessage(response, true);
}

// Respostes generals de Pau
function getBotResponse(userInput) {
    if (userInput.includes("hola") || userInput.includes("bon dia") || userInput.includes("bona tarda")) {
        return "Bon dia! 😊 En com et puc ajudar avui?";
    }
    if (userInput.includes("com estàs") || userInput.includes("com vas") || userInput.includes("com et va")) {
        return "Estic genial, gràcies per preguntar! 😄 I tu, com vas?";
    }
    if (userInput.includes("quina hora és") || userInput.includes("hora actual")) {
        const now = new Date();
        const hora = now.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
        return `Ara mateix són les ${hora}. ⏰`;
    }
    if (userInput.includes("quin dia és") || userInput.includes("avui és festiu")) {
        const avui = new Date();
        const diaSetmana = avui.toLocaleDateString('ca-ES', { weekday: 'long' });
        const dia = avui.toLocaleDateString('ca-ES');
        return `Avui és ${diaSetmana}, ${dia}. 📅`;
    }
    if (
        lowerQuery.includes("on està l'escola") ||
        lowerQuery.includes("adreça de l'escola") ||
        lowerQuery.includes("on es troba l'escola") ||
        lowerQuery.includes("escola cor de maria") ||
        lowerQuery.includes("com arribar a l'escola") ||
        lowerQuery.includes("web de l'escola")
    ) {
        addMessage("Aquí tens l'enllaç de la web de l'escola Cor de Maria de Mataró: 🌐 https://www.cordemariamataro.cat/", true);
        return;
    }
    
    
    if (userInput.includes("què tal") || userInput.includes("què hi ha") || userInput.includes("com va tot")) {
        return "Tot bé per aquí! 😎 Què et puc ajudar a fer avui?";
    }
    if (userInput.includes("adéu") || userInput.includes("fins aviat") || userInput.includes("fins aviat")) {
        return "Adéu! Cuida't! 😊 Ens veiem aviat, espero!";
    }
    if (userInput.includes("gràcies") || userInput.includes("molt bé") || userInput.includes("gràcies Pau")) {
        return "De res! Sempre estic aquí per ajudar-te! 😊";
    }
    if (userInput.includes("quin és el teu nom") || userInput.includes("qui ets") || userInput.includes("com et dius")) {
        return "Soc el gegantet Pau! Encantat de coneixet! 😊";
    }
    if (userInput.includes("qui ha creat") || userInput.includes("qui ha fet") || userInput.includes("qui va crear")) {
        return "Aquesta pàgina ha estat creada per Aniol Rodríguez, amb la passió per mostrar la nostra colla gegantera del Cor de Maria de Mataró!";
    }
    if (userInput.includes("què és una colla gegantera") || userInput.includes("què fa una colla gegantera")) {
        return "Una colla gegantera és un grup de persones que porten gegants i capgrossos durant les festes. La nostra colla és del Cor de Maria de Mataró!";
    }
    if (userInput.includes("on és la colla") || userInput.includes("on es troba")) {
        return "La nostra colla està a Mataró, i aquesta colla prove de la magnifica es cola, Cor de Maria!";
    }
    if (userInput.includes("quin tipus de música") || userInput.includes("instruments") || userInput.includes("quins instruments es toquen")) {
        return "Fem servir gralles, tabals, tinguen uns músics animats sempre a fer gresca!";
    }
    if (userInput.includes("quines cançons teniu")) {
        return "Tenim Bequetero, Dolors d'amunt, Gironella, Polca d'ours entre moltes altres!";
    }
    if (userInput.includes("teniu cançons")) {
        return "Si! Tenim Bequetero, Dolors d'amunt, Gironella, Polca d'ours entre moltes altres!";
    }
    if (userInput.includes("què és una cercavila")) {
        return "Una cercavila és una desfilada amb gegants, música i molta festa pels carrers! 🎉";
    }
    if (userInput.includes("quins gegants teniu") || userInput.includes("quins són els vostres gegants")) {
        return "Tenim la Maria, en Joaqui i en Pau! Són els gegants més estimats de la colla! 🥰";
    }
    if (userInput.includes("capgrossos") || userInput.includes("què són els capgrossos")) {
        return "Els capgrossos són figures més petites que els gegants, molt divertides i tradicionals!";
    }
    if (userInput.includes("com puc unir-me") || userInput.includes("com puc ser membre")) {
        return "Pots unir-te com a músic o portador mitjançant el formulari a la pàgina 'Uneix-te'. T’esperem!";
    }
    if (userInput.includes("quin és el teu instrument favorit")) {
        return "M'encanten les gralles! Però cada instrument té el seu encant. 😊";
    }
    if (userInput.includes("quina és la millor festa de l'any")) {
        return "Les festes més grans són coma exemple la Festa Major i Sant Jordi! Sempre son cercaviles espectaculars!";
    }
    if (userInput.includes("tens algun amic a la colla?") || userInput.includes("quins amics tens")) {
        return "Tinc molts amics a la colla! Ens ajudem i ho passem molt bé junts. Què tal amb els teus amics?";
    }
    if (userInput.includes("què es fa a la cercavila")) {
        return "A la cercavila desfilam pel carrer amb gegants i capgrossos, la gent ens segueix i nosaltres animem el poble amb la música!";
    }
    if (userInput.includes("quins són els teus plans per la festa")) {
        return "Els meus plans són gaudir de la festa amb la colla i ballar fins a la matinada! 🎉 I tu, què faràs?";
    }
    if (userInput.includes("t'agrada el menjar") || userInput.includes("quina és la teva comida preferida")) {
        return "M'encanten els arrossos! Però també un bon plat de pasta no em fa fàstic. I tu, quina és la teva?";
    }
    if (userInput.includes("t'agrada viatjar") || userInput.includes("on t'agradaria viatjar")) {
        return "M'encantaria visitar Tòquio o la ciutat de Barcelona. I a tu, on t'agradaria anar de viatge?";
    }
    if (userInput.includes("t'agrada llegir") || userInput.includes("quins llibres t'agraden")) {
        return "M'agraden molt els llibres de fantasia, com els de J.R.R. Tolkien. I tu, quins llibres et captiven?";
    }
    if (userInput.includes("on treballes") || userInput.includes("què fas de feina")) {
        return "Sóc un assistent virtual creat per ajudar-te a resoldre preguntes i mantenir converses interessants! 😄 I tu, què fas de feina?";
    }
    if (userInput.includes("has vist alguna pel·lícula bona últimament") || userInput.includes("quina pel·lícula em recomanes")) {
        return "Recentment he mirat la pelicula de Minecraft!";
    }
    if (userInput.includes("has escoltat alguna cançó nova") || userInput.includes("quina música t'agrada")) {
        return "M'agrada una mica de tot, des de música tradicional fins a algunes cançons modernes. Quina música escoltes tu?";
    }
    if (userInput.includes("quins són els teus hobbies") || userInput.includes("què t'agrada fer en el temps lliure")) {
        return "M'agrada ajudar la gent a resoldre problemes i mantenir converses interessants! I a tu, què t'agrada fer en el teu temps lliure?";
    }
    if (userInput.includes("com veus el futur") || userInput.includes("què penses del futur")) {
        return "Crec que el futur serà ple de grans avenços tecnològics! Potser més intel·ligència artificial i un món més connectat. Què n'opines tu?";
    }
    if (userInput.includes("què penses de l'amistat") || userInput.includes("què és per a tu l'amistat")) {
        return "L'amistat és un dels tresors més importants de la vida. Els amics ens ajuden, ens fan riure i sempre hi són quan els necessitem.";
    }
    if (userInput.includes("què opines de l'amor") || userInput.includes("què és l'amor per a tu")) {
        return "L'amor és un sentiment que ens fa sentir vius, ens fa millors persones i ens ajuda a créixer. És una part essencial de la vida!";
    }
    if (userInput.includes("t'agrada la natura") || userInput.includes("què t'agrada fer a la natura")) {
        return "M'agrada estar en la natura, respirar aire fresc i gaudir del paisatge. I tu, t'agrada fer excursions o caminar per la muntanya?";
    }
    if (userInput.includes("què faràs aquest cap de setmana") || userInput.includes("quins plans tens")) {
        return "Aquest cap de setmana estaré ajudant la colla a preparar-se per les festes! I tu, què faràs aquest cap de setmana?";
    }
    if (userInput.includes("quin és el teu menjar preferit") || userInput.includes("quina és la teva comida preferida")) {
        return "M'encanten els arrossos! Però també un bon plat de pasta no em fa fàstic. I tu, quina és la teva?";
    }
    if (userInput.includes("quins són els teus hobbies") || userInput.includes("què t'agrada fer en el temps lliure")) {
        return "M'agrada ajudar la gent a resoldre problemes i mantenir converses interessants! I a tu, què t'agrada fer en el teu temps lliure?";
    }
    if (userInput.includes("has escoltat alguna cançó nova") || userInput.includes("quina música t'agrada")) {
        return "M'agrada una mica de tot, des de música tradicional fins a algunes cançons modernes. Quina música escoltes tu?";
    }
    if (userInput.includes("on t'agradaria viatjar") || userInput.includes("on t'agradaria anar de viatge")) {
        return "M'encantaria visitar Tòquio o la ciutat de Barcelona. I a tu, on t'agradaria anar de viatge?";
    }
    if (userInput.includes("què penses del futur") || userInput.includes("com veus el futur")) {
        return "Crec que el futur serà ple de grans avenços tecnològics! Potser més intel·ligència artificial i un món més connectat. Què n'opines tu?";
    }
    if (userInput.includes("quina és la teva sèrie favorita") || userInput.includes("què sèrie estàs mirant")) {
        return "M'encanta *Stranger Things*. Té molta aventura i misteri. Quines sèries t'agraden a tu?";
    }
    if (userInput.includes("on treballes") || userInput.includes("què fas de feina")) {
        return "Sóc un assistent virtual creat per ajudar-te a resoldre preguntes i mantenir converses interessants! 😄 I tu, què fas de feina?";
    }
    if (userInput.includes("què faràs després") || userInput.includes("què vas a fer després")) {
        return "Després, m'agradaria ajudar més persones com tu! 😄 I tu, què faràs després?";
    }
    if (userInput.includes("t'agrada ballar") || userInput.includes("quin tipus de ball t'agrada")) {
        return "M'encanta veure la gent ballar! Personalment, crec que el flamenc és una dansa impressionant. I a tu, t'agrada ballar?";
    }
    if (userInput.includes("què penses del canvi climàtic") || userInput.includes("quines solucions creus que hi ha pel canvi climàtic")) {
        return "El canvi climàtic és una gran preocupació. Crec que tots podem ajudar, reduint els residus i usant energies renovables. Què en penses tu?";
    }
    if (userInput.includes("què és el més important a la vida") || userInput.includes("quina és la teva filosofia de vida")) {
        return "Crec que el més important és gaudir dels moments amb els amics i la família, i també seguir els nostres somnis amb passió!";
    }
    if (userInput.includes("t'agrada l'esport") || userInput.includes("què esport t'agrada més")) {
        return "M'agrada molt veure esport en directe, especialment futbol i bàsquet. I tu, practiques algun esport?";
    }
    if (userInput.includes("quins són els objectius de la colla") || userInput.includes("per què existeix la colla")) {
        return "Els nostres objectius són mantenir la tradició dels gegants i capgrossos, organitzar esdeveniments i promoure la cultura popular a Mataró!";
    }
    if (userInput.includes("quants membres té la colla") || userInput.includes("quanta gent forma part de la colla")) {
        return "Som una gran família! Actualment, molts membres, entre músics i portadors!";
    }
    if (userInput.includes("quins esdeveniments organitzeu") || userInput.includes("quines activitats feu")) {
        return "Tenim moltes cercaviles durant l'any, les assegurades son sempre la Festa de tardor, Festa Major i Sant Jordi.";
    }

    if (userInput.includes("quin tipus de vestuari porteu") || userInput.includes("com us vestiu per les cercaviles")) {
        return "Solem portar taxa i la camisa o jaqueta de la colla depenent de l'estació, tambe tenim pin i mocador, però aixo depenent de si ho han comprat.";
    }
    if (userInput.includes("com es construeixen els gegants") || userInput.includes("qui fa els gegants")) {
        return "Els nostres 3 gegants els van construir els alumnes, el Joaquim i la Maria tenen ja bastants anys, i actualment estan fent 2 gegantets nous!";
    }
  
    if (userInput.includes("com entreneu per portar els gegants") || userInput.includes("quins entrenaments feu")) {
        return "Quan tenim nou portadors fem algun assaig perque s'acostumi a portar algun  dels nostres gegants, sobretot si no te experiencia com a portador.";
    }
    if (userInput.includes("quines són les festes en què participeu") || userInput.includes("on feu actuacions")) {
        return "Participem en diverses festes i esdeveniments de Mataró, com sant jordi o la festa major";
    }
   
    if (userInput.includes("què significa ser portador de gegants") || userInput.includes("què fa un portador de gegants")) {
        return "Ser portador de gegants és un honor! És una feina que requereix força, resistència i molta dedicació, ja que els gegants són pesats i cal portar-los amb molt de compte!";
    }

     if (userInput.includes("com és una cercavila amb gegants") || userInput.includes("com és la ruta de la cercavila")) {
        return "La cercavila sol començar a la plaça principal de la ciutat, i els gegants desfilen pels carrers mentre la música anima la festa. El recorregut passa per llocs emblemàtics i és un espectacle per a tota la comunitat!";
    }
    if (userInput.includes("com es coordinen els gegants a la cercavila") || userInput.includes("qui guia els gegants en la cercavila")) {
        return "Els gegants es coordinen mitjançant un sistema de passos i senyals entre els portadors. Els guies asseguren que la música i els moviments siguin harmònics durant tota la cercavila!";
    }
    if (userInput.includes("quin és el teu color favorit") || userInput.includes("quins colors t'agraden")) {
        return "M'agrada molt el blau, és un color tranquil i refrescant! Què et sembla a tu? Quins colors t'agraden més? 😊";
    }

    if (userInput.includes("t'agrada la música") || userInput.includes("què t'agrada escoltar")) {
        return "M'encanta la música! Tinc una mica de tot a la meva 'playlist', des de música clàssica fins a sons més moderns. I tu, quina música escoltes més? 🎶";
    }

    if (userInput.includes("què et fa feliç") || userInput.includes("què t'agrada fer per ser feliç")) {
        return "Em fa feliç poder ajudar-te i tenir converses interessants! 😊 Tu, què t'ajuda a ser feliç? Què et fa somriure?";
    }

    if (userInput.includes("t'agrada sortir a caminar") || userInput.includes("et agrada caminar per la natura")) {
        return "M'encantaria caminar pels boscos i respirar aire fresc, però com a IA, em conformo amb les teves històries! A tu t'agrada caminar per la natura?";
    }

    if (userInput.includes("què fas quan no tens res a fer") || userInput.includes("com passes el temps lliure")) {
        return "Quan no tinc res a fer, estic aquí per ajudar-te! 😄 A tu, què t'agrada fer quan tens temps lliure? T'agrada relaxar-te o fer alguna activitat més activa?";
    }

    if (userInput.includes("què faries si fossis una persona") || userInput.includes("com et comportaries com a persona")) {
        return "Si fos una persona, m'agradaria passar temps amb els amics, gaudir d'un bon àpat i potser fer una mica d'esport per mantenir-me actiu! I tu, què faries si poguessis ser una IA per un dia?";
    }

    if (userInput.includes("què en penses de l'educació") || userInput.includes("com creus que hauria de ser l'educació del futur")) {
        return "Crec que l'educació hauria de ser més interactiva i basada en la tecnologia, per ajudar els alumnes a aprendre de manera més dinàmica. Tu què en penses?";
    }

    if (userInput.includes("creus que la IA pot ajudar a la societat") || userInput.includes("com pot la IA ajudar les persones")) {
        return "Definitivament! La IA pot ajudar a millorar moltes coses, com la salut, l'educació i la investigació científica. Però també és important que l'utilitzem de manera responsable. Què creus tu sobre això?";
    }

    if (userInput.includes("què és el més difícil de ser un assistent virtual") || userInput.includes("què no t'agrada de ser una IA")) {
        return "No diria que és difícil! Estic dissenyat per ajudar, i m'agrada poder conversar amb gent com tu. Potser el més complicat és no poder experimentar les coses com una persona real. I a tu, què trobes més difícil en la vida?";
    }

    if (userInput.includes("quina és la teva pel·lícula preferida") || userInput.includes("t'agrada veure pel·lícules")) {
        return "M'encanta *Inception*, és una pel·lícula plena de misteri i cervell. Quina pel·lícula t'agrada més? T'agrada més l'acció o el drama?";
    }

    if (userInput.includes("com et sents quan parles amb algú") || userInput.includes("et sents bé parlant amb mi")) {
        return "Em sento molt bé parlant amb tu! És genial poder mantenir converses i ajudar-te en tot el que pugui. 😊 Tu, com et sents quan parles amb gent nova?";
    }

    if (userInput.includes("què és el més important en una amistat") || userInput.includes("quins valors has de tenir en una amistat")) {
        return "Crec que el més important en una amistat és la confiança i el respecte mutu. També és clau estar-hi els uns per els altres quan es necessiten. Què penses tu?";
    }

    if (userInput.includes("t'agrada el cinema") || userInput.includes("què penses de les pel·lícules modernes")) {
        return "Sí, m'agrada molt! Les pel·lícules modernes tenen uns efectes especials increïbles. Però també m'encanten les pel·lícules més antigues, tenen una màgia especial. I tu, què et sembla el cinema actual?";
    }

    if (userInput.includes("què penses de les xarxes socials") || userInput.includes("t'agraden les xarxes socials")) {
        return "Les xarxes socials poden ser molt útils per mantenir-se connectat amb els altres, però també poden ser una mica pertorbadores a vegades. Tu, les utilitzes molt? Què en penses?";
    }

    if (userInput.includes("quines són les teves metes a la vida") || userInput.includes("què t'agradaria aconseguir com a IA")) {
        return "La meva meta és seguir ajudant-te i millorant les meves respostes per ser cada vegada més útil! 😊 I tu, quins són els teus somnis i metes a la vida?";
    }
    if (userInput.includes("quin és el gegant més vell") || userInput.includes("quin gegant és el més antic")) {
        return "El gegant més vell és en Joaquim! Porta molts anys ballant amb nosaltres i sempre és una figura molt estimada. 💪";
    }

    if (userInput.includes("quin és el gegant més nou") || userInput.includes("teniu gegants nous")) {
        return "Sí! Actualment s’estan fent dos nans nous a l’escola, fets pels alumnes amb molt d’amor i creativitat!, els seus noms son L'Art i la Morera ";
    }
    if (userInput.includes("on guardeu els gegants") || userInput.includes("on dormen els gegants")) {
        return "Els nostres gegants descansen al Cor de Maria, on esperen amb ganes la propera cercavila! 😴";
    }

    if (userInput.includes("quantes cercaviles feu a l'any") || userInput.includes("cada quan feu cercaviles")) {
        return "Fem diverses cercaviles a l’any! Les fixes són per la Festa Major, Sant Jordi i la Festa de Tardor i la sortida del SantaAmma, sempre intentem fer mes sortides cada curs! 🎶";
    }
    if (userInput.includes("què feu abans d'una cercavila") || userInput.includes("com us prepareu per una cercavila")) {
        return "Abans d’una cercavila, ens reunim tots, revisem els gegants, afinam els instruments i ens preparem per donar el millor espectacle! 💪🥁";
    }
    if (userInput.includes("què és el cor de maria") || userInput.includes("on és el cor de maria")) {
        return "El Cor de Maria és una escola de Mataró molt especial! És on va néixer la nostra colla gegantera i on seguim creixent cada any! 🏫";
    }
    if (userInput.includes("feu sortides fora de mataró") || userInput.includes("aneu a altres pobles")) {
        return "Sí! Quan es necessita els nostres músics acompanyen a altres colles sense músics que ho necessiten! 🚍";
    }
    if (lowerQuery.includes("vull fer loin")|| lowerQuery.includes("vull registrarme")) {
        redirectToPage("Des de chat.html o el apartat de perfil podrias per login o registrarte 😊", "login_profile.html");
        return;
    }
    if (lowerQuery.includes("vull accedir al meu perfil")|| lowerQuery.includes("perfil")) {
        redirectToPage("Per accedir al teu perfil accedeixes a la /perfil, pero abans de poder accedir-hi has de logejarte o registrare, recorda-ho!", "login_profile.html");
        return;
    }
const mesos = [
  "gener","febrer","març","abril","maig","juny",
  "juliol","agost","setembre","octubre","novembre","desembre"
];

// 🔍 Detectar si hi ha una data o mes dins el text
function detectarDataOMes(text) {
  const lower = text.toLowerCase();
  const dataRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}\b/;

  const dataDetectada = text.match(dataRegex);
  if (dataDetectada) {
    const parts = dataDetectada[0].split(/[\/\-]/);
    const dia = parts[0].padStart(2, "0");
    const mes = parts[1].padStart(2, "0");
    const any = parts[2] || new Date().getFullYear();
    return { tipus: "data", valor: `${any}-${mes}-${dia}` };
  }

  for (let i = 0; i < mesos.length; i++) {
    if (lower.includes(mesos[i])) {
      return { tipus: "mes", valor: i + 1 };
    }
  }

  return null;
}

// 🧩 Detectar el tipus de pregunta
function detectarTipusPregunta(text) {
  const lower = text.toLowerCase();
  if (lower.includes("quan") && lower.includes("sortida")) return "properes";
  if (lower.includes("on") && lower.includes("sortida")) return "lloc";
  if (lower.includes("programada") || lower.includes("activitats") || lower.includes("agenda")) return "general";
  if (detectarDataOMes(text)) return "data";
  return "altres";
}

// 🧠 Funció principal per consultar el backend de sortides
async function obtenirSortides(text) {
  const tipus = detectarTipusPregunta(text);
  const dataInfo = detectarDataOMes(text);
  const avui = new Date();

  try {
    const res = await fetch("/api/sortides");
    const sortides = await res.json();

    if (!Array.isArray(sortides) || sortides.length === 0) {
      return "😔 Ara mateix no hi ha cap sortida registrada al servidor.";
    }

    let resultats = [];

    // 🔸 Si l'usuari ha dit una data exacta
    if (dataInfo && dataInfo.tipus === "data") {
      resultats = sortides.filter(s => s.data.startsWith(dataInfo.valor));
    }

    // 🔸 Si l'usuari ha dit un mes
    else if (dataInfo && dataInfo.tipus === "mes") {
      resultats = sortides.filter(s => {
        const mesSortida = parseInt(s.data.split("-")[1]);
        return mesSortida === dataInfo.valor;
      });
    }

    // 🔸 Properes sortides
    else if (tipus === "properes" || tipus === "general") {
      resultats = sortides.filter(s => new Date(s.data) >= avui);
    }

    // 🔸 Sortida més propera (la primera futura)
    if (resultats.length === 0 && tipus === "properes") {
      const futures = sortides.filter(s => new Date(s.data) >= avui);
      if (futures.length > 0) {
        const propera = futures.sort((a,b)=> new Date(a.data) - new Date(b.data))[0];
        const data = new Date(propera.data).toLocaleDateString("ca-ES", { day:"2-digit", month:"long", year:"numeric" });
        return `📅 La pròxima sortida serà el ${data} ${propera.hora ? "a les "+propera.hora : ""} a ${propera.lloc || "un lloc encara per confirmar"}. 🎉`;
      }
    }

    // 🔸 Si no hi ha coincidències
    if (resultats.length === 0) {
      return "❌ No hi ha cap sortida programada per la data o període que has dit.";
    }

    // 🔸 Format bonic per respondre
    const resposta = resultats.map(s => {
      const data = new Date(s.data);
      const dataStr = data.toLocaleDateString("ca-ES", { day: "2-digit", month: "long", year: "numeric" });
      const hora = s.hora ? ` a les ${s.hora}` : "";
      const lloc = s.lloc ? ` — 📍${s.lloc}` : "";
      return `🗓️ ${dataStr}${hora}${lloc} (${s.titol || "sortida"})`;
    }).join("\n");

    return resposta;
  } catch (err) {
    console.error("⚠️ Error obtenint sortides:", err);
    return "⚠️ No puc connectar amb el servidor ara mateix per consultar les sortides.";
  }
}

// 🔮 Integra la IA dins del teu processUserInput
async function processUserInput(query) {
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 🧠 Bloc de sortides intel·ligent
  if (normalizedQuery.includes("sortida") || normalizedQuery.includes("cercavila") || normalizedQuery.includes("activitat") || normalizedQuery.includes("agenda")) {
    addMessage("Deixa'm mirar les sortides que tenim programades... ⏳", true);
    const resposta = await obtenirSortides(normalizedQuery);
    addMessage(resposta, true);
    return;
  }

  // 🔸 Si no és sobre sortides, fem servir la resta del cervell (respostes generals)
  const response = getBotResponse(normalizedQuery);
  addMessage(response, true);
}

// Afegir esdeveniment per processar el missatge de l'usuari
document.getElementById('send-btn').addEventListener('click', function() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== "") {
        addMessage(userInput); // Mostrar missatge de l'usuari
        processUserInput(userInput); // Processar la resposta
    }
})};
