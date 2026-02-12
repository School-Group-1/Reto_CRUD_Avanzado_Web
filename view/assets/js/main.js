document.addEventListener("DOMContentLoaded", async () => {
  /******************************************************************************************************
   *****************************************VARIABLE DECLARATION*****************************************
   ******************************************************************************************************/
  //Loading the current user from localstorage, can be admin or user this is checked later
  let profile = await check_user_logged_in();
  console.log("PROFILE: ", profile);

  /* ----------HOME---------- */
  const homeBtn = document.getElementById("adjustData");
  const logoutBtn = document.getElementById("logoutBtn");

  /* ----------USER POPUP---------- */
  const modifyUserPopup = document.getElementById("modifyUserPopupAdmin");
  const changePwdBtn = document.getElementById("changePwdBtn");
  const saveBtnUser = document.getElementById("saveBtnUser");

  /* ----------ADMIN POPUP---------- */
  const modifyAdminPopup = document.getElementById("modifyAdminPopup");
  const closeAdminSpan = document.getElementsByClassName("close")[0];
  const changePwdBtnAdmin = document.getElementById("changePwdBtnAdmin");
  const adminTableModal = document.getElementById("adminTableModal");
  const modifyAdminBtn = document.getElementById("modifySelfButton");
  const saveBtnAdmin = document.getElementById("saveBtnAdmin");

  /* ----------SHARED ELEMENTS---------- */
  const changePwdModal = document.getElementById("changePasswordModal");
  const deleteBtn = document.getElementById("deleteBtn");
  const closePasswordSpan =
    document.getElementsByClassName("closePasswordSpan")[0];

  /******************************************************************************************************
   ****************************************BUTTON FUNCTIONALITIES****************************************
   ******************************************************************************************************/

  /* ----------HOME---------- */
  //Opens a popup depending on if the profile is a user or admin
  homeBtn.onclick = async function () {
    if (["CARD_NO"] in profile) {
      profile = await check_user_logged_in();
      document.getElementById("message").innerHTML = "";
      const response = await fetch(`../../api/SetUser.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      console.log("PROFILE: ", profile);
      openModifyUserPopup(profile);
    } else if (["CURRENT_ACCOUNT"] in profile) {
      refreshAdminTable();
      adminTableModal.style.display = "block";
      //Hide delete button in user popups as admin can delete directly from table, no need for 2 buttons for the same thing
      deleteBtn.style.display = "none";
    }
  };

  //Destroys session in PHP to log the user out
  logoutBtn.onclick = function () {
    log_user_out();
  };

  /* ----------USER POPUP---------- */
  changePwdBtn.onclick = function () {
    changePwdModal.style.display = "block";
    resetPasswordModal();
  };

  saveBtnUser.onclick = async function () {
    await modifyUser();
  };

  /* ----------ADMIN POPUP---------- */
  closeAdminSpan.onclick = function () {
    adminTableModal.style.display = "none";
  };

  changePwdBtnAdmin.onclick = function () {
    changePwdModal.style.display = "block";
    resetPasswordModal();
  };

  modifyAdminBtn.onclick = function () {
    openModifyAdminPopup();
  };

  saveBtnAdmin.onclick = function () {
    modifyAdmin();
  };

  /* ----------SHARED ELEMENTS---------- */
  deleteBtn.onclick = function () {
    delete_user(profile["PROFILE_CODE"]);
  };

  closePasswordSpan.onclick = function () {
    changePwdModal.style.display = "none";
  };

  //If a popup is clicked outside of the actual area, automatically close the popup
  window.onclick = function (event) {
    if (event.target == adminTableModal) {
      adminTableModal.style.display = "none";
    } else if (event.target == modifyUserPopup) {
      modifyUserPopup.style.display = "none";
    } else if (event.target == modifyAdminPopup) {
      modifyAdminPopup.style.display = "none";
    } else if (event.target == changePwdModal) {
      changePwdModal.style.display = "none";
    }
  };

  //Change password popup functionality, inside this initial on document loaded method as it relies on the
  //form existing even though it isnt shown to be able to listen to it, if it isnt inside this on document
  //loaded method an error occurs as it tries to listen to the form before it is loaded
  document
    .getElementById("changePasswordForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      document.getElementById("messageOldPassword").innerHTML = "";
      document.getElementById("messageWrongPassword").innerHTML = "";
      document.getElementById("message").innerHTML = "";

      let actualProfile;

      if (["CARD_NO"] in profile) {
        // actualProfile = JSON.parse(localStorage.getItem("actualUser"));
        const response = await fetch("../../api/GetUser.php", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        actualProfile = data["data"];
      } else if (["CURRENT_ACCOUNT"] in profile) {
        // actualProfile = JSON.parse(localStorage.getItem("actualProfile"));
        const response = await fetch("../../api/GetProfile.php", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        actualProfile = data["data"];
      }

      /*const profile_code = actualProfile["PROFILE_CODE"];
      const userPassword = actualProfile["PSWD"];*/
      const password = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword =
        document.getElementById("confirmNewPassword").value;

      let hasErrors = false;

      if (newPassword != confirmPassword) {
        document.getElementById("messageWrongPassword").innerHTML =
          "The passwords are not the same";
        hasErrors = true;
      }

      if (!hasErrors) {
        try {
          console.log("Enviando datos:", { password, newPassword });
          const response = await fetch("../../api/ModifyPassword.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              password: password,
              newPassword: newPassword,
            }),
          });

          console.log("Status:", response.status);
          console.log("Headers:", [...response.headers.entries()]);

          const text = await response.text();
          console.log("Raw response:", text);

          if (data["success"]) {
            actualProfile.PSWD = newPassword;
            document.getElementById("messageSuccessPassword").innerHTML =
              "Password correctly changed";
            if (["CARD_NO"] in profile) {
              const response = await fetch(`../../api/SetUser.php`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(actualProfile),
              });

              let data = await response.json();
              console.log("SET USER TEST: ", data["data"]);
            } else if (["CURRENT_ACCOUNT"] in profile) {
              console.log("IS AN ADMIN");
              const response = await fetch(`../../api/SetProfile.php`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(actualProfile),
              });

              let data = await response.json();
              console.log("SET PROFILE TEST: ", data["data"]);
            }

            setTimeout(() => {
              document.getElementById("messageSuccessPassword").innerHTML = ""; // clean the modified message
              document.getElementById("changePasswordForm").reset(); // clean all the fields
            }, 3000);
          } else {
            document.getElementById("messageSuccessPassword").innerHTML =
              data["message"];
            document.getElementById("messageSuccessPassword").style.color =
              "red";
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
});

/******************************************************************************************************
 ***********************************************METHODS************************************************
 ******************************************************************************************************/

/* ----------HOME---------- */
async function openModifyUserPopup(actualProfile) {
  document.getElementById("message").innerHTML = "";
  console.log("ACTUAL PROFILE: ", JSON.stringify(actualProfile));
  response = await fetch(`../../api/SetUser.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(actualProfile),
  });

  data = await response.json();
  console.log("SET USER TEST: ", data["data"]);

  const usuario = {
    profile_code: actualProfile.PROFILE_CODE,
    password: actualProfile.PSWD,
    email: actualProfile.EMAIL,
    username: actualProfile.USER_NAME,
    telephone: actualProfile.TELEPHONE,
    name: actualProfile.NAME_,
    surname: actualProfile.SURNAME,
    gender: actualProfile.GENDER,
    card_no: actualProfile.CARD_NO,
  };

  document.getElementById("usernameUser").value = usuario.username;
  //if the profile has an atribute, it has them all, because all are mandatory
  if (usuario.email) {
    document.getElementById("emailUser").value = usuario.email;
    document.getElementById("phoneUser").value = usuario.telephone;
    document.getElementById("firstNameUser").value = usuario.name;
    document.getElementById("lastNameUser").value = usuario.surname;
    document.getElementById("genderUser").value = usuario.gender;
    document.getElementById("cardNumberUser").value = usuario.card_no;
  }

  let modifyUserPopup = document.getElementById("modifyUserPopupAdmin");
  modifyUserPopup.style.display = "flex";
}

/* ----------USER POPUP---------- */
async function modifyUser() {
  // const actualProfile = JSON.parse(localStorage.getItem("actualUser"));

  const response = await fetch("../../api/GetUser.php");
  const data = await response.json();
  const actualProfile = data["data"];

  const usuario = {
    profile_code: actualProfile.PROFILE_CODE,
    password: actualProfile.PSWD,
    email: actualProfile.EMAIL,
    username: actualProfile.USER_NAME,
    telephone: actualProfile.TELEPHONE,
    name: actualProfile.NAME_,
    surname: actualProfile.SURNAME,
    gender: actualProfile.GENDER,
    card_no: actualProfile.CARD_NO,
  };

  const profile_code = usuario.profile_code;
  const name = document.getElementById("firstNameUser").value;
  const surname = document.getElementById("lastNameUser").value;
  const email = document.getElementById("emailUser").value;
  const username = document.getElementById("usernameUser").value;
  const telephone = document
    .getElementById("phoneUser")
    .value.replace(/\s/g, ""); //remove spaces
  const gender = document.getElementById("genderUser").value;
  const card_no = document.getElementById("cardNumberUser").value;

  console.log(
    "Esto son los datos de los textfields" + profile_code,
    name,
    surname,
    email,
    username,
    telephone,
    gender,
    card_no,
  );

  if (
    !name ||
    !surname ||
    !email ||
    !username ||
    !telephone ||
    !gender ||
    !card_no
  ) {
    document.getElementById("message").innerHTML =
      "You must fill all the¡¡¡fields";
    document.getElementById("message").style.color = "red";
    return;
  }

  //verify if there are changes in the fields
  function hasChanges() {
    let changes = false;

    if (
      name !== usuario.name ||
      surname !== usuario.surname ||
      email !== usuario.email ||
      username !== usuario.username ||
      telephone !== usuario.telephone ||
      gender !== usuario.gender ||
      card_no !== usuario.card_no
    ) {
      changes = true;
    }
    return changes;
  }

  if (!hasChanges()) {
    document.getElementById("message").innerHTML = "No changes detected";
    document.getElementById("message").style.color = "red";
  } else {
    try {
      const response = await fetch(
        `../../api/ModifyUser.php?profile_code=${encodeURIComponent(
          profile_code,
        )}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(
          surname,
        )}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(
          username,
        )}&telephone=${encodeURIComponent(
          telephone,
        )}&gender=${encodeURIComponent(gender)}&card_no=${encodeURIComponent(
          card_no,
        )}`,
      );
      const dataTest = await response.json();
      console.log(dataTest);

      if (dataTest["success"]) {
        document.getElementById("message").innerHTML = dataTest["message"];
        document.getElementById("message").style.color = "green";

        actualProfile.NAME_ = name;
        actualProfile.SURNAME = surname;
        actualProfile.EMAIL = email;
        actualProfile.USER_NAME = username;
        actualProfile.TELEPHONE = telephone;
        actualProfile.CARD_NO = card_no;
        actualProfile.GENDER = gender;

        // localStorage.setItem("actualUser", JSON.stringify(actualProfile));
        let response = await fetch(`../../api/SetUser.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(actualProfile),
        });

        let data = await response.json();
        console.log("SET USER TEST: ", data["data"]);

        response = await fetch("../../api/GetProfile.php", {
          method: "GET",
          credentials: "include",
        });
        data = await response.json();

        if (["CURRENT_ACCOUNT"] in data["data"]) {
          refreshAdminTable();
        } else {
          // localStorage.setItem("actualProfile", JSON.stringify(actualProfile));
          const response = await fetch(`../../api/SetProfile.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(actualProfile),
          });
        }
      } else {
        document.getElementById("message").innerHTML = data["message"];
        document.getElementById("message").style.color = "red";
      }
    } catch (error) {
      console.log(error);
    }
  }
}

/* ----------ADMIN POPUP---------- */
async function get_all_users() {
  const response = await fetch("../../api/GetAllUsers.php");
  const data = await response.json();

  return data["data"];
}

async function delete_user_admin(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  const response = await fetch(
    `../../api/DeleteUser.php?id=${encodeURIComponent(id)}`,
  );

  const data = await response.json();

  if (!data["success"]) {
    console.log("Error deleting user: ", data["message"]);
  } else {
    console.log("User deleted.");
    row = document.getElementById(`user${id}`);
    if (row) row.remove();
  }
}

async function refreshAdminTable() {
  let table = document.getElementById("adminTable");
  table.innerHTML = `<tr class="adminTableHead">
              <th>Username</th>
              <th>Card Number</th>
              <th></th>
            </tr>`;
  let users = await get_all_users();

  if (users) {
    users.forEach((user) => {
      const profile_id = user["PROFILE_CODE"];
      let row = adminTable.insertRow(1);
      row.className = "adminTableData";
      row.id = `user${profile_id}`;
      let username = row.insertCell(0);
      username.id = `${profile_id}Username`;
      let cardNo = row.insertCell(1);
      cardNo.id = `${profile_id}CardNo`;
      let buttons = row.insertCell(2);

      username.innerHTML = user["USER_NAME"];
      cardNo.innerHTML = user["CARD_NO"];
      buttons.innerHTML = `<div class="center-flex-div">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-small" onclick='openModifyUserPopup(${JSON.stringify(user)})' >
                  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                  <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                </svg>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ff5457" class="size-small" onclick="delete_user_admin(${user.PROFILE_CODE})"  >
                  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                </svg>
              </div>`;
    });
  } else {
    let row = adminTable.insertRow(1);
    row.className = "adminTableData";
    let username = row.insertCell(0);
    let accountNum = row.insertCell(1);
    let buttons = row.insertCell(2);

    accountNum.innerHTML = "No users available.";
  }
}

async function openModifyAdminPopup() {
  document.getElementById("messageAdmin").innerHTML = "";
  const response = await fetch("../../api/GetProfile.php", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  const actualProfile = data["data"];
  // const actualProfile = JSON.parse(localStorage.getItem("actualProfile"));
  let modifyAdminPopup = document.getElementById("modifyAdminPopup");

  const usuario = {
    profile_code: actualProfile.PROFILE_CODE,
    password: actualProfile.PSWD,
    email: actualProfile.EMAIL,
    username: actualProfile.USER_NAME,
    telephone: actualProfile.TELEPHONE,
    name: actualProfile.NAME_,
    surname: actualProfile.SURNAME,
    current_account: actualProfile.CURRENT_ACCOUNT,
  };

  console.log("User username: ", usuario.username);

  document.getElementById("usernameAdmin").value = usuario.username;
  document.getElementById("emailAdmin").value = usuario.email;
  document.getElementById("phoneAdmin").value = usuario.telephone;
  document.getElementById("firstNameAdmin").value = usuario.name;
  document.getElementById("lastNameAdmin").value = usuario.surname;
  document.getElementById("profileCodeAdmin").value = usuario.profile_code;
  document.getElementById("currentAccountAdmin").value =
    usuario.current_account;

  modifyAdminPopup.style.display = "flex";
}

async function openModifyUserPopupAdmin(user) {}

async function modifyAdmin() {
  const response = await fetch("../../api/GetProfile.php", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  const actualProfile = data["data"];
  // const actualProfile = JSON.parse(localStorage.getItem("actualProfile"));

  const usuario = {
    profile_code: actualProfile.PROFILE_CODE,
    password: actualProfile.PSWD,
    email: actualProfile.EMAIL,
    username: actualProfile.USER_NAME,
    telephone: actualProfile.TELEPHONE,
    name: actualProfile.NAME_,
    surname: actualProfile.SURNAME,
    current_account: actualProfile.CURRENT_ACCOUNT,
  };

  const profile_code = usuario.profile_code;
  const name = document.getElementById("firstNameAdmin").value;
  const surname = document.getElementById("lastNameAdmin").value;
  const email = document.getElementById("emailAdmin").value;
  const username = document.getElementById("usernameAdmin").value;
  const telephone = document
    .getElementById("phoneAdmin")
    .value.replace(/\s/g, ""); //remove spaces
  const current_account = document.getElementById("currentAccountAdmin").value;

  console.log(
    "Esto son los datos de los textfields" + profile_code,
    name,
    surname,
    email,
    username,
    telephone,
    current_account,
  );

  if (
    !name ||
    !surname ||
    !email ||
    !username ||
    !telephone ||
    !current_account
  ) {
    document.getElementById("messageAdmin").innerHTML =
      "You must fill all the fields";
    document.getElementById("messageAdmin").style.color = "red";
    return;
  }

  //verify if there are changes in the fields
  function hasChanges() {
    let changes = false;

    if (
      name !== usuario.name ||
      surname !== usuario.surname ||
      email !== usuario.email ||
      username !== usuario.username ||
      telephone !== usuario.telephone ||
      current_account !== usuario.current_account
    ) {
      changes = true;
    }
    return changes;
  }

  if (!hasChanges()) {
    document.getElementById("messageAdmin").innerHTML = "No changes detected";
    document.getElementById("messageAdmin").style.color = "red";
  } else {
    try {
      const response = await fetch(
        `../../api/ModifyAdmin.php?profile_code=${encodeURIComponent(profile_code)}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(surname)}&email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&telephone=${encodeURIComponent(telephone)}&current_account=${encodeURIComponent(current_account)}`,
      );

      const data = await response.json();
      console.log(data);

      if (data["success"]) {
        document.getElementById("messageAdmin").innerHTML = data["message"];
        document.getElementById("messageAdmin").style.color = "green";

        actualProfile.NAME_ = name;
        actualProfile.SURNAME = surname;
        actualProfile.EMAIL = email;
        actualProfile.USER_NAME = username;
        actualProfile.TELEPHONE = telephone;
        actualProfile.CURRENT_ACCOUNT = current_account;

        console.log("New actual profile:", JSON.stringify(actualProfile));

        // localStorage.setItem("actualProfile", JSON.stringify(actualProfile));

        const response = await fetch(`../../api/SetProfile.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(actualProfile),
        });

        console.log("Local storage updated: ", response.json()["data"]);
      } else {
        document.getElementById("messageAdmin").innerHTML = data["error"];
        document.getElementById("messageAdmin").style.color = "red";
      }
    } catch (error) {
      console.log(error);
    }
  }
}

/* ----------SHARED ELEMENTS---------- */
function resetPasswordModal() {
  document.getElementById("changePasswordForm").reset();
  document.getElementById("messageOldPassword").innerHTML = "";
  document.getElementById("messageWrongPassword").innerHTML = "";
  document.getElementById("message").innerHTML = "";
}

async function delete_user(id) {
  if (!confirm("Are you sure you want to your account?")) return;

  const response = await fetch(
    `../../api/DeleteUser.php?id=${encodeURIComponent(id)}`,
  );

  const data = await response.json();

  if (!data["success"]) {
    console.log("Error deleting user: ", data["message"]);
  } else {
    log_user_out();
    window.location.href = "login.html";
  }
}

async function check_user_logged_in() {
  const response = await fetch("../../api/GetProfile.php", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();

  if (!data["success"]) {
    window.location.href = "login.html";
  } else {
    return data["data"];
  }
}

async function log_user_out() {
  const response = await fetch("../../api/Logout.php");
  const data = await response.json();

  if (data["success"]) {
    window.location.href = "login.html";
  }
}
