let eventData = null;

// =========================
// CARGAR EVENTO
// =========================

async function loadEvent() {
    try {
        const response = await fetch("/api/event");

        if (!response.ok) {
            throw new Error("No fue posible cargar el evento.");
        }

        eventData = await response.json();

        updateEventInformation();
        // =========================
        // UBICACIÓN DEL EVENTO
        // =========================

        const locationButton =
            document.getElementById("locationButton");

        if (locationButton) {

            locationButton.addEventListener("click", () => {

                if (
                    !eventData ||
                    !eventData.venue ||
                    !eventData.venue.maps
                ) {
                    console.error(
                        "No existe una ubicación configurada."
                    );

                    return;
                }

                window.open(
                    eventData.venue.maps,
                    "_blank",
                    "noopener,noreferrer"
                );

            });

        }

        startCountdown();

    } catch (error) {
        console.error("Error cargando evento:", error);
    }
}

// =========================
// ACTUALIZAR INFORMACIÓN
// =========================

function updateEventInformation() {

    if (!eventData) return;

    const venueName =
        document.getElementById("venueName");

    const venueAddress =
        document.getElementById("venueAddress");

    const venueCity =
        document.getElementById("venueCity");

    if (venueName) {
        venueName.textContent = eventData.venue.name;
    }

    if (venueAddress) {
        venueAddress.textContent = eventData.venue.address;
    }

    if (venueCity) {
        venueCity.textContent = eventData.venue.city;
    }
}

// =========================
// CUENTA REGRESIVA
// =========================

function startCountdown() {

    const eventDate =
        `${eventData.event.date}T${eventData.event.time}:00`;

    const target =
        new Date(eventDate).getTime();

    function updateCountdown() {

        const now = new Date().getTime();

        const difference = target - now;

        if (difference <= 0) {
            document.getElementById("days").textContent = "00";
            document.getElementById("hours").textContent = "00";
            document.getElementById("minutes").textContent = "00";
            document.getElementById("seconds").textContent = "00";
            return;
        }

        const days =
            Math.floor(
                difference / (1000 * 60 * 60 * 24)
            );

        const hours =
            Math.floor(
                (difference / (1000 * 60 * 60)) % 24
            );

        const minutes =
            Math.floor(
                (difference / (1000 * 60)) % 60
            );

        const seconds =
            Math.floor(
                (difference / 1000) % 60
            );

        document.getElementById("days").textContent =
            String(days).padStart(2, "0");

        document.getElementById("hours").textContent =
            String(hours).padStart(2, "0");

        document.getElementById("minutes").textContent =
            String(minutes).padStart(2, "0");

        document.getElementById("seconds").textContent =
            String(seconds).padStart(2, "0");
    }

    updateCountdown();

    setInterval(updateCountdown, 1000);
}

// =========================
// ENTRAR AL SHOW
// =========================

const enterButton =
    document.getElementById("enterButton");

if (enterButton) {

    enterButton.addEventListener("click", () => {

        // =========================
        // MÚSICA DE FONDO
        // =========================

        let backgroundMusic =
            document.getElementById("backgroundMusic");

        if (!backgroundMusic) {

            backgroundMusic =
                document.createElement("audio");

            backgroundMusic.id =
                "backgroundMusic";

            backgroundMusic.src =
                "/audio/back.mp3";

            backgroundMusic.loop = true;

            backgroundMusic.volume = 0.50;

            document.body.appendChild(
                backgroundMusic
            );
        }

        backgroundMusic.play()
            .catch(error => {
                console.error(
                    "No fue posible reproducir la música:",
                    error
                );
            });


        // =========================
        // CONTINUAR A LA INVITACIÓN
        // =========================

        const dateSection =
            document.querySelector(".date-section");

        if (dateSection) {

            dateSection.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}



// =========================
// CAMPOS DE ASISTENCIA
// =========================

const asistentesGroup =
    document.getElementById("asistentesGroup");

const confirmationInputs =
    document.querySelectorAll(
        'input[name="confirmacion"]'
    );

function updateAttendanceFields() {

    const selected =
        document.querySelector(
            'input[name="confirmacion"]:checked'
        );

    if (!selected) return;

    if (selected.value === "confirmado") {

        asistentesGroup.style.display = "block";

    } else {

        asistentesGroup.style.display = "none";
    }
}

confirmationInputs.forEach(input => {

    input.addEventListener(
        "change",
        updateAttendanceFields
    );

});

updateAttendanceFields();

// =========================
// FORMULARIO RSVP
// =========================

const rsvpForm =
    document.getElementById("rsvpForm");

const rsvpResult =
    document.getElementById("rsvpResult");

if (rsvpForm) {

    rsvpForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();
            event.stopPropagation();

            console.log("RSVP: formulario enviado");

            const formData =
                new FormData(rsvpForm);

            const data = {

                nombre:
                    formData.get("nombre"),

                telefono:
                    formData.get("telefono"),

                asistentes:
                    Number(
                        formData.get("asistentes")
                    ),

                confirmacion:
                    formData.get("confirmacion"),

                mensaje:
                    formData.get("mensaje")
            };

            console.log(
                "RSVP: datos",
                data
            );

            const submitButton =
                document.getElementById(
                    "submitRsvp"
                );

            submitButton.disabled = true;

            submitButton.textContent =
                "GUARDANDO...";

            try {

                const response =
                    await fetch(
                        "/api/rsvp",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );

                console.log(
                    "RSVP: respuesta HTTP",
                    response.status
                );

                const result =
                    await response.json();

                console.log(
                    "RSVP: respuesta",
                    result
                );

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "No fue posible registrar la asistencia."
                    );
                }

                rsvpForm.hidden = true;
                rsvpResult.hidden = false;

                if (
                    data.confirmacion ===
                    "confirmado"
                ) {

                    rsvpResult.innerHTML = `
                        <strong>
                            🤘 ¡ASISTENCIA CONFIRMADA!
                        </strong>

                        Gracias,
                        ${escapeHtml(data.nombre)}.

                        <br>

                        HAbrá caja de sobres por si quieres dejar un detalle.

                        <br>
                        Nos vemos en los XV de Natalie.
                    `;

                } else {

                    rsvpResult.innerHTML = `
                        <strong>
                            GRACIAS POR AVISARNOS
                        </strong>

                        Lamentamos que no puedas
                        acompañarnos,
                        ${escapeHtml(data.nombre)}.
                    `;
                }

                rsvpResult.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            } catch (error) {

                console.error(
                    "RSVP ERROR:",
                    error
                );

                submitButton.disabled = false;

                submitButton.textContent =
                    "CONFIRMAR ASISTENCIA";

                rsvpResult.hidden = false;

                rsvpResult.innerHTML = `
                    <strong>
                        NO SE PUDO REGISTRAR
                    </strong>

                    ${escapeHtml(error.message)}
                `;
            }

        }
    );

}

// =========================
// CONTROL DE MÚSICA
// =========================

const musicControl =
    document.getElementById("musicControl");

const musicIcon =
    document.getElementById("musicIcon");

if (musicControl) {

    musicControl.addEventListener(
        "click",
        () => {

            const backgroundMusic =
                document.getElementById(
                    "backgroundMusic"
                );

            if (!backgroundMusic) return;

            backgroundMusic.muted =
                !backgroundMusic.muted;

            musicControl.classList.toggle(
                "muted",
                backgroundMusic.muted
            );

            if (backgroundMusic.muted) {

                musicIcon.textContent = "♩";

                musicControl.setAttribute(
                    "aria-label",
                    "Activar música"
                );

                musicControl.setAttribute(
                    "title",
                    "Activar música"
                );

            } else {

                musicIcon.textContent = "♫";

                musicControl.setAttribute(
                    "aria-label",
                    "Silenciar música"
                );

                musicControl.setAttribute(
                    "title",
                    "Silenciar música"
                );

            }

        }
    );

}


// =========================
// SEGURIDAD
// =========================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =========================
// NAVEGACIÓN
// =========================

const siteNav =
    document.getElementById("siteNav");

const navLinks =
    document.querySelectorAll(".nav-link");

const navSections = [
    {
        id: "inicio",
        element: document.getElementById("inicio")
    },
    {
        id: "mensaje",
        element: document.getElementById("mensaje")
    },
    {
        id: "galeria",
        element: document.getElementById("galeria")
    },
    {
        id: "evento",
        element: document.getElementById("evento")
    },
    {
        id: "dress-code",
        element: document.getElementById("dress-code")
    },
    {
        id: "rsvp",
        element: document.getElementById("rsvp")
    }
];

function updateNavigation() {

    if (!siteNav) return;

    const scrollPosition =
        window.scrollY;

    const hero =
        document.getElementById("inicio");

    if (hero) {

        const heroBottom =
            hero.offsetTop +
            hero.offsetHeight;

        if (scrollPosition > heroBottom * 0.25) {

            siteNav.classList.add("visible");

        } else {

            siteNav.classList.remove("visible");
        }
    }

    let currentSection = "inicio";

    navSections.forEach(section => {

        if (!section.element) return;

        const sectionTop =
            section.element.offsetTop - 180;

        if (scrollPosition >= sectionTop) {
            currentSection = section.id;
        }

    });

    navLinks.forEach(link => {

        link.classList.toggle(
            "active",
            link.getAttribute("href") ===
            `#${currentSection}`
        );

    });
}

window.addEventListener(
    "scroll",
    updateNavigation,
    { passive: true }
);

navLinks.forEach(link => {

    link.addEventListener("click", event => {

        const targetId =
            link.getAttribute("href");

        const target =
            document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth"
        });

    });

});

updateNavigation();

// =========================
// INICIO
// =========================

loadEvent();
