const baseUrl = "https://lighthouse-user-api.herokuapp.com";
const indexUrl = baseUrl + "/api/v1/users/";
const dataPanel = document.querySelector("#data-panel");
const searchInput = document.querySelector('#search-input')
const modalFooter = document.querySelector('.modal-footer')
const per_page = 20
const paginator = document.querySelector('#paginator')
let numberOfPages
let page = 1


const users = [];
let filteredUsers = []

// 利用axios來呼叫API，將回傳的資料放在 users陣列之中，並將這些資料當成函式的參數
axios.get(indexUrl).then((response) => {
  users.push(...response.data.results);
  renderPaginator(users.length) //這裡傳入總資料的長度，去製作分頁數量
  displayUserList(userPerPage(page));
  // console.log(users);
});

// 利用剛獲得的資料去改寫 dataPanel內的資料
function displayUserList(data) {
  let rawHtml = "";

  data.forEach((item) => {
    rawHtml += `
    <div class="card m-3" style="width: 15rem;">
      <img class="card-img-top" src="${item.avatar}" data-id="${item.id} "alt="Card image cap" data-toggle="modal" data-target="#exampleModal">
      <i class="far fa-heart fa-2x" data-id=${item.id}></i>
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
  console.log(event.target)
  if (event.target.matches(".card-img-top")) {
    showDetail(Number(event.target.dataset.id));
  } else if (event.target.matches(".fa-heart")) {
    event.target.classList.add('fas')
    event.target.classList.remove('far')
    addFavorite(Number(event.target.dataset.id))
  }
});

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
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    <button id="add-button" type="button" class="btn btn-danger" data-id="${data.id}">
      Add to favorite
    </button>
    `
  });
}

// 設置監聽器 for 即時顯是搜尋結果
searchInput.addEventListener('input', function searchInputForm(event) {

  const text = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter((user) => {
    if (user.name.trim().toLowerCase().includes(text) || user.surname.trim().toLowerCase().includes(text)) return true  //姓跟名分開判斷
    // const userName = user.name.trim().toLowerCase() + user.surname.trim().toLowerCase()  //把姓跟名合在一起，然後去判斷
    // return userName.includes(text)
  })
  renderPaginator(filteredUsers.length) //這裡是將搜尋結果也製作相對應的分頁長度
  displayUserList(filteredPerPage(1))
})

// 設置監聽器 for 加入好友
modalFooter.addEventListener('click', function addToFavorite(event) {
  if (event.target.matches("#add-button")) {
    addFavorite(Number(event.target.dataset.id))
  }
})

// 處理加入好友
function addFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
  const user = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('此名單已加入追蹤清單 !')
  }

  list.push(user)
  localStorage.setItem('favoriteUser', JSON.stringify(list))
  console.log(list)
}

function filteredPerPage(page) {
  const start = (page - 1) * per_page
  return filteredUsers.slice(start, start + per_page)
}


// 將每頁呈現的資料數量進行切割
function userPerPage(page) {
  let data = filteredUsers.length ? filteredUsers : users //當有進行搜尋(會將結果存進 filteredUsers 使其length > 0)時，會回傳filteredUsers，否則就是回傳users
  const start = (page - 1) * per_page
  return data.slice(start, start + per_page)
}

// 依據 users資料製作 paginator的數量
function renderPaginator(amount) {
  numberOfPages = Math.ceil(amount / per_page)

  let rawHTML = `
  <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous" id="previous-page">
        &laquo;
      </a>
    </li>
  `
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-id="${page}">${page}</a></li>
    `
  }

  rawHTML += `
  <li class="page-item">
      <a class="page-link" href="#" aria-label="Next" id="next-page">
        &raquo;
      </a>
    </li>
  `

  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function pageClick(event) {
  event.preventDefault()

  if (event.target.tagName !== "A") return
  if (event.target.matches('#previous-page')) {
    if (page === 1)
      return alert('已經是第一頁了!')
    page--
  } else if (event.target.matches('#next-page')) {
    if (page === numberOfPages)
      return alert('已經是最後一頁了!')
    page++
  } else {
    page = Number(event.target.dataset.id)
  }
  displayUserList(userPerPage(page))
})