document.addEventListener("DOMContentLoaded", async () => {
  check_user_logged_in();

  document
    .getElementById("signupForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const pswd1 = document.getElementById("pswd1").value;
      const pswd2 = document.getElementById("pswd2").value;
      const parrafo = document.getElementById("mensaje");

      if (pswd1 !== pswd2) {
        parrafo.innerText = "Las contraseñas no coinciden.";
        parrafo.style.color = "red";
        return;
      }

      try {
        const response = await fetch("../../api/AddUser.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({ username, pswd1 }),
        });

        let data = await response.json();
        console.log(data);

        if (data["success"]) {
          parrafo.innerText = "Usuario creado con éxito.";
          parrafo.style.color = "green";

          const response = await fetch(`../../api/SetProfile.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data["data"]),
          });

          data = await response.json();

          window.location.href = "main.html";
          console.log("Datos recibidos:", data["message"]);
        } else {
          parrafo.innerText =
            "El Usuario ya existe, elija otro nombre de usuario";
          parrafo.style.color = "red";
        }
      } catch (error) {
        console.log(error);
        parrafo.innerText = "Error al crear el usuario.";
        parrafo.style.color = "red";
      }
    });

  async function check_user_logged_in() {
    const response = await fetch("../../api/GetProfile.php", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();

    if (data["success"]) {
      window.location.href = "main.html";
    }
  }
});
