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
  const contactButton = document.getElementById("contactButton");

  /* ----------USER POPUP---------- */
  const modifyUserPopup = document.getElementById("modifyUserPopupAdmin");
  const changePwdBtn = document.getElementById("changePwdBtn");
  const saveBtnUser = document.getElementById("saveBtnUser");

  /* ----------ADMIN POPUP---------- */
  const modifyAdminPopup = document.getElementById("modifyAdminPopup");
  const modifyProductPopup = document.getElementById("modifyProductPopup");
  const closeAdminSpan = document.getElementById("closeAdminPopup");
  const closeProductPopup = document.getElementById("closeProductPopup");
  const changePwdBtnAdmin = document.getElementById("changePwdBtnAdmin");
  const adminTableModal = document.getElementById("adminTableModal");
  const modifyAdminBtn = document.getElementById("modifySelfButton");
  const saveBtnAdmin = document.getElementById("saveBtnAdmin");
  const saveBtnProduct = document.getElementById("saveBtnProduct");
  const productImageInput = document.getElementById("productImageInput");
  const productFormImageDisplay = document.getElementById(
    "productFormImageDisplay",
  );

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

  //Loads product cards
  load_product_cards();

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

  closeProductPopup.onclick = function () {
    modifyProductPopup.style.display = "none";
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

  saveBtnProduct.onclick = async function () {
    await updateCreateProduct();
  };

  //Previews the new product image in the box
  productImageInput.onchange = (e) => {
    productFormImageDisplay.src = URL.createObjectURL(e.target.files[0]);
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
    switch (event.target) {
      case adminTableModal:
        adminTableModal.style.display = "none";
        break;
      case modifyUserPopup:
        modifyUserPopup.style.display = "none";
        break;
      case modifyAdminPopup:
        modifyAdminPopup.style.display = "none";
        break;
      case changePwdModal:
        changePwdModal.style.display = "none";
        break;
      case modifyProductPopup:
        modifyProductPopup.style.display = "none";
        break;
    }
  };

  //Makes the contact button open a link, didnt want to touch the CSS to wrap it in a <a> so this is the lazy solution
  contactButton.onclick = function () {
    window.open(
      "https://www.linkedin.com/in/mosi-hickman-blanco-093623349/",
      "_blank",
    );
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

async function load_product_cards() {
  let cardContainer = document.getElementsByClassName(
    "productScrollSection",
  )[0];
  cardContainer.innerHTML = "";
  let products = await get_all_products();
  if (products) {
    products.forEach(async (product) => {
      let company = await get_product_company(product["COMPANY_ID"]);
      let card = document.createElement("div");
      card.className = "productCard";
      card.innerHTML = `
        <div class="productImageContainer">
          <img src="../assets/img/${product["IMAGE"]}" class="productImage"/>
        </div>
        <div class="productName">${product["NAME"]}</div>
        <div class="productDescription">${product["DESCRIPTION"]}</div>
      `;

      let profile = await check_user_logged_in();
      if (["CURRENT_ACCOUNT"] in profile) {
        card.innerHTML += `
          <div class="productDeleteButton" id="${product["NAME"]}DeleteButton">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </div>
        `;
      }

      cardContainer.appendChild(card);
      cardDeleteButton = document.getElementById(
        `${product["NAME"]}DeleteButton`,
      );

      cardDeleteButton.onclick = async function (event) {
        //This is to stop the modify popup from displaying, its like telling the parent
        //That all logic will be handled here and not to worry
        event.stopPropagation();

        await delete_product(product["PRODUCT_ID"], card);
      };

      card.onclick = async function () {
        view_product_details(company, product);
      };
    });
  }

  const addCard = document.createElement("div");
  addCard.className = "productCard addProductCard";
  addCard.innerHTML = `
    <div class="addProductPlus">+</div>
  `;

  addCard.onclick = () => {
    unselect_product();
    view_product_details();
  };

  cardContainer.appendChild(addCard);
}

async function get_all_products() {
  const response = await fetch("../../api/GetAllProducts.php");
  const data = await response.json();

  return data["data"];
}

async function get_product_company(product_id) {
  const response = await fetch(
    `../../api/GetProductCompany.php?id=${encodeURIComponent(product_id)}`,
  );
  const data = await response.json();

  return data["data"][0];
}

async function view_product_details(company, product) {
  let profile = await check_user_logged_in();

  if (["CARD_NO"] in profile) {
    window.open(company["URL"], "_blank");
  } else if (["CURRENT_ACCOUNT"] in profile) {
    select_product(product);
    await open_product_popup();
  }
}

async function open_product_popup() {
  const response = await fetch("../../api/GetProduct.php", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  const actualProduct = data["data"];

  if (actualProduct) {
    document.getElementById("productFormImageDisplay").src =
      `../assets/img/${actualProduct["IMAGE"]}`;
    document.getElementById("productName").value = actualProduct["NAME"];
    document.getElementById("productPrice").value = actualProduct["PRICE"];
    document.getElementById("productCategory").value =
      actualProduct["PRODUCT_TYPE"];
    document.getElementById("productDescription").value =
      actualProduct["DESCRIPTION"];
  }

  let modifyProductPopup = document.getElementById("modifyProductPopup");
  modifyProductPopup.style.display = "flex";
}

async function delete_product(product_id, product_card) {
  if (confirm("¿Seguro que quieres eliminar este producto?")) {
    const response = await fetch(
      `../../api/DeleteProduct.php?id=${encodeURIComponent(product_id)}`,
    );
    const data = await response.json();

    if (!data["success"]) {
      console.log("Error deleting product: ", data["message"]);
    } else {
      alert("Producto eliminado.");
      product_card.remove();
    }
  }
}

async function updateCreateProduct() {
  const response = await fetch("../../api/GetProduct.php", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  const actualProduct = data["data"];

  const formData = new FormData(document.getElementById("productForm"));
  if (actualProduct) {
    modifyProduct(actualProduct, formData);
  } else {
    createProduct(formData);
  }
}

async function check_product_selected() {
  const response = await fetch("../../api/GetProduct.php", {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();

  if (!data["success"]) {
    return null;
  } else {
    return data["data"];
  }
}

async function select_product(product) {
  const response = await fetch(`../../api/SetProduct.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const data = await response.json();

  return data["success"];
}

async function unselect_product() {
  const response = await fetch(`../../api/SetProduct.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(null),
  });

  const data = await response.json();

  if (data["success"]) {
    const form = document.getElementById("productForm");
    form.reset();

    const imageInput = document.getElementById("productImageInput");
    imageInput.value = "";

    const imagePreview = document.getElementById("productFormImageDisplay");
    imagePreview.src = "https://placehold.co/1000x1000/png";
  }

  return data["success"];
}

async function modifyProduct(originalProduct, formData) {
  //The image field checks to see if the user has inserted a new image, if they havent then it just puts the original file name
  const product = {
    PRODUCT_ID: originalProduct["PRODUCT_ID"],
    NAME: formData.get("productName"),
    PRICE: formData.get("productPrice"),
    PRODUCT_TYPE: formData.get("productCategory"),
    DESCRIPTION: formData.get("productDescription"),
    IMAGE:
      formData.get("productImageInput")?.size > 0
        ? formData.get("productImageInput").name
        : originalProduct["IMAGE"],
  };

  const finalFormData = new FormData();
  finalFormData.append("PRODUCT_ID", product.PRODUCT_ID);
  finalFormData.append("NAME", product.NAME);
  finalFormData.append("PRICE", product.PRICE);
  finalFormData.append("PRODUCT_TYPE", product.PRODUCT_TYPE);
  finalFormData.append("DESCRIPTION", product.DESCRIPTION);
  finalFormData.append("IMAGE_NAME", product.IMAGE);

  console.log(finalFormData);

  const imageFile = formData.get("productImageInput");
  if (imageFile && imageFile.size > 0) {
    finalFormData.append("IMAGE_FILE", imageFile);
  }

  try {
    const response = await fetch(`../../api/ModifyProduct.php`, {
      method: "POST",
      body: finalFormData,
    });
    const data = await response.json();

    if (data["success"]) {
      alert("El producto ha sido modificado.");
      load_product_cards();

      const response = await fetch(`../../api/SetProduct.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
    } else {
      alert("Error modificando el producto");
    }
  } catch (error) {
    console.log(error);
  }
}

async function createProduct(formData) {
  const name = formData.get("productName");
  const price = formData.get("productPrice");
  const productType = formData.get("productCategory");
  const description = formData.get("productDescription");
  const imageFile = formData.get("productImageInput");

  if (
    !name ||
    !price ||
    !productType ||
    !description ||
    !imageFile ||
    imageFile.size === 0
  ) {
    alert("Por favor, rellena todos los campos y selecciona una imagen.");
    return;
  }

  const product = {
    NAME: name,
    PRICE: price,
    PRODUCT_TYPE: productType,
    DESCRIPTION: description,
    IMAGE: imageFile.name,
  };

  const finalFormData = new FormData();
  finalFormData.append("NAME", product.NAME);
  finalFormData.append("PRICE", product.PRICE);
  finalFormData.append("PRODUCT_TYPE", product.PRODUCT_TYPE);
  finalFormData.append("DESCRIPTION", product.DESCRIPTION);
  finalFormData.append("IMAGE_NAME", product.IMAGE);
  finalFormData.append("IMAGE_FILE", imageFile);

  try {
    const response = await fetch("../../api/AddProduct.php", {
      method: "POST",
      body: finalFormData,
    });

    const data = await response.json();

    if (data.success) {
      alert("El producto ha sido creado correctamente.");
      load_product_cards();
    } else {
      alert("Error creando el producto.");
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión al crear el producto.");
  }
}
