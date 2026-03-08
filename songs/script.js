// ===== データ =====

let songs = JSON.parse(localStorage.getItem("songs")) || [];

// ===== 保存 =====

function saveSongs(){
localStorage.setItem("songs",JSON.stringify(songs));
}

// 編集中の曲ID（nullなら新規追加モード）
let editingId = null;

// ===== メニュー =====

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click",()=>{
menu.classList.toggle("open");
});

// ===== ページ切替 =====

const pages = document.querySelectorAll(".page");

document.querySelectorAll("#menu button").forEach(btn=>{

btn.addEventListener("click",()=>{

const page = btn.dataset.page;

pages.forEach(p=>p.classList.add("hidden"));

document.getElementById(page+"Page").classList.remove("hidden");

menu.classList.remove("open");

});

});

// ===== 曲追加 =====

document.getElementById("saveBtn").addEventListener("click", () => {
    const title = document.getElementById("title").value;
    if (!title) return;

    if (editingId) {
        // 編集モード
        const song = songs.find(s => s.id === editingId);
        song.title = title;
        song.artist = document.getElementById("artist").value;
        song.tags = document.getElementById("tags").value.split(",");
        song.url = document.getElementById("url").value;
        song.status = document.getElementById("status").value;
    } else {
        // 新規追加モード
        songs.push({
            id: Date.now(),
            title,
            artist: document.getElementById("artist").value,
            tags: document.getElementById("tags").value.split(","),
            url: document.getElementById("url").value,
            status: document.getElementById("status").value,
            favorite: false,
            created: Date.now()
        });
    }

    saveSongs();
    render();

    // フォームと状態リセット
    editingId = null;
    document.getElementById("saveBtn").textContent = "保存";
    document.getElementById("title").value = "";
    document.getElementById("artist").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("url").value = "";
    document.getElementById("status").value = "sing";
});

// ===== 削除 =====

function deleteSong(id){

songs = songs.filter(s=>s.id!==id);

saveSongs();
render();

}

// ===== ステータス変更 =====

function toggleStatus(id){

const song = songs.find(s=>s.id===id);

song.status = song.status==="sing" ? "learn" : "sing";

saveSongs();
render();

}

// ===== お気に入り =====

function toggleFavorite(id){

const song = songs.find(s=>s.id===id);

song.favorite=!song.favorite;

saveSongs();
render();

}

// ===== 最近追加 =====

function renderRecent(){

const box = document.getElementById("recentSongs");

box.innerHTML="";

songs
.filter(song => song.status === "sing")
.sort((a,b)=>b.created-a.created)
.slice(0,5)
.forEach(song=>{

box.appendChild(songCard(song));

});

}

// ===== 曲カード =====

function songCard(song) {
  const div = document.createElement("div");
  div.className = "song";

  div.innerHTML = `
    <div class="songMain">
      <b>${song.favorite ? "⭐" : ""}${song.title}</b><br>
      <span class="songArtist">${song.artist}</span>
    </div>

    <div class="songDetail">
      状態：${song.status === "sing" ? "歌える" : "覚える"}<br>
      ${song.url ? `<a href="${song.url}" target="_blank">URL</a>` : ""}<br><br>
      ${song.tags.map(t => `<span class="tag">${t}</span>`).join(" ")}<br>
      <button onclick="toggleStatus(${song.id})">⇄</button>
      <button onclick="toggleFavorite(${song.id})">★</button>
      <button onclick="editSong(${song.id})">編集</button>
      <button onclick="deleteSong(${song.id})">削除</button>
    </div>
    </div>
  `;

  div.querySelector(".songMain").addEventListener("click", () => {
    div.classList.toggle("open"); // ここで開閉
  });

  div.addEventListener("contextmenu", e => {
    e.preventDefault();
    toggleFavorite(song.id);
  });

  return div;
}

// ===== リスト表示 =====

function renderLists() {
    const sing = document.getElementById("singList");
    const learn = document.getElementById("learnList");
    const fav = document.getElementById("favList");

    // まず各リストを空にする
    sing.innerHTML = "";
    learn.innerHTML = "";
    fav.innerHTML = "";

    songs.forEach(song => {
        // 歌える曲リスト
        if (song.status === "sing") {
            sing.appendChild(songCard(song));
        }

        // 覚える曲リスト
        if (song.status === "learn") {
            learn.appendChild(songCard(song));
        }

        // お気に入りリスト
        if (song.favorite) {
            fav.appendChild(songCard(song));
        }
    });
}

// ===== 編集 =====

function editSong(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    editingId = id; // 編集中のIDをセット
    document.getElementById("title").value = song.title;
    document.getElementById("artist").value = song.artist;
    document.getElementById("tags").value = song.tags.join(",");
    document.getElementById("url").value = song.url;
    document.getElementById("status").value = song.status;

    document.getElementById("saveBtn").textContent = "更新";

    // 編集ページに切り替え
    pages.forEach(p => p.classList.add("hidden"));
    document.getElementById("addPage").classList.remove("hidden");
}

function saveNewSong() {
    const title = document.getElementById("title").value;
    if (!title) return;

    const song = {
        id: Date.now(),
        title,
        artist: document.getElementById("artist").value,
        tags: document.getElementById("tags").value.split(","),
        url: document.getElementById("url").value,
        status: document.getElementById("status").value,
        favorite: false,
        created: Date.now()
    };

    songs.push(song);
    saveSongs();
    render();
}

// 最初の保存ボタンは新規追加用に設定
document.getElementById("saveBtn").onclick = saveNewSong;

// ===== 検索 =====

const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("input",renderSearch);

function renderSearch(){

const q = searchBar.value.toLowerCase();

const box = document.getElementById("searchResults");

box.innerHTML="";

songs
.filter(song=>

song.title.toLowerCase().includes(q) ||
song.artist.toLowerCase().includes(q) ||
song.tags.join("").toLowerCase().includes(q)

)

.forEach(song=>{

box.appendChild(songCard(song));

});

}

// ===== タグ =====

function renderTags(){

const tagList = document.getElementById("tagList");

tagList.innerHTML="";

const tags = [...new Set(songs.flatMap(s=>s.tags))];

tags.forEach(tag=>{

const btn = document.createElement("button");

btn.textContent = tag;

btn.onclick=()=>{

searchBar.value = tag;
renderSearch();

};

tagList.appendChild(btn);

});

}

// ===== 歌手 =====

function renderArtists(){

const artistList = document.getElementById("artistList");

artistList.innerHTML="";

const artists = [...new Set(songs.map(s=>s.artist))];

artists.forEach(artist=>{

const btn = document.createElement("button");

btn.textContent = artist;

btn.onclick=()=>{

searchBar.value = artist;
renderSearch();

};

artistList.appendChild(btn);

});

}

// ===== バックアップ =====

document.getElementById("backupBtn").addEventListener("click",()=>{

const blob = new Blob([JSON.stringify(songs,null,2)],{type:"application/json"});

const a = document.createElement("a");

a.href = URL.createObjectURL(blob);
a.download = "karaoke_backup.json";
a.click();

});

// ===== 復元 =====

document.getElementById("restoreFile").addEventListener("change",e=>{

const file = e.target.files[0];

if(!file)return;

const reader = new FileReader();

reader.onload=function(ev){

songs = JSON.parse(ev.target.result);

saveSongs();
render();

};

reader.readAsText(file);

});

// ===== 描画 =====

function render(){

renderRecent();
renderLists();
renderTags();
renderArtists();
renderSearch();

}

render();


// ===== 外クリックで閉じる =====

document.addEventListener("click",(e)=>{

if(!menu.contains(e.target) && e.target !== menuBtn){
menu.classList.remove("open");
}

});

document.addEventListener("click", (e) => {
    // メニュークリックやメニュー内ボタンは無視
    if(menu.contains(e.target) || e.target === menuBtn) return;

    // 開いているカードを全部取得
    document.querySelectorAll(".song.open").forEach(openCard => {
        // クリックした場所がそのカード内じゃなければ閉じる
        if(!openCard.contains(e.target)){
            openCard.classList.remove("open");
        }
    });

});
