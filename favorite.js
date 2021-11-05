const baseUrl = "https://lighthouse-user-api.herokuapp.com";
const indexUrl = baseUrl + "/api/v1/users/";
const dataPanel = document.querySelector("#data-panel");
const searchInput = document.querySelector('#search-input')
const modalFooter = document.querySelector('.modal-footer')

const users = JSON.parse(localStorage.getItem('favoriteUser')) || []
let filteredUsers = []

// 利用剛獲得的資料去改寫 dataPanel內的資料
function displayUserList(data) {
  let rawHtml = "";

  data.forEach((item) => {
    rawHtml += `
    <div class="card m-3" style="width: 15rem;">
      <img class="card-img-top" src="${item.avatar}" data-id="${item.id} "alt="Card image cap" data-toggle="modal" data-target="#exampleModal">
      <i class="fas fa-heart fa-2x" data-id=${item.id}></i>
      <div class="card-body text-center">
        <h5 class="card-title">${item.name} ${item.surname}</h5>
      </div>
    </div>
    `;
  });
  dataPanel.innerHTML = rawHtml;
}

// 在dataPanel上設置監聽器，當觸發後去取得按鈕上的ID以利辨識，並調用函式
dataPanel.addEventListener("click", function clickModal(event) {
  if (event.target.matches(".card-img-top")) {
    showDetail(Number(event.target.dataset.id));
  }
});

// 在modal上設置監聽去，去觸發刪除按鈕
modalFooter.addEventListener('click', (event) => {
  if (event.target.matches("#delete-button")) {
    removeFavorite(Number(event.target.dataset.id))
    console.log(Number(event.target.dataset.id))
  }
})

dataPanel.addEventListener("click", function clickModal(event) {
  if (event.target.matches(".fas")) {
    removeFavorite(Number(event.target.dataset.id))
  }
});

function removeFavorite(id) {
  if (!users || users.length === 0) return // 如果users = 0的時候(代表為空陣列)是 false，加上!後會變成true

  const usersIndex = users.findIndex((user) => user.id === id)

  if (usersIndex === -1) return //代表沒找到

  users.splice(usersIndex, 1)
  localStorage.setItem('favoriteUser', JSON.stringify(users))
  displayUserList(users)
}



// 函式藉由 ID來判斷是誰的資料後，在利用axios去取得該資料的API後，進行內容的改寫
function showDetail(id) {
  const modalTitle = document.querySelector(".modal-title");
  const modalBody = document.querySelector(".modal-body");

  axios.get(indexUrl + id).then((response) => {
    const data = response.data;
    modalTitle.innerText = `${data.name}  ${data.surname}`;
    modalBody.innerHTML = `
    <div class="row">
      <div><img src="${data.avatar}" alt="movie-poster" class="img-fluid m-2"></div>
      <div class="m-2">
        <p>Gender: ${data.gender}</p>
        <p>Birthday: ${data.birthday}</p>
        <p>Age: ${data.age}</p>
        <p>Email: ${data.email}</p>
      </div>
    </div>
    `;

    modalFooter.innerHTML = `
    <button id="delete-button" type="button" class="btn btn-danger" data-id="${data.id}" data-dismiss="modal">
      Delete
    </button>
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    `
  });
}

displayUserList(users)
