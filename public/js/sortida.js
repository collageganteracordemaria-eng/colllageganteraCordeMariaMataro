document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ calendar.js carregat correctament!");
  const today = new Date();
  generateCalendar(today.getFullYear(), today.getMonth(), today.getDate());
});

async function generateCalendar(year, month, highlightDay = null) {
  const container = document.getElementById("calendar-container");

  container.classList.remove("show");
  container.classList.add("fade-in");

  setTimeout(async () => {
    container.innerHTML = "";

    // 🧭 --- FILTRE / BUSCADOR ---
    const filterDiv = document.createElement("div");
    filterDiv.classList.add("calendar-filter", "mb-3", "text-center");
    filterDiv.innerHTML = `
      <input 
        type="text" 
        id="calendar-search" 
        placeholder="Cerca per dia, nom o data..." 
        class="form-control form-control-sm mx-auto" 
        style="max-width: 280px;"
      >
    `;
    container.appendChild(filterDiv);

    // 🗓️ --- CAPÇALERA ---
    const header = document.createElement("div");
    header.classList.add("calendar-header");
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("btn", "btn-outline-danger", "btn-sm");
    prevBtn.textContent = "← Mes anterior";

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("btn", "btn-outline-danger", "btn-sm");
    nextBtn.textContent = "Mes següent →";

    const title = document.createElement("h4");
    title.textContent = new Date(year, month).toLocaleString("ca-ES", {
      month: "long",
      year: "numeric",
    });
    title.classList.add("text-capitalize", "mb-0");

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    container.appendChild(header);

    // 📅 --- CAPÇALERA DIES ---
    const daysOfWeek = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];
    const weekHeader = document.createElement("div");
    weekHeader.classList.add("calendar-weekdays");
    weekHeader.style.display = "grid";
    weekHeader.style.gridTemplateColumns = "repeat(7, 1fr)";
    weekHeader.innerHTML = daysOfWeek
      .map((d) => `<div class='text-danger text-center fw-bold'>${d}</div>`)
      .join("");
    container.appendChild(weekHeader);

    // 🔲 --- GRAELLA DIES ---
    const grid = document.createElement("div");
    grid.classList.add("calendar-grid");
    container.appendChild(grid);

    // 🔄 --- OBTENIM SORTIDES ---
    const res = await fetch(`/sortides?any=${year}&mes=${month + 1}`);
    const data = await res.json();
    const sortides = data.success ? data.sortides : [];

    const firstDay = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Espais buits abans del primer dia
    for (let i = 1; i < firstDay; i++) grid.appendChild(document.createElement("div"));

    // 🧩 --- GENEREM ELS DIES ---
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.classList.add("calendar-day", "text-center");
      dayDiv.textContent = day;

      const fullDate = new Date(year, month, day);
      const sortida = sortides.find((s) => {
        const sDate = new Date(s.data);
        return (
          sDate.getFullYear() === fullDate.getFullYear() &&
          sDate.getMonth() === fullDate.getMonth() &&
          sDate.getDate() === fullDate.getDate()
        );
      });

      if (sortida) {
        dayDiv.classList.add("has-sortida");
        dayDiv.dataset.nom = sortida.titol.toLowerCase();
        dayDiv.dataset.data = sortida.data;
        dayDiv.title = sortida.titol;
      }

      // 🔴 Marca el dia actual
      if (highlightDay === day) {
        dayDiv.classList.add("today", "text-white", "bg-danger", "rounded-circle");
      }

      // 📌 Clic per mostrar info
      dayDiv.addEventListener("click", () => {
        document.querySelectorAll(".calendar-day").forEach((d) => d.classList.remove("selected"));
        dayDiv.classList.add("selected");

        const info = document.getElementById("sortida-info");
        info.style.display = "block";
        info.classList.remove("visible");

setTimeout(() => {
  let content = "";

  if (sortida) {
    content = `
      <div class="d-flex justify-content-between align-items-start">
        <h3 class="text-danger mb-2">${sortida.titol}</h3>
        <button id="close-info" class="btn btn-sm btn-outline-danger fw-bold" style="line-height:1;">✕</button>
      </div>

      <p><strong>Data:</strong> ${new Date(sortida.data).toLocaleDateString("ca-ES")}</p>
      <p><strong>Hora:</strong> ${sortida.hora || "No definida"}</p>
      <p><strong>Lloc:</strong> ${sortida.lloc}</p>

      <p>${sortida.descripcio || ""}</p>

      ${sortida.imatge ? 
        `<img src="/uploads/${sortida.imatge}" class="img-fluid rounded mt-2" style="max-width:250px;">`
        : ""
      }

      <!-- ⭐ PLANTADA + GOOGLE MAPS -->
      ${
        sortida.ubicacioMaps
          ? `
            <p class="mt-3"><strong>Plantada:</strong></p>
            <iframe 
              src="${sortida.ubicacioMaps}" 
              width="100%" 
              height="200" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy">
            </iframe>
          `
          : ""
      }
    `;
  } else {
    content = `
      <div class="d-flex justify-content-between align-items-start">
        <h3 class="text-danger mb-2">Sense sortides</h3>
        <button id="close-info" class="btn btn-sm btn-outline-danger fw-bold" style="line-height:1;">✕</button>
      </div>
      <p>No hi ha sortides aquest dia.</p>
    `;
  }

  info.innerHTML = content;
  info.classList.add("visible");

  // 🔴 Botó per tancar la informació
  const closeBtn = document.getElementById("close-info");
  closeBtn.addEventListener("click", () => {
    info.classList.remove("visible");
    setTimeout(() => (info.style.display = "none"), 200);
  });
}, 100);


      });

      grid.appendChild(dayDiv);
    }

    // 🔁 --- NAVEGACIÓ ---
    prevBtn.addEventListener("click", () => {
      const prevMonth = new Date(year, month - 1);
      generateCalendar(prevMonth.getFullYear(), prevMonth.getMonth());
    });

    nextBtn.addEventListener("click", () => {
      const nextMonth = new Date(year, month + 1);
      generateCalendar(nextMonth.getFullYear(), nextMonth.getMonth());
    });

    // 🔍 --- BUSCADOR INTEL·LIGENT ---
    const searchInput = document.getElementById("calendar-search");
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.trim().toLowerCase();
      const days = document.querySelectorAll(".calendar-day");

      days.forEach((d) => {
        const dayNum = d.textContent.trim();
        const nom = d.dataset.nom || "";
        const data = d.dataset.data || "";

        if (
          val === "" ||
          dayNum === val ||
          nom.includes(val) ||
          data.includes(val)
        ) {
          d.style.display = "block";
        } else {
          d.style.display = "none";
        }
      });
    });

    setTimeout(() => container.classList.add("show"), 10);
  }, 100);
}
 document.querySelectorAll('.gallery-img').forEach(img => {
    img.addEventListener('click', () => {
      const modalImg = document.getElementById('modalImage');
      modalImg.src = img.src;
      const modal = new bootstrap.Modal(document.getElementById('imageModal'));
      modal.show();
    });
  });