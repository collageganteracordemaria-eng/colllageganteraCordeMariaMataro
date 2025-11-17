const rutas = [
  { url: '/', file: 'index.html', keywords: ['inici', 'home', 'principal', 'benvinguda', 'entrada', 'pàgina inicial'] },
  { url: '/cercavila', file: 'cercaviles.html', keywords: ['cercavila', 'desfilada', 'sortida', 'comparsa', 'carrers', 'sortides', 'música al carrer'] },
  { url: '/chat', file: 'chat.html', keywords: ['xat', 'missatges', 'conversar', 'parlar', 'comunicació', 'grup', 'en línia'] },
  { url: '/cursa', file: 'cursa.html', keywords: ['cursa', 'carrera', 'competició', 'idees', 'conversar'] },
  { url: '/contacte', file: 'contacte.html', keywords: ['contacte', 'correu', 'telèfon', 'adreça', 'formulari de contacte', 'ajuda', 'suport'] },
  { url: '/membres', file: 'equip.html', keywords: ['equip', 'membres', 'persones', 'integrants', 'organitzadors', 'participants', 'col·laboradors'] },
  { url: '/experiencies', file: 'experiencies.html', keywords: ['experiències', 'vivències', 'històries', 'records', 'testimonis', 'experiències personals'] },
  { url: '/carnaval', file: 'carnaval.html', keywords: ['carnaval', 'disfresses', 'festa', 'màscares', 'desfilada', 'ball', 'celebració', 'alegria'] },
  { url: '/festa-major', file: 'festam.html', keywords: ['festa major', 'celebració', 'principal', 'poble', 'tradició', 'fm', 'FM'] },
  { url: '/festa-tardor', file: 'festatar.html', keywords: ['festa tardor', 'tardor', 'celebració', 'cumple de la colla', 'cumpleanys'] },
  { url: '/formulari-musica', file: 'formulari-musica.html', keywords: ['música', 'inscripció', 'formulari', 'grup musical', 'banda', 'orquestra', 'participar música'] },
  { url: '/formulari-portador', file: 'formulari-portador.html', keywords: ['portador', 'formulari', 'inscripció', 'carregador', 'gegant', 'capgròs', 'participar'] },
  { url: '/home', file: 'menu.html', keywords: ['menú', 'inici', 'principal', 'home', 'navegació', 'pàgina principal'] },
  { url: '/sant-jordi', file: 'sant_jordi.html', keywords: ['sant jordi', 'llegenda del drac', 'celebració de sant jordi'] },
  { url: '/uneix-te', file: 'uneixte.html', keywords: ['unir-se', 'participar', 'registre', 'inscripció', 'apuntar-se', 'fer-se soci', 'colaborar'] },
];

function handleSearch(event) {
  event.preventDefault();
  const query = document.getElementById('searchInput').value.toLowerCase().trim();

  // Cerca coincidències per URL, file o paraules clau
  const resultat = rutas.find(r => 
    r.url.includes(query) || 
    r.file.includes(query) || 
    r.keywords.some(k => k.includes(query))
  );

  if(resultat) {
    window.location.href = resultat.file; // Redirigeix a la pàgina
  } else {
    alert('No s’ha trobat cap pàgina amb aquest terme 😅');
  }

  return false;
}

// Suggereix opcions en viu basades en paraules clau
const input = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');

input.addEventListener('input', () => {
  const value = input.value.toLowerCase().trim();
  suggestions.innerHTML = '';
  if(value === '') {
    suggestions.style.display = 'none';
    return;
  }

  const matches = rutas.filter(r => 
    r.url.includes(value) || 
    r.file.includes(value) || 
    r.keywords.some(k => k.includes(value))
  );

  if(matches.length === 0) {
    suggestions.style.display = 'none';
    return;
  }

  matches.forEach(match => {
    const li = document.createElement('li');
    li.textContent = match.keywords[0]; // mostra la primera paraula clau com a suggeriment
    li.style.padding = '5px';
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      window.location.href = match.file;
    });
    suggestions.appendChild(li);
  });

  suggestions.style.display = 'block';
});

input.addEventListener('blur', () => {
  setTimeout(() => suggestions.style.display = 'none', 100);
});