document.addEventListener("DOMContentLoaded", async () => {
  check_user_logged_in();

  document
    .getElementById("loginForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      let data = await login(username, password);

      if (data) {
        if (!data["success"]) {
          alert("El nombre de usuario o la contraseña con incorrectas.");
        } else {
          if (data["success"]) {
            let string = JSON.stringify(data["data"]);
            let user = JSON.parse(string);
            console.log(user);
            // localStorage.setItem("actualProfile", string);
            window.location.href = "main.html";
          }
        }
      } else {
        console.log("Error al cargar JSON.");
      }
    });

  async function login(username, password) {
    const response = await fetch(`../../api/Login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    let data = await response.json();

    return data;
  }

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
