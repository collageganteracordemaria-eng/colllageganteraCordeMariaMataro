document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const userInput = loginForm.querySelector("input[name='usuario']");
  const passInput = loginForm.querySelector("input[name='password']");
  const container1 = document.getElementById("container1");

  const validRoles = ["admin","usuari","editor","membre"];

  // Zona privada
  const section = document.createElement("section");
  section.id = "zonaPrivada";
  section.style.display = "none";
  section.innerHTML = `
    <div class="zona-gran">
        <img src="/images/logo_corazon_de_maria.png" alt="Logo Colla" style="padding-right: 70px;">
      <h1>Benvingut, <span id="adminName"></span></h1>
      <a href="http://localhost:3000/home">
        <button id="logoutBtn">Tancar sessió</button>
      </a>

      <h2>Gestió d'Usuaris</h2>
      <table class="tabla" id="userTable">
        <thead>
          <tr>
            <th>_id</th>
            <th>Usuari</th>
            <th>Password</th>
            <th>Role</th>
            <th>Email</th>
            <th>WebRol</th>
            <th>Validacio WebRol</th>
            <th>Accions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <h2>Calendari de Sortides</h2>
      <table class="tabla" id="sortidaTable">
        <thead>
          <tr>
            <th>_id</th>
            <th>Títol</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Lloc</th>
            <th>Lloc Plantada</th>
            <th>Descripció</th>
            <th>Imatge</th>
            <th>Accions</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;
  document.body.appendChild(section);

  // LOGIN
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (userInput.value === "Admin3" && passInput.value === "Aniol2341@L725") {
      localStorage.setItem("isAdmin", "true");
      container1.style.display = "none";
      section.style.display = "block";
      document.getElementById("adminName").textContent = userInput.value;
      loadUsers();
      loadSortides();
    } else alert("Usuari o contrasenya incorrectes.");
  });

  if (localStorage.getItem("isAdmin") === "true") {
    loginForm.style.display = "none";
    container1.style.display = "none";
    section.style.display = "block";
    document.getElementById("adminName").textContent = "Admin";
    loadUsers();
    loadSortides();
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("isAdmin");
    section.style.display = "none";
    container1.style.display = "block";
    loginForm.style.display = "block";
    loginForm.reset();
  });

  const zonaGran = document.querySelector(".zona-gran");
  const sortidaTable = document.getElementById("sortidaTable");

  // Afegir Sortida
  const addSortidaBtn = document.createElement("button");
  addSortidaBtn.textContent = "Afegir Sortida";
  addSortidaBtn.style.margin = "10px 0";
  addSortidaBtn.style.display = "block";
  sortidaTable.parentNode.insertBefore(addSortidaBtn, sortidaTable.nextSibling);

addSortidaBtn.addEventListener("click", () => {
  if (!document.getElementById("addSortidaForm")) {
    const form = document.createElement("form");
    form.id = "addSortidaForm";
    form.enctype = "multipart/form-data";
    form.style.margin = "10px 0";
    form.innerHTML = `
      <input type="text" name="titol" placeholder="Títol" required>
      <input type="date" name="data" required>
      <input type="time" name="hora" placeholder="Hora" required> <!-- camp hora afegit -->
      <input type="text" name="lloc" placeholder="Lloc" required>
      <input type="text" name="descripcio" placeholder="Descripció">
      <input type="file" name="imatge" accept="image/*" required>
      <button type="submit">Afegir</button>
    `;
    sortidaTable.parentNode.insertBefore(form, addSortidaBtn.nextSibling);

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        const res = await fetch("/admin/sortides", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) {
          alert("Sortida afegida correctament");
          form.remove();
          loadSortides();
        } else alert("Error afegint sortida: " + (data.message || "desconegut"));
      } catch (err) {
        console.error(err);
        alert("Error afegint sortida");
      }
    });
  }
});

  // Afegir Usuari
  const addUserBtn = document.createElement("button");
  addUserBtn.textContent = "Afegir Usuari";
  addUserBtn.style.margin = "10px 0";
  addUserBtn.style.display = "block";
  const sortidaTitle = zonaGran.querySelector("h2:nth-of-type(2)");
  sortidaTitle.parentNode.insertBefore(addUserBtn, sortidaTitle);

  addUserBtn.addEventListener("click", async () => {
    const username = prompt("Nom d'usuari:");
    if (!username) return alert("Nom d'usuari obligatori");
    const password = prompt("Contrasenya:");
    if (!password) return alert("Contrasenya obligatoria");
    const email = prompt("Email:");
    if (!email) return alert("Email obligatori");

    let role = prompt("Rol (admin/usuari/editor/membre):", "usuari");
    if (!validRoles.includes(role)) role = "usuari";

    try {
      const res = await fetch("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, role })
      });
      const data = await res.json();
      if (data.success) {
        alert("Usuari creat correctament");
        loadUsers();
      } else alert("Error creant usuari: " + (data.message || "desconegut"));
    } catch (err) {
      console.error(err);
      alert("Error creant usuari");
    }
  });

async function loadUsers() {
    try {
        const res = await fetch("/get-users");
        const users = await res.json();
        const userTableBody = document.querySelector("#userTable tbody");
        userTableBody.innerHTML = "";

        users.forEach(u => {
            const roleWeb = u.roleWeb || "No assignat";
            const validacioWebRol = u.validacioWebRol || "No validat";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u._id}</td>
                <td>${u.username}</td>
                <td>${u.password}</td>
                <td>${u.role || ""}</td>
                <td>${u.email}</td>
                <td>${roleWeb}</td>
                <td>${validacioWebRol}</td>
                <td class="acciones">
                    <img src="/images/editar.png" class="edit-btn" data-id="${u._id}" title="Editar">
                    <img src="/images/paperera.png" class="delete-btn" data-id="${u._id}" title="Eliminar">
                </td>
            `;
            userTableBody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error carregant usuaris:", err);
    }
}



function assignUserButtons(users) {
    // VALIDAR ROL WEB
    document.querySelectorAll(".validar-rol-btn").forEach(btn => {
        btn.addEventListener("click", async e => {
            const userId = e.target.dataset.id;
            const user = users.find(u => u._id === userId);
            if (!user) return alert("Usuari no trobat");

            let rolWeb = prompt(`Validar/Asignar rol web per ${user.username} (music/portador):`, user.infoWeb?.roleWeb || "");
            if (!["music", "portador"].includes(rolWeb)) return alert("Rol web no vàlid. Només 'music' o 'portador'.");

            try {
                const res = await fetch(`/admin/users/${userId}/roleWeb`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ roleWeb: rolWeb, roleWebValidat: true })
                });
                const data = await res.json();
                if (data.success) {
                    alert(`Rol web validat correctament: ${rolWeb}`);
                    const accedirBtn = e.target.parentElement.querySelector(".accedir-btn");
                    if (accedirBtn) accedirBtn.disabled = false;
                    loadUsers(); // refresca la taula
                } else {
                    alert("Error validant rol web: " + (data.message || "desconegut"));
                }
            } catch (err) {
                console.error(err);
                alert("Error validant rol web");
            }
        });
    });

    // ACCEDIR A SECCIONS
    document.querySelectorAll(".accedir-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const userId = e.target.dataset.id;
            const user = users.find(u => u._id === userId);
            if (!user || !user.infoWeb?.roleWebValidat) return alert("Aquest usuari no té rol web validat.");
            
            const roleWeb = user.infoWeb.roleWeb;
            if (roleWeb === "music") {
                window.location.href = "http://localhost:3000/seccio-usuaris"; // secció musics
            } else if (roleWeb === "portador") {
                window.location.href = "http://localhost:3000/seccio-portadors"; // secció portadors
            } else {
                alert("Rol web desconegut o no autoritzat.");
            }
        });
    });
}



    // ACCEDIR A SECCIONS
    document.querySelectorAll(".accedir-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const userId = e.target.dataset.id;
        const user = users.find(u => u._id === userId);
        const roleWeb = user?.infoWeb?.roleWeb;

        if (!roleWeb) return alert("Aquest usuari no té rol web validat.");

        if (roleWeb === "music") {
          window.location.href = "/seccio-musics";
        } else if (roleWeb === "portador") {
          window.location.href = "/seccio-portadors";
        } else {
          alert("Rol web desconegut o no autoritzat.");
        }
      });
    });

    // EDITAR I ELIMINAR USUARIS (no modificat)
const userTableBody = document.querySelector("#userTable tbody");

userTableBody.addEventListener("click", async (e) => {
  const target = e.target;

  // EDITAR USUARI
  if (target.classList.contains("edit-btn")) {
    const userId = target.dataset.id;

    try {
      const res = await fetch("/get-users");
      const users = await res.json();
      const user = users.find(u => u._id === userId);
      if (!user) return alert("Usuari no trobat");

      // 1. Dades bàsiques
      const newUsername = prompt("Nou usuari:", user.username) || user.username;
      const newPassword = prompt("Nova contrasenya (**** per mantenir):", "********");
      const newEmail = prompt("Nou email:", user.email) || user.email;
      let newRole = prompt("Rol (admin/usuari/editor/membre):", user.role || "usuari");
      if (!["admin","usuari","editor","membre"].includes(newRole)) newRole = "usuari";

      // 2. WebRol
      const currentWebRol = user.infoWeb?.roleWeb || "";
      let newWebRol = prompt("Assigna/Modifica WebRol (music/portador/acompanyant/Usuari) o deixa buit:", currentWebRol) || currentWebRol;

      // 3. Validar WebRol
      let roleWebValidat = user.infoWeb?.roleWebValidat || false;
      if (newWebRol) {
        const validar = prompt("Vols validar aquest WebRol? (si/no)", roleWebValidat ? "si" : "no");
        roleWebValidat = validar.toLowerCase() === "si";
      }

      // 4. Payload
      const payload = { username: newUsername, email: newEmail, role: newRole };
      if (newPassword !== "********") payload.password = newPassword;

      // 🔹 Sempre enviar infoWeb per poder validar
      payload.infoWeb = { roleWeb: newWebRol, roleWebValidat };

      // 5. Enviar PUT
      const resUpdate = await fetch(`/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await resUpdate.json();
      if (data.success) {
        alert("Usuari actualitzat correctament");
        loadUsers(); // refrescar taula
      } else {
        alert("Error actualitzant usuari: " + (data.message || "desconegut"));
      }

    } catch (err) {
      console.error(err);
      alert("Error editant usuari");
    }
  }

  // ELIMINAR USUARI
  if (target.classList.contains("delete-btn")) {
    const userId = target.dataset.id;
    if (!confirm("Segur que vols eliminar aquest usuari?")) return;

    try {
      const res = await fetch(`/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Usuari eliminat correctament");
        loadUsers();
      } else {
        alert("Error eliminant usuari: " + (data.message || "desconegut"));
      }
    } catch (err) {
      console.error(err);
      alert("Error eliminant usuari");
    }
  }
});

// Sortides
const sortidaTableBody = document.getElementById("sortidaTable").querySelector("tbody");

async function loadSortides() {
  try {
    const res = await fetch("/admin/sortides");
    const sortides = await res.json();
    const sortidaTableBody = document.querySelector("#sortidaTable tbody");
    sortidaTableBody.innerHTML = "";

    sortides.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s._id}</td>
        <td>${s.titol}</td>
        <td>${new Date(s.data).toISOString().split('T')[0]}</td>
        <td>${s.hora || ''}</td>
        <td>${s.lloc}</td>
<td style="padding:0; width:80px; height:20px; text-align:center; overflow:hidden;">
  ${s.ubicacioMaps
    ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.ubicacioMaps)}" target="_blank">
         ${s.ubicacioMaps}
       </a>`
    : ""
  }
</td>





        <td>${s.descripcio || ''}</td>
        <td>
          <img src="/uploads/${s.imatge}" class="sortida-img" style="height: 50px; width: 50px;">
        </td>
        <td class="acciones" style="height: 120px !important;">
          <img src="/images/editar.png" class="edit-sortida-btn" style="height: 50px !important; width: 50px !important;" data-id="${s._id}" title="Editar sortida">
          <img src="/images/paperera.png" class="delete-sortida-btn" style="height: 50px !important; width:50px !important;" data-id="${s._id}" title="Eliminar sortida">
        </td>
      `;
      sortidaTableBody.appendChild(tr);
    });

    // EDITAR SORTIDA
    document.querySelectorAll(".edit-sortida-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        const sortida = sortides.find(s => s._id === id);
        if (!sortida) return alert("Sortida no trobada");

        const nouTitol = prompt("Nou títol:", sortida.titol) || sortida.titol;
        const novaData = prompt("Nova data (YYYY-MM-DD):", new Date(sortida.data).toISOString().split('T')[0]) || sortida.data;
        const novaHora = prompt("Nova hora (HH:MM):", sortida.hora || "") || sortida.hora;
        const nouLloc = prompt("Nou lloc:", sortida.lloc) || sortida.lloc;

        // 🔹 Nou camp Google Maps
        const novaUbicacio = prompt("Nova ubicació Google Maps (URL):", sortida.ubicacioMaps || "") || sortida.ubicacioMaps;

        const novaDesc = prompt("Nova descripció:", sortida.descripcio || "") || sortida.descripcio;

        const formData = new FormData();
        formData.append("titol", nouTitol);
        formData.append("data", novaData);
        formData.append("hora", novaHora);
        formData.append("lloc", nouLloc);
        formData.append("ubicacioMaps", novaUbicacio); // 🔹 nou camp enviat
        formData.append("descripcio", novaDesc);

        try {
          const res = await fetch(`/admin/sortides/${id}`, {
            method: "PUT",
            body: formData
          });
          const data = await res.json();
          if (data.success) {
            alert("Sortida actualitzada correctament");
            loadSortides();
          } else {
            alert("Error actualitzant sortida: " + (data.message || "desconegut"));
          }
        } catch (err) {
          console.error("Error actualitzant sortida:", err);
          alert("Error actualitzant sortida");
        }
      });
    });

    // ELIMINAR SORTIDA
    document.querySelectorAll(".delete-sortida-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        if (!confirm("Segur que vols eliminar aquesta sortida?")) return;

        try {
          const res = await fetch(`/admin/sortides/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            alert("Sortida eliminada correctament");
            loadSortides();
          } else {
            alert("Error eliminant sortida: " + (data.message || "desconegut"));
          }
        } catch (err) {
          console.error("Error eliminant sortida:", err);
          alert("Error eliminant sortida");
        }
      });
    });

  } catch (err) {
    console.error("Error carregant sortides:", err);
  }
}})
