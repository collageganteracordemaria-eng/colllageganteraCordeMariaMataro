document.getElementById("contacte-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que el formulari es presenti de manera tradicional
  
    const nom = document.getElementById("nom").value;
    const correu = document.getElementById("email").value;
    const missatge = document.getElementById("missatge").value;
  
    if (!nom || !correu || !missatge) {
      alert("Tots els camps són obligatoris.");
      return; // Si algun camp està buit, no s'envia el formulari
    }
  
    const data = { nom, correu, message: missatge };
  
    fetch('https://collageganteracordemaria-eng.github.io/colllageganteraCordeMariaMataro/submit-contacte', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Missatge enviat correctament!");
        window.location.href = 'https://collageganteracordemaria-eng.github.io/colllageganteraCordeMariaMataro/home'; // Redirigeix a 'menu.html'
      } else {
        alert(data.message || "Error en l'enviament del missatge.");
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert("Hi ha hagut un error en l'enviament del formulari.");
    });
  });
  